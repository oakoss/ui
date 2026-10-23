import { type ReactNode, type RefObject, useEffect, useRef } from 'react';
import { mergeProps } from 'react-aria/mergeProps';
import { type ToastAria, useToast } from 'react-aria/useToast';
import { tv } from 'tailwind-variants/lite';

import type { ToastContent, ToastPriority } from '#/lib/toast/toast-content';
import type { ToastSlot } from '#/lib/toast/toast-stack';
import type { ToastItem, ToastStore } from '#/lib/toast/toast-store';

import {
  ToastBody,
  type ToastIcons,
} from '#/components/ui/feedback/toast/toast-body';
import { ToastClose } from '#/components/ui/feedback/toast/toast-buttons';
import { useToastLifecycle } from '#/hooks/use-toast-lifecycle';
import { useCssVars, useToastHeight } from '#/hooks/use-toast-stack';
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
  onHeight: (height: number) => void;
  pendingLabel: string | undefined;
  side: 'bottom' | 'top';
  slot: ToastSlot;
  store: ToastStore;
};

const styles = tv({
  slots: {
    close: '-me-1 -mt-1 shrink-0',
    inner:
      'flex w-full items-start gap-3 p-4 transition-opacity duration-200 group-data-behind/toast:opacity-0',
    toast: [
      focusRing,
      'group/toast absolute inset-x-4 z-(--toast-z) translate-y-(--toast-offset) scale-(--toast-scale) overflow-hidden rounded-panel border border-border bg-popover text-sm text-popover-foreground shadow-lg transition duration-200 ease-out data-behind:h-(--toast-front-height)',
      'aria-hidden:opacity-0 entering:scale-95 entering:opacity-0 exiting:scale-95 exiting:opacity-0',
    ],
  },
  variants: {
    side: {
      bottom: { toast: 'bottom-4 origin-bottom' },
      top: { toast: 'top-4 origin-top' },
    },
  },
});

// A non-modal alertdialog for keyboard reach; announcing is the Toaster's
// live regions' job, so none of its content is a live region.
export function ToastItemView({
  closeLabel,
  icons,
  item,
  onAnnounce,
  onHeight,
  pendingLabel,
  side,
  slot,
  store,
}: ToastItemProps) {
  const {
    aria,
    descriptionRef,
    innerRef,
    isEntering,
    keyboardProps,
    ref,
    titleRef,
  } = useToastParts({ item, onAnnounce, onHeight, slot, store });
  const s = styles({ side });

  return (
    <div
      {...mergeProps(aria.toastProps, keyboardProps)}
      {...labelling(item.content, aria.toastProps)}
      {...stateAttributes(item, slot, isEntering)}
      className={cn(s.toast())}
      data-slot="toast"
      ref={ref}
    >
      <ToastInner
        aria={aria}
        closeLabel={closeLabel}
        descriptionRef={descriptionRef}
        icons={icons}
        innerRef={innerRef}
        item={item}
        pendingLabel={pendingLabel}
        store={store}
        titleRef={titleRef}
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

function stateAttributes(
  item: ToastItem,
  slot: ToastSlot,
  isEntering: boolean,
) {
  return {
    'aria-hidden': slot.isHidden || undefined,
    'data-behind': slot.isBehind || undefined,
    'data-entering': isEntering || undefined,
    'data-exiting': item.isExiting || undefined,
    'data-intent': item.content.intent,
    inert: slot.isHidden,
  };
}

// The part a collapsed stack never clips, so its height is the toast's own.
function ToastInner({
  aria,
  closeLabel,
  descriptionRef,
  icons,
  innerRef,
  item,
  pendingLabel,
  store,
  titleRef,
}: {
  aria: ToastAria;
  descriptionRef: RefObject<HTMLDivElement | null>;
  innerRef: RefObject<HTMLDivElement | null>;
  titleRef: RefObject<HTMLDivElement | null>;
} & Pick<
  ToastItemProps,
  'closeLabel' | 'icons' | 'item' | 'pendingLabel' | 'store'
>) {
  const s = styles();
  return (
    <div className={cn(s.inner())} data-slot="toast-inner" ref={innerRef}>
      <ToastBody
        descriptionProps={aria.descriptionProps}
        descriptionRef={descriptionRef}
        icons={icons}
        item={item}
        onActionDone={() => {
          store.actionDone(item);
        }}
        pendingLabel={pendingLabel}
        titleProps={aria.titleProps}
        titleRef={titleRef}
      />
      <ToastClose
        className={cn(s.close())}
        label={labelOr(closeLabel, aria.closeButtonProps['aria-label'])}
        onPress={() => store.close(item.key)}
      />
    </div>
  );
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

function useToastParts({
  item,
  onAnnounce,
  onHeight,
  slot,
  store,
}: Pick<
  ToastItemProps,
  'item' | 'onAnnounce' | 'onHeight' | 'slot' | 'store'
>) {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const aria = useToast({ toast: item }, store, ref);
  const { isEntering, keyboardProps } = useToastLifecycle(ref, item, store);
  useAnnouncement(item, onAnnounce, titleRef, descriptionRef);
  useToastHeight(ref, innerRef, onHeight);
  useCssVars(ref, {
    '--toast-offset': `${String(slot.offset)}px`,
    '--toast-scale': String(slot.scale),
    '--toast-z': String(slot.z),
  });
  return {
    aria,
    descriptionRef,
    innerRef,
    isEntering,
    keyboardProps,
    ref,
    titleRef,
  };
}
