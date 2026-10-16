# Research: Visual Regression from the Storybook Run

Date: 2026-10-16
Related: bead `ui-5ba` · [testing.md](../best-practices/testing.md)

## Summary

The spike asked whether every story can be screenshotted in the existing Storybook Vitest run and compared against `main` without committing images. Capture works: a preview `afterEach` behind a `VITE_VISUAL` flag screenshotted all 1687 story runs in a CI-like container, twice, with every test passing. Two runs of the same tree differed in 37 images (2.2%); 36 of them by at most 37 pixels of anti-aliasing, and one by a 1px popover shift. A capture run took 718–757s in the container, against 449s for the Storybook suite in CI's `check` job, so it needs its own workflow, run automatically on PRs that change rendering files (26 of the last 30). Comparing runs is workable with a small pixel threshold. reg-actions can run without pushing images to a branch, at the cost of images in its PR comment; self-hosted Argos needs a service stack out of proportion to the task.

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

- **Base images** come from the `reg` artifact of a run whose commit is the PR's merge base (`git merge-base` of the base and head SHAs, in `src/git.ts` and `src/run.ts` on `main` at `7bcfef2`, the source the pinned `v3` build `f0cccbc` was generated from; corrected 2026-10-16 while building the workflow). So it runs on both `push` and `pull_request`, `main` must upload a capture on every push, and checkout needs the full history. Merging a PR is the approval: its capture becomes the base for PRs branched after it.
- **It uploads its own artifact,** the capture plus any base images and diffs, with no retention setting (`retention-days` applies only to the image branch), so artifacts keep the repository's default retention.
- **Thresholds:** `matching-threshold` (per-pixel YIQ distance), then `threshold-pixel` or `threshold-rate`; `threshold-pixel` wins when both are set. All default to 0, which would flag all 37 noisy images.
- **Image branch:** by default it pushes the comment's images to a branch (`branch`, default `reg_actions`) in this repository and needs a token with write access. `disable-branch: true` turns that off; the comment then shows no images, and the diffs live only in the uploaded artifact.
- **It never fails the workflow** on changes; it reports through the comment.
- **No release tags:** `v3` is a branch, so pinning means a commit SHA. Latest activity July 2026; 97 stars.

**reg-cli** (the engine reg-actions wraps), run inside the job and uploading its HTML report as an artifact, gives the same comparison with no branch, no write permission and no PR comment.

**Self-hosted Argos** (the bead's fallback; repository checked 2026-10-16): MIT, active, 640 stars. Its `docker-compose.yml` runs Postgres, RabbitMQ, Redis and DynamoDB, and its environment needs AWS credentials and a GitHub App; the README documents no self-hosting. GitHub code search found no `selfHosted` flag, though the search may not index the whole repository. Running that stack for this repository is out of proportion to the task.

### Costs and complications

- **Time:** a capture would take about 12–13 minutes plus setup, inferred from the container times; a normal Storybook run took about the same in the container as in CI (420–450s). As its own workflow it adds nothing to the `check` job or CI Summary. Running capture inside `check` is not possible, since it needs `--update=all`.
- **Minutes:** free. The repository is public, and Actions on standard GitHub-hosted runners is free for public repositories.
- **Storage:** 20.5MB per capture. At CI's recent 9–25 runs a day, keeping every capture for the default 90 days could reach tens of gigabytes. reg-actions can't set a shorter retention for PR captures, and a PR's artifact also holds the base images, about twice the size (inferred). GitHub documents storage quotas for private repositories and none for public ones, so free storage here is inferred. reg-actions' image branch would grow the repository's history for good, which `disable-branch: true` avoids. Actions caches already hold 11.6GB, over the free 10GB, so GitHub evicts the least recently used; a capture uses artifacts, not the cache.
- **Baseline gaps:** a PR compares against the capture at its merge base. When that `main` run was cancelled, failed or expired, the PR finds no base, and every push posts a new comment reporting every story as new: reg-actions' no-base path ignores `comment-mode` and `outdated-comment-action` (`src/service.ts`). PRs branched before the workflow's first `main` capture hit this too.
- **Rendering upgrades:** a Playwright or Chromium bump, or a font change in the runner image, can change hundreds of images at once. Capturing inside the pinned Playwright container rules out the runner image; browser upgrades will still show many changes.
- **Review load:** every intentional visual change produces a report to look at, and new or renamed stories show as added or removed.
- **Fork PRs** get a read-only token, so reg-actions can't comment on them; the capture still runs.
- **Maintenance:** a third-party action pinned by commit SHA, artifact retention, and keeping the container and Storybook's Playwright on one version.

### When to capture

Measured against the last 30 merged PRs, a filter on every UI path (`packages/ui`, `packages/tokens`, `apps/storybook`, the lockfile) would have run for 29 of them, and 35 of the last 37 commits on `main` (since 2026-10-09) touched those paths. Leaving out story files, story helpers and unit tests, so the filter matches only what can change a component's rendering, ran for 26 and skipped 4: three test-only PRs (#64, #69, #71) and one docs PR (#48), the four that changed no component rendering.

## Recommendation

1. **Keep the capture hook** as built: whole page, per-project paths, soft assertion, flag-gated.
2. **Add a `visual.yml` workflow** that runs `VITE_VISUAL=true vitest run --update=all` in the Playwright container, and reg-actions uploads `.visual` as its artifact. It checks one image was written per story that passed: a path without the project (light and dark overwriting each other) or a capture that wrote nothing would otherwise pass. It runs automatically, with no label to remember:
   - **Pull requests** that change `packages/ui/src` or `packages/tokens/src` (not their tests or snapshots), `apps/storybook/.storybook`, `apps/storybook/src/styles`, `apps/storybook/vitest.config.ts`, the lockfile, or the workflow itself; not while a PR is a draft. A PR that only changes stories or story helpers gets no report; its new stories join the baseline when it merges.
   - **Every push to `main`,** since a PR whose merge base has no capture gets no comparison.
3. **Compare with reg-actions, `disable-branch: true`** (chosen 2026-10-16) and `threshold-pixel: 50` alone, since it overrides `threshold-rate`: a PR comment listing changed stories, diffs in the artifact, nothing pushed to the repository. The image branch and reg-cli were the alternatives.
4. **Report, don't block:** reg-actions never fails the workflow; a few weeks of reports would show whether the threshold holds.
5. **Run settings:**
   - **Only PR runs cancel:** a newer push to a PR cancels its older run, but `main` runs always finish, since a cancelled `main` capture leaves PRs branched from that commit without a base.
   - **Keep the base alive:** artifacts keep the repository's default retention, since reg-actions sets none. A PR whose merge base is older than that finds no base and reports every story as new.
   - **A stale branch's report holds:** reg-actions compares against the capture at the merge base, so changes merged to `main` since then don't show as diffs.
   - **Pin the container to Storybook's Playwright version** and bump both together (Renovate can update a workflow's container image); a mismatch fails on missing browsers. Storybook pins Playwright exactly, since Renovate's lockfile maintenance isn't grouped and could move it alone.
   - **Check out the PR head,** not checkout's default merge commit, so the capture and its merge-base base share history; and add the checkout to git's `safe.directory`, since the container runs as root over a runner-owned workspace.
   - **Permissions and triggers:** `pull_request`, never `pull_request_target`, which would run fork code with write access; `contents: read`, `actions: read`, `pull-requests: write`.
   - **Not a required check**, so a flaky capture never blocks a merge, outside CI Summary, with `timeout-minutes: 25`.
   - **Growth:** capture time grows with the story count; Vitest's `--shard` can split it across jobs if it gets slow.
6. **Before turning it on:** fix or opt out the popover-inside-dialog story (fixed: its play function opened the popover while the dialog was still scaling in), and add the image-count check. Lockfile-only Renovate PRs will run captures too; that is expected, since dependency bumps can change rendering.

## Sources

- `@vitest/browser` 5.0.4 `dist/index.js` (`screenshotMatcher`, `determineOutcome`, `getStableScreenshot`), `vitest` 5.0.4 config types (`ToMatchScreenshotOptions`) and Storybook 10.6.1 `pauseAnimations`, read in `node_modules`.
- Container runs on 2026-10-16, per-pixel comparison with pngjs; CI `check` job on `main` run 38843988396 (9m36s, Storybook suite 449.72s).
- [reg-viz/reg-actions](https://github.com/reg-viz/reg-actions), including [`disable-branch`](https://github.com/reg-viz/reg-actions#disable-branch-optional)
- [argos-ci/argos](https://github.com/argos-ci/argos)
- [How use of GitHub Actions is measured](https://docs.github.com/billing/managing-billing-for-your-products/managing-billing-for-github-actions) and [cache size beyond 10GB](https://github.blog/changelog/2025-11-20-github-actions-cache-size-can-now-exceed-10-gb-per-repository/)
- `gh` queries on 2026-10-16: repository visibility, CI run counts per day, Actions cache usage, and the files of the last 30 merged PRs.
- [Vitest visual regression testing](https://vitest.dev/guide/browser/visual-regression-testing)
