## 1. Package Setup

- [x] 1.1 Create `packages/ui/` directory
- [x] 1.2 Create `package.json` with name `@oakoss/ui`
- [x] 1.3 Add dependencies: `react-aria-components`, `tailwind-variants`, `tailwind-merge`, `clsx`
- [x] 1.4 Add dev dependencies: `typescript`, `@types/node`
- [x] 1.5 Create `tsconfig.json` extending `@oakoss/typescript-config/react-library.json`
- [x] 1.6 Verify package is auto-detected by pnpm workspace

## 2. Source Directory Structure

- [x] 2.1 Create `starters/react-aria-tailwind/src/` directories
- [x] 2.2 Create `starters/react-aria-css/src/` directories
- [x] 2.3 Create `scripts/` directory for build script
- [x] 2.4 Create `public/r/` directory for output

## 3. Tailwind Style - Utils

- [x] 3.1 Create `starters/react-aria-tailwind/src/lib/utils.ts`
- [x] 3.2 Implement `focusRing` TV preset (matching React Aria)
- [x] 3.3 Implement `composeTailwindRenderProps` helper

## 4. Tailwind Style - Button

- [x] 4.1 Create `starters/react-aria-tailwind/src/components/ui/Button.tsx`
- [x] 4.2 Wrap `react-aria-components` Button with Tailwind Variants
- [x] 4.3 Add variants: `primary`, `secondary`, `destructive`, `outline`, `ghost`, `link`
- [x] 4.4 Add sizes: `sm`, `md`, `lg`
- [x] 4.5 Use React Aria state attributes (`data-pressed`, `data-disabled`, etc.)

## 5. CSS Style - Theme

- [x] 5.1 Create `starters/react-aria-css/src/components/ui/theme.css`
- [x] 5.2 Define CSS variables following shadcn naming conventions
- [x] 5.3 Add light/dark mode support via `prefers-color-scheme`
- [x] 5.4 Add forced-colors (high contrast) support

## 6. CSS Style - Utilities

- [x] 6.1 Create `starters/react-aria-css/src/components/ui/utilities.css`
- [x] 6.2 Add `.button-base` utility class (following React Aria pattern)
- [x] 6.3 Add focus ring styles

## 7. CSS Style - Button

- [x] 7.1 Create `starters/react-aria-css/src/components/ui/Button.tsx`
- [x] 7.2 Wrap `react-aria-components` Button with CSS classes
- [x] 7.3 Use `data-variant` attribute for styling variants
- [x] 7.4 Create `starters/react-aria-css/src/components/ui/Button.css`
- [x] 7.5 Style all variants using `[data-variant="..."]` selectors
- [x] 7.6 Import `theme.css` and `utilities.css`

## 8. Custom Build Script

- [x] 8.1 Create `scripts/build-registry.ts`
- [x] 8.2 Implement file reading from `starters/[style]/src/`
- [x] 8.3 Implement import path rewriting
- [x] 8.4 Implement CSS file inlining
- [x] 8.5 Implement dependency detection from imports
- [x] 8.6 Generate individual component JSON files with `content` property
- [x] 8.7 Generate style definition JSONs (`react-aria-tailwind.json`, `react-aria-css.json`)
- [x] 8.8 Generate main `registry.json` (without content, for index)
- [x] 8.9 Add `build` script to `package.json`

## 9. Registry Manifest

- [x] 9.1 Define source `registry.json` with schema reference
- [x] 9.2 Add `react-aria-tailwind` style item
- [x] 9.3 Add `react-aria-tailwind-utils` item
- [x] 9.4 Add `react-aria-tailwind-button` item with registryDependencies
- [x] 9.5 Add `react-aria-css` style item
- [x] 9.6 Add `react-aria-css-button` item (no utils dependency for CSS)
- [ ] 9.7 Configure `css` field for Tailwind plugins

## 10. Build & Verification

- [x] 10.1 Run build script
- [x] 10.2 Verify `public/r/registry.json` is valid
- [x] 10.3 Verify individual component JSONs have `content` property
- [x] 10.4 Verify `registryDependencies` use full URLs
- [ ] 10.5 Test with `shadcn view` command locally

## 11. Turbo Integration

- [x] 11.1 Add `packages/ui` to turbo.json pipeline
- [x] 11.2 Configure build caching
- [x] 11.3 Add to root package.json scripts

## 12. Documentation

- [ ] 12.1 Create `packages/ui/README.md` with overview
- [ ] 12.2 Document installation for Tailwind style
- [ ] 12.3 Document installation for CSS style
- [ ] 12.4 Document development workflow
- [ ] 12.5 Document adding new components
