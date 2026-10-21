import { type ComponentProps, type RefObject, useLayoutEffect } from 'react';

import { Input, type InputProps } from '#/components/ui/inputs/input';
import {
  Separator,
  type SeparatorProps,
} from '#/components/ui/layout/separator';
import { currentPage } from '#/components/ui/navigation/sidebar-provider';
import { useScrollContainer } from '#/hooks/use-scroll-region';
import { cn, cx } from '#/lib/cx';
import { focusRing } from '#/lib/recipes';

// A focusable scroll region that brings the current page into view when it
// mounts. One wrapper holds the groups, so a group opening anywhere resizes
// what the region watches.
export function SidebarContent({
  children,
  className,
  ...props
}: Omit<ComponentProps<'div'>, 'ref'>) {
  const container = useScrollContainer<HTMLDivElement>(props);
  useCurrentInView(container.ref);
  return (
    <div
      data-slot="sidebar-content"
      {...container}
      className={cn(
        focusRing,
        'min-h-0 flex-1 overflow-x-hidden overflow-y-auto focus-visible:-outline-offset-3',
        className,
      )}
    >
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

export function SidebarFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-2 p-2', className)}
      data-slot="sidebar-footer"
      {...props}
    />
  );
}

export function SidebarHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col gap-2 p-2', className)}
      data-slot="sidebar-header"
      {...props}
    />
  );
}

export function SidebarInput({ className, ...props }: InputProps) {
  return (
    <Input
      className={cx('w-full bg-background', className)}
      data-slot="sidebar-input"
      size="sm"
      {...props}
    />
  );
}

export function SidebarSeparator({ className, ...props }: SeparatorProps) {
  return (
    <Separator
      className={cn('mx-2 w-auto border-sidebar-border', className)}
      data-slot="sidebar-separator"
      {...props}
    />
  );
}

// Centers the current page once a group that opens for it has resized.
function revealCurrent(container: HTMLElement) {
  const item = container.querySelector(currentPage);
  if (!item) return true;
  const target = item.getBoundingClientRect();
  const box = container.getBoundingClientRect();
  // Still inside a closed or opening group, which clips it from the scroll.
  if (
    item.closest('[hidden], [aria-hidden=true]') ||
    target.bottom - box.top + container.scrollTop > container.scrollHeight
  ) {
    return false;
  }
  if (target.top < box.top || target.bottom > box.bottom) {
    container.scrollTop +=
      target.top - box.top - (box.height - target.height) / 2;
  }
  return true;
}

// Once the user scrolls, presses or types in the sidebar, a current page that
// shows up later stays where it is.
function useCurrentInView(ref: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const container = ref.current;
    const observer = new ResizeObserver(() => {
      if (container && revealCurrent(container)) observer.disconnect();
    });
    const stop = () => observer.disconnect();
    const groups = container?.firstElementChild;
    if (groups) observer.observe(groups);
    container?.addEventListener('keydown', stop);
    container?.addEventListener('pointerdown', stop);
    container?.addEventListener('wheel', stop);
    return () => {
      observer.disconnect();
      container?.removeEventListener('keydown', stop);
      container?.removeEventListener('pointerdown', stop);
      container?.removeEventListener('wheel', stop);
    };
  }, [ref]);
}
