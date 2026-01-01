## Prerequisites (from add-component-registry)

- [ ] 0.1 Complete `add-component-registry` change
- [ ] 0.2 Deploy registry to `https://ui.oakoss.com/r/`
- [ ] 0.3 Verify registry is publicly accessible
- [ ] 0.4 Test installation with full URL works

## 1. Prepare Assets

- [ ] 1.1 Create square SVG logo for oakoss-ui
- [ ] 1.2 Write registry description (what components it provides)
- [ ] 1.3 Verify `registry.json` meets requirements:
  - [ ] Valid JSON conforming to registry schema
  - [ ] `files` array does NOT include `content` property
  - [ ] Flat structure (no nested items)

## 2. Submit Registration Request

- [ ] 2.1 Open GitHub issue at shadcn-ui/ui using registry directory template
- [ ] 2.2 Fill in required fields:
  - Name: `@oakoss`
  - URL: `https://ui.oakoss.com/r/{name}.json`
  - Homepage: `https://ui.oakoss.com`
  - Description: (prepared in 1.2)
- [ ] 2.3 Attach SVG logo to issue
- [ ] 2.4 Check all requirement boxes

## 3. Post-Approval

- [ ] 3.1 Verify namespace appears in `https://ui.shadcn.com/r/registries.json`
- [ ] 3.2 Test `shadcn add @oakoss/react-aria-tailwind-button` works
- [ ] 3.3 Test `shadcn search @oakoss` works
- [ ] 3.4 Update documentation with namespace install commands
