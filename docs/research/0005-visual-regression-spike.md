# Research: Visual Regression from the Storybook Run

Date: 2026-10-16
Related: bead `ui-5ba` · [testing.md](../best-practices/testing.md)

## Summary

The spike asked whether every story can be screenshotted in the existing Storybook Vitest run and compared against `main` without committing images. Capture works: a preview `afterEach` behind a `VITE_VISUAL` flag screenshotted all 1687 story runs in a CI-like container, twice, with every test passing. Two runs of the same tree differed in 37 images (2.2%); 36 of them by at most 37 pixels of anti-aliasing, and one by a 1px popover shift. A capture run took 718–757s in the container, against 449s for the Storybook suite in CI's `check` job, so it needs its own job. Comparing runs is workable with a small pixel threshold. reg-actions can run without pushing images to a branch, at the cost of images in its PR comment; self-hosted Argos needs a service stack out of proportion to the task.

## Findings

### Capture

- **Hook:** `captureStory` (`apps/storybook/src/helpers/visual.ts`) runs as the preview's `afterEach`, after each story's play function, and calls `expect.soft(page).toMatchScreenshot(storyId)`. With `VITE_VISUAL` unset it returns at once: sample files passed the same tests and wrote no images, and the static Storybook build compiles it to an empty function.
- **Whole page, not the story root:** a page capture includes portaled overlays (dialogs, menus, popovers); an open Dialog story's image showed the dialog over its backdrop at the full 1200×900 viewport.
- **Paths:** `browser.expect.toMatchScreenshot.resolveScreenshotPath` receives the test project, so images land in `.visual/<project>/<id>.png`, where the id is the story id with `--` collapsed to `-` (Vitest sanitizes it; none of the 873 current stories collide). The default path would let the light, dark and forced-colors projects overwrite each other, since they run the same test names.
- **Animations need nothing from the hook:** in a test run, Storybook pauses every CSS animation and turns off transitions with a stylesheet before `afterEach`, and `toMatchScreenshot` captures with `animations: 'disabled'` by default (`@vitest/browser` `defaultOptions`). An earlier version of the hook called `finish()` on every animation, which throws `InvalidStateError` on infinite ones and failed 53 stories; without any animation handling the infinite-animation stories passed and two captures matched.
- **Imports aren't caught:** with the flag set, a failed import of `vitest` or `vitest/browser` throws. Caught, it passed a run with zero images.
- **A failed capture must not throw:** Storybook removes its pause stylesheet only when `afterEach` succeeds, so a thrown capture failure left the whole page paused. Measured: with one retry, Progress's indeterminate story failed its retry on `expected 'paused' to be 'running'`. `expect.soft` still fails the story but lets the cleanup run; the same retry then passed.

### `toMatchScreenshot` without committed references (read in `@vitest/browser` 5.0.4)

- **A missing reference fails the test** (`pass: false`), writing the screenshot as the new reference or, in CI's default `updateSnapshot: 'none'`, to the diffs path. A capture run therefore needs `--update=all`, so it can't share the normal test run, whose failures must stay failures. No story uses Vitest snapshots, so `--update=all` overwrites nothing else today.
- **The stability loop still runs** with no reference: it takes screenshots until two in a row match. That, and the per-project path option, are what the matcher adds over a plain `page.screenshot`.
- **`-u` takes an optional value** (`--update [type]`), so `-u <file>` treats the file as the update mode and runs every story file. Use `--update=all`.

### Noise floor

Two full runs of one tree in `mcr.microsoft.com/playwright:v1.64.0-noble` (x86, 4 CPUs, Playwright 1.64.0 as in the lockfile), `CI=true VITE_VISUAL=true vitest run --update=all`:

|        | Run 1                   | Run 2                   |
| ------ | ----------------------- | ----------------------- |
| Tests  | 1687 passed, no retries | 1687 passed, no retries |
| Images | 1687                    | 1687                    |
| Time   | 757s                    | 718s                    |

- **The count:** 873 stories, run in light and dark (814 each) plus the 59 tagged `forced-colors`, so 1687 images rather than the bead's estimate of about 1218; the suite grew.
- **37 of 1687 images differed** byte for byte. Measured per pixel:
  - **36 by 1 to 37 pixels**, in a few pixels at edges: field borders, focus rings, the input's right edge, menu items.
  - **1 by 3240 pixels:** dark `overlays-popover-inside-dialog`, where the popover sat 1px lower in one run (y 494 and 495), a positioning rounding difference.
- From these two runs, a threshold of about 50 differing pixels would pass every anti-aliasing case; the popover case needs an opt-out for that story or a fix to its positioning. A ratio that covered it (3240 of 1,080,000 pixels is 0.3%) would also pass a real change of that size, such as a recolored button. More runs would firm up both numbers.
- One capture is 20.5MB (12.1KB per image).
- These runs used an earlier hook that also finished or paused animations itself. Since the screenshot disables animations either way, the numbers should hold for the current hook (inferred; not re-measured over the full suite).

### Comparison tools

**reg-actions** (README and repository, checked 2026-10-16):

- **Base images** come from the artifact the workflow uploaded on the target branch, so it runs on both `push` and `pull_request`, and `main` must upload a capture on every push. Merging a PR is the approval: its capture becomes `main`'s next base.
- **Thresholds:** `matching-threshold` (per-pixel YIQ distance), then `threshold-pixel` or `threshold-rate`; `threshold-pixel` wins when both are set. All default to 0, which would flag all 37 noisy images.
- **Image branch:** by default it pushes the comment's images to a branch (`branch`, default `reg_actions`) in this repository and needs a token with write access. `disable-branch: true` turns that off; the comment then shows no images, and the diffs live only in the uploaded artifact.
- **It never fails the workflow** on changes; it reports through the comment.
- **No release tags:** `v3` is a branch, so pinning means a commit SHA. Latest activity July 2026; 97 stars.

**reg-cli** (the engine reg-actions wraps), run inside the job and uploading its HTML report as an artifact, gives the same comparison with no branch, no write permission and no PR comment.

**Self-hosted Argos** (the bead's fallback; repository checked 2026-10-16): MIT, active, 640 stars. Its `docker-compose.yml` runs Postgres, RabbitMQ, Redis and DynamoDB, and its environment needs AWS credentials and a GitHub App; the README documents no self-hosting. GitHub code search found no `selfHosted` flag, though the search may not index the whole repository. Running that stack for this repository is out of proportion to the task.

### Cost in CI

- A capture job beside `check` would add no time to `check` but end CI later: about 12–13 minutes of capture plus setup, against `check`'s 9.5 minutes, so roughly 15 minutes until CI Summary reports. This is inferred from container times; CI's runners may differ. The job must be in CI Summary's `needs:`.
- Running capture inside the `check` job is not possible without `--update=all`, which the test run can't take.

## Recommendation

1. **Keep the capture hook** as built: whole page, per-project paths, soft assertion, flag-gated.
2. **Add a separate `visual` CI job** that runs `VITE_VISUAL=true vitest run --update=all` on `push` to `main` and on pull requests, uploading `.visual` as an artifact, with the job in CI Summary's `needs:`. The job checks each project wrote one image per story it ran: a path without the project (light and dark overwriting each other) or a capture that wrote nothing would otherwise pass.
3. **Choose the comparison** (your call):
   - **reg-actions with `disable-branch: true`** and `threshold-pixel: 50` (alone: it overrides `threshold-rate`), with the popover-inside-dialog story left out of capture or its 1px shift fixed: a PR comment listing changed stories, diffs in the artifact, nothing pushed.
   - **reg-actions with its image branch:** the same, with images in the comment, at the cost of a `reg_actions` branch and write permission.
   - **reg-cli in the job:** an HTML report artifact only, no comment.
4. **Report, don't block**, at first: reg-actions never fails the workflow, and a few weeks of reports would show whether the threshold holds.

## Sources

- `@vitest/browser` 5.0.4 `dist/index.js` (`screenshotMatcher`, `determineOutcome`, `getStableScreenshot`), `vitest` 5.0.4 config types (`ToMatchScreenshotOptions`) and Storybook 10.6.1 `pauseAnimations`, read in `node_modules`.
- Container runs on 2026-10-16, per-pixel comparison with pngjs; CI `check` job on `main` run 38843988396 (9m36s, Storybook suite 449.72s).
- [reg-viz/reg-actions](https://github.com/reg-viz/reg-actions), including [`disable-branch`](https://github.com/reg-viz/reg-actions#disable-branch-optional)
- [argos-ci/argos](https://github.com/argos-ci/argos)
- [Vitest visual regression testing](https://vitest.dev/guide/browser/visual-regression-testing)
