import type { ReactNode } from 'react';

import type {
  ToastBaseOptions,
  ToastIntent,
  ToastLoadingOptions,
  ToastOptions,
  ToastPromiseStates,
} from '#/lib/toast-content';

import { ToastStore } from '#/lib/toast-store';

type ShowToast = (title: ReactNode, options?: ToastOptions) => string;

export const toastStore = new ToastStore();

// A server render has no Toaster to show a toast, so calls there do nothing.
const isServer = () => typeof document === 'undefined';

function showAs(intent: ToastIntent): ShowToast {
  return (title, options) =>
    isServer() ? (options?.id ?? '') : toastStore.show(title, options, intent);
}

export const toast = Object.assign(showAs('neutral'), {
  // The title names the toast for screen readers; render draws all of it.
  custom: (
    render: (id: string) => ReactNode,
    options: { title: string } & ToastOptions,
  ) => {
    const { title, ...rest } = options;
    return isServer()
      ? (options.id ?? '')
      : toastStore.show(title, { ...rest, custom: render });
  },
  destructive: showAs('destructive'),
  dismiss: (id?: string) => {
    toastStore.dismiss(id);
  },
  dismissAll: () => {
    toastStore.dismiss();
  },
  info: showAs('info'),
  loading: (title: ReactNode, options?: ToastLoadingOptions) =>
    isServer()
      ? (options?.id ?? '')
      : toastStore.show(title, options, 'loading'),
  promise: <T>(
    input: (() => Promise<T>) | Promise<T>,
    states: ToastPromiseStates<T>,
    options?: ToastBaseOptions,
  ) =>
    isServer()
      ? typeof input === 'function'
        ? input()
        : input
      : toastStore.promise(input, states, options),
  reset: () => {
    toastStore.reset();
  },
  success: showAs('success'),
  warning: showAs('warning'),
});
