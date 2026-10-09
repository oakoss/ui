import type { ReactNode } from 'react';

import {
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
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
import { cx } from '#/lib/cx';

export type TextFieldProps = (ComposedProps | LayoutProps) &
  Omit<AriaTextFieldProps, 'children'>;

type ComposedProps = {
  children: Exclude<ReactNode, boolean | null | undefined>;
} & Partial<Record<Exclude<keyof LayoutProps, 'children'>, never>>;

type LayoutProps = {
  children?: never;
  description?: ReactNode;
  errorMessage?: FieldErrorProps['children'];
  errors?: FieldErrorProps['errors'];
  label?: ReactNode;
  placeholder?: string;
  size?: InputSize;
};

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
        (({ isRequired }) => (
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
            <Input placeholder={placeholder} size={size} />
            {isEmptyNode(description) ? null : (
              <FieldDescription>{description}</FieldDescription>
            )}
            <FieldError errors={errors}>{errorMessage}</FieldError>
          </>
        ))}
    </AriaTextField>
  );
}
