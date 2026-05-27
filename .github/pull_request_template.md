<!--
Title: Conventional Commits format, e.g.
  feat(button): add loading state
  fix(combobox): correct keyboard navigation in RTL
-->

## Summary

<!-- One or two sentences on what changed and why. -->

## Related Issue

closes #

## Type of change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing usage to change)
- [ ] Docs / chore (no runtime impact)
- [ ] New component implementation (link the already-merged proposal from `docs/proposals/`)
- [ ] Proposal (new architectural proposal added to `docs/proposals/`)

## Test plan

<!-- How did you verify this works? Commands run, scenarios covered, manual testing. -->

- [ ] `pnpm lint` passes
- [ ] `pnpm format:check` passes
- [ ] `pnpm lint:md` passes

## Accessibility impact

<!--
If this touches a component, recipe, or interaction, cite the WCAG 2.2 criteria you verified.
Delete this section for docs-only or infrastructure PRs.
-->

- [ ] Keyboard navigation tested
- [ ] Screen reader tested (specify: VoiceOver / NVDA / JAWS / TalkBack)
- [ ] RTL verified
- [ ] Color contrast meets WCAG 2.2 AA

## Screenshots

<!-- Before / after for UI changes. Delete for non-UI PRs. -->

## Checklist

- [ ] Self-reviewed the diff
- [ ] Added or updated a decision or proposal if this is an architectural change
- [ ] Updated relevant docs in `docs/`
