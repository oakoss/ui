import type { ReactNode } from 'react';

export type ToastAction = {
  label: string;
  // Called when onPress throws or its promise rejects; reportError otherwise.
  onError?: (error: unknown) => void;
  // A returned promise keeps the action pending until it settles.
  onPress: () => unknown;
};

export type ToastBaseOptions = {
  closeOnAction?: boolean;
  description?: ReactNode;
  icon?: ReactNode;
  id?: string;
  onClose?: (reason: ToastCloseReason) => void;
  // High priority interrupts screen readers; destructive toasts always do.
  priority?: ToastPriority;
};

export type ToastCloseReason = 'evicted' | 'programmatic' | 'timeout' | 'user';

export type ToastContent = Readonly<{
  action: ToastAction | undefined;
  closeOnAction: boolean;
  custom: ((id: string) => ReactNode) | undefined;
  description: ReactNode;
  duration: number;
  icon: ReactNode;
  intent: ToastIntent;
  priority: ToastPriority;
  title: ReactNode;
}>;

export type ToastIntent =
  | 'destructive'
  | 'info'
  | 'loading'
  | 'neutral'
  | 'success'
  | 'warning';

// A loading toast stays until it's updated or closed, so it takes no duration.
export type ToastLoadingOptions = { action?: ToastAction } & ToastBaseOptions;

// A toast with an action stays until it's closed, so it takes no duration.
export type ToastOptions = (
  | { action: ToastAction; duration?: never }
  | { action?: undefined; duration?: number }
) &
  ToastBaseOptions;

export type ToastPriority = 'high' | 'normal';

export type ToastPromiseMessage<T> =
  | ((value: T) => ReactNode | ToastPromiseState)
  | ReactNode
  | ToastPromiseState;

export type ToastPromiseState = { title: ReactNode } & ToastOptions;

export type ToastPromiseStates<T> = {
  error: ToastPromiseMessage<unknown>;
  loading: ({ title: ReactNode } & ToastLoadingOptions) | ReactNode;
  success: ToastPromiseMessage<T>;
};

export type ToastShowOptions = {
  custom?: (id: string) => ReactNode;
} & ToastOptions;

export type ToastTimer = { pause: () => void; resume: () => void };

export const defaultToastDuration = 5000;

export function callMessage<T>(message: ToastPromiseMessage<T>, value: T) {
  return typeof message === 'function' ? message(value) : message;
}

// Keeps its remaining time across a pause.
export function createTimer(callback: () => void, delay: number): ToastTimer {
  let id: ReturnType<typeof setTimeout> | undefined;
  let remaining = delay;
  let startedAt = 0;
  return {
    pause() {
      if (id === undefined) return;
      clearTimeout(id);
      id = undefined;
      remaining -= Date.now() - startedAt;
    },
    resume() {
      if (id !== undefined) return;
      startedAt = Date.now();
      id = setTimeout(
        () => {
          id = undefined;
          callback();
        },
        Math.max(remaining, 0),
      );
    },
  };
}

export function resolveContent(
  title: ReactNode,
  options: ToastShowOptions,
  intent: ToastIntent,
  fallbackDuration = defaultToastDuration,
): ToastContent {
  const { action, duration = fallbackDuration } = options;
  return {
    action,
    closeOnAction: options.closeOnAction ?? true,
    custom: options.custom,
    description: options.description,
    duration:
      action || intent === 'loading'
        ? Infinity
        : Math.max(Number.isNaN(duration) ? 0 : duration, defaultToastDuration),
    icon: options.icon,
    intent,
    priority:
      intent === 'destructive' ? 'high' : (options.priority ?? 'normal'),
    title,
  };
}

export function toPromiseState(message: ReactNode | ToastPromiseState) {
  if (!isPromiseState(message)) return { options: {}, title: message };
  const { title, ...options } = message;
  return { options, title };
}

function isPromiseState(value: unknown): value is ToastPromiseState {
  return typeof value === 'object' && value !== null && 'title' in value;
}
