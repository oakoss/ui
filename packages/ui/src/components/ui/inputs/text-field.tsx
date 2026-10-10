import {
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from 'react-aria-components';

import {
  fieldLayout,
  type FieldMessages,
  type Shortcut,
} from '#/components/ui/inputs/field';
import { Input, type InputSize } from '#/components/ui/inputs/input';
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

type LayoutProps = { placeholder?: string; size?: InputSize } & FieldMessages;

export function TextareaField({
  autoGrow,
  children,
  className,
  description,
  errorMessage,
  errors,
  label,
  maxRows,
  minRows,
  placeholder,
  size,
  ...props
}: TextareaFieldProps) {
  return (
    <AriaTextField
      {...props}
      className={cx('flex flex-col gap-2', className)}
      data-slot="textarea-field"
    >
      {children ??
        fieldLayout(
          <Textarea
            autoGrow={autoGrow}
            maxRows={maxRows}
            minRows={minRows}
            placeholder={placeholder}
            size={size}
          />,
          { description, errorMessage, errors, label },
        )}
    </AriaTextField>
  );
}

export function TextField({
  children,
  className,
  description,
  errorMessage,
  errors,
  label,
  placeholder,
  size,
  ...props
}: TextFieldProps) {
  return (
    <AriaTextField
      {...props}
      className={cx('flex flex-col gap-2', className)}
      data-slot="text-field"
    >
      {children ??
        fieldLayout(<Input placeholder={placeholder} size={size} />, {
          description,
          errorMessage,
          errors,
          label,
        })}
    </AriaTextField>
  );
}
