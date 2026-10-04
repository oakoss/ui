import type { ComponentProps, ReactNode } from 'react';

import {
  FieldError as AriaFieldError,
  type FieldErrorProps as AriaFieldErrorProps,
  Input as AriaInput,
  type InputProps as AriaInputProps,
  Label as AriaLabel,
  type LabelProps as AriaLabelProps,
  Text as AriaText,
  type TextProps as AriaTextProps,
} from 'react-aria-components';
import { tv, type VariantProps } from 'tailwind-variants/lite';

import { cn, cx } from '#/lib/cx';
import { inputFocusRing } from '#/lib/recipes';

export function FieldSet({ className, ...props }: ComponentProps<'fieldset'>) {
  return (
    <fieldset
      className={cn('flex flex-col gap-6', className)}
      data-slot="field-set"
      {...props}
    />
  );
}

const legendStyles = tv({
  base: 'mb-3 font-medium text-foreground',
  defaultVariants: { variant: 'legend' },
  variants: { variant: { label: 'text-sm', legend: 'text-base' } },
});

export type FieldErrorProps = {
  errors?: readonly unknown[];
} & AriaFieldErrorProps;

export type FieldLegendProps = ComponentProps<'legend'> &
  VariantProps<typeof legendStyles>;

export function FieldDescription({ className, ...props }: AriaTextProps) {
  return (
    <AriaText
      className={cn('text-sm text-muted-foreground', className)}
      data-slot="field-description"
      slot="description"
      {...props}
    />
  );
}

export function FieldError({
  children,
  className,
  errors,
  ...props
}: FieldErrorProps) {
  const own = children === '' || children === false ? undefined : children;
  return (
    <AriaFieldError
      {...props}
      className={cx(
        'flex flex-col gap-1 text-sm text-destructive-text',
        className,
      )}
      data-slot="field-error"
    >
      {own ?? errorList(errors)}
    </AriaFieldError>
  );
}

export function FieldGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex w-full flex-col gap-7', className)}
      data-slot="field-group"
      {...props}
    />
  );
}

export function FieldLabel({ className, ...props }: AriaLabelProps) {
  return (
    <AriaLabel
      className={cn(
        'flex w-fit items-center gap-1 text-sm leading-snug font-medium text-foreground select-none in-data-disabled:opacity-50',
        className,
      )}
      data-slot="field-label"
      {...props}
    />
  );
}

export function FieldLegend({
  className,
  variant = 'legend',
  ...props
}: FieldLegendProps) {
  return (
    <legend
      className={cn(legendStyles({ variant }), className)}
      data-slot="field-legend"
      data-variant={variant}
      {...props}
    />
  );
}

function errorList(errors: readonly unknown[] | undefined): ReactNode {
  if (errors === undefined) return undefined;
  const messages = [
    ...new Set(
      errors.flat().flatMap((error) => {
        const message = messageOf(error)?.trim();
        return message === undefined || message === '' ? [] : message;
      }),
    ),
  ];
  if (messages.length < 2) return messages[0];
  return messages.map((message, index) => (
    <span key={message}>
      {index > 0 ? ' ' : null}
      {message}
    </span>
  ));
}

function messageOf(error: unknown): string | undefined {
  if (typeof error === 'string') return error;
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return typeof error.message === 'string' ? error.message : undefined;
  }
  return undefined;
}

const inputStyles = tv({
  base: [
    inputFocusRing,
    'w-full min-w-0 rounded-control border border-input bg-field px-control-x py-1 text-ui text-foreground transition-colors placeholder:text-muted-foreground',
    'disabled:cursor-not-allowed disabled:opacity-50 data-invalid:border-destructive-text',
  ],
  defaultVariants: { size: 'md' },
  variants: {
    size: { lg: 'h-control-lg', md: 'h-control', sm: 'h-control-sm' },
  },
});

export type InputProps = { size?: InputSize } & Omit<AriaInputProps, 'size'>;

export type InputSize = NonNullable<VariantProps<typeof inputStyles>['size']>;

export function Input({ className, size = 'md', ...props }: InputProps) {
  return (
    <AriaInput
      className={cx(inputStyles({ size }), className)}
      data-size={size}
      data-slot="input"
      {...props}
    />
  );
}
