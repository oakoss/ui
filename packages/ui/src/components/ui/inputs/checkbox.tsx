import type { ReactNode } from 'react';

import {
  CheckboxButton,
  type CheckboxButtonRenderProps,
  CheckboxField,
  type CheckboxFieldProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants/lite';

import * as Icon from '#/components/icons';
import {
  FieldDescription,
  FieldError,
  type FieldErrorProps,
} from '#/components/ui/inputs/field';
import { cn, cx } from '#/lib/cx';
import { targetSize as targetSizeStyles } from '#/lib/recipes';

export type CheckboxProps = {
  children?: ReactNode;
  description?: ReactNode;
  errorMessage?: FieldErrorProps['children'];
  errors?: FieldErrorProps['errors'];
  // A 44px hit area around the box; turn it off where checkboxes sit closer
  // than that, or neighbors take each other's clicks.
  targetSize?: boolean;
} & Omit<CheckboxFieldProps, 'children'>;

// Forced colors repaint the box's fill as the page color, so each state
// takes a system color the mode keeps. Invalid has none of its own there:
// Mark is a fixed yellow that vanishes on a light page, so the error text
// carries it.
const boxStyles = tv({
  base: 'flex size-4 shrink-0 items-center justify-center rounded-sm border border-input bg-field text-primary-foreground transition-colors forced-colors:border-[ButtonText]',
  // An invalid box keeps its error border when checked.
  compoundVariants: [
    { className: 'border-destructive-text', isInvalid: true, isSelected: true },
  ],
  variants: {
    isDisabled: { true: 'forced-colors:border-[GrayText]' },
    isFocusVisible: {
      true: 'outline-(length:--ring-width) outline-offset-2 outline-ring outline-solid',
    },
    isInvalid: { true: 'border-destructive-text' },
    isSelected: {
      true: 'border-primary bg-primary forced-colors:border-[Highlight] forced-colors:bg-[Highlight] forced-colors:text-[HighlightText]',
    },
  },
});

export function Checkbox({
  children,
  className,
  description,
  errorMessage,
  errors,
  targetSize = true,
  ...props
}: CheckboxProps) {
  return (
    <CheckboxField
      {...props}
      className={cx('flex flex-col gap-1', className)}
      data-slot="checkbox-field"
    >
      <CheckboxButton
        className="flex min-h-6 w-fit items-center gap-2 text-sm leading-snug font-medium text-foreground select-none disabled:cursor-not-allowed disabled:opacity-50"
        data-slot="checkbox"
      >
        {(state) => (
          <>
            <Box state={state} targetSize={targetSize} />
            {children}
            {state.isRequired ? (
              <span aria-hidden className="text-destructive-text">
                *
              </span>
            ) : null}
          </>
        )}
      </CheckboxButton>
      {isEmpty(description) ? null : (
        <FieldDescription className="ms-6">{description}</FieldDescription>
      )}
      <FieldError className="ms-6" errors={errors}>
        {errorMessage}
      </FieldError>
    </CheckboxField>
  );
}

function Box({
  state,
  targetSize,
}: {
  state: CheckboxButtonRenderProps;
  targetSize: boolean;
}) {
  const { isIndeterminate, isSelected } = state;
  return (
    <span
      className={cn(
        boxStyles({
          isDisabled: state.isDisabled,
          isFocusVisible: state.isFocusVisible,
          isInvalid: state.isInvalid,
          isSelected: isSelected || isIndeterminate,
        }),
        targetSize && targetSizeStyles,
      )}
      data-slot="checkbox-indicator"
    >
      {isIndeterminate ? (
        <Icon.Minus aria-hidden className="size-3.5" />
      ) : isSelected ? (
        <Icon.Check aria-hidden className="size-3.5" />
      ) : null}
    </span>
  );
}

function isEmpty(node: ReactNode): boolean {
  return (
    node === undefined ||
    node === null ||
    typeof node === 'boolean' ||
    node === ''
  );
}
