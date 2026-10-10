import { type ReactNode, use, useEffect, useState } from 'react';
import {
  Button as AriaButton,
  ComboBox as AriaComboBox,
  type ComboBoxProps as AriaComboBoxProps,
  type HeaderProps as AriaHeaderProps,
  type ListBoxSectionProps as AriaListBoxSectionProps,
  type AsyncListData,
  ButtonContext,
  ComboBoxStateContext,
} from 'react-aria-components';

import type { FieldMessages } from '#/components/ui/inputs/field';
import type { PopoverContentProps } from '#/components/ui/overlays/popover';

import * as Icon from '#/components/icons';
import { Spinner } from '#/components/ui/feedback/spinner';
import { buttonStyles } from '#/components/ui/inputs/button';
import { Input, type InputSize } from '#/components/ui/inputs/input';
import {
  DecoratedInputGroup,
  type InputGroupSlots,
  useFieldShortcut,
} from '#/components/ui/inputs/input-group';
import {
  ListBox,
  ListBoxHeader,
  ListBoxItem,
  type ListBoxItemProps,
  type ListBoxOptions,
  ListBoxPopover,
  ListBoxSection,
} from '#/components/ui/inputs/list-box';
import { cn, cx } from '#/lib/cx';

export type ComboboxItemProps<T extends object = object> = ListBoxItemProps<T>;

// The list renders the items of the ComboBox around it.
export type ComboboxListProps<T extends object> = {
  children?: ((item: T) => ReactNode) | ReactNode;
  dependencies?: readonly unknown[];
} & Pick<Parts, 'emptyLabel' | 'loadingLabel' | 'loadingState' | 'onLoadMore'>;

// The children are the options, filtered by what's typed unless items is
// given.
export type ComboboxProps<T extends object> = FieldMessages &
  InputGroupSlots &
  Omit<AriaComboBoxProps<T>, 'children' | 'defaultItems' | 'items'> &
  Options<T> &
  Parts;

type Options<T extends object> =
  | ({
      children: (item: T) => ReactNode;
      defaultItems: Iterable<T>;
      items?: never;
    } & Pick<ListBoxOptions<T>, 'dependencies'>)
  | ({ defaultItems?: never } & ListBoxOptions<T>);

type Parts = {
  clearLabel?: string;
  emptyLabel?: string;
  loadingLabel?: string;
  // useAsyncList's: 'loading' and 'filtering' show a spinner in the field,
  // 'loadingMore' one at the end of the list.
  loadingState?: AsyncListData<object>['loadingState'];
  onLoadMore?: () => void;
  placeholder?: string;
  size?: InputSize;
};

export function Combobox<T extends object>({
  allowsEmptyCollection = true,
  children,
  className,
  defaultItems,
  dependencies,
  description,
  end,
  errorMessage,
  errors,
  items,
  label,
  start,
  ...props
}: ComboboxProps<T>) {
  const [parts, comboBoxProps] = splitParts(props);
  const { decorations, fieldProps, layout } = useFieldShortcut(
    { description, end, errorMessage, errors, label, start },
    comboBoxProps,
  );
  return (
    <AriaComboBox<T>
      {...fieldProps}
      allowsEmptyCollection={allowsEmptyCollection}
      className={cx('flex flex-col gap-2', className)}
      data-slot="combobox"
      defaultItems={defaultItems}
      items={items}
    >
      {layout(
        <>
          <Field
            {...parts}
            decorations={decorations}
            isClearable={props.isDisabled !== true && props.isReadOnly !== true}
          />
          <ComboboxContent>
            <ComboboxList<T> {...parts} dependencies={dependencies}>
              {children}
            </ComboboxList>
          </ComboboxContent>
        </>,
      )}
    </AriaComboBox>
  );
}

export function ComboboxContent(props: PopoverContentProps) {
  return <ListBoxPopover kind="combobox" {...props} />;
}

export function ComboboxHeader(props: AriaHeaderProps) {
  return <ListBoxHeader kind="combobox" {...props} />;
}

export function ComboboxItem<T extends object>(props: ComboboxItemProps<T>) {
  return <ListBoxItem<T> kind="combobox" {...props} />;
}

export function ComboboxList<T extends object>({
  emptyLabel = 'No results',
  loadingLabel = 'Loading',
  loadingState,
  ...props
}: ComboboxListProps<T>) {
  return (
    <ListBox<T>
      {...props}
      emptyLabel={emptyLabel}
      isLoadingMore={loadingState === 'loadingMore'}
      kind="combobox"
      loadMore={<Spinner label={loadingLabel} />}
    />
  );
}

export function ComboboxSection<T extends object>(
  props: AriaListBoxSectionProps<T>,
) {
  return <ListBoxSection<T> kind="combobox" {...props} />;
}

// React Aria names the trigger ("Show suggestions") and keeps it pressed while
// the list is open, which would hold Button's pressed look; it doesn't move
// focus off the input.
export function ComboboxTrigger({ className }: { className?: string }) {
  return (
    <AriaButton
      className={cn(
        buttonStyles({ size: 'icon-sm', targetSize: false, variant: 'ghost' }),
        'pressed:scale-100 pressed:from-transparent pressed:to-transparent',
        className,
      )}
      data-slot="combobox-trigger"
    >
      <Icon.ChevronDown aria-hidden />
    </AriaButton>
  );
}

// Empties the input and the value with it, leaving focus in the input: taking
// focus itself would drop it to the page when the button unmounts. It isn't a
// Tab stop, since deleting the text does the same, and it opts out of the
// field's button context, which belongs to the trigger.
function ClearButton({ label }: { label: string }) {
  const state = use(ComboBoxStateContext);
  if (state === null || state.inputValue === '') return null;
  return (
    <ButtonContext value={null}>
      <AriaButton
        aria-label={label}
        className={cn(
          buttonStyles({
            size: 'icon-sm',
            targetSize: false,
            variant: 'ghost',
          }),
        )}
        data-slot="combobox-clear"
        excludeFromTabOrder
        onPress={(event) => {
          state.setInputValue('');
          event.target
            .closest('[data-slot=input-group]')
            ?.querySelector<HTMLElement>('[role=combobox]')
            ?.focus();
        }}
        preventFocusOnPress
      >
        <Icon.X aria-hidden />
      </AriaButton>
    </ButtonContext>
  );
}

function Field({
  clearLabel = 'Clear',
  decorations,
  isClearable,
  loadingLabel = 'Loading',
  loadingState,
  placeholder,
  size,
}: { decorations: InputGroupSlots; isClearable: boolean } & Omit<
  Parts,
  'emptyLabel' | 'onLoadMore'
>) {
  const isLoading = loadingState === 'loading' || loadingState === 'filtering';
  return (
    <DecoratedInputGroup
      axis="inline"
      end={
        <>
          {decorations.end}
          {useDelayed(isLoading) ? (
            <Spinner data-slot="combobox-spinner" label={loadingLabel} />
          ) : null}
          {isClearable ? <ClearButton label={clearLabel} /> : null}
          <ComboboxTrigger />
        </>
      }
      size={size}
      start={decorations.start}
    >
      <Input placeholder={placeholder} size={size} />
    </DecoratedInputGroup>
  );
}

function splitParts<P extends Parts>({
  clearLabel,
  emptyLabel,
  loadingLabel,
  loadingState,
  onLoadMore,
  placeholder,
  size,
  ...rest
}: P) {
  return [
    {
      clearLabel,
      emptyLabel,
      loadingLabel,
      loadingState,
      onLoadMore,
      placeholder,
      size,
    },
    rest,
  ] as const;
}

// Turns true after 500ms, so a fast response doesn't flash a spinner.
function useDelayed(isActive: boolean) {
  const [hasWaited, setHasWaited] = useState(false);
  useEffect(() => {
    const timer = isActive
      ? setTimeout(() => {
          setHasWaited(true);
        }, 500)
      : undefined;
    return () => {
      clearTimeout(timer);
      setHasWaited(false);
    };
  }, [isActive]);
  return isActive && hasWaited;
}
