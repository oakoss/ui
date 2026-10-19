import { type ComponentProps, type ReactNode, useId } from 'react';
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
  Link as AriaLink,
  type LinkProps as AriaLinkProps,
  type PressEvent,
} from 'react-aria-components';
import { tv, type VariantProps } from 'tailwind-variants/lite';

import { Skeleton } from '#/components/ui/feedback/skeleton';
import {
  useSidebar,
  useSidebarLayout,
} from '#/components/ui/navigation/sidebar-provider';
import {
  Tooltip,
  type TooltipProps,
  TooltipTrigger,
} from '#/components/ui/overlays/tooltip';
import { cn, cx } from '#/lib/cx';
import { focusRing } from '#/lib/recipes';

export type SidebarMenuActionProps = ((
  | { 'aria-label': string }
  | { 'aria-labelledby': string }
) &
  AriaButtonProps) & {
  // Shown on hover and focus where the pointer can hover, always on touch.
  showOnHover?: boolean;
};

export type SidebarMenuButtonProps = {
  // Names the item in a tooltip while the sidebar is collapsed to icons.
  tooltip?: ReactNode | TooltipProps;
} & LinkOrButton &
  VariantProps<typeof buttonStyles>;

export type SidebarMenuSubButtonProps = { size?: 'md' | 'sm' } & LinkOrButton;

// Props a link would drop, so a menu link rejects them.
type ButtonOnly = Exclude<keyof AriaButtonProps, keyof AriaLinkProps>;

// A link with `href`, otherwise a button. A link marked current gets
// `aria-current="page"`; a router link that sets it itself needs no prop.
type LinkOrButton = { className?: string; isCurrent?: boolean } & (
  | Omit<AriaButtonProps, 'className'>
  | (Omit<AriaLinkProps, 'className'> &
      Partial<Record<ButtonOnly, never>> &
      Required<Pick<AriaLinkProps, 'href'>>)
);

// Forced colors repaint the current item's fill as the page color, so it
// takes Highlight.
const current =
  'current:bg-sidebar-accent current:text-sidebar-accent-foreground forced-colors:current:bg-[Highlight] forced-colors:current:text-[HighlightText] forced-colors:current:forced-color-adjust-none';

const buttonStyles = tv({
  base: [
    focusRing,
    current,
    'peer/menu-button group/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-start text-sm transition-[width,height,padding] group-has-data-[slot=sidebar-menu-action]/menu-item:pe-8 group-data-[collapsible=icon]:size-control-sm group-data-[collapsible=icon]:p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 current:font-medium pressed:bg-sidebar-accent pressed:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0 [&>span:last-child]:truncate',
  ],
  defaultVariants: { size: 'md', variant: 'default' },
  variants: {
    size: {
      lg: 'h-12 group-data-[collapsible=icon]:p-0',
      md: 'h-control-sm',
      sm: 'h-7 text-xs',
    },
    variant: {
      default: '',
      outline:
        'bg-background ring-1 ring-sidebar-border hover:ring-sidebar-accent',
    },
  },
});

const skeletonWidths = ['w-1/2', 'w-3/5', 'w-2/3', 'w-3/4', 'w-4/5'];

export function SidebarMenu({ className, ...props }: ComponentProps<'ul'>) {
  return (
    <ul
      className={cn('flex w-full min-w-0 flex-col gap-1', className)}
      data-slot="sidebar-menu"
      {...props}
    />
  );
}

export function SidebarMenuAction({
  className,
  showOnHover = false,
  ...props
}: SidebarMenuActionProps) {
  return (
    <AriaButton
      data-slot="sidebar-menu-action"
      {...props}
      className={cx(
        [
          focusRing,
          'absolute end-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground transition-transform group-data-[collapsible=icon]:hidden peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0',
          showOnHover &&
            'opacity-0 group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 peer-current/menu-button:text-sidebar-accent-foreground aria-expanded:opacity-100 pointer-coarse:opacity-100',
        ],
        className,
      )}
    />
  );
}

export function SidebarMenuBadge({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute end-1 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium text-sidebar-foreground tabular-nums select-none group-data-[collapsible=icon]:hidden peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1 peer-current/menu-button:text-sidebar-accent-foreground',
        className,
      )}
      data-slot="sidebar-menu-badge"
      {...props}
    />
  );
}

export function SidebarMenuButton({
  className,
  size = 'md',
  tooltip,
  variant = 'default',
  ...props
}: SidebarMenuButtonProps) {
  const { isIcon, side } = useSidebarLayout();
  const button = (
    <LinkOrButtonPart
      className={cn(buttonStyles({ size, variant }), className)}
      data-size={size}
      data-slot="sidebar-menu-button"
      {...props}
    />
  );
  if (tooltip === undefined || tooltip === null) return button;
  const tooltipProps =
    typeof tooltip === 'object' && 'children' in tooltip
      ? tooltip
      : { children: tooltip };
  return (
    <TooltipTrigger isDisabled={!isIcon}>
      {button}
      <Tooltip
        placement={side === 'start' ? 'end' : 'start'}
        {...tooltipProps}
      />
    </TooltipTrigger>
  );
}

export function SidebarMenuItem({ className, ...props }: ComponentProps<'li'>) {
  return (
    <li
      className={cn('group/menu-item relative', className)}
      data-slot="sidebar-menu-item"
      {...props}
    />
  );
}

// Widths vary by item but match between the server and the client.
export function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: { showIcon?: boolean } & ComponentProps<'div'>) {
  const id = useId();
  let sum = 0;
  for (const character of id) sum += character.codePointAt(0) ?? 0;
  return (
    <div
      className={cn(
        'flex h-control-sm items-center gap-2 rounded-md px-2',
        className,
      )}
      data-slot="sidebar-menu-skeleton"
      {...props}
    >
      {showIcon ? <Skeleton className="size-4 rounded-md" /> : null}
      <Skeleton
        className={cn('h-4', skeletonWidths[sum % skeletonWidths.length])}
      />
    </div>
  );
}

export function SidebarMenuSub({ className, ...props }: ComponentProps<'ul'>) {
  return (
    <ul
      className={cn(
        'mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-s border-sidebar-border px-2.5 py-0.5 group-data-[collapsible=icon]:hidden rtl:-translate-x-px',
        className,
      )}
      data-slot="sidebar-menu-sub"
      {...props}
    />
  );
}

export function SidebarMenuSubButton({
  className,
  size = 'md',
  ...props
}: SidebarMenuSubButtonProps) {
  return (
    <LinkOrButtonPart
      className={cn(
        focusRing,
        current,
        'flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground group-data-[collapsible=icon]:hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[size=md]:text-sm data-[size=sm]:text-xs rtl:translate-x-px pressed:bg-sidebar-accent pressed:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground',
        className,
      )}
      data-size={size}
      data-slot="sidebar-menu-sub-button"
      {...props}
    />
  );
}

export function SidebarMenuSubItem({
  className,
  ...props
}: ComponentProps<'li'>) {
  return (
    <li
      className={cn('group/menu-sub-item relative', className)}
      data-slot="sidebar-menu-sub-item"
      {...props}
    />
  );
}

// A link closes the phone's sheet as it navigates. A current button takes
// data-current itself, which React Aria sets only on links.
function LinkOrButtonPart({
  className,
  isCurrent = false,
  ...props
}: { 'data-size': string; 'data-slot': string } & LinkOrButton) {
  const { isMobile, setOpenMobile } = useSidebar();
  if (!('href' in props)) {
    return (
      <AriaButton
        aria-current={isCurrent || undefined}
        data-current={isCurrent || undefined}
        {...props}
        className={cn(className)}
      />
    );
  }
  const { onPress } = props;
  return (
    <AriaLink
      aria-current={isCurrent ? 'page' : undefined}
      {...props}
      className={cn(className)}
      onPress={(event: PressEvent) => {
        onPress?.(event);
        if (isMobile) setOpenMobile(false);
      }}
    />
  );
}
