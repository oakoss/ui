import { type ReactNode, use } from 'react';
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
  type HeaderProps as AriaHeaderProps,
  type ListBoxSectionProps as AriaListBoxSectionProps,
  Select as AriaSelect,
  type SelectProps as AriaSelectProps,
  SelectValue as AriaSelectValue,
  type SelectValueProps as AriaSelectValueProps,
  FieldErrorContext,
} from 'react-aria-components';
import { tv } from 'tailwind-variants/lite';

import type { FieldMessages } from '#/components/ui/inputs/field';
import type { InputSize } from '#/components/ui/inputs/input';
import type { PopoverContentProps } from '#/components/ui/overlays/popover';

import * as Icon from '#/components/icons';
import {
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
import { cx } from '#/lib/cx';
import { fieldSurface, focusRing, targetSize } from '#/lib/recipes';

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

export type SelectContentProps<T extends object> = ListBoxOptions<T> &
  Omit<PopoverContentProps, 'children'>;

export type SelectItemProps<T extends object = object> = ListBoxItemProps<T>;

// The children are the options; label, description and errors sit around the
// trigger. A custom layout composes these parts inside React Aria's Select.
export type SelectProps<T extends object, M extends Mode = 'single'> = {
  size?: InputSize;
} & FieldMessages &
  InputGroupSlots &
  ListBoxOptions<T> &
  Omit<AriaSelectProps<T, M>, 'children'>;

export type SelectTriggerProps = {
  children?: ReactNode;
  size?: InputSize;
} & Omit<AriaButtonProps, 'children'>;

type Mode = 'multiple' | 'single';

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
          <ListBoxPopover kind="select">
            <ListBox dependencies={dependencies} items={items} kind="select">
              {children}
            </ListBox>
          </ListBoxPopover>
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
    <ListBoxPopover kind="select" {...props}>
      <ListBox dependencies={dependencies} items={items} kind="select">
        {children}
      </ListBox>
    </ListBoxPopover>
  );
}

export function SelectHeader(props: AriaHeaderProps) {
  return <ListBoxHeader kind="select" {...props} />;
}

// The trigger shows an option's label without its description.
export function SelectItem<T extends object>(props: SelectItemProps<T>) {
  return <ListBoxItem<T> kind="select" {...props} />;
}

export function SelectSection<T extends object>(
  props: AriaListBoxSectionProps<T>,
) {
  return <ListBoxSection<T> kind="select" {...props} />;
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
