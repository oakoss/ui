import { createContext, use } from 'react';
import {
  Tab as AriaTab,
  TabList as AriaTabList,
  type TabListProps as AriaTabListProps,
  TabPanel as AriaTabPanel,
  type TabPanelProps as AriaTabPanelProps,
  type TabProps as AriaTabProps,
  Tabs as AriaTabs,
  type TabsProps as AriaTabsProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants/lite';

import { cx } from '#/lib/cx';
import { focusRing } from '#/lib/recipes';

export type TabsProps = { variant?: TabsVariant } & AriaTabsProps;

export type TabsVariant = 'default' | 'line';

// Tabs sets the look once; its list and tabs read it here.
const TabsVariantContext = createContext<TabsVariant>('default');

// The list is the group its tabs read their orientation from, so a Tabs
// nested in another's panel doesn't take the outer one's layout.
const listStyles = tv({
  base: 'group/tabs-list inline-flex w-fit items-center justify-center text-muted-foreground orientation-vertical:h-fit orientation-vertical:flex-col',
  variants: {
    variant: {
      default: 'rounded-lg bg-muted p-0.5 orientation-horizontal:h-control-sm',
      line: 'gap-1',
    },
  },
});

// The selected look never relies on a fill alone: forced colors repaint
// fills, so the default look takes the system's selection colors there, opting
// out of the text backplate that would hide its label and so setting its own
// focus outline color, and the line look's indicator is a border, which they
// keep. A disabled tab stays gray, selected or not.
const tabStyles = tv({
  base: [
    focusRing,
    'relative inline-flex flex-1 cursor-default items-center justify-center gap-1.5 rounded-md px-1.5 py-0.5 text-sm font-medium whitespace-nowrap text-foreground/60 transition-colors hover:text-foreground disabled:opacity-50 dark:text-muted-foreground forced-colors:disabled:text-[GrayText] selected:not-disabled:text-foreground',
    'group-orientation-vertical/tabs-list:w-full group-orientation-vertical/tabs-list:justify-start',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  variants: {
    variant: {
      default:
        'h-full selected:bg-background selected:shadow-sm dark:selected:bg-input/30 forced-colors:selected:not-disabled:bg-[Highlight] forced-colors:selected:not-disabled:text-[HighlightText] forced-colors:selected:not-disabled:forced-color-adjust-none forced-colors:selected:not-disabled:focus-visible:outline-[Highlight]',
      line: 'after:absolute group-orientation-horizontal/tabs-list:after:inset-x-0 group-orientation-horizontal/tabs-list:after:bottom-0 group-orientation-vertical/tabs-list:after:inset-y-0 group-orientation-vertical/tabs-list:after:end-0 selected:after:border-foreground group-orientation-horizontal/tabs-list:selected:after:border-b-2 group-orientation-vertical/tabs-list:selected:after:border-e-2',
    },
  },
});

export function Tabs({ className, variant = 'default', ...props }: TabsProps) {
  return (
    <TabsVariantContext value={variant}>
      <AriaTabs
        data-slot="tabs"
        {...props}
        className={cx('flex gap-2 orientation-horizontal:flex-col', className)}
        data-variant={variant}
      />
    </TabsVariantContext>
  );
}

// A panel with nothing focusable inside is a tab stop, so it shows the focus
// outline, drawn inside its edge where a clipping parent can't hide it. It
// isn't a control, so unlike focusRing it draws no outline at rest, which
// forced colors would paint as a box.
export function TabsContent({ className, ...props }: AriaTabPanelProps) {
  return (
    <AriaTabPanel
      data-slot="tabs-content"
      {...props}
      className={cx(
        'flex-1 rounded-control text-sm outline-none focus-visible:outline-(length:--ring-width) focus-visible:-outline-offset-3 focus-visible:outline-ring focus-visible:outline-solid',
        className,
      )}
    />
  );
}

export function TabsList<T extends object>({
  className,
  ...props
}: AriaTabListProps<T>) {
  const variant = use(TabsVariantContext);
  return (
    <AriaTabList
      data-slot="tabs-list"
      {...props}
      className={cx(listStyles({ variant }), className)}
      data-variant={variant}
    />
  );
}

export function TabsTrigger({ className, ...props }: AriaTabProps) {
  const variant = use(TabsVariantContext);
  return (
    <AriaTab
      data-slot="tabs-trigger"
      {...props}
      className={cx(tabStyles({ variant }), className)}
    />
  );
}
