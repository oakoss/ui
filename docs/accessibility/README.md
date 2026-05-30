# Accessibility

The accessibility target, methodology, and known issues for oakoss/ui.

## Target

- **WCAG 2.2 AA** conformance
- **EN 301 549** — the harmonised European ICT accessibility standard referenced by the EU Accessibility Act
- **Section 508** (US federal) compliance

Each shipped component is tested against these targets.

## Testing methodology

- **Static**: `eslint-plugin-jsx-a11y` on every PR
- **Component-level runtime**: `@storybook/addon-a11y` via the Storybook Vitest addon (`parameters.a11y.test: 'error'`, axe-core engine)
- **Integration**: `@axe-core/playwright` against the docs site
- **Manual**: VoiceOver (macOS, iOS), NVDA + JAWS (Windows), TalkBack (Android)

## Known issues

Tracked in this directory as dated markdown files with severity, affected components, and remediation timeline. Filename: `YYYY-MM-DD-short-kebab-title.md`.

## Why we publish this

Most React component libraries in 2026 (including Ant Design, Arco, TDesign) make no public a11y commitment. A public commitment matches the bar set by USWDS, GOV.UK, and Adobe Spectrum.
