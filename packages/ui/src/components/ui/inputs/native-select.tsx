import {
  type ChangeEvent,
  type ChangeEventHandler,
  type ComponentProps,
  type ContextType,
  type ReactNode,
  use,
  useId,
  useState,
} from 'react';
import {
  FieldErrorContext,
  FormValidationContext,
  LabelContext,
  Provider,
  TextContext,
} from 'react-aria-components';
import { tv } from 'tailwind-variants/lite';

import type { InputSize } from '#/components/ui/inputs/input';

import * as Icon from '#/components/icons';
import {
  errorList,
  fieldLayout,
  type FieldMessages,
  isEmptyNode,
} from '#/components/ui/inputs/field';
import { cn } from '#/lib/cx';
import { fieldControl } from '#/lib/recipes';

const selectStyles = tv({
  base: [fieldControl, 'peer cursor-default appearance-none py-1'],
  defaultVariants: { multiple: false, size: 'md' },
  variants: {
    // A list box shows its own options, so it has no chevron to clear; its
    // height is set after the size's.
    multiple: { false: 'pe-8', true: 'py-1.5' },
    size: { lg: 'h-control-lg', md: 'h-control', sm: 'h-control-sm' },
  },
});

// Without React Aria's validation, the field is valid unless isInvalid says
// otherwise; FieldError reads only isInvalid and the errors passed to it.
const valid: ValidityState = {
  badInput: false,
  customError: false,
  patternMismatch: false,
  rangeOverflow: false,
  rangeUnderflow: false,
  stepMismatch: false,
  tooLong: false,
  tooShort: false,
  typeMismatch: false,
  valid: true,
  valueMissing: false,
};

export type NativeSelectProps = {
  isInvalid?: boolean;
  size?: InputSize;
} & FieldMessages &
  Omit<ComponentProps<'select'>, 'size'>;

type Ids = {
  description: string;
  error: string;
  label: string;
  select: string;
};

type ValidationErrors = ContextType<typeof FormValidationContext>;

export function NativeSelect({
  'aria-describedby': describedBy,
  className,
  description,
  errorMessage,
  errors,
  id,
  isInvalid = false,
  label,
  ...props
}: NativeSelectProps) {
  const field = useField({
    describedBy,
    description,
    errorMessage,
    errors,
    id,
    isInvalid,
    name: props.name,
    onChange: props.onChange,
  });
  return (
    <FieldContexts
      errors={field.errors}
      ids={field.ids}
      isInvalid={field.isInvalid}
    >
      <div
        className={cn('flex flex-col gap-2', className)}
        data-disabled={props.disabled === true || undefined}
        data-invalid={field.isInvalid || undefined}
        data-slot="native-select-field"
      >
        {fieldLayout(
          <Control
            {...props}
            aria-describedby={field.describedBy}
            id={field.ids.select}
            isInvalid={field.isInvalid}
            onChange={field.onChange}
          />,
          { description, errorMessage, errors: field.errors, label },
        )({ isRequired: props.required === true })}
      </div>
    </FieldContexts>
  );
}

// The open list takes its colors from the options in Chromium on Windows and
// Linux, so they carry the theme's popover colors rather than the field's
// translucent fill.
export function NativeSelectOptGroup({
  className,
  ...props
}: ComponentProps<'optgroup'>) {
  return (
    <optgroup
      className={cn('bg-popover text-popover-foreground', className)}
      data-slot="native-select-optgroup"
      {...props}
    />
  );
}

export function NativeSelectOption({
  className,
  ...props
}: ComponentProps<'option'>) {
  return (
    <option
      className={cn('bg-popover text-popover-foreground', className)}
      data-slot="native-select-option"
      {...props}
    />
  );
}

function Control({
  isInvalid,
  multiple = false,
  size = 'md',
  ...props
}: { isInvalid: boolean; size?: InputSize } & Omit<
  ComponentProps<'select'>,
  'size'
>) {
  return (
    <div className="relative" data-slot="native-select-wrapper">
      <select
        aria-invalid={isInvalid || undefined}
        className={cn(selectStyles({ multiple, size }), multiple && 'h-auto')}
        data-invalid={isInvalid || undefined}
        data-size={size}
        data-slot="native-select"
        multiple={multiple}
        {...props}
      />
      {multiple ? null : (
        <Icon.ChevronDown
          aria-hidden
          className="pointer-events-none absolute end-2.5 top-1/2 size-4 -translate-y-1/2 opacity-60 peer-disabled:opacity-30"
          data-slot="native-select-icon"
        />
      )}
    </div>
  );
}

// The contexts React Aria's own fields provide, so FieldLabel names the
// select, and FieldDescription and FieldError describe it.
function FieldContexts({
  children,
  errors,
  ids,
  isInvalid,
}: {
  children: ReactNode;
  errors?: readonly unknown[];
  ids: Ids;
  isInvalid: boolean;
}) {
  // What an errorMessage render function receives as validationErrors.
  const validationErrors = (errors ?? []).filter(
    (error): error is string => typeof error === 'string',
  );
  return (
    <Provider
      values={[
        [LabelContext, { htmlFor: ids.select, id: ids.label }],
        [
          TextContext,
          {
            slots: {
              description: { id: ids.description },
              errorMessage: { id: ids.error },
            },
          },
        ],
        [
          FieldErrorContext,
          { isInvalid, validationDetails: valid, validationErrors },
        ],
      ]}
    >
      {children}
    </Provider>
  );
}

// The error describes the select only when it has a message to show.
function useField({
  describedBy,
  description,
  errorMessage,
  errors,
  id,
  isInvalid,
  name,
  onChange,
}: {
  describedBy?: string;
  id?: string;
  isInvalid: boolean;
  name?: string;
  onChange?: ChangeEventHandler<HTMLSelectElement>;
} & Omit<FieldMessages, 'label'>) {
  const generatedId = useId();
  const descriptionId = useId();
  const errorId = useId();
  const labelId = useId();
  const form = useFormError(name, onChange);
  const isFormInvalid = errors === undefined && form.messages.length > 0;
  const shown = isFormInvalid ? form.messages : errors;
  const isFieldInvalid = isInvalid || isFormInvalid;
  const hasMessage =
    typeof errorMessage === 'function' ||
    !isEmptyNode(errorMessage) ||
    errorList(shown) !== undefined;
  const ids = {
    description: descriptionId,
    error: errorId,
    label: labelId,
    select: id ?? generatedId,
  };
  return {
    describedBy:
      [
        describedBy,
        isEmptyNode(description) ? undefined : ids.description,
        isFieldInvalid && hasMessage ? ids.error : undefined,
      ]
        .filter(Boolean)
        .join(' ') || undefined,
    errors: shown,
    ids,
    isInvalid: isFieldInvalid,
    onChange: form.onChange,
  };
}

// A React Aria Form's validationErrors reach the select by its name, and as
// on React Aria's own fields, a change clears them until the Form passes new
// ones. An error with no message is no error.
function useFormError(
  name: string | undefined,
  onChange: ChangeEventHandler<HTMLSelectElement> | undefined,
) {
  const formErrors = use(FormValidationContext);
  const [clearedFor, setClearedFor] = useState<ValidationErrors>();
  const messages = name === undefined ? [] : [formErrors[name] ?? []].flat();
  const hasError =
    clearedFor !== formErrors && errorList(messages) !== undefined;
  return {
    messages: hasError ? messages : [],
    onChange: (event: ChangeEvent<HTMLSelectElement>) => {
      setClearedFor(formErrors);
      onChange?.(event);
    },
  };
}
