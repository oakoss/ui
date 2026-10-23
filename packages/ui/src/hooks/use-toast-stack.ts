import {
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useReducer,
  useState,
} from 'react';
import { mergeProps } from 'react-aria/mergeProps';
import { useFocusWithin } from 'react-aria/useFocusWithin';
import { useHover } from 'react-aria/useHover';
import { useInteractOutside } from 'react-aria/useInteractOutside';

import type { ToastItem, ToastStore } from '#/lib/toast/toast-store';

import { useCssVars } from '#/hooks/use-css-vars';
import { useLatest } from '#/hooks/use-latest';
import { stackToasts, type ToastSlot } from '#/lib/toast/toast-stack';
import {
  closedStack,
  nextStackOpen,
  stackOpenView,
} from '#/lib/toast/toast-stack-open';

// Places a toast in the stack and reports its natural height, measured from
// its inner part, which a collapsed stack never clips.
export function useStackSlot({
  inner,
  onHeight,
  outer,
  slot,
}: {
  inner: RefObject<HTMLElement | null>;
  onHeight: (height: number) => void;
  outer: RefObject<HTMLElement | null>;
  slot: ToastSlot;
}) {
  const onHeightRef = useLatest(onHeight);
  useLayoutEffect(() => {
    const report = () => {
      const content = inner.current;
      const card = outer.current;
      if (!content || !card) return;
      const border = card.offsetHeight - card.clientHeight;
      onHeightRef.current(content.offsetHeight + border);
    };
    report();
    const observer = new ResizeObserver(report);
    if (inner.current) observer.observe(inner.current);
    return () => {
      observer.disconnect();
    };
  }, [inner, onHeightRef, outer]);
  useCssVars(outer, {
    '--toast-offset': `${String(slot.offset)}px`,
    '--toast-scale': String(slot.scale),
    '--toast-z': String(slot.z),
  });
}

export function useToastStack({
  isExpanded,
  items,
  ref,
  side,
  store,
  visible,
}: {
  isExpanded: boolean;
  items: readonly ToastItem[];
  ref: RefObject<HTMLElement | null>;
  side: 'bottom' | 'top';
  store: ToastStore;
  visible: number;
}) {
  const [heights, setHeights] = useState<ReadonlyMap<number, number>>(
    () => new Map(),
  );
  const open = useStackOpen(ref, store);
  const isOpen = isExpanded || open.isOpen;
  const onHeight = (instance: number, height: number) => {
    setHeights((current) => {
      if (current.get(instance) === height) return current;
      const shown = new Set(items.map((item) => item.instance));
      const next = new Map([...current].filter(([key]) => shown.has(key)));
      return next.set(instance, height);
    });
  };
  return {
    ...stackToasts({
      heights,
      isExpanded: isOpen,
      items,
      side,
      visible: open.showsAll ? Infinity : visible,
    }),
    isExpanded: isOpen,
    onHeight,
    regionProps: open.props,
  };
}

// Feeds the region's hover, focus, taps and Escape to the open state, and
// pauses the timers while a tap holds the stack open.
function useStackOpen(ref: RefObject<HTMLElement | null>, store: ToastStore) {
  const [state, send] = useReducer(nextStackOpen, closedStack);
  const view = stackOpenView(state);
  const { hoverProps } = useHover({
    onHoverChange: (isHovering) => {
      send(isHovering ? 'hover' : 'unhover');
    },
  });
  const { focusWithinProps } = useFocusWithin({
    onFocusWithinChange: (isFocused) => {
      send(isFocused ? 'focus' : 'blur');
    },
  });
  useInteractOutside({
    isDisabled: !state.isTapped,
    onInteractOutside: () => {
      send('tapOutside');
    },
    ref,
  });
  const { pausesTimers } = view;
  useEffect(() => {
    if (pausesTimers) store.pause('tap');
    return () => {
      if (pausesTimers) store.resume('tap');
    };
  }, [pausesTimers, store]);
  const props = {
    onFocus: (event: FocusEvent) => {
      if (event.target !== event.currentTarget) send('focusToast');
    },
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === 'Escape' && event.target === event.currentTarget) {
        send('escape');
      }
    },
    // A tap on a control presses it without opening the stack; React Aria's
    // press handling stops most, but a pending button lets them through.
    onPointerDown: (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return;
      const isOnControl =
        event.target instanceof Element &&
        event.target.closest('a, button, input, select, textarea') !== null;
      if (!isOnControl) send('tap');
    },
  };
  return { ...view, props: mergeProps(hoverProps, focusWithinProps, props) };
}
