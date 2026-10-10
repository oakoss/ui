import type { ReactNode } from 'react';

import {
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
  type TextFieldRenderProps,
} from 'react-aria-components';

import {
  FieldDescription,
  FieldError,
  type FieldErrorProps,
  FieldLabel,
  Input,
  type InputSize,
  isEmptyNode,
} from '#/components/ui/inputs/field';
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

type LayoutProps = {
  children?: never;
  description?: ReactNode;
  errorMessage?: FieldErrorProps['children'];
  errors?: FieldErrorProps['errors'];
  label?: ReactNode;
  placeholder?: string;
  size?: InputSize;
};

type Messages = Pick<
  LayoutProps,
  'description' | 'errorMessage' | 'errors' | 'label'
>;

// Children replace the layout, so they can't be mixed with its props.
type Shortcut<Layout extends LayoutProps> =
  | ({ children: Exclude<ReactNode, boolean | null | undefined> } & Partial<
      Record<Exclude<keyof Layout, 'children'>, never>
    >)
  | Layout;

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
        layout(
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
        layout(<Input placeholder={placeholder} size={size} />, {
          description,
          errorMessage,
          errors,
          label,
        })}
    </AriaTextField>
  );
}

function layout(
  control: ReactNode,
  { description, errorMessage, errors, label }: Messages,
) {
  return function Layout({ isRequired }: TextFieldRenderProps) {
    return (
      <>
        {isEmptyNode(label) ? null : (
          <FieldLabel>
            {label}
            {isRequired ? (
              <span aria-hidden className="text-destructive-text">
                *
              </span>
            ) : null}
          </FieldLabel>
        )}
        {control}
        {isEmptyNode(description) ? null : (
          <FieldDescription>{description}</FieldDescription>
        )}
        <FieldError errors={errors}>{errorMessage}</FieldError>
      </>
    );
  };
}
