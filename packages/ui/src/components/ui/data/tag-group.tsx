import type { ReactElement, ReactNode } from 'react';

import {
  Button as AriaButton,
  Tag as AriaTag,
  TagGroup as AriaTagGroup,
  type TagGroupProps as AriaTagGroupProps,
  TagList as AriaTagList,
  type TagProps as AriaTagProps,
  Text as AriaText,
} from 'react-aria-components';
import { tv, type VariantProps } from 'tailwind-variants/lite';

import * as Icon from '#/components/icons';
import { FieldDescription, FieldLabel } from '#/components/ui/inputs/field';
import { cn, cx } from '#/lib/cx';
import { isEmptyNode } from '#/lib/empty-node';
import { focusRing, stateLayer } from '#/lib/recipes';
import { itemTextValue } from '#/lib/text-value';

// Resting tags are soft; a selected tag turns solid, so selection shows as a
// fill and not as color alone. Hover and press tint only tags that act.
const styles = tv({
  base: [
    focusRing,
    stateLayer,
    'relative inline-flex h-6 max-w-full min-w-0 cursor-default items-center gap-1 rounded-badge border border-transparent bg-(--tag-subtle) px-2 text-xs font-medium whitespace-nowrap text-(--tag-text) tabular-nums transition-colors [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-3',
    'data-selection-mode:cursor-pointer selected:bg-(--tag-bg) selected:bg-none selected:text-(--tag-fg) selected:hover:bg-(--tag-hover) selected:pressed:bg-(--tag-hover)',
    // The selected text color would outrank GrayText on a disabled tag.
    'disabled:opacity-50 forced-colors:disabled:text-[GrayText] forced-colors:disabled:opacity-100 forced-colors:disabled:selected:text-[GrayText]',
    // Forced colors repaint a selected fill as the page color, so a selected
    // tag takes the system's selection colors while it's enabled.
    'forced-colors:selected:not-disabled:border-[Highlight] forced-colors:selected:not-disabled:bg-[Highlight] forced-colors:selected:not-disabled:bg-none forced-colors:selected:not-disabled:text-[HighlightText] forced-colors:selected:not-disabled:forced-color-adjust-none forced-colors:selected:not-disabled:focus-visible:outline-[Highlight]',
  ],
  variants: {
    intent: {
      destructive:
        '[--tag-bg:var(--color-destructive)] [--tag-fg:var(--color-destructive-foreground)] [--tag-hover:var(--color-destructive-hover)] [--tag-subtle:var(--color-destructive-subtle)] [--tag-text:var(--color-destructive-text)]',
      info: '[--tag-bg:var(--color-info)] [--tag-fg:var(--color-info-foreground)] [--tag-hover:var(--color-info-hover)] [--tag-subtle:var(--color-info-subtle)] [--tag-text:var(--color-info-text)]',
      neutral:
        '[--tag-bg:var(--color-foreground)] [--tag-fg:var(--color-background)] [--tag-hover:color-mix(in_oklab,var(--color-foreground)_90%,transparent)] [--tag-subtle:var(--color-secondary)] [--tag-text:var(--color-foreground)]',
      primary:
        '[--tag-bg:var(--color-primary)] [--tag-fg:var(--color-primary-foreground)] [--tag-hover:var(--color-primary-hover)] [--tag-subtle:var(--color-primary-subtle)] [--tag-text:var(--color-primary-text)]',
      success:
        '[--tag-bg:var(--color-success)] [--tag-fg:var(--color-success-foreground)] [--tag-hover:var(--color-success-hover)] [--tag-subtle:var(--color-success-subtle)] [--tag-text:var(--color-success-text)]',
      warning:
        '[--tag-bg:var(--color-warning)] [--tag-fg:var(--color-warning-foreground)] [--tag-hover:var(--color-warning-hover)] [--tag-subtle:var(--color-warning-subtle)] [--tag-text:var(--color-warning-text)]',
    },
  },
});

// The children are the tags, or a function of each of items. errorMessage
// shows below the tags and describes the group.
export type TagGroupProps<T extends object> = {
  description?: ReactNode;
  // Shown when the group has no tags; a blank one shows nothing.
  emptyLabel?: string;
  errorMessage?: ReactNode;
  label?: ReactNode;
} & Omit<AriaTagGroupProps, 'children'> &
  TagItems<T>;

// Screen readers name a tag by its text, so a tag whose content isn't plain
// text needs textValue.
export type TagLabel =
  | {
      children: number | readonly (number | string)[] | string;
      textValue?: string;
    }
  | { children?: ReactNode; textValue: string };

export type TagProps = {
  intent?: NonNullable<VariantProps<typeof styles>['intent']>;
} & Omit<AriaTagProps, 'children' | 'textValue'> &
  TagLabel;

type TagItems<T extends object> =
  | {
      children: (item: T) => ReactElement;
      dependencies?: readonly unknown[];
      items: Iterable<T>;
    }
  | { children?: ReactNode; dependencies?: never; items?: never };

export function Tag({
  children,
  className,
  intent = 'neutral',
  textValue,
  ...props
}: TagProps) {
  return (
    <AriaTag
      className={cx(
        [
          styles({ intent }),
          props.href !== undefined &&
            'cursor-pointer underline underline-offset-2',
        ],
        className,
      )}
      data-intent={intent}
      data-slot="tag"
      textValue={itemTextValue(textValue, children)}
      {...props}
    >
      {({ allowsRemoving }) => (
        <>
          <span className="min-w-0 truncate [&_svg]:me-1 [&_svg]:inline [&_svg]:align-middle">
            {children}
          </span>
          {allowsRemoving ? <RemoveButton /> : null}
        </>
      )}
    </AriaTag>
  );
}

export function TagGroup<T extends object>({
  children,
  className,
  dependencies,
  description,
  emptyLabel = 'No tags',
  errorMessage,
  items,
  label,
  ...props
}: TagGroupProps<T>) {
  return (
    <AriaTagGroup
      className={cn('flex flex-col gap-2', className)}
      data-slot="tag-group"
      {...props}
    >
      {isEmptyNode(label) ? null : <FieldLabel>{label}</FieldLabel>}
      <AriaTagList<T>
        // Focus lands on the list once the last tag is removed.
        className={cn(focusRing, 'flex flex-wrap gap-1.5 rounded-sm')}
        data-slot="tag-list"
        dependencies={dependencies}
        items={items}
        renderEmptyState={emptyState(emptyLabel)}
      >
        {children}
      </AriaTagList>
      {isEmptyNode(description) ? null : (
        <FieldDescription>{description}</FieldDescription>
      )}
      {isEmptyNode(errorMessage) ? null : (
        <AriaText
          className="text-sm text-destructive-text"
          data-slot="tag-group-error"
          slot="errorMessage"
        >
          {errorMessage}
        </AriaText>
      )}
    </AriaTagGroup>
  );
}

function emptyState(label: string) {
  return label.trim() === ''
    ? undefined
    : () => <span className="text-sm text-muted-foreground">{label}</span>;
}

// React Aria names the button "Remove" with the tag's text, translated. A
// selected tag opts out of forced colors, so the button sets its own focus
// outline there.
function RemoveButton() {
  return (
    <AriaButton
      className={cx(
        focusRing,
        '-me-2 inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-badge hover:bg-current/10 disabled:pointer-events-none forced-colors:focus-visible:outline-[Highlight] pressed:bg-current/15',
      )}
      data-slot="tag-remove"
      slot="remove"
    >
      <Icon.X aria-hidden className="size-3" />
    </AriaButton>
  );
}
