import type { ReactNode } from 'react';

import {
  FieldError as AriaFieldError,
  Input as AriaInput,
  Label as AriaLabel,
  Text as AriaText,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
  type ValidationResult,
} from 'react-aria-components';
import { tv } from 'tailwind-variants/lite';

import { cn, cx } from '#/lib/cx';
import { inputFocusRing } from '#/lib/recipes';

const textFieldStyles = tv({
  slots: {
    description: 'text-xs text-muted-foreground',
    error: 'text-xs text-destructive-text',
    input: [
      inputFocusRing,
      'flex h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 data-[invalid]:border-destructive',
    ],
    label: 'text-sm font-medium text-foreground',
    root: 'flex flex-col gap-1.5',
  },
});

export type TextFieldProps = {
  description?: string;
  errorMessage?: ((validation: ValidationResult) => ReactNode) | ReactNode;
  label?: string;
  placeholder?: string;
} & Omit<AriaTextFieldProps, 'children'>;

export function TextField({
  className,
  description,
  errorMessage,
  label,
  placeholder,
  ...props
}: TextFieldProps) {
  const styles = textFieldStyles();
  const hasLabel = label !== undefined && label !== '';
  const hasDescription = description !== undefined && description !== '';
  return (
    <AriaTextField {...props} className={cx(styles.root(), className)}>
      {hasLabel ? (
        <AriaLabel className={cn(styles.label())}>{label}</AriaLabel>
      ) : null}
      <AriaInput className={cn(styles.input())} placeholder={placeholder} />
      {hasDescription ? (
        <AriaText className={cn(styles.description())} slot="description">
          {description}
        </AriaText>
      ) : null}
      <AriaFieldError className={cn(styles.error())}>
        {errorMessage}
      </AriaFieldError>
    </AriaTextField>
  );
}
