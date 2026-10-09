import { createContext, type ReactNode, use } from 'react';
import {
  RadioGroup as AriaRadioGroup,
  type RadioGroupProps as AriaRadioGroupProps,
  RadioButton,
  type RadioButtonRenderProps,
  RadioField,
  type RadioFieldProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants/lite';

import {
  FieldDescription,
  FieldError,
  type FieldErrorProps,
  FieldLabel,
  isEmptyNode,
} from '#/components/ui/inputs/field';
import { cn, cx } from '#/lib/cx';
import { targetSize as targetSizeStyles } from '#/lib/recipes';

export type RadioGroupItemProps = {
  children?: ReactNode;
  description?: ReactNode;
} & Omit<RadioFieldProps, 'children'>;

export type RadioGroupProps = {
  children?: ReactNode;
  description?: ReactNode;
  errorMessage?: FieldErrorProps['children'];
  errors?: FieldErrorProps['errors'];
  label?: ReactNode;
  // A 44px hit area around each dot; turn it off where options sit closer
  // than that, or neighbors take each other's clicks.
  targetSize?: boolean;
  // Cards make each whole option the click target.
  variant?: 'card' | 'default';
} & Omit<AriaRadioGroupProps, 'children'>;

const GroupContext = createContext<{
  targetSize: boolean;
  variant: 'card' | 'default';
}>({ targetSize: true, variant: 'default' });

// A selected dot is a thick border, which forced colors repaint, where a
// filled center would vanish into the page color.
const dotStyles = tv({
  base: 'size-4 shrink-0 rounded-full border border-input bg-field transition-colors forced-colors:border-[ButtonText]',
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
      true: 'border-4 border-primary forced-colors:border-[Highlight]',
    },
  },
});

export function RadioGroup({
  children,
  className,
  description,
  errorMessage,
  errors,
  label,
  targetSize = true,
  variant = 'default',
  ...props
}: RadioGroupProps) {
  return (
    <AriaRadioGroup
      {...props}
      className={cx('group/radio-group flex flex-col gap-2', className)}
      data-slot="radio-group"
      data-variant={variant}
    >
      {({ isRequired }) => (
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
          <Options targetSize={targetSize} variant={variant}>
            {children}
          </Options>
          {isEmptyNode(description) ? null : (
            <FieldDescription>{description}</FieldDescription>
          )}
          <FieldError errors={errors}>{errorMessage}</FieldError>
        </>
      )}
    </AriaRadioGroup>
  );
}

const cardStyles =
  'relative rounded-lg border border-input p-4 transition-colors has-data-focus-visible:outline-(length:--ring-width) has-data-focus-visible:outline-offset-2 has-data-focus-visible:outline-ring has-data-focus-visible:outline-solid selected:border-primary disabled:opacity-50 forced-colors:selected:border-[Highlight]';

export function RadioGroupItem({
  children,
  className,
  description,
  ...props
}: RadioGroupItemProps) {
  const { targetSize, variant } = use(GroupContext);
  const isCard = variant === 'card';
  return (
    <RadioField
      {...props}
      className={cx(isCard ? cardStyles : 'flex flex-col gap-1', className)}
      data-slot="radio-group-item-field"
    >
      <RadioButton
        className={cn(
          'flex min-h-6 w-fit items-center gap-2 text-sm leading-snug font-medium text-foreground select-none disabled:cursor-not-allowed',
          // The card's label stretches over it, so the whole card selects.
          isCard
            ? 'w-full after:absolute after:inset-0 after:rounded-lg'
            : 'disabled:opacity-50',
        )}
        data-slot="radio-group-item"
      >
        {(state) => (
          <>
            <Dot
              isCard={isCard}
              state={state}
              targetSize={targetSize && !isCard}
            />
            {children}
          </>
        )}
      </RadioButton>
      {isEmptyNode(description) ? null : (
        <FieldDescription
          className={cn(
            'ms-6',
            // Links in a card's description sit above the stretched label.
            isCard && '[&_:is(a,button)]:relative [&_:is(a,button)]:z-10',
          )}
        >
          {description}
        </FieldDescription>
      )}
    </RadioField>
  );
}

function Dot({
  isCard,
  state,
  targetSize,
}: {
  isCard: boolean;
  state: RadioButtonRenderProps;
  targetSize: boolean;
}) {
  return (
    <span
      className={cn(
        dotStyles({
          isDisabled: state.isDisabled,
          // A card draws the focus ring around itself instead.
          isFocusVisible: state.isFocusVisible && !isCard,
          isInvalid: state.isInvalid,
          isSelected: state.isSelected,
        }),
        targetSize && targetSizeStyles,
      )}
      data-slot="radio-group-indicator"
    />
  );
}

function Options({
  children,
  targetSize,
  variant,
}: {
  children: ReactNode;
  targetSize: boolean;
  variant: 'card' | 'default';
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 group-orientation-horizontal/radio-group:flex-row group-orientation-horizontal/radio-group:flex-wrap',
        // Rows 44px apart, and options in a row past a dot's 14px reach, so
        // the dots' hit areas don't take a neighbor's clicks.
        targetSize && variant === 'default' && 'gap-x-4 gap-y-5',
      )}
    >
      <GroupContext value={{ targetSize, variant }}>{children}</GroupContext>
    </div>
  );
}
