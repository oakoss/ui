import { useEffect, useRef, useSyncExternalStore } from 'react';
import { useToastRegion } from 'react-aria/useToast';
import { createPortal } from 'react-dom';
import { tv } from 'tailwind-variants/lite';

import type { ToastIcons } from '#/components/ui/feedback/toast/toast-body';
import type { ToastItem, ToastStore } from '#/lib/toast/toast-store';

import {
  type ToastAnnounce,
  ToastItemView,
} from '#/components/ui/feedback/toast/toast-item';
import { cn } from '#/lib/cx';
import { announce } from '#/lib/toast/toast-announcer';
import { toastStore } from '#/lib/toast/toast-api';
import {
  defaultToastDuration,
  defaultToastLimit,
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
  // Toasts shown at once, at least 1; past it the oldest closes.
  limit?: number;
  messages?: ToasterMessages;
  placement?: ToasterPlacement;
  store?: ToastStore;
};

type ToastRegionProps = {
  className: string;
  icons: ToastIcons | undefined;
  items: readonly ToastItem[];
  messages: ToasterMessages | undefined;
  onAnnounce: ToastAnnounce;
  placement: ToasterPlacement;
  store: ToastStore;
};

const placements = {
  'bottom center': { align: 'center', side: 'bottom' },
  'bottom end': { align: 'end', side: 'bottom' },
  'bottom start': { align: 'start', side: 'bottom' },
  'top center': { align: 'center', side: 'top' },
  'top end': { align: 'end', side: 'top' },
  'top start': { align: 'start', side: 'top' },
} as const;

const styles = tv({
  base: 'fixed z-(--z-toast) flex max-h-dvh w-full max-w-sm flex-col gap-2 overflow-hidden p-4 outline-hidden',
  variants: {
    align: { center: 'inset-x-0 mx-auto', end: 'end-0', start: 'start-0' },
    side: { bottom: 'bottom-0 flex-col-reverse', top: 'top-0' },
  },
});

// Renders the store's toasts. It sits on the body, like React Aria's
// overlays, so an open modal never hides it.
export function Toaster({
  className,
  duration = defaultToastDuration,
  icons,
  limit = defaultToastLimit,
  messages,
  placement = 'bottom end',
  store = toastStore,
}: ToasterProps) {
  const isClient = useSyncExternalStore(subscribeNever, isTrue, isFalse);
  const items = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot,
  );
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);
  useConnectedStore(store, limit, duration);

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
          items={items}
          messages={messages}
          onAnnounce={onAnnounce}
          placement={placement}
          store={store}
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
  items,
  messages,
  onAnnounce,
  placement,
  store,
}: ToastRegionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { regionProps } = useToastRegion(
    { 'aria-label': messages?.region?.(items.length) },
    store,
    ref,
  );
  // Unmounting while hovered or focused never ends React Aria's pause.
  useEffect(
    () => () => {
      store.resumeAll();
    },
    [store],
  );
  return (
    <div
      {...regionProps}
      className={cn(className)}
      data-placement={placement}
      data-slot="toast-viewport"
      ref={ref}
    >
      {items.map((item) => (
        <ToastItemView
          closeLabel={messages?.close}
          icons={icons}
          item={item}
          key={item.instance}
          onAnnounce={onAnnounce}
          pendingLabel={messages?.pending}
          store={store}
        />
      ))}
    </div>
  );
}

// Timers run while the Toaster is mounted, and pause while the page is hidden.
function useConnectedStore(store: ToastStore, limit: number, duration: number) {
  useEffect(() => store.connect(), [store]);

  useEffect(() => {
    store.setLimit(limit);
  }, [limit, store]);

  useEffect(() => {
    store.setDuration(duration);
  }, [duration, store]);

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
