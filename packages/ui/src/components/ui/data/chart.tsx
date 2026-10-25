import type { ChartPoint, ChartValue } from '@tanstack/charts';

import {
  Chart as ChartPrimitive,
  type ChartProps as ChartPrimitiveProps,
  type ChartTooltipBodyRenderContext,
} from '@tanstack/charts/react/tooltip';
import {
  type ComponentType,
  createContext,
  type CSSProperties,
  type ReactNode,
  use,
  useId,
} from 'react';

import { useChartFormatter } from '#/hooks/use-chart-formatter';
import { axisText, axisValue, headingAxis, rowText } from '#/lib/chart-tooltip';
import { cn } from '#/lib/cx';

export type ChartConfig = Record<
  string,
  { color?: string; icon?: ComponentType; label?: ReactNode }
>;

export type ChartContainerProps<
  TDatum,
  TXValue extends ChartValue,
  TYValue extends ChartValue,
> = {
  className?: string;
  config: ChartConfig;
  description: string;
  title: string;
} & Omit<
  ChartPrimitiveProps<TDatum, TXValue, TYValue>,
  'ariaDescription' | 'ariaLabel' | 'className' | 'style'
>;

export type ChartIndicator = 'dashed' | 'dot' | 'line';

export type ChartTooltipContentProps<
  TDatum,
  TXValue extends ChartValue,
  TYValue extends ChartValue,
> = {
  className?: string;
  hideIndicator?: boolean;
  hideLabel?: boolean;
  indicator?: ChartIndicator;
  // Formats the heading: the value the focused points share, usually x.
  labelFormatter?: (
    value: TXValue | TYValue,
    points: readonly ChartPoint<TDatum, TXValue, TYValue>[],
  ) => ReactNode;
  points: readonly ChartPoint<TDatum, TXValue, TYValue>[];
  // Formats each row's value, along the axis the heading doesn't read, or y.
  valueFormatter?: (
    value: TXValue | TYValue,
    point: ChartPoint<TDatum, TXValue, TYValue>,
  ) => ReactNode;
};

const ChartContext = createContext<{ config: ChartConfig } | null>(null);

type ChartTooltipItemProps = {
  hideIndicator: boolean;
  indicator: ChartIndicator;
  label: ReactNode;
  point: ChartPoint;
  value: ReactNode;
};

export function ChartContainer<
  TDatum,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
>({
  aspectRatio = 16 / 9,
  className,
  config,
  description,
  renderTooltipBody = defaultTooltipBody,
  title,
  ...props
}: ChartContainerProps<TDatum, TXValue, TYValue>) {
  const id = useId();
  return (
    <ChartContext value={{ config }}>
      <figure
        aria-describedby={`${id}-description`}
        aria-labelledby={`${id}-title`}
        className={cn('flex flex-col gap-4', className)}
        data-slot="chart"
      >
        <figcaption className="grid gap-1" data-slot="chart-caption">
          <span
            className="text-sm font-medium"
            data-slot="chart-title"
            id={`${id}-title`}
          >
            {title}
          </span>
          <span
            className="text-sm text-muted-foreground"
            data-slot="chart-description"
            id={`${id}-description`}
          >
            {description}
          </span>
        </figcaption>
        <ChartPrimitive
          {...props}
          ariaDescription={description}
          ariaLabel={title}
          aspectRatio={aspectRatio}
          className="text-xs text-muted-foreground [--ts-chart-1:var(--color-chart-1)] [--ts-chart-2:var(--color-chart-2)] [--ts-chart-3:var(--color-chart-3)] [--ts-chart-4:var(--color-chart-4)] [--ts-chart-5:var(--color-chart-5)]"
          renderTooltipBody={renderTooltipBody}
        />
      </figure>
    </ChartContext>
  );
}

export function ChartTooltipContent<
  TDatum,
  TXValue extends ChartValue = ChartValue,
  TYValue extends ChartValue = ChartValue,
>({
  className,
  hideIndicator = false,
  hideLabel = false,
  indicator = 'dot',
  labelFormatter,
  points,
  valueFormatter,
}: ChartTooltipContentProps<TDatum, TXValue, TYValue>) {
  const format = useChartFormatter();
  const labelNode = useTooltipLabel(points, hideLabel, labelFormatter);
  if (points.length === 0) return null;
  const heading = headingAxis(points);
  const valueAxis = heading === 'y' ? 'x' : 'y';
  const isLabelNested = points.length === 1 && indicator !== 'dot';

  return (
    <div
      className={cn(
        'grid min-w-32 items-start gap-1.5 rounded-lg border bg-popover px-2.5 py-1.5 text-xs text-popover-foreground shadow-xl',
        className,
      )}
      data-slot="chart-tooltip"
    >
      {isLabelNested ? null : labelNode}
      <div className="grid gap-1.5">
        {points.map((point) => (
          <ChartTooltipItem
            hideIndicator={hideIndicator}
            indicator={indicator}
            key={point.key}
            label={isLabelNested ? labelNode : null}
            point={point}
            value={
              valueFormatter
                ? valueFormatter(axisValue(point, valueAxis), point)
                : rowText(point, heading, format)
            }
          />
        ))}
      </div>
    </div>
  );
}

export function useChart() {
  const context = use(ChartContext);
  if (!context)
    throw new Error('useChart must be used within a ChartContainer');
  return context;
}

function ChartTooltipIndicator({
  color,
  indicator,
  isLabelNested,
}: {
  color: string;
  indicator: ChartIndicator;
  isLabelNested: boolean;
}) {
  const style: CSSProperties & Record<'--indicator', string> = {
    '--indicator': color,
  };
  return (
    <span
      aria-hidden="true"
      className={cn(
        'shrink-0 rounded-xs border-(--indicator) bg-(--indicator) forced-color-adjust-none',
        {
          'my-0.5': isLabelNested && indicator === 'dashed',
          'size-2.5': indicator === 'dot',
          'w-0 border-[1.5px] border-dashed bg-transparent':
            indicator === 'dashed',
          'w-1': indicator === 'line',
        },
      )}
      data-slot="chart-tooltip-indicator"
      style={style}
    />
  );
}

function ChartTooltipItem({
  hideIndicator,
  indicator,
  label,
  point,
  value,
}: ChartTooltipItemProps) {
  const { config } = useChart();
  const key = String(point.group ?? point.markId);
  const item = config[key];
  const isLabelNested = label !== null;
  return (
    <div
      className={cn(
        'flex w-full flex-wrap items-stretch gap-2 [&>svg]:size-2.5 [&>svg]:text-muted-foreground',
        indicator === 'dot' && 'items-center',
      )}
      data-slot="chart-tooltip-item"
    >
      {item?.icon ? (
        <item.icon />
      ) : hideIndicator ? null : (
        <ChartTooltipIndicator
          color={point.color}
          indicator={indicator}
          isLabelNested={isLabelNested}
        />
      )}
      <div
        className={cn(
          'flex flex-1 justify-between gap-4 leading-none',
          isLabelNested ? 'items-end' : 'items-center',
        )}
      >
        <div className="grid gap-1.5">
          {label}
          <span className="text-muted-foreground">
            {item?.label ?? (point.groupLabel || key)}
          </span>
        </div>
        <span className="font-mono font-medium text-foreground tabular-nums">
          {value}
        </span>
      </div>
    </div>
  );
}

function defaultTooltipBody<
  TDatum,
  TXValue extends ChartValue,
  TYValue extends ChartValue,
>(context: ChartTooltipBodyRenderContext<TDatum, TXValue, TYValue>) {
  return <ChartTooltipContent points={context.points} />;
}

// A category named in the config heads the tooltip with its label.
function useTooltipLabel<
  TDatum,
  TXValue extends ChartValue,
  TYValue extends ChartValue,
>(
  points: readonly ChartPoint<TDatum, TXValue, TYValue>[],
  isHidden: boolean,
  labelFormatter: ChartTooltipContentProps<
    TDatum,
    TXValue,
    TYValue
  >['labelFormatter'],
): ReactNode {
  const { config } = useChart();
  const format = useChartFormatter();
  const [first] = points;
  const axis = headingAxis(points);
  if (isHidden || !first || axis === undefined) return null;
  const category = axisValue(first, axis);
  const label = labelFormatter
    ? labelFormatter(category, points)
    : typeof category === 'string'
      ? (config[category]?.label ?? category)
      : axisText(first, axis, format);
  if (label === null || label === undefined) return null;
  return (
    <div className="font-medium" data-slot="chart-tooltip-label">
      {label}
    </div>
  );
}
