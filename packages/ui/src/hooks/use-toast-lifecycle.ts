import { type RefObject, useEffect, useState } from 'react';
import { useKeyboard } from 'react-aria/useKeyboard';

import type { ToastItem, ToastStore } from '#/lib/toast/toast-store';

// Long past any exit transition: a toast whose exit never settles still goes.
const exitLimit = 1000;

export function useToastLifecycle(
  ref: RefObject<HTMLElement | null>,
  { isExiting, key }: ToastItem,
  store: ToastStore,
) {
  const isEntering = useEntering();
  useRemoveAfterExit(ref, isExiting, key, store);
  const { keyboardProps } = useKeyboard({
    onKeyDown: (event) => {
      if (event.key === 'Escape') store.close(key);
      else event.continuePropagation();
    },
  });
  return { isEntering, keyboardProps };
}

// Entering styles hold for the first frame, so the transition has a start.
function useEntering() {
  const [isEntering, setIsEntering] = useState(true);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsEntering(false);
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, []);
  return isEntering;
}

function useRemoveAfterExit(
  ref: RefObject<HTMLElement | null>,
  isExiting: boolean,
  key: string,
  store: ToastStore,
) {
  useEffect(() => {
    let isCancelled = false;
    let limit: ReturnType<typeof setTimeout> | undefined;
    const finish = async (animations: Animation[]) => {
      await Promise.race([
        Promise.allSettled(animations.map((animation) => animation.finished)),
        new Promise((resolve) => {
          limit = setTimeout(resolve, exitLimit);
        }),
      ]);
      if (!isCancelled) store.remove(key);
    };
    if (isExiting) void finish(ref.current?.getAnimations() ?? []);
    return () => {
      isCancelled = true;
      clearTimeout(limit);
    };
  }, [isExiting, key, ref, store]);
}
