import { type ReactNode, use } from 'react';
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
  Header as AriaHeader,
  type HeaderProps as AriaHeaderProps,
  ListBox as AriaListBox,
  ListBoxItem as AriaListBoxItem,
  type ListBoxItemProps as AriaListBoxItemProps,
  ListBoxSection as AriaListBoxSection,
  type ListBoxSectionProps as AriaListBoxSectionProps,
  Select as AriaSelect,
  type SelectProps as AriaSelectProps,
  SelectValue as AriaSelectValue,
  type SelectValueProps as AriaSelectValueProps,
  Text as AriaText,
  composeRenderProps,
  FieldErrorContext,
} from 'react-aria-components';
import { tv } from 'tailwind-variants/lite';

import type { FieldMessages } from '#/components/ui/inputs/field';
import type { InputSize } from '#/components/ui/inputs/input';

import * as Icon from '#/components/icons';
import {
  type InputGroupSlots,
  useFieldShortcut,
} from '#/components/ui/inputs/input-group';
import {
  PopoverContent,
  type PopoverContentProps,
} from '#/components/ui/overlays/popover';
import { cn, cx } from '#/lib/cx';
import { fieldSurface, focusRing, listItem, targetSize } from '#/lib/recipes';

const triggerStyles = tv({
  base: [
    focusRing,
    fieldSurface,
    targetSize,
    'flex cursor-default items-center gap-2 text-start [&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  defaultVariants: { size: 'md' },
  variants: {
    size: { lg: 'h-control-lg', md: 'h-control', sm: 'h-control-sm' },
  },
});

export type SelectContentProps<T extends object> = Omit<
  PopoverContentProps,
  'children'
> &
  Options<T>;

export type SelectItemProps<T extends object = object> = {
  children?: ReactNode;
  description?: ReactNode;
} & Omit<AriaListBoxItemProps<T>, 'children'>;

// The children are the options; label, description and errors sit around the
// trigger. A custom layout composes these parts inside React Aria's Select.
export type SelectProps<T extends object, M extends Mode = 'single'> = {
  size?: InputSize;
} & FieldMessages &
  InputGroupSlots &
  Omit<AriaSelectProps<T, M>, 'children'> &
  Options<T>;

export type SelectTriggerProps = {
  children?: ReactNode;
  size?: InputSize;
} & Omit<AriaButtonProps, 'children'>;

type Mode = 'multiple' | 'single';

// A function child renders each of items; dependencies re-render them when
// outside state the function reads changes.
type Options<T extends object> = (
  | { children: (item: T) => ReactNode; items: Iterable<T> }
  | { children?: ReactNode; items?: never }
) & { dependencies?: readonly unknown[] };

export function Select<T extends object, M extends Mode = 'single'>({
  children,
  className,
  dependencies,
  description,
  end,
  errorMessage,
  errors,
  items,
  label,
  size,
  start,
  ...props
}: SelectProps<T, M>) {
  const shortcut = useFieldShortcut(
    { description, end, errorMessage, errors, label, start },
    props,
  );
  return (
    <AriaSelect<T, M>
      {...shortcut.fieldProps}
      className={cx('flex flex-col gap-2', className)}
      data-slot="select"
    >
      {shortcut.layout(
        <>
          <SelectTrigger size={size}>
            {shortcut.decorations.start}
            <SelectValue />
            {shortcut.decorations.end}
          </SelectTrigger>
          <Popover>
            <List dependencies={dependencies} items={items}>
              {children}
            </List>
          </Popover>
        </>,
      )}
    </AriaSelect>
  );
}

export function SelectContent<T extends object>({
  children,
  dependencies,
  items,
  ...props
}: SelectContentProps<T>) {
  return (
    <Popover {...props}>
      <List dependencies={dependencies} items={items}>
        {children}
      </List>
    </Popover>
  );
}

export function SelectHeader({ className, ...props }: AriaHeaderProps) {
  return (
    <AriaHeader
      className={cn(
        'px-2 py-1.5 text-xs font-medium text-muted-foreground',
        className,
      )}
      data-slot="select-label"
      {...props}
    />
  );
}

// Options with a description name themselves by the label slot alone; the
// trigger shows the label only.
export function SelectItem<T extends object>({
  children,
  className,
  description,
  textValue,
  ...props
}: SelectItemProps<T>) {
  return (
    <AriaListBoxItem
      className={cx([listItem, 'pe-8'], className)}
      data-slot="select-item"
      textValue={
        textValue ??
        (typeof children === 'string' || typeof children === 'number'
          ? String(children)
          : undefined)
      }
      {...props}
    >
      {composeRenderProps(
        <>
          <span className="flex flex-col">
            <AriaText slot="label">{children}</AriaText>
            {description === undefined ? null : (
              <AriaText slot="description">{description}</AriaText>
            )}
          </span>
        </>,
        (content, { isSelected }) => (
          <>
            {content}
            {isSelected ? (
              <Icon.Check
                aria-hidden
                className="absolute end-2 size-4"
                data-slot="select-item-indicator"
              />
            ) : null}
          </>
        ),
      )}
    </AriaListBoxItem>
  );
}

// Sections divide themselves: a separator is no valid child of a listbox.
export function SelectSection<T extends object>({
  className,
  ...props
}: AriaListBoxSectionProps<T>) {
  return (
    <AriaListBoxSection
      className={cn(
        'not-first:-mx-1 not-first:mt-1 not-first:border-t not-first:border-border not-first:px-1 not-first:pt-1',
        className,
      )}
      data-slot="select-group"
      {...props}
    />
  );
}

// Reads its own Select's validation, so a custom layout gets the invalid
// border and an invalid group around a valid Select doesn't.
export function SelectTrigger({
  children,
  className,
  size = 'md',
  ...props
}: SelectTriggerProps) {
  const validation = use(FieldErrorContext);
  return (
    <AriaButton
      className={cx(triggerStyles({ size }), className)}
      data-invalid={validation?.isInvalid === true ? true : undefined}
      data-size={size}
      data-slot="select-trigger"
      {...props}
    >
      {children}
      <Icon.ChevronDown aria-hidden className="ms-auto size-4 opacity-60" />
    </AriaButton>
  );
}

export function SelectValue<T extends object>({
  className,
  ...props
}: AriaSelectValueProps<T>) {
  return (
    <AriaSelectValue
      className={cx(
        'min-w-0 truncate placeholder-shown:text-muted-foreground [&_[slot=description]]:hidden',
        className,
      )}
      data-slot="select-value"
      {...props}
    />
  );
}

function List<T extends object>({
  children,
  dependencies,
  items,
}: {
  children?: ((item: T) => ReactNode) | ReactNode;
  dependencies?: readonly unknown[];
  items?: Iterable<T>;
}) {
  return (
    <AriaListBox
      className="max-h-[inherit] overflow-y-auto outline-hidden"
      data-slot="select-list"
      dependencies={dependencies}
      items={items}
    >
      {children}
    </AriaListBox>
  );
}

function Popover({
  className,
  offset = 4,
  placement = 'bottom start',
  ...props
}: PopoverContentProps) {
  return (
    <PopoverContent
      className={cn('w-auto min-w-(--trigger-width) p-1', className)}
      data-slot="select-content"
      offset={offset}
      placement={placement}
      {...props}
    />
  );
}
