import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
  composeRenderProps,
  ProgressBarContext,
  useSlottedContext,
} from 'react-aria-components';
import { tv, type VariantProps } from 'tailwind-variants/lite';

import { Spinner } from '#/components/ui/feedback/spinner';
import { cn, cx } from '#/lib/cx';
import { focusRing, stateLayer, targetSize } from '#/lib/recipes';

const defaults = {
  fullWidth: false,
  intent: 'primary',
  size: 'md',
  targetSize: true,
  variant: 'solid',
} as const;

const styles = tv({
  base: [
    focusRing,
    'relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-control border border-transparent text-ui font-medium whitespace-nowrap transition select-none',
    'not-data-rac:active:scale-97 disabled:pointer-events-none disabled:opacity-50 pending:cursor-default pressed:scale-97',
    // Forced colors gray a disabled button but not a disabled link styled as
    // one, and the fade would dim the gray past a native disabled button's.
    'forced-colors:disabled:text-[GrayText] forced-colors:disabled:opacity-100',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  defaultVariants: defaults,
  variants: {
    fullWidth: { false: '', true: 'w-full' },
    intent: {
      destructive:
        '[--btn-bg:var(--color-destructive)] [--btn-border:var(--color-destructive-border)] [--btn-fg:var(--color-destructive-foreground)] [--btn-hover:var(--color-destructive-hover)] [--btn-subtle:var(--color-destructive-subtle)] [--btn-text:var(--color-destructive-text)]',
      info: '[--btn-bg:var(--color-info)] [--btn-border:var(--color-info-border)] [--btn-fg:var(--color-info-foreground)] [--btn-hover:var(--color-info-hover)] [--btn-subtle:var(--color-info-subtle)] [--btn-text:var(--color-info-text)]',
      neutral:
        '[--btn-bg:var(--color-foreground)] [--btn-border:var(--color-border)] [--btn-fg:var(--color-background)] [--btn-hover:color-mix(in_oklab,var(--color-foreground)_90%,transparent)] [--btn-subtle:var(--color-secondary)] [--btn-text:var(--color-foreground)]',
      primary:
        '[--btn-bg:var(--color-primary)] [--btn-border:var(--color-primary-border)] [--btn-fg:var(--color-primary-foreground)] [--btn-hover:var(--color-primary-hover)] [--btn-subtle:var(--color-primary-subtle)] [--btn-text:var(--color-primary-text)]',
      success:
        '[--btn-bg:var(--color-success)] [--btn-border:var(--color-success-border)] [--btn-fg:var(--color-success-foreground)] [--btn-hover:var(--color-success-hover)] [--btn-subtle:var(--color-success-subtle)] [--btn-text:var(--color-success-text)]',
      warning:
        '[--btn-bg:var(--color-warning)] [--btn-border:var(--color-warning-border)] [--btn-fg:var(--color-warning-foreground)] [--btn-hover:var(--color-warning-hover)] [--btn-subtle:var(--color-warning-subtle)] [--btn-text:var(--color-warning-text)]',
    },
    size: {
      icon: 'size-control',
      'icon-lg': 'size-control-lg',
      'icon-sm': 'size-control-sm',
      lg: 'h-control-lg px-control-x has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2',
      md: 'h-control px-control-x has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2',
      sm: 'h-control-sm gap-1.5 px-control-x has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5',
    },
    targetSize: { false: '', true: targetSize },
    variant: {
      ghost: [stateLayer, 'text-(--btn-text)'],
      link: 'text-(--btn-text) underline-offset-4 hover:underline',
      outline: [
        stateLayer,
        'border-(--btn-border) bg-background text-(--btn-text)',
      ],
      soft: [stateLayer, 'bg-(--btn-subtle) text-(--btn-text)'],
      solid:
        'bg-(--btn-bg) text-(--btn-fg) hover:bg-(--btn-hover) not-data-rac:active:bg-(--btn-hover) pressed:bg-(--btn-hover)',
    },
  },
});

export type ButtonProps = { pendingLabel?: string } & AriaButtonProps &
  ButtonSizeProps &
  Omit<ButtonStyleProps, 'size'>;

// Icon sizes have no text to name the control, so they require a label.
export type ButtonSizeProps =
  | { 'aria-label': string; size?: ButtonStyleProps['size'] }
  | { 'aria-labelledby': string; size?: ButtonStyleProps['size'] }
  | { size?: Exclude<ButtonStyleProps['size'], IconSize> };

export type ButtonStyleProps = VariantProps<typeof styles>;

type IconSize = 'icon-lg' | 'icon-sm' | 'icon';

export function Button({
  children,
  className,
  fullWidth,
  intent,
  pendingLabel = 'Pending',
  size,
  targetSize,
  variant,
  ...props
}: ButtonProps) {
  return (
    <AriaButton
      data-slot="button"
      {...props}
      className={cx(
        styles({ fullWidth, intent, size, targetSize, variant }),
        className,
      )}
      data-intent={intent ?? defaults.intent}
      data-size={size ?? defaults.size}
      data-variant={variant ?? defaults.variant}
    >
      {composeRenderProps(children, (resolved, { isPending }) => (
        <>
          <span
            className={cn(
              'inline-flex items-center justify-center gap-[inherit]',
              isPending && 'opacity-0',
            )}
          >
            {resolved}
          </span>
          {isPending ? <PendingLoader label={pendingLabel} /> : null}
        </>
      ))}
    </AriaButton>
  );
}

export function buttonStyles({
  className,
  ...props
}: { className?: string } & ButtonStyleProps = {}): string {
  return cn(styles(props), className);
}

// A pending React Aria Button names itself with its progress bar, by the id it
// provides through ProgressBarContext. Only the loader takes it, so a Spinner
// in the button's own content can't claim the same id.
function PendingLoader({ label }: { label: string }) {
  const progress = useSlottedContext(ProgressBarContext);
  return (
    <Spinner
      className="absolute inset-0 flex"
      data-slot="loader"
      id={progress?.id}
      label={label}
    />
  );
}
