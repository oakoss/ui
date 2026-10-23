import { useEffect, useRef, useSyncExternalStore } from 'react';
import { mergeProps } from 'react-aria/mergeProps';
import { useToastRegion } from 'react-aria/useToast';
import { createPortal } from 'react-dom';
import { tv } from 'tailwind-variants/lite';

import type { ToastIcons } from '#/components/ui/feedback/toast/toast-body';
import type { ToastItem, ToastStore } from '#/lib/toast/toast-store';

import {
  type ToastAnnounce,
  ToastItemView,
} from '#/components/ui/feedback/toast/toast-item';
import { useCssVars } from '#/hooks/use-css-vars';
import { useToastStack } from '#/hooks/use-toast-stack';
import { cn } from '#/lib/cx';
import { announce } from '#/lib/toast/toast-announcer';
import { toastStore } from '#/lib/toast/toast-api';
import {
  defaultToastDuration,
  defaultToastLimit,
  defaultToastVisible,
} from '#/lib/toast/toast-content';
import { toasterInset } from '#/lib/toast/toast-stack';

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
  // Toasts the stack shows, at least 1; older ones wait behind it.
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

const styles = tv({
  base: 'fixed z-(--z-toast) h-(--toaster-height) max-h-dvh w-full max-w-sm overflow-hidden outline-hidden',
  variants: {
    align: { center: 'inset-x-0 mx-auto', end: 'end-0', start: 'start-0' },
    side: { bottom: 'bottom-0', top: 'top-0' },
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
  const { ref, regionProps, stack } = useRegionParts({
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
      data-expanded={stack.isExpanded || undefined}
      data-placement={placement}
      data-slot="toast-viewport"
      ref={ref}
    >
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

function useRegionParts({
  isExpanded,
  items,
  label,
  side,
  store,
  visible,
}: {
  isExpanded: boolean;
  items: readonly ToastItem[];
  label: string | undefined;
  side: 'bottom' | 'top';
  store: ToastStore;
  visible: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const stack = useToastStack({ isExpanded, items, ref, side, store, visible });
  const { regionProps } = useToastRegion({ 'aria-label': label }, store, ref);
  // Unmounting while hovered or focused never ends React Aria's pause.
  useEffect(
    () => () => {
      store.resumeAll();
    },
    [store],
  );
  useCssVars(ref, {
    '--toast-front-height':
      stack.frontHeight > 0 ? `${String(stack.frontHeight)}px` : undefined,
    '--toaster-height': `${String(stack.height + toasterInset)}px`,
  });
  return {
    ref,
    regionProps: mergeProps(regionProps, stack.regionProps),
    stack,
  };
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
