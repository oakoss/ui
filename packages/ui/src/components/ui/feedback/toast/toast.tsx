import { useEffect, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { tv } from 'tailwind-variants/lite';

import type { ToastIcons } from '#/components/ui/feedback/toast/toast-body';
import type { ToastItem, ToastStore } from '#/lib/toast/toast-store';

import {
  type ToastAnnounce,
  ToastItemView,
} from '#/components/ui/feedback/toast/toast-item';
import { useToastRegionParts } from '#/hooks/use-toast-region';
import { cn } from '#/lib/cx';
import { focusRing } from '#/lib/recipes';
import { announce } from '#/lib/toast/toast-announcer';
import { toastStore } from '#/lib/toast/toast-api';
import {
  defaultToastDuration,
  defaultToastLimit,
  defaultToastVisible,
} from '#/lib/toast/toast-content';

export { toast } from '#/lib/toast/toast-api';

export type ToasterMessages = {
  // React Aria's translated "Close" otherwise.
  close?: string;
  pending?: string;
  // React Aria's translated count ("2 notifications") otherwise.
  region?: (count: number) => string;
};

export type ToasterPlacement = keyof typeof placements;

export type ToasterProps = {
  className?: string;
  // For toasts that don't set their own; never under 5 s.
  duration?: number;
  // Per intent, for toasts that don't set their own.
  icons?: ToastIcons;
  // Keeps the stack open, for toasts whose actions shouldn't hide behind
  // another; timers still run.
  isExpanded?: boolean;
  // Toasts kept at once, at least 1; past it the oldest closes.
  limit?: number;
  messages?: ToasterMessages;
  placement?: ToasterPlacement;
  store?: ToastStore;
  // Toasts the stack shows, at least 1; older ones wait behind it, their
  // timers held until they move up.
  visible?: number;
};

type ToastRegionProps = {
  className: string;
  icons: ToastIcons | undefined;
  isExpanded: boolean;
  items: readonly ToastItem[];
  messages: ToasterMessages | undefined;
  onAnnounce: ToastAnnounce;
  placement: ToasterPlacement;
  store: ToastStore;
  visible: number;
};

const placements = {
  'bottom center': { align: 'center', side: 'bottom' },
  'bottom end': { align: 'end', side: 'bottom' },
  'bottom start': { align: 'start', side: 'bottom' },
  'top center': { align: 'center', side: 'top' },
  'top end': { align: 'end', side: 'top' },
  'top start': { align: 'start', side: 'top' },
} as const;

// Clear of a phone's notch, home bar and on-screen keyboard, and full width
// on a phone.
const styles = tv({
  base: [
    focusRing,
    'fixed z-(--z-toast) flex h-(--toaster-height) max-h-[calc(var(--toaster-viewport,100dvh)-env(safe-area-inset-top)-env(safe-area-inset-bottom))] w-full max-w-sm overflow-x-hidden overflow-y-hidden overscroll-contain px-[max(env(safe-area-inset-left),env(safe-area-inset-right))] focus-visible:-outline-offset-3 data-scrollable:overflow-y-auto max-sm:inset-x-0 max-sm:max-w-none',
  ],
  variants: {
    align: { center: 'inset-x-0 mx-auto', end: 'end-0', start: 'start-0' },
    // The stack scrolls from its edge: column-reverse starts a bottom
    // stack's scroll at the bottom.
    side: {
      bottom:
        'bottom-[max(env(safe-area-inset-bottom),var(--toaster-bottom,0px))] flex-col-reverse',
      top: 'top-[max(env(safe-area-inset-top),var(--toaster-top,0px))] flex-col',
    },
  },
});

// Renders the store's toasts. It sits on the body, like React Aria's
// overlays, so an open modal never hides it.
export function Toaster({
  className,
  duration = defaultToastDuration,
  icons,
  isExpanded = false,
  limit = defaultToastLimit,
  messages,
  placement = 'bottom end',
  store = toastStore,
  visible = defaultToastVisible,
}: ToasterProps) {
  const { isClient, items } = useStoreItems(store);
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);
  useConnectedStore(store, { duration, limit, visible });

  if (!isClient) return null;
  const onAnnounce: ToastAnnounce = (message, priority) => {
    const region = priority === 'high' ? assertiveRef : politeRef;
    announce(region.current, message);
  };
  // The live regions stay mounted, so later toasts reach regions screen
  // readers already watch.
  return createPortal(
    <div data-react-aria-top-layer="" data-slot="toast-portal">
      <div aria-live="polite" className="sr-only" ref={politeRef} role="log" />
      <div
        aria-live="assertive"
        className="sr-only"
        ref={assertiveRef}
        role="log"
      />
      {items.length > 0 ? (
        <ToastRegion
          className={cn(styles(placements[placement]), className)}
          icons={icons}
          isExpanded={isExpanded}
          items={items}
          messages={messages}
          onAnnounce={onAnnounce}
          placement={placement}
          store={store}
          visible={visible}
        />
      ) : null}
    </div>,
    document.body,
  );
}

function isFalse() {
  return false;
}

function isTrue() {
  return true;
}

function subscribeNever() {
  return () => {
    // Nothing to unsubscribe.
  };
}

// A landmark only while it holds toasts, so F6 never stops on an empty one.
function ToastRegion({
  className,
  icons,
  isExpanded,
  items,
  messages,
  onAnnounce,
  placement,
  store,
  visible,
}: ToastRegionProps) {
  const { align, side } = placements[placement];
  const { ref, regionProps, stack } = useToastRegionParts({
    isExpanded,
    items,
    label: messages?.region?.(items.length),
    side,
    store,
    visible,
  });
  return (
    <div
      {...regionProps}
      className={cn(className)}
      data-placement={placement}
      data-slot="toast-viewport"
      ref={ref}
    >
      <div className="relative h-(--toaster-height) w-full shrink-0">
        {stack.placed.map(({ item, slot }) => (
          <ToastItemView
            align={align}
            closeLabel={messages?.close}
            icons={icons}
            item={item}
            key={item.instance}
            onAnnounce={onAnnounce}
            onHeight={(height) => {
              stack.onHeight(item.instance, height);
            }}
            pendingLabel={messages?.pending}
            side={side}
            slot={slot}
            store={store}
          />
        ))}
      </div>
    </div>
  );
}

// Timers run while the Toaster is mounted, and pause while the page is hidden.
function useConnectedStore(
  store: ToastStore,
  {
    duration,
    limit,
    visible,
  }: { duration: number; limit: number; visible: number },
) {
  useEffect(() => store.connect(), [store]);

  useEffect(() => {
    store.setLimit(limit);
  }, [limit, store]);

  useEffect(() => {
    store.setDuration(duration);
  }, [duration, store]);

  useEffect(() => {
    store.setVisible(visible);
  }, [store, visible]);

  useEffect(() => {
    const sync = () => {
      if (document.hidden) store.pause('hidden');
      else store.resume('hidden');
    };
    sync();
    document.addEventListener('visibilitychange', sync);
    return () => {
      document.removeEventListener('visibilitychange', sync);
      store.resume('hidden');
    };
  }, [store]);
}

// isClient is false on the server and through hydration, so the toasts and
// live regions mount only on the client.
function useStoreItems(store: ToastStore) {
  const isClient = useSyncExternalStore(subscribeNever, isTrue, isFalse);
  const items = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  return { isClient, items };
}
