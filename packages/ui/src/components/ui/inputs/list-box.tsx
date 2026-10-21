import type { ReactNode } from 'react';

import {
  Header as AriaHeader,
  type HeaderProps as AriaHeaderProps,
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  type ListBoxItemProps as AriaListBoxItemProps,
  ListBoxLoadMoreItem as AriaListBoxLoadMoreItem,
  ListBoxSection as AriaListBoxSection,
  type ListBoxSectionProps as AriaListBoxSectionProps,
  Text as AriaText,
  Collection,
  composeRenderProps,
  ListBoxContext,
  useSlottedContext,
} from 'react-aria-components';

import * as Icon from '#/components/icons';
import {
  PopoverContent,
  type PopoverContentProps,
} from '#/components/ui/overlays/popover';
import { cn, cx } from '#/lib/cx';
import { emptyState } from '#/lib/empty-state';
import { listItem } from '#/lib/recipes';
import { itemTextValue } from '#/lib/text-value';

export type ListBoxItemProps<T extends object = object> = {
  children?: ReactNode;
  description?: ReactNode;
} & Omit<AriaListBoxItemProps<T>, 'children'>;

// A function child renders each of items; dependencies re-render them when
// outside state the function reads changes.
export type ListBoxOptions<T extends object> = (
  | { children: (item: T) => ReactNode; items: Iterable<T> }
  | { children?: ReactNode; items?: never }
) & { dependencies?: readonly unknown[] };

// Each part takes the component it belongs to, which names its data-slot.
export type ListKind = 'combobox' | 'select';

// With onLoadMore, a row after the options shows loadMore and fetches the next
// page as it scrolls into view.
type ListBoxProps<T extends object> = {
  children?: ((item: T) => ReactNode) | ReactNode;
  dependencies?: readonly unknown[];
  emptyLabel?: string;
  isLoadingMore?: boolean;
  items?: Iterable<T>;
  kind: ListKind;
  loadMore?: ReactNode;
  onLoadMore?: () => void;
};

export function ListBox<T extends object>({
  children,
  dependencies,
  emptyLabel,
  isLoadingMore,
  items,
  kind,
  loadMore,
  onLoadMore,
}: ListBoxProps<T>) {
  // A ComboBox or Select passes its items through context, which the
  // collection doesn't read.
  const context = useSlottedContext(ListBoxContext);
  return (
    <AriaListBox<T>
      className="max-h-[inherit] overflow-y-auto overscroll-contain outline-hidden"
      data-slot={`${kind}-list`}
      renderEmptyState={emptyState(emptyLabel, 'px-2 py-1.5')}
    >
      <Collection dependencies={dependencies} items={items ?? context?.items}>
        {children}
      </Collection>
      {onLoadMore === undefined ? null : (
        <AriaListBoxLoadMoreItem
          className="flex justify-center py-1.5"
          isLoading={isLoadingMore}
          onLoadMore={onLoadMore}
        >
          {loadMore}
        </AriaListBoxLoadMoreItem>
      )}
    </AriaListBox>
  );
}

export function ListBoxHeader({
  className,
  kind,
  ...props
}: { kind: ListKind } & AriaHeaderProps) {
  return (
    <AriaHeader
      className={cn(
        'px-2 py-1.5 text-xs font-medium text-muted-foreground',
        className,
      )}
      data-slot={`${kind}-label`}
      {...props}
    />
  );
}

// Options with a description name themselves by the label slot alone.
export function ListBoxItem<T extends object>({
  children,
  className,
  description,
  kind,
  textValue,
  ...props
}: { kind: ListKind } & ListBoxItemProps<T>) {
  return (
    <AriaListBoxItem
      className={cx([listItem, 'pe-8'], className)}
      data-slot={`${kind}-item`}
      textValue={itemTextValue(textValue, children)}
      {...props}
    >
      {composeRenderProps(
        <span className="flex flex-col">
          <AriaText slot="label">{children}</AriaText>
          {description === undefined ? null : (
            <AriaText slot="description">{description}</AriaText>
          )}
        </span>,
        (content, { isSelected }) => (
          <>
            {content}
            {isSelected ? (
              <Icon.Check
                aria-hidden
                className="absolute end-2 size-4"
                data-slot={`${kind}-item-indicator`}
              />
            ) : null}
          </>
        ),
      )}
    </AriaListBoxItem>
  );
}

// At least the field's width, capped inside React Aria's 12px viewport padding.
export function ListBoxPopover({
  className,
  kind,
  offset = 4,
  placement = 'bottom start',
  ...props
}: { kind: ListKind } & PopoverContentProps) {
  return (
    <PopoverContent
      className={cn(
        'w-auto max-w-[calc(100%-24px)] min-w-[min(var(--trigger-width),calc(100%-24px))] p-1',
        className,
      )}
      data-slot={`${kind}-content`}
      offset={offset}
      placement={placement}
      {...props}
    />
  );
}

// Sections divide themselves: a separator is no valid child of a listbox.
export function ListBoxSection<T extends object>({
  className,
  kind,
  ...props
}: { kind: ListKind } & AriaListBoxSectionProps<T>) {
  return (
    <AriaListBoxSection
      className={cn(
        'not-first:-mx-1 not-first:mt-1 not-first:border-t not-first:border-border not-first:px-1 not-first:pt-1',
        className,
      )}
      data-slot={`${kind}-group`}
      {...props}
    />
  );
}
