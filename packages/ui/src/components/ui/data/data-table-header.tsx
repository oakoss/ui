import { FlexRender, type Header, type RowData } from '@tanstack/react-table';

import * as Icon from '#/components/icons';
import { TableHead } from '#/components/ui/data/table';
import { Button } from '#/components/ui/inputs/button';
import {
  type DataTableFeatures,
  useDataTableContext,
} from '#/hooks/use-data-table';
import { cn } from '#/lib/cx';

export type DataTableHeadProps = {
  header: Header<DataTableFeatures, RowData>;
  // Rows the header spans, for a column outside the groups above it.
  rowSpan?: number;
};

const sortNames = { asc: 'ascending', desc: 'descending' } as const;

// Only the first sort column carries aria-sort, which ARIA allows on one
// header at a time; later ones show their place in the order. A header
// spanning group rows sits at their foot, in line with the grouped columns'.
export function DataTableHead({ header, rowSpan = 1 }: DataTableHeadProps) {
  const { column } = header;
  const meta = column.columnDef.meta;
  const sorted = column.getIsSorted();
  return (
    <TableHead
      align={meta?.align}
      aria-sort={
        sorted !== false && column.getSortIndex() === 0
          ? sortNames[sorted]
          : undefined
      }
      className={cn(rowSpan > 1 && 'align-bottom', meta?.className)}
      colSpan={header.colSpan > 1 ? header.colSpan : undefined}
      data-slot="data-table-head"
      rowSpan={rowSpan > 1 ? rowSpan : undefined}
    >
      {header.isPlaceholder ? null : column.getCanSort() ? (
        <DataTableSortButton header={header} />
      ) : (
        <FlexRender header={header} />
      )}
    </TableHead>
  );
}

// Each press steps ascending, descending, then unsorted; with Shift it adds
// the column to the order instead of replacing it.
function DataTableSortButton({ header }: DataTableHeadProps) {
  const { column } = header;
  const sorted = column.getIsSorted();
  const isEnd = column.columnDef.meta?.align === 'end';
  const order = column.getSortIndex();
  const isMulti = useDataTableContext().state.sorting.length > 1;
  return (
    <Button
      className={cn('gap-1.5', isEnd ? '-me-2.5' : '-ms-2.5')}
      data-slot="data-table-sort"
      intent="neutral"
      onPress={(event) =>
        column.toggleSorting(
          undefined,
          event.shiftKey && column.getCanMultiSort(),
        )
      }
      size="sm"
      targetSize={false}
      variant="ghost"
    >
      <FlexRender header={header} />
      {sorted === 'asc' ? (
        <Icon.ArrowUp aria-hidden className="size-3.5" />
      ) : sorted === 'desc' ? (
        <Icon.ArrowDown aria-hidden className="size-3.5" />
      ) : (
        <Icon.ArrowUpDown aria-hidden className="size-3.5 opacity-50" />
      )}
      {isMulti && order >= 0 ? (
        <span aria-hidden className="text-xs text-muted-foreground">
          {order + 1}
        </span>
      ) : null}
    </Button>
  );
}
