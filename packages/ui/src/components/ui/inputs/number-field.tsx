import type { ReactNode } from 'react';

import {
  Button as AriaButton,
  NumberField as AriaNumberField,
  type NumberFieldProps as AriaNumberFieldProps,
} from 'react-aria-components';

import * as Icon from '#/components/icons';
import {
  fieldLayout,
  type FieldMessages,
  type Shortcut,
} from '#/components/ui/inputs/field';
import { Input, type InputSize } from '#/components/ui/inputs/input';
import { InputGroup } from '#/components/ui/inputs/input-group';
import { cn, cx } from '#/lib/cx';
import { stateLayer } from '#/lib/recipes';

export type NumberFieldProps = Omit<AriaNumberFieldProps, 'children'> &
  Shortcut<LayoutProps>;

export type NumberFieldStepperProps = {
  side?: 'end' | 'start';
  slot: 'decrement' | 'increment';
};

export type NumberFieldSteppers = 'end' | 'none' | 'split' | 'start';

type LayoutProps = {
  placeholder?: string;
  size?: InputSize;
  steppers?: NumberFieldSteppers;
} & FieldMessages;

export function NumberField({
  children,
  className,
  description,
  errorMessage,
  errors,
  label,
  placeholder,
  size,
  steppers = 'split',
  ...props
}: NumberFieldProps) {
  return (
    <AriaNumberField
      {...props}
      className={cx('group/number-field flex flex-col gap-2', className)}
      data-slot="number-field"
    >
      {children ??
        fieldLayout(
          <InputGroup className="overflow-hidden" size={size}>
            {steppers === 'split' || steppers === 'start' ? (
              <NumberFieldStepper side="start" slot="decrement" />
            ) : null}
            {steppers === 'start' ? (
              <NumberFieldStepper side="start" slot="increment" />
            ) : null}
            <Input
              className="tabular-nums"
              placeholder={placeholder}
              size={size}
            />
            {steppers === 'end' ? (
              <NumberFieldStepper side="end" slot="decrement" />
            ) : null}
            {steppers === 'split' || steppers === 'end' ? (
              <NumberFieldStepper side="end" slot="increment" />
            ) : null}
          </InputGroup>,
          { description, errorMessage, errors, label },
        )}
    </AriaNumberField>
  );
}

// The span keeps a stepper at a bound from fading the whole InputGroup.
export function NumberFieldStepper({
  side,
  slot,
}: NumberFieldStepperProps): ReactNode {
  const isStart =
    (side ?? (slot === 'decrement' ? 'start' : 'end')) === 'start';
  return (
    <span className="contents">
      <AriaButton
        className={cn(
          stateLayer,
          'flex aspect-square shrink-0 items-center justify-center self-stretch border-input text-muted-foreground outline-hidden transition-colors select-none hover:text-foreground disabled:cursor-not-allowed disabled:not-group-data-disabled/number-field:opacity-50 max-sm:min-w-11 forced-colors:disabled:text-[GrayText] forced-colors:disabled:not-group-data-disabled/number-field:opacity-100 [&>svg]:size-4',
          isStart ? 'border-e' : 'border-s',
        )}
        data-slot={`number-field-${slot}`}
        slot={slot}
      >
        {slot === 'decrement' ? (
          <Icon.Minus aria-hidden />
        ) : (
          <Icon.Plus aria-hidden />
        )}
      </AriaButton>
    </span>
  );
}
