import { type ComponentProps, createContext, type ReactNode, use } from 'react';
import {
  Label as AriaLabel,
  type LabelProps as AriaLabelProps,
  ProgressBar as AriaProgressBar,
  type ProgressBarProps as AriaProgressBarProps,
  type ProgressBarRenderProps,
} from 'react-aria-components';
import { tv, type VariantProps } from 'tailwind-variants/lite';

import { cn, cx } from '#/lib/cx';
import { isEmptyNode } from '#/lib/empty-node';

// The fill takes each intent's text role, which keeps 3:1 against the track
// in light and dark; the solid fills drop below it in dark.
const styles = tv({
  base: 'flex w-full flex-wrap items-center gap-x-3 gap-y-2',
  variants: {
    intent: {
      destructive: '[--progress-fill:var(--color-destructive-text)]',
      info: '[--progress-fill:var(--color-info-text)]',
      primary: '[--progress-fill:var(--color-primary-text)]',
      success: '[--progress-fill:var(--color-success-text)]',
      warning: '[--progress-fill:var(--color-warning-text)]',
    },
  },
});

type ProgressValues = Pick<
  ProgressBarRenderProps,
  'isIndeterminate' | 'percentage' | 'valueText'
>;

const ProgressContext = createContext<null | ProgressValues>(null);

// A label renders the default layout: the label and value in a row, then the
// track. Children replace the layout, built from ProgressLabel,
// ProgressValue and ProgressTrack; a function child gets React Aria's render
// props, such as percentage and valueText.
export type ProgressProps = (
  | {
      children:
        | ((values: ProgressBarRenderProps) => ReactNode)
        | Exclude<ReactNode, boolean | null | undefined>;
      label?: never;
    }
  | { children?: never; label?: ReactNode }
) & { intent?: NonNullable<VariantProps<typeof styles>['intent']> } & Omit<
    AriaProgressBarProps,
    'children'
  >;

export type ProgressTrackProps = Omit<
  ComponentProps<'span'>,
  'children' | 'dangerouslySetInnerHTML'
>;

export type ProgressValueProps = {
  children?: (valueText: string) => ReactNode;
} & Omit<ComponentProps<'span'>, 'children' | 'dangerouslySetInnerHTML'>;

export function Progress({
  children,
  className,
  intent = 'primary',
  label,
  ...props
}: ProgressProps) {
  return (
    <AriaProgressBar
      data-slot="progress"
      {...props}
      className={cx(styles({ intent }), className)}
      data-intent={intent}
    >
      {(values) => (
        <ProgressContext value={values}>
          {typeof children === 'function' ? (
            children(values)
          ) : isEmptyNode(children) ? (
            <Layout label={label} />
          ) : (
            children
          )}
        </ProgressContext>
      )}
    </AriaProgressBar>
  );
}

export function ProgressLabel({ className, ...props }: AriaLabelProps) {
  return (
    <AriaLabel
      className={cn('text-sm font-medium', className)}
      data-slot="progress-label"
      {...props}
    />
  );
}

// Forced colors repaint the track's fill as the page color, so a border keeps
// its shape there. The fill remounts when the bar turns determinate, or its
// width would transition from the indeterminate bar's.
export function ProgressTrack({ className, ...props }: ProgressTrackProps) {
  const { isIndeterminate } = useProgress();
  return (
    <span
      className={cn(
        'relative flex h-1.5 w-full items-center overflow-hidden rounded-full bg-muted forced-colors:border',
        className,
      )}
      data-slot="progress-track"
      {...props}
    >
      <Fill key={isIndeterminate ? 'indeterminate' : 'determinate'} />
    </span>
  );
}

// The formatted value; mounts nothing while the bar is indeterminate.
export function ProgressValue({
  children,
  className,
  ...props
}: ProgressValueProps) {
  const { valueText } = useProgress();
  const content =
    children && valueText !== undefined ? children(valueText) : valueText;
  if (isEmptyNode(content)) return null;
  return (
    <span
      className={cn(
        'ms-auto text-sm text-muted-foreground tabular-nums',
        className,
      )}
      data-slot="progress-value"
      {...props}
    >
      {content}
    </span>
  );
}

// An indeterminate fill slides across the track. Reduced motion stops the
// slide, and the fill rests as a short bar in the middle, which doesn't read
// as a value.
function Fill() {
  const { isIndeterminate, percentage = 0 } = useProgress();
  return (
    <span
      className={cn(
        'h-full rounded-full bg-(--progress-fill) forced-colors:bg-[Highlight]',
        isIndeterminate
          ? 'absolute inset-y-0 start-3/10 w-2/5 animate-progress-indeterminate motion-reduce:animate-none'
          : 'transition-[width] duration-300 ease-out',
      )}
      data-slot="progress-indicator"
      style={isIndeterminate ? undefined : { width: `${percentage}%` }}
    />
  );
}

function Layout({ label }: { label: ReactNode }) {
  return (
    <>
      {isEmptyNode(label) ? null : (
        <>
          <ProgressLabel>{label}</ProgressLabel>
          <ProgressValue />
        </>
      )}
      <ProgressTrack />
    </>
  );
}

function useProgress() {
  const context = use(ProgressContext);
  if (!context) throw new Error('Progress parts must be inside a Progress.');
  return context;
}
