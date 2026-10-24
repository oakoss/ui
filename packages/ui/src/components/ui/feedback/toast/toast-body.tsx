import type { ReactNode, RefObject } from 'react';
import type { ToastAria } from 'react-aria/useToast';

import { tv } from 'tailwind-variants/lite';

import type { ToastContent, ToastIntent } from '#/lib/toast/toast-content';
import type { ToastItem } from '#/lib/toast/toast-store';

import * as Icon from '#/components/icons';
import { Spinner } from '#/components/ui/feedback/spinner';
import { ToastAction } from '#/components/ui/feedback/toast/toast-buttons';
import { cn } from '#/lib/cx';
import { isEmptyNode } from '#/lib/empty-node';

export type ToastIcons = Partial<Record<ToastIntent, ReactNode>>;

type ToastTextParts = {
  descriptionProps: ToastAria['descriptionProps'];
  descriptionRef: RefObject<HTMLDivElement | null>;
  titleProps: ToastAria['titleProps'];
  titleRef: RefObject<HTMLDivElement | null>;
};

const styles = tv({
  slots: {
    action: '-my-1.5 shrink-0',
    content: 'grid min-w-0 flex-1 gap-1',
    description: 'line-clamp-2 text-muted-foreground',
    icon: 'mt-0.5 flex size-4 shrink-0 items-center justify-center [&_svg]:size-4',
    title: 'font-medium',
  },
  variants: {
    intent: {
      destructive: { icon: 'text-destructive-text' },
      info: { icon: 'text-info-text' },
      loading: { icon: 'text-muted-foreground' },
      neutral: { icon: 'text-muted-foreground' },
      success: { icon: 'text-success-text' },
      warning: { icon: 'text-warning-text' },
    },
  },
});

const defaultIcons: Record<ToastIntent, ReactNode> = {
  destructive: <Icon.CircleAlert />,
  info: <Icon.Info />,
  loading: <Spinner aria-hidden />,
  neutral: null,
  success: <Icon.CircleCheck />,
  warning: <Icon.TriangleAlert />,
};

// A custom toast draws itself inside the part that names it when its title
// can't; otherwise the icon, the text and the action.
export function ToastBody({
  icons,
  item,
  onActionDone,
  pendingLabel,
  ...parts
}: {
  icons: ToastIcons | undefined;
  item: ToastItem;
  onActionDone: () => void;
  pendingLabel: string | undefined;
} & ToastTextParts) {
  const { content } = item;
  if (content.custom) {
    return <ToastCustom item={item} render={content.custom} {...parts} />;
  }
  const s = styles({ intent: content.intent });
  const icon = iconFor(content, icons);
  return (
    <>
      {isEmptyNode(icon) ? null : (
        <span aria-hidden className={cn(s.icon())} data-slot="toast-icon">
          {icon}
        </span>
      )}
      <ToastText content={content} {...parts} />
      {content.action ? (
        <ToastAction
          action={content.action}
          className={cn(s.action())}
          onDone={onActionDone}
          pendingLabel={pendingLabel}
          version={item.version}
        />
      ) : null}
    </>
  );
}

function iconFor(content: ToastContent, icons: ToastIcons | undefined) {
  if (content.icon !== undefined) return content.icon;
  const icon = icons?.[content.intent];
  return icon === undefined ? defaultIcons[content.intent] : icon;
}

function ToastCustom({
  item,
  render,
  titleProps,
  titleRef,
}: { item: ToastItem; render: (id: string) => ReactNode } & ToastTextParts) {
  return (
    <div
      {...titleProps}
      className={cn(styles().content())}
      data-slot="toast-content"
      ref={titleRef}
    >
      {render(item.key)}
    </div>
  );
}

function ToastText({
  content,
  descriptionProps,
  descriptionRef,
  titleProps,
  titleRef,
}: { content: ToastContent } & ToastTextParts) {
  const s = styles();
  return (
    <div className={cn(s.content())} data-slot="toast-content">
      <div
        {...titleProps}
        className={cn(s.title())}
        data-slot="toast-title"
        ref={titleRef}
      >
        {content.title}
      </div>
      {isEmptyNode(content.description) ? null : (
        <div
          {...descriptionProps}
          className={cn(s.description())}
          data-slot="toast-description"
          ref={descriptionRef}
        >
          {content.description}
        </div>
      )}
    </div>
  );
}
