import { type CSSProperties, useEffect } from 'react';
import { ToggleButton, ToggleButtonGroup } from 'react-aria-components';

import { useChart } from '#/hooks/use-chart';
import { chartSeriesKeys } from '#/lib/chart-series';
import { cn, cx } from '#/lib/cx';
import { focusRing } from '#/lib/recipes';

export type ChartLegendProps = (
  | {
      // The series hidden; pass the same set to chartColor in the definition.
      hidden: Iterable<string>;
      // Names the toolbar of toggles.
      label?: string;
      onHiddenChange: (hidden: Set<string>) => void;
    }
  | { hidden?: never; label?: never; onHiddenChange?: never }
) & { className?: string };

const legendStyles =
  'flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs';

// The config's series. With `hidden` and `onHiddenChange`, each item toggles
// its series and highlights it on hover and focus.
export function ChartLegend({
  className,
  hidden,
  label = 'Series',
  onHiddenChange,
}: ChartLegendProps) {
  const { config } = useChart();
  const series = chartSeriesKeys(config);
  if (!onHiddenChange) {
    return (
      <ul className={cn(legendStyles, className)} data-slot="chart-legend">
        {series.map((key) => (
          <li className="flex items-center gap-1.5" key={key}>
            <ChartLegendSwatch color={config[key]?.color} />
            {config[key]?.label ?? key}
          </li>
        ))}
      </ul>
    );
  }
  const hiddenKeys = new Set(hidden);
  return (
    <ToggleButtonGroup
      aria-label={label}
      className={cx(legendStyles, className)}
      data-slot="chart-legend"
      onSelectionChange={(visible) => {
        onHiddenChange(new Set(series.filter((key) => !visible.has(key))));
      }}
      selectedKeys={series.filter((key) => !hiddenKeys.has(key))}
      selectionMode="multiple"
    >
      {series.map((key) => (
        <ChartLegendItem id={key} isHidden={hiddenKeys.has(key)} key={key} />
      ))}
    </ToggleButtonGroup>
  );
}

// A hidden item, like TanStack's, takes no highlight, so hovering it leaves a
// focused item's in place; an item that hides or unmounts gives its own up.
function ChartLegendItem({ id, isHidden }: { id: string; isHidden: boolean }) {
  const { config, highlighter } = useChart();
  useEffect(() => {
    if (isHidden) highlighter.release(id);
    return () => highlighter.release(id);
  }, [highlighter, id, isHidden]);
  return (
    <ToggleButton
      className={cx(
        `${focusRing} group flex min-h-6 min-w-6 cursor-default items-center gap-1.5 rounded-sm px-1 text-foreground not-data-selected:text-muted-foreground not-data-selected:line-through`,
      )}
      data-slot="chart-legend-item"
      id={id}
      onBlur={() => highlighter.highlight('keyboard', null)}
      onFocus={() => {
        if (!isHidden) highlighter.highlight('keyboard', id);
      }}
      onHoverEnd={() => highlighter.highlight('pointer', null)}
      onHoverStart={() => {
        if (!isHidden) highlighter.highlight('pointer', id);
      }}
    >
      <ChartLegendSwatch color={config[id]?.color} />
      {config[id]?.label ?? id}
    </ToggleButton>
  );
}

// Forced colors would repaint the swatch as the page color.
function ChartLegendSwatch({ color }: { color: string | undefined }) {
  const style: CSSProperties & Record<'--swatch', string> = {
    '--swatch': color ?? 'currentColor',
  };
  return (
    <span
      aria-hidden="true"
      className="size-2.5 shrink-0 rounded-xs border-2 border-(--swatch) bg-(--swatch) forced-color-adjust-none group-not-data-selected:bg-transparent"
      data-slot="chart-legend-swatch"
      style={style}
    />
  );
}
