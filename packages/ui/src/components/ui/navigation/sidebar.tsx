import { type ComponentProps, useId, useLayoutEffect, useMemo } from 'react';
import { tv } from 'tailwind-variants/lite';

import {
  nameOr,
  type SidebarCollapsible,
  SidebarLayoutContext,
  type SidebarSide,
  useFocusHandoff,
  useSidebarInternals,
} from '#/components/ui/navigation/sidebar-provider';
import { Sheet } from '#/components/ui/overlays/sheet';
import { cn } from '#/lib/cx';

export type SidebarProps = {
  collapsible?: SidebarCollapsible;
  // Describes the phone's sheet to screen readers.
  mobileDescription?: string;
  // Names the phone's sheet when the sidebar has no name of its own.
  mobileLabel?: string;
  side?: SidebarSide;
  variant?: SidebarVariant;
} & ComponentProps<'div'>;

export type SidebarVariant = 'floating' | 'inset' | 'sidebar';

type PartProps = { isNamed: boolean } & Omit<SidebarProps, 'collapsible'>;

// Floating and inset sidebars pad their panel, so their icon rail is wider.
const padded = {
  container:
    'p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]',
  gap: 'group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]',
};

const styles = tv({
  defaultVariants: { side: 'start', variant: 'sidebar' },
  slots: {
    container:
      'fixed inset-y-0 z-(--z-sticky) hidden h-svh w-(--sidebar-width) transition-[inset-inline-start,inset-inline-end,width,visibility] duration-200 ease-linear group-data-[collapsible=offcanvas]:invisible md:flex',
    gap: 'relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear group-data-[collapsible=offcanvas]:w-0',
    inner:
      'flex size-full flex-col bg-sidebar group-data-[variant=floating]:rounded-panel group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm',
    root: 'group peer hidden text-sidebar-foreground data-[side=end]:order-last md:block',
  },
  variants: {
    side: {
      end: {
        container:
          'end-0 group-data-[collapsible=offcanvas]:-end-(--sidebar-width)',
      },
      start: {
        container:
          'start-0 group-data-[collapsible=offcanvas]:-start-(--sidebar-width)',
      },
    },
    variant: {
      floating: padded,
      inset: padded,
      sidebar: {
        container:
          'border-sidebar-border group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=end]:border-s group-data-[side=start]:border-e',
        gap: 'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
      },
    },
  },
});

// Named, it's a navigation landmark, and its phone sheet takes the name.
export function Sidebar({
  collapsible = 'offcanvas',
  side = 'start',
  variant = 'sidebar',
  ...props
}: SidebarProps) {
  const { isMobile, setCollapsible, state } = useSidebarInternals();
  useLayoutEffect(
    () => setCollapsible(collapsible),
    [collapsible, setCollapsible],
  );
  const isNamed =
    (props['aria-label'] ?? '').trim() !== '' ||
    (props['aria-labelledby'] ?? '').trim() !== '';
  const isIcon = !isMobile && collapsible === 'icon' && state === 'collapsed';
  const layout = useMemo(() => ({ isIcon, side }), [isIcon, side]);
  if (collapsible === 'none') {
    return <StaticSidebar isNamed={isNamed} {...props} />;
  }
  return (
    <SidebarLayoutContext value={layout}>
      {isMobile ? (
        <MobileSidebar isNamed={isNamed} side={side} {...props} />
      ) : (
        <DesktopSidebar
          collapsible={collapsible}
          isNamed={isNamed}
          side={side}
          variant={variant}
          {...props}
        />
      )}
    </SidebarLayoutContext>
  );
}

// The page beside the sidebar: its `<main>`, or a div in a layout with one.
export function SidebarInset({
  className,
  elementType: Element = 'main',
  ...props
}: { elementType?: 'div' | 'main' } & Omit<ComponentProps<'main'>, 'ref'>) {
  return (
    <Element
      className={cn(
        'relative flex w-full flex-1 flex-col bg-background md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:rounded-panel md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[side=end]:me-0 md:peer-data-[variant=inset]:peer-data-[side=start]:ms-0 md:peer-data-[variant=inset]:peer-data-[state=collapsed]:mx-2',
        className,
      )}
      data-slot="sidebar-inset"
      {...props}
    />
  );
}

function DesktopSidebar({
  children,
  className,
  collapsible,
  isNamed,
  mobileDescription: _description,
  mobileLabel: _label,
  side,
  variant,
  ...props
}: { collapsible: SidebarCollapsible } & PartProps) {
  const { sidebarId, sidebarRef, state } = useSidebarInternals();
  useFocusHandoff(collapsible);
  const slots = styles({ side, variant });
  const Inner = isNamed ? 'nav' : 'div';
  return (
    <div
      className={cn(slots.root())}
      data-collapsible={state === 'collapsed' ? collapsible : ''}
      data-side={side}
      data-slot="sidebar"
      data-state={state}
      data-variant={variant}
    >
      <div className={cn(slots.gap())} data-slot="sidebar-gap" />
      <div
        className={cn(slots.container())}
        data-side={side}
        data-slot="sidebar-container"
        id={sidebarId}
        ref={sidebarRef}
      >
        <Inner
          data-slot="sidebar-inner"
          {...props}
          className={cn(slots.inner(), className)}
        >
          {children}
        </Inner>
      </div>
    </div>
  );
}

// The sheet renders outside the provider, so its width variable is set on
// the sidebar itself, where a consumer's className can change it.
function MobileSidebar({
  children,
  className,
  isNamed,
  mobileDescription,
  mobileLabel,
  side,
  ...props
}: PartProps) {
  const { isOpenMobile, setOpenMobile } = useSidebarInternals();
  const descriptionId = useId();
  const hasDescription = (mobileDescription ?? '').trim() !== '';
  const Inner = isNamed ? 'nav' : 'div';
  return (
    <Sheet
      aria-describedby={hasDescription ? descriptionId : undefined}
      aria-label={
        isNamed ? props['aria-label'] : nameOr(mobileLabel, 'Sidebar')
      }
      aria-labelledby={props['aria-labelledby']}
      className="w-auto max-w-none bg-sidebar p-0 text-sidebar-foreground"
      isOpen={isOpenMobile}
      onOpenChange={setOpenMobile}
      showCloseButton={false}
      side={side}
    >
      {hasDescription ? (
        <span className="sr-only" id={descriptionId}>
          {mobileDescription}
        </span>
      ) : null}
      <Inner
        data-mobile="true"
        data-slot="sidebar"
        {...props}
        className={cn(
          'flex size-full w-(--sidebar-width-mobile) flex-col [--sidebar-width-mobile:18rem]',
          className,
        )}
      >
        {children}
      </Inner>
    </Sheet>
  );
}

function StaticSidebar({
  className,
  isNamed,
  mobileDescription: _description,
  mobileLabel: _label,
  ...props
}: PartProps) {
  const { sidebarId } = useSidebarInternals();
  const Inner = isNamed ? 'nav' : 'div';
  return (
    <Inner
      data-slot="sidebar"
      id={sidebarId}
      {...props}
      className={cn(
        'flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground',
        className,
      )}
    />
  );
}
