# Research: Toasts

Date: 2026-10-23
Related: bead `ui-o2f.30` (the decided spec) · bead `ui-tek` (`@xstate/store-react`) · [components.md](../best-practices/components.md) (survey and library rules)

## Summary

Four surveys fed the Toast port: a re-check of the 2026-10-13 library pick, a feature comparison of 17 libraries, design guidance from 12 design systems, and the most-reacted community issues plus accessibility critiques. The result replaces the react-hot-toast plan with a store of our own on `useSyncExternalStore`, fed to React Aria's `useToastRegion` and `useToast` hooks, with announcements through two live regions the Toaster mounts once. The API follows Sonner's call signature so shadcn users mostly change an import. The default look is a neutral card stack; the pill-to-card morph that the old plan centred on becomes a later Toaster variant, since no design system uses it. Libraries were read from their npm tarballs and source; nothing was rendered in a browser or a screen reader, so the announcement approach still needs a manual check (in the bead's acceptance).

## Findings

### Library choice

- **React Aria's Toast** is still `UNSTABLE_ToastQueue` in react-aria-components 1.22.1 and on main, with no update in place or promise toasts ([#6927](https://github.com/adobe/react-spectrum/issues/6927)) and open bugs on dropped toasts, exit animations and pausing ([#9930](https://github.com/adobe/react-spectrum/issues/9930), [#9056](https://github.com/adobe/react-spectrum/issues/9056), [#8053](https://github.com/adobe/react-spectrum/issues/8053), [#8131](https://github.com/adobe/react-spectrum/issues/8131)). Its hooks are stable exports of `react-aria` 3.53: `useToastRegion`, `useToast` (`dist/types/exports/index.d.ts:119-121`), and react-stately exports `ToastQueue` and the `ToastState` interface (`add`, `close`, `pauseAll`, `resumeAll`, `visibleToasts`).
- **react-hot-toast 2.6.1** gives a store, upsert by id, promise toasts and height offsets, but a toast is one `message`, it has no close callbacks, it drops the oldest past 20 without telling anyone, success toasts last 2 s, and it pauses only on hover, all toasts together. Its published headless bundle is byte-identical to 2.6.0, so the merged fix for one subscriber unsubscribing another ([#436](https://github.com/timolins/react-hot-toast/pull/436)) isn't on npm. Little activity between 2025-08 and 2026-07.
- **Sonner 2.0.8** has no state-only hook; its `Toaster` owns markup and stacking. **goey-toast** sits on Sonner and framer-motion; its morph is an SVG path rewritten every frame.
- **Store libraries:** Zustand, TanStack Store and `@xstate/store-react` (2.1.0, about 4 kB min+gz for `@xstate/store` 4.3.0) would hold the list, but the toast logic (pausable timers, upsert, close reasons, eviction, duration rules, promise states) is ours either way. A wider look at `@xstate/store-react` is `ui-tek`.
- No new single-purpose headless toast library appeared since mid-2025.

### Features across libraries

From `sonner`, `react-hot-toast`, `react-toastify`, `notistack`, Mantine, Chakra v3 (Zag), Ant Design, MUI, Radix, Base UI, HeroUI v2 and v3, React Spectrum S2, Fluent UI v9, goey-toast, sileo and remix-toast.

| Feature                                     | Who has it                                                        | Note                                                            |
| ------------------------------------------- | ----------------------------------------------------------------- | --------------------------------------------------------------- |
| Types, duration, hover pause, 6 positions   | Nearly all                                                        | Table stakes                                                    |
| Update by id                                | Most                                                              | Mantine and react-toastify ignore a repeated id instead         |
| Promise or loading helper                   | All but Radix, MUI, S2                                            | antd's `message()` resolves when it closes                      |
| Title, description, action as data          | Sonner, Zag, Base UI, S2                                          | react-hot-toast has one `message`                               |
| Close reason                                | Sonner, notistack, MUI, react-toastify, Zag                       | Sonner splits `onDismiss` from `onAutoClose`                    |
| Pause on hidden page or window blur         | Sonner, Zag, HeroUI v3; blur in toastify, MUI, Radix, Base UI     | No library pauses on all of hover, focus and a hidden page      |
| Queue rather than drop                      | react-toastify, notistack, Mantine, Zag, Fluent                   | Community prefers dropping the oldest                           |
| Priority                                    | Zag (1–8), Mantine, Base UI, Fluent                               |                                                                 |
| Collapsed stack that expands                | Sonner, Zag, antd, Mantine, Base UI, HeroUI, S2                   | S2's expanded stack is full-screen and contains focus           |
| Swipe directions                            | Sonner, Radix, Base UI, react-toastify                            | Zag has no swipe                                                |
| Remaining-time bar                          | react-toastify, Mantine, antd, HeroUI v2, goey                    | Zag's `--duration` variable shows a CSS-only route              |
| Region hotkey                               | Sonner (Alt+T), Radix (F8), Zag, HeroUI v3, Fluent; React Aria F6 |                                                                 |
| History                                     | Sonner `getHistory()`, react-toastify notification center         |                                                                 |
| Anchored toast                              | Base UI                                                           |                                                                 |
| Server-triggered toast                      | None                                                              | remix-toast writes a cookie flash the client turns into a toast |
| Grouping repeats, sound, reload persistence | None                                                              | No `new Audio`, `vibrate` or storage in any package             |

Sizes (own code, min+gz, dependencies excluded): react-hot-toast headless 1.8 kB, Radix 4.4 kB, Sonner 9.8 kB, react-toastify 9.7 kB plus 2.9 kB CSS.

### Design guidance

- **Against toasts:** GitHub's Primer says toasts "pose significant accessibility concerns and are not recommended for use": they vanish before people read them, sit far from the trigger in reading order, get missed when magnified, cover content and are over-used. The Scottish Government design system advises against them; Shopify Polaris deprecated its React Toast and says not to use toasts for errors.
- **Shared rules among the systems that use them:** at least 5 s (Spectrum); a toast with an action doesn't auto-dismiss (Spectrum, Material 3, Carbon); errors don't auto-dismiss (Atlassian); one action (Carbon, Material 3, Spectrum); two lines (Carbon, Material 3); about three to four at once (Fluent caps at 4).
- **Archetypes:** a neutral card stacked in a corner (Sonner, Geist, Fluent, Carbon); a bottom snackbar, one at a time (Material 3, Polaris, Spectrum); a top-centre pill (react-hot-toast, Ant `message`); the pill-to-card morph (goey-toast, sileo, Dribbble); a persistent flag or banner (Atlassian, GOV.UK).
- **The morph:** no design system uses it. goey-toast's 12 px coloured title is about 2.8:1 on white and never wraps; actions exist only in the expanded state; the path math is physical, not logical; both libraries depend on `motion`, and sileo blurs a large region with an SVG filter.
- **Themes, not variants:** surface (neutral, inverse, tinted), radius, elevation, width and gap. Carbon picks one contrast style per product and never mixes them.

### Community needs

Ordered by the survey's judgment, not by reaction count; Reddit couldn't be searched.

1. Toasts above and inside modals, usable there: sonner [#667](https://github.com/emilkowalski/sonner/issues/667), shadcn [#2401](https://github.com/shadcn-ui/ui/issues/2401), chakra [#6276](https://github.com/chakra-ui/chakra-ui/issues/6276), react-toastify [#959](https://github.com/fkhadra/react-toastify/issues/959), react-hot-toast [#355](https://github.com/timolins/react-hot-toast/issues/355).
2. A close button and actions with callbacks: react-hot-toast [#7](https://github.com/timolins/react-hot-toast/issues/7), its most-reacted open issue, and [#174](https://github.com/timolins/react-hot-toast/issues/174).
3. Custom content that keeps the motion: react-hot-toast [#116](https://github.com/timolins/react-hot-toast/issues/116).
4. Upsert by id and an awaitable promise: notistack [#234](https://github.com/iamhosseindhv/notistack/issues/234), sonner [#464](https://github.com/emilkowalski/sonner/issues/464), [#339](https://github.com/emilkowalski/sonner/issues/339).
5. Announced once: react-toastify [#1291](https://github.com/fkhadra/react-toastify/issues/1291) (three times), [#1122](https://github.com/fkhadra/react-toastify/issues/1122) (never).
6. Timing control, and no auto-dismiss with actions.
7. Dropping the oldest at a limit: react-hot-toast [#31](https://github.com/timolins/react-hot-toast/issues/31), react-toastify [#1129](https://github.com/fkhadra/react-toastify/issues/1129).
8. Position, mobile offsets and swipe toward the nearest edge: sonner [#274](https://github.com/emilkowalski/sonner/issues/274), [#396](https://github.com/emilkowalski/sonner/issues/396), radix [#2132](https://github.com/radix-ui/primitives/issues/2132).
9. `toast()` from anywhere, before mount, and after a redirect: radix [#2804](https://github.com/radix-ui/primitives/issues/2804), sonner [#624](https://github.com/emilkowalski/sonner/pull/624), [remix-toast](https://github.com/code-forge-io/remix-toast).
10. Testable, clean under React 19 and Strict Mode, no injected CSS: chakra [#2969](https://github.com/chakra-ui/chakra-ui/issues/2969), notistack [#614](https://github.com/iamhosseindhv/notistack/issues/614), react-hot-toast [#138](https://github.com/timolins/react-hot-toast/issues/138), sonner [#449](https://github.com/emilkowalski/sonner/issues/449).

The largest single signal is notistack [#184](https://github.com/iamhosseindhv/notistack/issues/184) (379 reactions): using it without Material UI. The [Hacker News thread](https://news.ycombinator.com/item?id=41298794) on "toasts are bad UX" (702 points) defends only undo and confirming background work, and asks for an activity log.

### Accessibility

- [WCAG 2.2.1](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html): a toast that disappears is a time limit unless the information is available elsewhere. React Spectrum never auto-dismisses a toast with an action for this reason (`packages/@adobe/react-spectrum/src/toast/ToastContainer.tsx:189-191`, and the same rule in S2's `Toast.tsx`).
- [WCAG 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html): status messages don't take focus; `status` for success and progress, `alert` for warnings and errors.
- [Adrian Roselli](https://adrianroselli.com/2020/01/defining-toast-messages.html): the live region must exist before the message. [Scott O'Hara](https://www.scottohara.me/blog/2019/07/08/a-toast-to-a11y-toasts.html): live regions strip button semantics; browse mode never fires hover or focus, so pausing on them isn't enough; offer undo outside the toast.
- React Aria's `useToast` (react-aria 3.53, `useToast.mjs`) gives each toast `role="alertdialog"` with `tabIndex=0` and its content `role="alert"`, hidden until mounted so NVDA announces it, so every toast interrupts. `useToastRegion` sets `data-react-aria-top-layer`, which `ariaHideOutside` skips (`ariaHideOutside.mjs:22`), so the region stays reachable while a React Aria Modal hides the rest of the page.

## Sources

- Packages read from npm tarballs: `sonner@2.0.8`, `react-hot-toast@2.6.1`, `react-toastify@11.1.0`, `notistack@3.0.2`, `@mantine/notifications@9.7.3`, `@zag-js/toast@1.46.0`, `@radix-ui/react-toast@1.3.1`, `@base-ui/react@1.9.0`, `@heroui/toast@2.0.22`, `@heroui/react@3.2.6`, `@fluentui/react-toast@9.8.5`, `goey-toast@0.5.0`, `sileo@0.1.6`, `remix-toast@4.0.0`, `@xstate/store@4.3.0`
- Source on GitHub: [adobe/react-spectrum](https://github.com/adobe/react-spectrum), [emilkowalski/sonner](https://github.com/emilkowalski/sonner), [timolins/react-hot-toast](https://github.com/timolins/react-hot-toast), [anl331/goey-toast](https://github.com/anl331/goey-toast), [hiaaryan/sileo](https://github.com/hiaaryan/sileo), [ant-design/ant-design](https://github.com/ant-design/ant-design), [mui/material-ui](https://github.com/mui/material-ui), [chakra-ui/chakra-ui](https://github.com/chakra-ui/chakra-ui)
- Design systems: [Primer](https://primer.style/accessibility/toasts), [Scottish Government](https://designsystem.gov.scot/components/notification-message/modals-toasts), [GOV.UK notification banner](https://design-system.service.gov.uk/components/notification-banner/), [Carbon](https://carbondesignsystem.com/components/notification/usage/), [Atlassian Flag](https://atlassian.design/components/flag/usage), [Fluent 2](https://fluent2.microsoft.design/components/web/react/core/toast/usage), [React Spectrum Toast](https://react-spectrum.adobe.com/Toast), [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/notifications), [Geist](https://vercel.com/geist/toast), [Ant Design message](https://ant.design/components/message), [Polaris (deprecated)](https://polaris-react.shopify.com/components/deprecated/toast), [Material 3 snackbar](https://material.io/components/snackbars)
- Writing: [Building a toast component](https://emilkowal.ski/ui/building-a-toast-component), [Toasts are bad UX](https://maxschmitt.me/posts/toasts-bad-ux), [Robin Wieruch on server action toasts](https://www.robinwieruch.de/react-server-actions-toast/)
