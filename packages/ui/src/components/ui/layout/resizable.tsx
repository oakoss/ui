import {
  type HTMLAttributes,
  type ReactNode,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import * as ResizablePrimitive from 'react-resizable-panels';

import { useScrollContainer } from '#/hooks/use-scroll-region';
import { readCookie, writeCookie } from '#/lib/cookies';
import { cn } from '#/lib/cx';
import { focusRing } from '#/lib/recipes';

export type ResizableHandleProps = (
  | { 'aria-label': string; 'aria-labelledby'?: string }
  | { 'aria-label'?: string; 'aria-labelledby': string }
) & { withHandle?: boolean } & ResizablePrimitive.SeparatorProps;

export type ResizablePanelGroupProps = {
  // Keeps the layout in a cookie under this key; give panels ids, which the
  // layout is keyed by.
  persistKey?: string;
} & ResizablePrimitive.GroupProps;

// The library's hit test sets the drag area, so CSS can't widen it; these
// meet WCAG 2.5.8 with a mouse and 2.5.5 on touch.
const targetSize = { coarse: 44, fine: 24 };

export function ResizableHandle({
  className,
  withHandle = false,
  ...props
}: ResizableHandleProps) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      {...props}
      className={cn(
        focusRing,
        'group/handle relative flex shrink-0 items-center justify-center border-input transition-colors aria-disabled:opacity-50 aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:border-t aria-[orientation=vertical]:border-s data-[separator=active]:border-ring data-[separator=hover]:border-ring',
        className,
      )}
    >
      {withHandle ? (
        <div
          aria-hidden
          className={cn(
            'z-10 h-6 w-1.5 shrink-0 rounded-full border border-input bg-background group-aria-[orientation=horizontal]/handle:h-1.5 group-aria-[orientation=horizontal]/handle:w-6',
          )}
          data-slot="resizable-handle-icon"
        />
      ) : null}
    </ResizablePrimitive.Separator>
  );
}

// Content scrolls in our container, a tab stop only while it overflows; it
// takes the label, description, role and tabIndex. It fills the library's
// own wrapper, which takes the className, so that wrapper never scrolls.
export function ResizablePanel({
  'aria-describedby': describedBy,
  'aria-label': label,
  'aria-labelledby': labelledBy,
  children,
  className,
  role,
  tabIndex,
  ...props
}: ResizablePrimitive.PanelProps) {
  return (
    <ResizablePrimitive.Panel
      data-slot="resizable-panel"
      {...props}
      className={cn('relative')}
    >
      <PanelContent
        aria-describedby={describedBy}
        aria-label={label}
        aria-labelledby={labelledBy}
        className={cn(className)}
        {...(role !== undefined && { role })}
        {...(tabIndex !== undefined && { tabIndex })}
      >
        {children}
      </PanelContent>
    </ResizablePrimitive.Panel>
  );
}

export function ResizablePanelGroup({
  className,
  defaultLayout,
  groupRef,
  onLayoutChanged,
  persistKey,
  resizeTargetMinimumSize = targetSize,
  ...props
}: ResizablePanelGroupProps) {
  const stored = useStoredLayout(persistKey);
  const ownGroupRef = useRef<ResizablePrimitive.GroupImperativeHandle>(null);
  useImperativeHandle<
    null | ResizablePrimitive.GroupImperativeHandle,
    null | ResizablePrimitive.GroupImperativeHandle
  >(groupRef, () => ownGroupRef.current, []);
  // A server renders the default; once hydrated, the stored layout applies.
  useEffect(() => {
    if (stored === null) return;
    try {
      ownGroupRef.current?.setLayout(stored);
    } catch {
      // Saved for other panels; the default stands.
    }
  }, [stored]);
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      {...props}
      className={cn(className)}
      defaultLayout={defaultLayout ?? stored ?? undefined}
      groupRef={ownGroupRef}
      onLayoutChanged={(layout, meta) => {
        if (persistKey !== undefined && meta.isUserInteraction) {
          void writeCookie(persistKey, JSON.stringify(meta.requestedLayout));
        }
        onLayoutChanged?.(layout, meta);
      }}
      resizeTargetMinimumSize={resizeTargetMinimumSize}
    />
  );
}

function isLayout(value: unknown): value is ResizablePrimitive.Layout {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((size) => typeof size === 'number')
  );
}

function PanelContent({
  children,
  className,
  ...props
}: { children: ReactNode; className: string | undefined } & Pick<
  HTMLAttributes<HTMLDivElement>,
  'aria-describedby' | 'aria-label' | 'aria-labelledby' | 'role' | 'tabIndex'
>) {
  const container = useScrollContainer<HTMLDivElement>(props);
  return (
    <div
      {...container}
      className={cn(
        focusRing,
        'absolute inset-0 overflow-auto focus-visible:-outline-offset-3',
        className,
      )}
      data-slot="resizable-panel-content"
    >
      {children}
    </div>
  );
}

function parseLayout(raw: null | string) {
  if (raw === null) return null;
  try {
    const value: unknown = JSON.parse(raw);
    return isLayout(value) ? value : null;
  } catch {
    return null;
  }
}

// The cookie changes only through this group.
function subscribeNever() {
  return () => {
    // Nothing to unsubscribe.
  };
}

// A layout the cookie holds, read during render: a client's first render
// has it, and a server renders the default until hydration.
function useStoredLayout(key: string | undefined) {
  const raw = useSyncExternalStore(
    subscribeNever,
    () => (key === undefined ? null : readCookie(key)),
    () => null,
  );
  return useMemo(() => parseLayout(raw), [raw]);
}
