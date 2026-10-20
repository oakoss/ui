import type { ComponentProps } from 'react';

import { Select as AriaSelect } from 'react-aria-components';

import * as Icon from '#/components/icons';
import { Button, type ButtonProps } from '#/components/ui/inputs/button';
import { FieldLabel } from '#/components/ui/inputs/field';
import {
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/inputs/select';
import {
  defaultPageLabel,
  pageOf,
  selectedCount,
  useDataTableContext,
} from '#/hooks/use-data-table';
import { cn } from '#/lib/cx';

export type DataTablePaginationProps = {
  firstLabel?: string;
  lastLabel?: string;
  nextLabel?: string;
  pageLabel?: (page: number, pageCount: number) => string;
  pageSizeLabel?: string;
  pageSizes?: number[];
  previousLabel?: string;
  selectedLabel?: (selected: number, total: number) => string;
} & ComponentProps<'div'>;

type StepLabels = Pick<
  DataTablePaginationProps,
  'firstLabel' | 'lastLabel' | 'nextLabel' | 'previousLabel'
>;

const defaultPageSizes = [10, 20, 30, 40, 50];

// Page controls are buttons, not links: they change the table's state, not
// the page's address.
export function DataTablePagination({
  className,
  firstLabel,
  lastLabel,
  nextLabel,
  pageLabel = defaultPageLabel,
  pageSizeLabel = 'Rows per page',
  pageSizes = defaultPageSizes,
  previousLabel,
  selectedLabel = defaultSelectedLabel,
  ...props
}: DataTablePaginationProps) {
  const table = useDataTableContext();
  const { page, pageCount } = pageOf(table);
  const canSelect = table.options.enableRowSelection !== false;
  const selected = selectedCount(table);
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm',
        className,
      )}
      data-slot="data-table-pagination"
      {...props}
    >
      <p className="text-muted-foreground">
        {canSelect ? selectedLabel(selected, table.getRowCount()) : null}
      </p>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <PageSize label={pageSizeLabel} pageSizes={pageSizes} />
        <p className="font-medium">{pageLabel(page, pageCount)}</p>
        <PageSteps
          firstLabel={firstLabel}
          lastLabel={lastLabel}
          nextLabel={nextLabel}
          previousLabel={previousLabel}
        />
      </div>
    </div>
  );
}

function defaultSelectedLabel(selected: number, total: number) {
  return `${String(selected)} of ${String(total)} selected`;
}

function PageSize({
  label,
  pageSizes,
}: {
  label: string;
  pageSizes: number[];
}) {
  const table = useDataTableContext();
  return (
    <AriaSelect
      className="flex items-center gap-2"
      onChange={(key) => table.setPageSize(Number(key))}
      value={String(table.state.pagination.pageSize)}
    >
      <FieldLabel className="whitespace-nowrap">{label}</FieldLabel>
      <SelectTrigger className="w-20" size="sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {pageSizes.map((size) => (
          <SelectItem id={String(size)} key={size}>
            {String(size)}
          </SelectItem>
        ))}
      </SelectContent>
    </AriaSelect>
  );
}

// First and last drop out on phones, where the bar wraps anyway.
function PageSteps({
  firstLabel = 'First page',
  lastLabel = 'Last page',
  nextLabel = 'Next page',
  previousLabel = 'Previous page',
}: StepLabels) {
  const table = useDataTableContext();
  // With no pages there's nowhere to step, even from a page kept for rows
  // still loading.
  const isEmpty = table.getPageCount() === 0;
  const isFirst = isEmpty || !table.getCanPreviousPage();
  const isLast = isEmpty || !table.getCanNextPage();
  return (
    <div className="flex items-center gap-1">
      <StepButton
        className="max-sm:hidden"
        isDisabled={isFirst}
        label={firstLabel}
        onPress={() => table.firstPage()}
      >
        <Icon.ChevronsLeft aria-hidden className="rtl:rotate-180" />
      </StepButton>
      <StepButton
        isDisabled={isFirst}
        label={previousLabel}
        onPress={() => table.previousPage()}
      >
        <Icon.ChevronLeft aria-hidden className="rtl:rotate-180" />
      </StepButton>
      <StepButton
        isDisabled={isLast}
        label={nextLabel}
        onPress={() => table.nextPage()}
      >
        <Icon.ChevronRight aria-hidden className="rtl:rotate-180" />
      </StepButton>
      <StepButton
        className="max-sm:hidden"
        isDisabled={isLast}
        label={lastLabel}
        onPress={() => table.lastPage()}
      >
        <Icon.ChevronsRight aria-hidden className="rtl:rotate-180" />
      </StepButton>
    </div>
  );
}

function StepButton({
  label,
  ...props
}: { label: string } & Omit<ButtonProps, 'aria-label' | 'size'>) {
  return (
    <Button aria-label={label} size="icon-sm" variant="outline" {...props} />
  );
}
