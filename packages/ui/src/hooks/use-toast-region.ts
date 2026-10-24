import {
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { mergeProps } from 'react-aria/mergeProps';
import { useToastRegion } from 'react-aria/useToast';

import type { ToastItem, ToastStore } from '#/lib/toast/toast-store';

import { useCssVars } from '#/hooks/use-css-vars';
import { useToastStack } from '#/hooks/use-toast-stack';
import { toasterInset } from '#/lib/toast/toast-stack';

// The region scrolls when the stack is taller than the space it has, and is
// then a tab stop, so a keyboard can scroll it as well as Tab through it.
export function useToastRegionParts({
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
  useVisibleViewport(ref);
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
  const isScrollable = useOverflows(ref, stack.height + toasterInset);
  return {
    ref,
    regionProps: mergeProps(regionProps, stack.regionProps, {
      'data-expanded': stack.isExpanded || undefined,
      'data-scrollable': isScrollable || undefined,
      ...(isScrollable && { tabIndex: 0 }),
    }),
    stack,
  };
}

// The visual viewport has no observer, so its own events drive this.
function followViewport(element: HTMLElement, viewport: VisualViewport) {
  const update = () => {
    placeInViewport(element, viewport);
  };
  update();
  viewport.addEventListener('resize', update);
  viewport.addEventListener('scroll', update);
  return () => {
    viewport.removeEventListener('resize', update);
    viewport.removeEventListener('scroll', update);
  };
}

function placeInViewport(element: HTMLElement, viewport: VisualViewport) {
  if (viewport.scale > 1) return;
  const { height, offsetTop } = viewport;
  const below = Math.max(innerHeight - height - offsetTop, 0);
  element.style.setProperty('--toaster-viewport', `${String(height)}px`);
  element.style.setProperty('--toaster-top', `${String(offsetTop)}px`);
  element.style.setProperty('--toaster-bottom', `${String(below)}px`);
}

// Whether the stack is taller than the region's room, from their heights
// rather than its scroll size, which the toasts' transforms change without a
// resize to report it.
function useOverflows(ref: RefObject<HTMLElement | null>, height: number) {
  const [room, setRoom] = useState(Infinity);
  useLayoutEffect(() => {
    const element = ref.current;
    return element ? watchRoom(element, setRoom) : undefined;
  }, [height, ref]);
  return room + 1 < height;
}

// Keeps the region inside the visible viewport, above a phone's on-screen
// keyboard, through variables its classes read. Pinch zoom leaves it be.
function useVisibleViewport(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const element = ref.current;
    return element && visualViewport
      ? followViewport(element, visualViewport)
      : undefined;
  }, [ref]);
}

function watchRoom(element: HTMLElement, onRoom: (room: number) => void) {
  const measure = () => {
    onRoom(element.clientHeight);
  };
  measure();
  const observer = new ResizeObserver(measure);
  observer.observe(element);
  return () => {
    observer.disconnect();
  };
}
