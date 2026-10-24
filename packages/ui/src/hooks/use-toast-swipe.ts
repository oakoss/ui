import {
  type PointerEvent,
  type RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react';
import { useLocale } from 'react-aria/I18nProvider';

import { useLatest } from '#/hooks/use-latest';
import {
  endSwipe,
  exitTransform,
  isOnControl,
  moveSwipe,
  startSwipe,
  type SwipeDirection,
  swipeDirections,
} from '#/lib/toast/toast-swipe';

// Touch and pen swipe a toast toward the stack's nearest edges; a mouse
// selects its text instead.
export function useToastSwipe({
  align,
  isDisabled,
  onSwipe,
  ref,
  side,
}: {
  align: 'center' | 'end' | 'start';
  isDisabled: boolean;
  onSwipe: () => void;
  ref: RefObject<HTMLElement | null>;
  side: 'bottom' | 'top';
}) {
  const { direction } = useLocale();
  const directions = swipeDirections({
    align,
    isRtl: direction === 'rtl',
    side,
  });
  const onSwipeRef = useLatest(onSwipe);
  const cancelRef = useRef<(() => void) | null>(null);
  // A toast that closes or hides mid-swipe springs back, and its own
  // transitions run.
  useLayoutEffect(() => {
    if (!isDisabled) return;
    cancelRef.current?.();
    cancelRef.current = null;
  }, [isDisabled]);
  useEffect(
    () => () => {
      cancelRef.current?.();
    },
    [],
  );
  const onPointerDown = (event: PointerEvent) => {
    const element = ref.current;
    const isIgnored =
      isDisabled ||
      event.pointerType === 'mouse' ||
      !event.isPrimary ||
      cancelRef.current !== null ||
      isOnControl(event.target);
    if (!element || isIgnored) return;
    cancelRef.current = trackSwipe(element, event, directions, (out) => {
      cancelRef.current = null;
      if (out) onSwipeRef.current();
    });
  };
  return { onPointerDown };
}

// Follows one pointer until it lifts, and returns a cancel. The offset is set
// on the element, so a move doesn't render, and data-swiping holds
// transitions off until release.
function trackSwipe(
  element: HTMLElement,
  down: PointerEvent,
  directions: readonly SwipeDirection[],
  onRelease: (out: SwipeDirection | undefined) => void,
) {
  const view = element.ownerDocument.defaultView ?? globalThis;
  let state = startSwipe({ x: down.clientX, y: down.clientY }, down.timeStamp);
  const onMove = (move: globalThis.PointerEvent) => {
    if (move.pointerId !== down.pointerId) return;
    state = moveSwipe(state, { x: move.clientX, y: move.clientY }, directions);
    element.toggleAttribute('data-swiping', state.axis !== undefined);
    const { x, y } = state.offset;
    show(`translate(${String(x)}px, ${String(y)}px)`);
  };
  const show = (transform: string) => {
    element.style.setProperty('--toast-swipe', transform);
  };
  const onEnd = (end: globalThis.PointerEvent) => {
    if (end.pointerId !== down.pointerId) return;
    stop();
    const out =
      end.type === 'pointerup'
        ? endSwipe(state, end.timeStamp, directions)
        : undefined;
    show(out ? exitTransform(out, state.offset) : 'translate(0, 0)');
    onRelease(out);
  };
  const stop = () => {
    delete element.dataset.swiping;
    view.removeEventListener('pointermove', onMove);
    view.removeEventListener('pointerup', onEnd);
    view.removeEventListener('pointercancel', onEnd);
  };
  view.addEventListener('pointermove', onMove);
  view.addEventListener('pointerup', onEnd);
  view.addEventListener('pointercancel', onEnd);
  return () => {
    stop();
    show('translate(0, 0)');
  };
}
