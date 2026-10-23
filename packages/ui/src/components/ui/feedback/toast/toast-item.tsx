import {
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';
import { mergeProps } from 'react-aria/mergeProps';
import { useKeyboard } from 'react-aria/useKeyboard';
import { useToast } from 'react-aria/useToast';
import { tv } from 'tailwind-variants/lite';

import type { ToastContent, ToastPriority } from '#/lib/toast/toast-content';
import type { ToastItem, ToastStore } from '#/lib/toast/toast-store';

import {
  ToastBody,
  type ToastIcons,
} from '#/components/ui/feedback/toast/toast-body';
import { ToastClose } from '#/components/ui/feedback/toast/toast-buttons';
import { cn } from '#/lib/cx';
import { isEmptyNode } from '#/lib/empty-node';
import { focusRing } from '#/lib/recipes';
import { announcement } from '#/lib/toast/toast-announcer';

export type ToastAnnounce = (message: string, priority: ToastPriority) => void;

export type ToastItemProps = {
  closeLabel: string | undefined;
  icons: ToastIcons | undefined;
  item: ToastItem;
  onAnnounce: ToastAnnounce;
  pendingLabel: string | undefined;
  store: ToastStore;
};

// Long past any exit transition: a toast whose exit never settles still goes.
const exitLimit = 1000;

const styles = tv({
  slots: {
    close: '-me-1 -mt-1 shrink-0',
    toast: [
      focusRing,
      'flex w-full items-start gap-3 rounded-panel border border-border bg-popover p-4 text-sm text-popover-foreground shadow-lg transition duration-200 ease-out',
      'entering:scale-95 entering:opacity-0 exiting:scale-95 exiting:opacity-0',
    ],
  },
});

// A non-modal alertdialog for keyboard reach; announcing is the Toaster's
// live regions' job, so none of its content is a live region.
export function ToastItemView({
  closeLabel,
  icons,
  item,
  onAnnounce,
  pendingLabel,
  store,
}: ToastItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const { closeButtonProps, descriptionProps, titleProps, toastProps } =
    useToast({ toast: item }, store, ref);
  const { content, isExiting, key } = item;
  const { isEntering, keyboardProps } = useToastLifecycle(ref, item, store);
  useAnnouncement(item, onAnnounce, titleRef, descriptionRef);

  return (
    <div
      {...mergeProps(toastProps, keyboardProps)}
      {...labelling(content, toastProps)}
      className={cn(styles().toast())}
      data-entering={isEntering || undefined}
      data-exiting={isExiting || undefined}
      data-intent={content.intent}
      data-slot="toast"
      ref={ref}
    >
      <ToastBody
        descriptionProps={descriptionProps}
        descriptionRef={descriptionRef}
        icons={icons}
        item={item}
        onActionDone={() => {
          // A late action leaves a toast that replaced its own alone.
          if (content.closeOnAction) store.close(key, item.version);
        }}
        pendingLabel={pendingLabel}
        titleProps={titleProps}
        titleRef={titleRef}
      />
      <ToastClose
        className={cn(styles().close())}
        label={labelOr(closeLabel, closeButtonProps['aria-label'])}
        onPress={() => store.close(key)}
      />
    </div>
  );
}

function isNamed(title: ReactNode): title is string {
  return typeof title === 'string' && title.trim() !== '';
}

// A custom toast with a string title is named by it; otherwise a toast points
// at its own parts, the description only when one rendered.
function labelling(
  content: ToastContent,
  toastProps: { 'aria-describedby'?: string },
) {
  if (content.custom) {
    return isNamed(content.title)
      ? {
          'aria-describedby': undefined,
          'aria-label': content.title,
          'aria-labelledby': undefined,
        }
      : { 'aria-describedby': undefined };
  }
  return {
    'aria-describedby': isEmptyNode(content.description)
      ? undefined
      : toastProps['aria-describedby'],
  };
}

// A blank message keeps React Aria's translated label.
function labelOr(message: string | undefined, fallback: string | undefined) {
  if (message !== undefined && message.trim() !== '') return message;
  return fallback ?? '';
}

// Announces a toast when it appears and whenever its text changes; an update
// that only restarts its timer says nothing new.
function useAnnouncement(
  item: ToastItem,
  onAnnounce: ToastAnnounce,
  titleRef: RefObject<HTMLElement | null>,
  descriptionRef: RefObject<HTMLElement | null>,
) {
  const announcedRef = useRef({ message: '', version: 0 });
  useEffect(() => {
    const last = announcedRef.current;
    if (item.isExiting || last.version === item.version) return;
    const { content } = item;
    const message =
      content.custom && isNamed(content.title)
        ? announcement(content.title)
        : announcement(
            titleRef.current?.textContent,
            descriptionRef.current?.textContent,
          );
    announcedRef.current = { message, version: item.version };
    if (message !== last.message) onAnnounce(message, content.priority);
  });
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

function useToastLifecycle(
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
