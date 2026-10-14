import { createContext, type ReactNode, use } from 'react';
import {
  CheckboxGroup as AriaCheckboxGroup,
  type CheckboxGroupProps as AriaCheckboxGroupProps,
  CheckboxButton,
  CheckboxField,
  type CheckboxFieldProps,
} from 'react-aria-components';

import { CheckboxIndicator } from '#/components/ui/inputs/checkbox';
import {
  errorList,
  FieldDescription,
  fieldLayout,
  type FieldMessages,
} from '#/components/ui/inputs/field';
import { cn, cx } from '#/lib/cx';
import { isEmptyNode } from '#/lib/empty-node';

export type CheckboxGroupItemProps = {
  children?: ReactNode;
  description?: ReactNode;
} & Omit<CheckboxFieldProps, 'children'>;

// React Aria's CheckboxGroup has no orientation, so the group sets its own.
// requiredLabel is the error when isRequired and nothing is checked, where
// the browser's own message speaks of a single box.
export type CheckboxGroupProps = {
  children?: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  requiredLabel?: string;
  // A 44px hit area around each box; turn it off where options sit closer
  // than that, or neighbors take each other's clicks.
  targetSize?: boolean;
  // Cards make each whole option the click target.
  variant?: 'card' | 'default';
} & FieldMessages &
  Omit<AriaCheckboxGroupProps, 'children'>;

const GroupContext = createContext<{
  targetSize: boolean;
  variant: 'card' | 'default';
}>({ targetSize: true, variant: 'default' });

export function CheckboxGroup({
  children,
  className,
  description,
  errorMessage,
  errors,
  label,
  orientation = 'vertical',
  requiredLabel = 'Select at least one option.',
  targetSize = true,
  variant = 'default',
  ...props
}: CheckboxGroupProps) {
  return (
    <AriaCheckboxGroup
      {...props}
      className={cx('group/checkbox-group flex flex-col gap-2', className)}
      data-orientation={orientation}
      data-slot="checkbox-group"
      data-variant={variant}
    >
      {fieldLayout(
        <Options targetSize={targetSize} variant={variant}>
          {children}
        </Options>,
        {
          description,
          // FieldError shows its children over errors, so the fallback steps
          // aside when a form passes errors that render; an empty list, as
          // form libraries pass with no errors, keeps it.
          errorMessage:
            errorMessage ??
            (errorList(errors) === undefined
              ? (validation) =>
                  validation.validationDetails.valueMissing
                    ? requiredLabel
                    : validation.validationErrors.join(' ')
              : undefined),
          errors,
          label,
        },
        { isGroup: true },
      )}
    </AriaCheckboxGroup>
  );
}

const cardStyles =
  'relative rounded-lg border border-input p-4 transition-colors has-data-focus-visible:outline-(length:--ring-width) has-data-focus-visible:outline-offset-2 has-data-focus-visible:outline-ring has-data-focus-visible:outline-solid selected:border-primary disabled:opacity-50 forced-colors:selected:border-[Highlight]';

// The group shows errors, so an item takes none of its own.
export function CheckboxGroupItem({
  children,
  className,
  description,
  ...props
}: CheckboxGroupItemProps) {
  const { targetSize, variant } = use(GroupContext);
  const isCard = variant === 'card';
  return (
    <CheckboxField
      {...props}
      className={cx(isCard ? cardStyles : 'flex flex-col gap-1', className)}
      data-slot="checkbox-group-item-field"
    >
      <CheckboxButton
        className={cn(
          'flex min-h-6 w-fit items-center gap-2 text-sm leading-snug font-medium text-foreground select-none disabled:cursor-not-allowed',
          // The card's label stretches over it, so the whole card toggles.
          isCard
            ? 'w-full after:absolute after:inset-0 after:rounded-lg'
            : 'disabled:opacity-50',
        )}
        data-slot="checkbox-group-item"
      >
        {(state) => (
          <>
            <CheckboxIndicator
              isCard={isCard}
              state={state}
              targetSize={targetSize && !isCard}
            />
            {children}
          </>
        )}
      </CheckboxButton>
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
    </CheckboxField>
  );
}

// Horizontal options wrap onto more rows on a narrow screen.
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
        'flex flex-col gap-3 group-orientation-horizontal/checkbox-group:flex-row group-orientation-horizontal/checkbox-group:flex-wrap',
        // Rows 44px apart, and options in a row past a box's 14px reach, so
        // the boxes' hit areas don't take a neighbor's clicks.
        targetSize && variant === 'default' && 'gap-x-4 gap-y-5',
      )}
    >
      <GroupContext value={{ targetSize, variant }}>{children}</GroupContext>
    </div>
  );
}
