import {
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { mergeProps } from 'react-aria/mergeProps';
import { useFocusWithin } from 'react-aria/useFocusWithin';
import { useHover } from 'react-aria/useHover';
import { useInteractOutside } from 'react-aria/useInteractOutside';

import type { ToastItem, ToastStore } from '#/lib/toast/toast-store';

import { useLatest } from '#/hooks/use-latest';
import { stackToasts } from '#/lib/toast/toast-stack';

// An undefined value removes the property.
export function useCssVars(
  ref: RefObject<HTMLElement | null>,
  vars: Readonly<Record<`--${string}`, string | undefined>>,
) {
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    for (const [name, value] of Object.entries(vars)) {
      if (value === undefined) element.style.removeProperty(name);
      else element.style.setProperty(name, value);
    }
  });
}

// Reports a toast's natural height, measured from its inner part, which a
// collapsed stack never clips.
export function useToastHeight(
  outer: RefObject<HTMLElement | null>,
  inner: RefObject<HTMLElement | null>,
  onHeight: (height: number) => void,
) {
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
  const pointer = useHoverOrFocus();
  const tap = useTapOpen(ref, store);
  const isOpen = isExpanded || pointer.isOpen || tap.isOpen;
  const onHeight = (instance: number, height: number) => {
    setHeights((current) => {
      if (current.get(instance) === height) return current;
      const shown = new Set(items.map((item) => item.instance));
      const next = new Map([...current].filter(([key]) => shown.has(key)));
      return next.set(instance, height);
    });
  };
  // While focus is inside, nothing hides out from under it.
  const shownCount =
    pointer.hasFocus && !pointer.isEscaped ? Infinity : visible;
  return {
    ...stackToasts({
      heights,
      isExpanded: isOpen,
      items,
      side,
      visible: shownCount,
    }),
    isExpanded: isOpen,
    onHeight,
    regionProps: mergeProps(pointer.props, tap.props),
  };
}

// Open while hovered or focused within, until Escape on the region (which F6
// focuses) closes it; leaving or blurring clears the Escape.
function useHoverOrFocus() {
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);
  const [isEscaped, setIsEscaped] = useState(false);
  const { hoverProps } = useHover({
    onHoverChange: (isHovering) => {
      setIsHovered(isHovering);
      if (!isHovering) setIsEscaped(false);
    },
  });
  const { focusWithinProps } = useFocusWithin({
    onFocusWithinChange: (isFocused) => {
      setHasFocus(isFocused);
      if (!isFocused) setIsEscaped(false);
    },
  });
  const keyProps = {
    // Moving into a toast after an Escape on the region opens it again.
    onFocus: (event: FocusEvent) => {
      if (event.target !== event.currentTarget) setIsEscaped(false);
    },
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === 'Escape' && event.target === event.currentTarget) {
        setIsEscaped(true);
      }
    },
  };
  return {
    hasFocus,
    isEscaped,
    isOpen: (isHovered || hasFocus) && !isEscaped,
    props: mergeProps(hoverProps, focusWithinProps, keyProps),
  };
}

// A tap opens the stack on touch screens, which have no hover, and pauses the
// timers as hover does; a tap outside or Escape closes it.
function useTapOpen(ref: RefObject<HTMLElement | null>, store: ToastStore) {
  const [isTapped, setIsTapped] = useState(false);
  useInteractOutside({
    isDisabled: !isTapped,
    onInteractOutside: () => {
      setIsTapped(false);
    },
    ref,
  });
  useEffect(() => {
    if (isTapped) store.pause('expanded');
    else store.resume('expanded');
  }, [isTapped, store]);
  useEffect(
    () => () => {
      store.resume('expanded');
    },
    [store],
  );
  const props = {
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === 'Escape' && event.target === event.currentTarget) {
        setIsTapped(false);
      }
    },
    // A tap on a control presses it without opening the stack; React Aria's
    // press handling stops most, but a pending button lets them through.
    onPointerDown: (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return;
      const isOnControl =
        event.target instanceof Element &&
        event.target.closest('a, button, input, select, textarea') !== null;
      if (!isOnControl) setIsTapped(true);
    },
  };
  return { isOpen: isTapped, props };
}
