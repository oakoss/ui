import {
  type ComponentProps,
  Fragment,
  isValidElement,
  type ReactNode,
} from 'react';
import {
  FieldError as AriaFieldError,
  type FieldErrorProps as AriaFieldErrorProps,
  Input as AriaInput,
  type InputProps as AriaInputProps,
  Label as AriaLabel,
  type LabelProps as AriaLabelProps,
  Text as AriaText,
  type TextProps as AriaTextProps,
  LabelContext,
  useSlottedContext,
} from 'react-aria-components';
import { tv, type VariantProps } from 'tailwind-variants/lite';

import { Separator } from '#/components/ui/layout/separator';
import { cn, cx } from '#/lib/cx';
import { inputFocusRing } from '#/lib/recipes';

export function FieldSet({ className, ...props }: ComponentProps<'fieldset'>) {
  return (
    <fieldset
      className={cn(
        'flex flex-col gap-6 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3',
        className,
      )}
      data-slot="field-set"
      {...props}
    />
  );
}

const fieldStyles = tv({
  base: 'group/field flex w-full gap-3',
  variants: {
    orientation: {
      horizontal:
        'items-center has-[>[data-slot=field-content]]:items-start *:data-[slot=field-label]:flex-auto',
      // A row once the nearest FieldGroup is 28rem wide; stacked below that.
      responsive:
        'flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:*:data-[slot=field-label]:flex-auto [&>.sr-only]:w-auto',
      vertical: 'flex-col *:w-full [&>.sr-only]:w-auto',
    },
  },
});

export type FieldProps = {
  orientation?: 'horizontal' | 'responsive' | 'vertical';
} & ComponentProps<'div'>;

export function Field({
  className,
  orientation = 'vertical',
  ...props
}: FieldProps) {
  return (
    <div
      data-slot="field"
      {...props}
      className={cn(fieldStyles({ orientation }), className)}
      data-orientation={orientation}
    />
  );
}

export function FieldContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'group/field-content flex flex-1 flex-col gap-1 leading-snug',
        className,
      )}
      data-slot="field-content"
      {...props}
    />
  );
}

// With text, the text sits between two lines; screen readers meet only the
// first.
export function FieldSeparator({
  children,
  className,
  ...props
}: ComponentProps<'div'>) {
  const hasText = !isEmptyNode(children);
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm text-muted-foreground',
        className,
      )}
      data-content={hasText}
      data-slot="field-separator"
      {...props}
    >
      <Separator className="flex-1" />
      {hasText ? (
        <>
          <span data-slot="field-separator-content">{children}</span>
          {/* React Aria's Separator drops aria-hidden, so a wrapper hides it. */}
          <div aria-hidden="true" className="flex flex-1">
            <Separator />
          </div>
        </>
      ) : null}
    </div>
  );
}

function isEmptyNode(node: ReactNode): boolean {
  let current = node;
  while (
    isValidElement<{ children?: ReactNode }>(current) &&
    current.type === Fragment
  ) {
    current = current.props.children;
  }
  if (Array.isArray(current))
    return current.every((child) => isEmptyNode(child));
  return (
    current === undefined ||
    current === null ||
    typeof current === 'boolean' ||
    current === ''
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
      className={cn(
        'text-sm text-muted-foreground group-data-[orientation=horizontal]/field:text-balance [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-foreground',
        className,
      )}
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
      className={cn(
        'group/field-group @container/field-group flex w-full flex-col gap-7 *:data-[slot=field-group]:gap-4',
        className,
      )}
      data-slot="field-group"
      {...props}
    />
  );
}

export function FieldLabel({ className, ...props }: AriaLabelProps) {
  const context = useSlottedContext(LabelContext, props.slot);
  const label = (
    <AriaLabel
      className={cn(
        'flex w-fit items-center gap-1 text-sm leading-snug font-medium text-foreground select-none in-data-disabled:opacity-50',
        className,
      )}
      data-slot="field-label"
      {...props}
    />
  );
  // A label for another control by id would otherwise also take the id of
  // the React Aria field around it, and name that field too.
  if (props.htmlFor !== undefined && props.htmlFor !== context?.htmlFor) {
    return <LabelContext value={null}>{label}</LabelContext>;
  }
  return label;
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
