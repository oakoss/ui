import {
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from 'react-aria-components';

import type { FieldMessages, Shortcut } from '#/components/ui/inputs/field';

import { Input, type InputSize } from '#/components/ui/inputs/input';
import {
  DecoratedInputGroup,
  type InputGroupSlots,
  useFieldShortcut,
} from '#/components/ui/inputs/input-group';
import { Textarea, type TextareaProps } from '#/components/ui/inputs/textarea';
import { cx } from '#/lib/cx';

export type TextareaFieldProps = Omit<
  AriaTextFieldProps,
  'children' | 'pattern' | 'type'
> &
  Shortcut<
    LayoutProps & Pick<TextareaProps, 'autoGrow' | 'maxRows' | 'minRows'>
  >;

export type TextFieldProps = Omit<AriaTextFieldProps, 'children'> &
  Shortcut<LayoutProps>;

type LayoutProps = { placeholder?: string; size?: InputSize } & FieldMessages &
  InputGroupSlots;

export function TextareaField({
  autoGrow,
  children,
  className,
  description,
  end,
  errorMessage,
  errors,
  label,
  maxRows,
  minRows,
  placeholder,
  size,
  start,
  ...props
}: TextareaFieldProps) {
  const { decorations, fieldProps, isUndecorated, layout } = useFieldShortcut(
    { description, end, errorMessage, errors, label, start },
    props,
  );
  const control = (
    <Textarea
      autoGrow={autoGrow}
      maxRows={maxRows}
      minRows={minRows}
      placeholder={placeholder}
      size={size}
    />
  );
  return (
    <AriaTextField
      {...fieldProps}
      className={cx('flex flex-col gap-2', className)}
      data-slot="textarea-field"
    >
      {children ??
        layout(
          isUndecorated ? (
            control
          ) : (
            <DecoratedInputGroup axis="block" size={size} {...decorations}>
              {control}
            </DecoratedInputGroup>
          ),
        )}
    </AriaTextField>
  );
}

export function TextField({
  children,
  className,
  description,
  end,
  errorMessage,
  errors,
  label,
  placeholder,
  size,
  start,
  ...props
}: TextFieldProps) {
  const { decorations, fieldProps, isUndecorated, layout } = useFieldShortcut(
    { description, end, errorMessage, errors, label, start },
    props,
  );
  const control = <Input placeholder={placeholder} size={size} />;
  return (
    <AriaTextField
      {...fieldProps}
      className={cx('flex flex-col gap-2', className)}
      data-slot="text-field"
    >
      {children ??
        layout(
          isUndecorated ? (
            control
          ) : (
            <DecoratedInputGroup axis="inline" size={size} {...decorations}>
              {control}
            </DecoratedInputGroup>
          ),
        )}
    </AriaTextField>
  );
}
