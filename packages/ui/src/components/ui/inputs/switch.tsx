import type { ReactNode } from 'react';

import {
  SwitchButton,
  type SwitchButtonRenderProps,
  SwitchField,
  type SwitchFieldProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants/lite';

import {
  FieldDescription,
  FieldError,
  type FieldErrorProps,
  isEmptyNode,
} from '#/components/ui/inputs/field';
import { cn, cx } from '#/lib/cx';
import { targetSize as targetSizeStyles } from '#/lib/recipes';

export type SwitchProps = {
  children?: ReactNode;
  description?: ReactNode;
  errorMessage?: FieldErrorProps['children'];
  errors?: FieldErrorProps['errors'];
  // `start` puts the label first and the switch at the row's end, as in a
  // settings list.
  labelPlacement?: 'end' | 'start';
  size?: 'md' | 'sm';
  // A 44px hit area around the track; turn it off where switches sit closer
  // than that, or neighbors take each other's clicks.
  targetSize?: boolean;
} & Omit<SwitchFieldProps, 'children'>;

// Forced colors repaint fills as the page color, so the track and thumb take
// system colors there, and the thumb keeps an outline either way.
const trackStyles = tv({
  base: 'flex shrink-0 items-center rounded-full border border-transparent bg-input px-0.5 transition-colors forced-colors:border-[ButtonText]',
  variants: {
    isDisabled: { true: 'forced-colors:border-[GrayText]' },
    isFocusVisible: {
      true: 'outline-(length:--ring-width) outline-offset-2 outline-ring outline-solid',
    },
    isInvalid: { true: 'border-destructive-text' },
    isSelected: {
      true: 'bg-primary forced-colors:border-[Highlight] forced-colors:bg-[Highlight]',
    },
    size: { md: 'h-5 w-9', sm: 'h-4 w-7' },
  },
});

const thumbStyles = tv({
  base: 'rounded-full bg-background outline outline-transparent transition-transform forced-colors:bg-[ButtonText]',
  compoundVariants: [
    {
      className: 'translate-x-3.5 rtl:-translate-x-3.5',
      isSelected: true,
      size: 'md',
    },
    {
      className: 'translate-x-2.5 rtl:-translate-x-2.5',
      isSelected: true,
      size: 'sm',
    },
  ],
  variants: {
    isDisabled: { true: 'forced-colors:bg-[GrayText]' },
    isSelected: { true: 'forced-colors:bg-[HighlightText]' },
    size: { md: 'size-4', sm: 'size-3' },
  },
});

export function Switch({
  children,
  className,
  description,
  errorMessage,
  errors,
  labelPlacement = 'end',
  size = 'md',
  targetSize = true,
  ...props
}: SwitchProps) {
  const isStart = labelPlacement === 'start';
  return (
    <SwitchField
      {...props}
      className={cx('flex flex-col gap-1', className)}
      data-slot="switch-field"
    >
      <SwitchButton
        className={cn(
          'flex min-h-6 items-center gap-2 text-sm leading-snug font-medium text-foreground select-none disabled:cursor-not-allowed disabled:opacity-50',
          isStart ? 'w-full flex-row-reverse justify-between' : 'w-fit',
        )}
        data-size={size}
        data-slot="switch"
      >
        {(state) => (
          <>
            <Track size={size} state={state} targetSize={targetSize} />
            {isEmptyNode(children) && !state.isRequired ? null : (
              <Label isRequired={state.isRequired}>{children}</Label>
            )}
          </>
        )}
      </SwitchButton>
      {isEmptyNode(description) ? null : (
        <FieldDescription className={cn(!isStart && indent[size])}>
          {description}
        </FieldDescription>
      )}
      <FieldError className={cx(!isStart && indent[size])} errors={errors}>
        {errorMessage}
      </FieldError>
    </SwitchField>
  );
}

// Lines the description up under the label, past the track and gap.
const indent = { md: 'ms-11', sm: 'ms-9' } as const;

// One flex item, so a settings row's spacing keeps the asterisk by the label.
function Label({
  children,
  isRequired,
}: {
  children: ReactNode;
  isRequired: boolean;
}) {
  return (
    <span className="flex items-center gap-1">
      {children}
      {isRequired ? (
        <span aria-hidden className="text-destructive-text">
          *
        </span>
      ) : null}
    </span>
  );
}

function Track({
  size,
  state,
  targetSize,
}: {
  size: 'md' | 'sm';
  state: SwitchButtonRenderProps;
  targetSize: boolean;
}) {
  return (
    <span
      className={cn(
        trackStyles({
          isDisabled: state.isDisabled,
          isFocusVisible: state.isFocusVisible,
          isInvalid: state.isInvalid,
          isSelected: state.isSelected,
          size,
        }),
        targetSize && targetSizeStyles,
      )}
      data-slot="switch-track"
    >
      <span
        className={cn(
          thumbStyles({
            isDisabled: state.isDisabled,
            isSelected: state.isSelected,
            size,
          }),
        )}
        data-slot="switch-thumb"
      />
    </span>
  );
}
