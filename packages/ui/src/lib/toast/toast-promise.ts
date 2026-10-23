import type { ReactNode } from 'react';

import {
  callMessage,
  type ToastBaseOptions,
  type ToastIntent,
  type ToastPromiseState,
  type ToastPromiseStates,
  type ToastShowOptions,
  toPromiseState,
} from '#/lib/toast/toast-content';

// What trackPromise needs from the store; an entry is one shown toast.
export type ToastPromiseHost<Entry extends { key: string }> = {
  dismiss: (key: string) => void;
  // Whether this entry is still the open toast under its id.
  isOpen: (entry: Entry) => boolean;
  show: (
    title: ReactNode,
    options: ToastShowOptions,
    intent: ToastIntent,
  ) => Entry;
};

// Shows a loading toast and updates it in place when the promise settles.
export function trackPromise<T, Entry extends { key: string }>(
  host: ToastPromiseHost<Entry>,
  input: (() => Promise<T>) | Promise<T>,
  states: ToastPromiseStates<T>,
  options: ToastBaseOptions,
) {
  const promise = typeof input === 'function' ? input() : input;
  const loading = toPromiseState(states.loading);
  // Captured before an onClose run by this show can reuse the id.
  const own = host.show(
    loading.title,
    { ...options, ...loading.options },
    'loading',
  );
  const { key } = own;
  const settle = (message: ReactNode | ToastPromiseState, isOk: boolean) => {
    const { options: stateOptions, title } = toPromiseState(message);
    host.show(
      title,
      { ...options, ...stateOptions, id: key },
      isOk ? 'success' : 'destructive',
    );
  };
  const watch = async () => {
    const [result] = await Promise.allSettled([promise]);
    // A toast closed or replaced meanwhile stays that way.
    if (!host.isOpen(own)) return;
    try {
      if (result.status === 'fulfilled') {
        settle(callMessage(states.success, result.value), true);
      } else {
        settle(callMessage(states.error, result.reason), false);
      }
    } catch (error: unknown) {
      // A message that throws mustn't leave the spinner up.
      host.dismiss(key);
      throw error;
    }
  };
  void watch();
  return promise;
}
