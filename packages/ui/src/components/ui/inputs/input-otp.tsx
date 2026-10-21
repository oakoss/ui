import {
  OTPInput,
  OTPInputContext,
  REGEXP_ONLY_DIGITS,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from 'input-otp';
import {
  type ComponentProps,
  createContext,
  Fragment,
  type ReactNode,
  type Ref,
  use,
  useState,
} from 'react';
import {
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
  InputContext,
  useContextProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants/lite';

import type { InputSize } from '#/components/ui/inputs/input';

import * as Icon from '#/components/icons';
import { fieldLayout, type FieldMessages } from '#/components/ui/inputs/field';
import { useOTPPaste } from '#/hooks/use-otp-paste';
import { cn, cx } from '#/lib/cx';

export type InputOTPCharacters = 'alphanumeric' | 'digits';

export type InputOTPProps = Omit<
  AriaTextFieldProps,
  'children' | 'inputMode' | 'maxLength' | 'minLength' | 'pattern' | 'type'
> & {
  characters?: InputOTPCharacters;
  length?: number;
  // For the style tag input-otp adds, under a Content Security Policy.
  nonce?: string;
  onComplete?: (value: string) => void;
  // Turns pasted text into a code; the default drops spaces and dashes.
  pasteTransformer?: (pasted: string) => string;
  // A character for each empty slot, such as "○○○○○○".
  placeholder?: string;
  ref?: Ref<HTMLInputElement>;
  size?: InputSize;
} & FieldMessages &
  (
    | { children: ReactNode; groupSize?: never }
    | { children?: never; groupSize?: number }
  );

type OTPOptions = Pick<
  InputOTPProps,
  'nonce' | 'onComplete' | 'placeholder' | 'ref'
> &
  Required<Pick<InputOTPProps, 'characters' | 'length' | 'pasteTransformer'>>;

const characterSets = {
  alphanumeric: { inputMode: 'text', pattern: REGEXP_ONLY_DIGITS_AND_CHARS },
  digits: { inputMode: 'numeric', pattern: REGEXP_ONLY_DIGITS },
} as const;

const styles = tv({
  defaultVariants: { size: 'md' },
  slots: {
    caret:
      'pointer-events-none absolute inset-0 flex items-center justify-center after:h-1/2 after:animate-caret-blink after:border-s after:border-current motion-reduce:after:animate-none',
    slot: 'relative flex items-center justify-center border-y border-e border-input bg-field text-foreground tabular-nums transition-colors group-data-disabled/otp:opacity-50 group-data-invalid/otp:border-destructive-text first:rounded-s-control first:border-s last:rounded-e-control data-active:z-10 data-active:outline-(length:--ring-width) data-active:outline-offset-0 data-active:outline-ring data-active:outline-solid forced-colors:group-data-disabled/otp:text-[GrayText] forced-colors:group-data-disabled/otp:opacity-100 any-pointer-coarse:size-11',
  },
  variants: {
    size: {
      lg: { slot: 'size-control-lg text-base' },
      md: { slot: 'size-control text-ui' },
      sm: { slot: 'size-control-sm text-sm' },
    },
  },
});

const SizeContext = createContext<InputSize>('md');

export function InputOTP({
  characters = 'digits',
  children,
  className,
  defaultValue = '',
  description,
  errorMessage,
  errors,
  groupSize,
  label,
  length = 6,
  nonce,
  onChange,
  onComplete,
  pasteTransformer,
  placeholder,
  ref,
  size = 'md',
  value,
  ...props
}: InputOTPProps) {
  const code = useCode({ characters, defaultValue, onChange, value });
  const options: OTPOptions = {
    characters,
    length,
    nonce,
    onComplete,
    pasteTransformer: pasteTransformer ?? cleanPaste,
    placeholder,
    ref,
  };
  const control = (
    <OTPControl options={options} setValue={code.setValue} value={code.value}>
      {children ?? <Slots groupSize={groupSize ?? length} length={length} />}
    </OTPControl>
  );
  return (
    <SizeContext value={size}>
      <AriaTextField
        {...props}
        className={cx('group/otp flex flex-col gap-2', className)}
        data-slot="input-otp"
        onChange={code.setValue}
        value={code.value}
      >
        {fieldLayout(control, { description, errorMessage, errors, label })}
      </AriaTextField>
    </SizeContext>
  );
}

export function InputOTPGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-otp-group"
      {...props}
      className={cn('flex items-center', className)}
    />
  );
}

export function InputOTPSeparator({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      data-slot="input-otp-separator"
      {...props}
      className={cn('flex items-center text-muted-foreground', className)}
    >
      <Icon.Minus />
    </div>
  );
}

export function InputOTPSlot({
  className,
  index,
  ...props
}: { index: number } & ComponentProps<'div'>) {
  const size = use(SizeContext);
  const { char, hasFakeCaret, isActive, placeholderChar } =
    use(OTPInputContext).slots[index] ?? {};
  const { caret, slot } = styles({ size });
  return (
    <div
      data-active={isActive === true ? true : undefined}
      data-slot="input-otp-slot"
      {...props}
      className={cn(slot(), className)}
    >
      {char ?? <span className="text-muted-foreground">{placeholderChar}</span>}
      {hasFakeCaret === true ? <div className={cn(caret())} /> : null}
    </div>
  );
}

// Codes come with spaces and dashes for reading ("123 456", "AB-12").
function cleanPaste(pasted: string) {
  return pasted.replaceAll(/[\s-]/gu, '');
}

// React Aria's TextField hands the input its id, name, ARIA and validation
// through InputContext; input-otp's one real input takes them.
function OTPControl({
  children,
  options: { characters, length, ref: ownRef, ...options },
  setValue,
  value,
}: {
  children: ReactNode;
  options: OTPOptions;
  setValue: (value: string) => void;
  value: string;
}) {
  const [contextProps, ref] = useContextProps({}, ownRef ?? null, InputContext);
  const { inputMode, pattern } = characterSets[characters];
  const paste = useOTPPaste(contextProps, value);
  return (
    // Codes read left to right in every language.
    <div className="w-fit" dir="ltr" onPasteCapture={paste.guard}>
      <OTPInput
        {...withoutValue(contextProps)}
        {...options}
        containerClassName="flex items-center has-disabled:cursor-not-allowed"
        inputMode={inputMode}
        maxLength={length}
        onBlur={paste.onBlur}
        onChange={setValue}
        onPaste={paste.onPaste}
        pattern={pattern}
        ref={ref}
        spellCheck={false}
        value={value}
      >
        <div aria-hidden className="flex items-center gap-2">
          {children}
        </div>
      </OTPInput>
    </div>
  );
}

function Slots({ groupSize, length }: { groupSize: number; length: number }) {
  const groups = Array.from(
    { length: Math.ceil(length / groupSize) },
    (_, group) => group * groupSize,
  );
  return groups.map((start, group) => (
    <Fragment key={start}>
      {group > 0 ? <InputOTPSeparator /> : null}
      <InputOTPGroup>
        {Array.from(
          { length: Math.min(groupSize, length - start) },
          (_, offset) => (
            <InputOTPSlot index={start + offset} key={start + offset} />
          ),
        )}
      </InputOTPGroup>
    </Fragment>
  ));
}

// Letter codes are case-insensitive, so they're kept in printed capitals.
function useCode({
  characters,
  defaultValue,
  onChange,
  value,
}: {
  characters: InputOTPCharacters;
  defaultValue: string;
  onChange: ((value: string) => void) | undefined;
  value: string | undefined;
}) {
  const normalize = (code: string) =>
    characters === 'alphanumeric' ? code.toUpperCase() : code;
  const [uncontrolled, setUncontrolled] = useState(() =>
    normalize(defaultValue),
  );
  const setValue = (next: string) => {
    const code = normalize(next);
    if (value === undefined) setUncontrolled(code);
    onChange?.(code);
  };
  return { setValue, value: normalize(value ?? uncontrolled) };
}

// The value and its setter come from the field's state; an undefined key
// would replace one of input-otp's defaults, such as one-time-code.
function withoutValue(props: object) {
  return Object.fromEntries(
    Object.entries(props).filter(
      ([key, entry]) =>
        key !== 'value' && key !== 'onChange' && entry !== undefined,
    ),
  );
}
