import type { ChartPoint } from '@tanstack/charts';

import * as Icon from '#/components/icons';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/data/table';
import { buttonStyles } from '#/components/ui/inputs/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '#/components/ui/layout/collapsible';
import { useChart } from '#/hooks/use-chart';
import { useChartFormatter } from '#/hooks/use-chart-formatter';
import { type ChartTableModel, chartTableModel } from '#/lib/chart-table-model';
import {
  axisText,
  categoryText,
  configText,
  seriesText,
} from '#/lib/chart-tooltip';
import { cn } from '#/lib/cx';

export type ChartTableProps = {
  // Heads the column of categories, such as months.
  categoryLabel?: string;
  className?: string;
  defaultExpanded?: boolean;
  // Names the button that shows the table.
  label?: string;
  // Heads the series column of a table with a row per point.
  seriesLabel?: string;
  // Heads the values' column of a table with a row per point.
  valueLabel?: string;
};

type ChartSceneTableProps = {
  categoryLabel: string;
  points: readonly ChartPoint[];
  seriesLabel: string;
  valueLabel: string;
};

type ChartTableText = Record<
  'category' | 'cell' | 'series',
  (point: ChartPoint) => string
>;

// The values each plot in the container drew, behind a disclosure: a row per
// category and a column per series where that holds every value, else a row
// per point. A hidden series leaves the table too.
export function ChartTable({
  categoryLabel = 'Category',
  className,
  defaultExpanded,
  label = 'View as table',
  seriesLabel = 'Series',
  valueLabel = 'Value',
}: ChartTableProps) {
  const { scenes } = useChart();
  return (
    <Collapsible
      className={cn('flex flex-col gap-2', className)}
      data-slot="chart-table"
      defaultExpanded={defaultExpanded}
    >
      <CollapsibleTrigger
        className={cn(
          buttonStyles({ intent: 'neutral', size: 'sm', variant: 'ghost' }),
          'group self-start',
        )}
      >
        <Icon.ChevronDown className="transition-transform group-aria-expanded:rotate-180 motion-reduce:transition-none" />
        {label}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col gap-4">
          {[...scenes].map(([id, scene]) =>
            scene.points.length === 0 ? null : (
              <ChartSceneTable
                categoryLabel={categoryLabel}
                key={id}
                points={scene.points}
                seriesLabel={seriesLabel}
                valueLabel={valueLabel}
              />
            ),
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function ChartSceneTable({
  categoryLabel,
  points,
  seriesLabel,
  valueLabel,
}: ChartSceneTableProps) {
  const { config, title } = useChart();
  const format = useChartFormatter();
  const model = chartTableModel(points);
  const isSeriesColumn = model.kind === 'points' && model.hasSeries;
  const text: ChartTableText = {
    category: (point) => categoryText(point, model.axis, config, format),
    cell: (point) => axisText(point, model.axis === 'x' ? 'y' : 'x', format),
    series: (point) => seriesText(point, config),
  };
  return (
    <Table size="sm">
      <TableCaption className="sr-only">{title}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">{categoryLabel}</TableHead>
          {model.kind === 'series' ? (
            model.series.map((key) => (
              <TableHead align="end" key={String(key)} scope="col">
                {configText(config, String(key), String(key))}
              </TableHead>
            ))
          ) : (
            <>
              {isSeriesColumn ? (
                <TableHead scope="col">{seriesLabel}</TableHead>
              ) : null}
              <TableHead align="end" scope="col">
                {valueLabel}
              </TableHead>
            </>
          )}
        </TableRow>
      </TableHeader>
      <ChartSceneTableBody
        isSeriesColumn={isSeriesColumn}
        model={model}
        text={text}
      />
    </Table>
  );
}

function ChartSceneTableBody({
  isSeriesColumn,
  model,
  text,
}: {
  isSeriesColumn: boolean;
  model: ChartTableModel;
  text: ChartTableText;
}) {
  return (
    <TableBody>
      {model.kind === 'series'
        ? model.rows.map(({ category, cells }) => (
            <TableRow key={category.key}>
              <TableHead scope="row">{text.category(category)}</TableHead>
              {model.series.map((key) => {
                const cell = cells.get(key);
                return (
                  <TableCell align="end" key={String(key)}>
                    {cell ? text.cell(cell) : null}
                  </TableCell>
                );
              })}
            </TableRow>
          ))
        : model.points.map((point) => (
            <TableRow key={point.key}>
              <TableHead scope="row">{text.category(point)}</TableHead>
              {isSeriesColumn ? (
                <TableCell>{text.series(point)}</TableCell>
              ) : null}
              <TableCell align="end">{text.cell(point)}</TableCell>
            </TableRow>
          ))}
    </TableBody>
  );
}
