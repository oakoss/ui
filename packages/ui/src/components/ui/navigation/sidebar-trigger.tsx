import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';

import type { DistributiveOmit } from '#/components/ui/overlays/dialog';

import * as Icon from '#/components/icons';
import { Kbd } from '#/components/ui/data/kbd';
import { Button, type ButtonProps } from '#/components/ui/inputs/button';
import {
  nameOr,
  useSidebarInternals,
} from '#/components/ui/navigation/sidebar-provider';
import { Tooltip, TooltipTrigger } from '#/components/ui/overlays/tooltip';
import { cx } from '#/lib/cx';

export type SidebarRailProps = { label?: string } & Omit<
  AriaButtonProps,
  'aria-label' | 'aria-labelledby' | 'children'
>;

export type SidebarTriggerProps = { label?: string } & DistributiveOmit<
  ButtonProps,
  'aria-label' | 'aria-labelledby' | 'children' | 'size'
>;

// A mouse convenience out of the tab order, still visible at the page's edge
// while an off-canvas sidebar is hidden.
export function SidebarRail({
  className,
  label = 'Toggle sidebar',
  onPress,
  ...props
}: SidebarRailProps) {
  const { isMobile, toggleSidebar } = useSidebarInternals();
  if (isMobile) return null;
  return (
    <AriaButton
      data-slot="sidebar-rail"
      excludeFromTabOrder
      preventFocusOnPress
      {...props}
      aria-label={nameOr(label, 'Toggle sidebar')}
      aria-labelledby={undefined}
      className={cx(
        'visible absolute inset-y-0 z-20 flex w-4 cursor-ew-resize transition-colors ease-linear group-data-[side=end]:-start-2 group-data-[side=start]:-end-2 after:absolute after:inset-y-0 after:start-1/2 after:w-0.5 group-data-[collapsible=offcanvas]:hover:bg-sidebar hover:after:bg-sidebar-border',
        className,
      )}
      onPress={(event) => {
        onPress?.(event);
        toggleSidebar();
      }}
    />
  );
}

// The tooltip shows the shortcut while it works.
export function SidebarTrigger({
  label = 'Toggle sidebar',
  onPress,
  ...props
}: SidebarTriggerProps) {
  const {
    collapsible,
    isMobile,
    isOpen,
    isOpenMobile,
    keyboardShortcut,
    sidebarId,
    toggleSidebar,
  } = useSidebarInternals();
  const name = nameOr(label, 'Toggle sidebar');
  const key =
    keyboardShortcut === false || collapsible === 'none'
      ? ''
      : keyboardShortcut.toUpperCase();
  return (
    <TooltipTrigger>
      <Button
        data-slot="sidebar-trigger"
        variant="ghost"
        {...props}
        aria-controls={isMobile ? undefined : sidebarId}
        aria-expanded={isMobile ? isOpenMobile : isOpen}
        aria-label={name}
        aria-labelledby={undefined}
        onPress={(event) => {
          onPress?.(event);
          toggleSidebar();
        }}
        size="icon-sm"
      >
        <Icon.PanelLeft className="rtl:rotate-180" />
      </Button>
      <Tooltip>
        {name}
        {key === '' ? null : (
          <Kbd className="ms-2">{`${isApple() ? '⌘' : 'Ctrl+'}${key}`}</Kbd>
        )}
      </Tooltip>
    </TooltipTrigger>
  );
}

function isApple() {
  return /Mac|iPhone|iPad/u.test(navigator.userAgent);
}
