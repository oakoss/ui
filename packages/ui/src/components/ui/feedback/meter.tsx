import { type ComponentProps, createContext, type ReactNode, use } from 'react';
import {
  Label as AriaLabel,
  type LabelProps as AriaLabelProps,
  Meter as AriaMeter,
  type MeterProps as AriaMeterProps,
  type MeterRenderProps,
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
      destructive: '[--meter-fill:var(--color-destructive-text)]',
      info: '[--meter-fill:var(--color-info-text)]',
      primary: '[--meter-fill:var(--color-primary-text)]',
      success: '[--meter-fill:var(--color-success-text)]',
      warning: '[--meter-fill:var(--color-warning-text)]',
    },
  },
});

type MeterValues = Pick<MeterRenderProps, 'percentage' | 'valueText'>;

const MeterContext = createContext<MeterValues | null>(null);

// A label renders the default layout: the label and value in a row, then the
// track. Children replace the layout, built from MeterLabel, MeterValue and
// MeterTrack; a function child gets React Aria's render props, such as
// percentage and valueText.
export type MeterProps = (
  | {
      children:
        | ((values: MeterRenderProps) => ReactNode)
        | Exclude<ReactNode, boolean | null | undefined>;
      label?: never;
    }
  | { children?: never; label?: ReactNode }
) & { intent?: NonNullable<VariantProps<typeof styles>['intent']> } & Omit<
    AriaMeterProps,
    'children'
  >;

export type MeterTrackProps = Omit<
  ComponentProps<'span'>,
  'children' | 'dangerouslySetInnerHTML'
>;

export type MeterValueProps = {
  children?: (valueText: string) => ReactNode;
} & Omit<ComponentProps<'span'>, 'children' | 'dangerouslySetInnerHTML'>;

export function Meter({
  children,
  className,
  intent = 'primary',
  label,
  ...props
}: MeterProps) {
  return (
    <AriaMeter
      data-slot="meter"
      {...props}
      className={cx(styles({ intent }), className)}
      data-intent={intent}
    >
      {(values) => (
        <MeterContext value={values}>
          {typeof children === 'function' ? (
            children(values)
          ) : isEmptyNode(children) ? (
            <Layout label={label} />
          ) : (
            children
          )}
        </MeterContext>
      )}
    </AriaMeter>
  );
}

export function MeterLabel({ className, ...props }: AriaLabelProps) {
  return (
    <AriaLabel
      className={cn('text-sm font-medium', className)}
      data-slot="meter-label"
      {...props}
    />
  );
}

// Forced colors repaint the track's fill as the page color, so a border keeps
// its shape there.
export function MeterTrack({ className, ...props }: MeterTrackProps) {
  const { percentage } = useMeter();
  return (
    <span
      className={cn(
        'relative flex h-1.5 w-full items-center overflow-hidden rounded-full bg-muted forced-colors:border',
        className,
      )}
      data-slot="meter-track"
      {...props}
    >
      <span
        className="h-full rounded-full bg-(--meter-fill) transition-[width] duration-300 ease-out forced-colors:bg-[Highlight]"
        data-slot="meter-indicator"
        style={{ width: `${percentage}%` }}
      />
    </span>
  );
}

export function MeterValue({ children, className, ...props }: MeterValueProps) {
  const { valueText } = useMeter();
  const content =
    children && valueText !== undefined ? children(valueText) : valueText;
  if (isEmptyNode(content)) return null;
  return (
    <span
      className={cn(
        'ms-auto text-sm text-muted-foreground tabular-nums',
        className,
      )}
      data-slot="meter-value"
      {...props}
    >
      {content}
    </span>
  );
}

function Layout({ label }: { label: ReactNode }) {
  return (
    <>
      {isEmptyNode(label) ? null : (
        <>
          <MeterLabel>{label}</MeterLabel>
          <MeterValue />
        </>
      )}
      <MeterTrack />
    </>
  );
}

function useMeter() {
  const context = use(MeterContext);
  if (!context) throw new Error('Meter parts must be inside a Meter.');
  return context;
}
