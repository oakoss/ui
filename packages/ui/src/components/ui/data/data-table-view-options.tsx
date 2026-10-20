import type { Selection } from 'react-aria-components';

import * as Icon from '#/components/icons';
import { Button } from '#/components/ui/inputs/button';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/overlays/dropdown-menu';
import { columnLabel, useDataTableContext } from '#/hooks/use-data-table';

export type DataTableViewOptionsProps = { label?: string };

// Shows and hides the columns that can hide, staying open so several can
// change at once. Display columns, such as selection and actions, stay.
export function DataTableViewOptions({
  label = 'Columns',
}: DataTableViewOptionsProps) {
  const table = useDataTableContext();
  const columns = table
    .getAllLeafColumns()
    .filter((column) => column.accessorFn !== undefined && column.getCanHide());
  const visible = columns
    .filter((column) => column.getIsVisible())
    .map((column) => column.id);

  function show(keys: Selection) {
    table.setColumnVisibility((previous) => ({
      ...previous,
      ...Object.fromEntries(
        columns.map((column) => [
          column.id,
          keys === 'all' || keys.has(column.id),
        ]),
      ),
    }));
  }

  return (
    <DropdownMenuTrigger>
      <Button data-slot="data-table-view-options" size="sm" variant="outline">
        <Icon.Columns aria-hidden data-icon="inline-start" />
        {label}
      </Button>
      <DropdownMenu
        onSelectionChange={show}
        placement="bottom end"
        selectedKeys={visible}
        selectionMode="multiple"
        shouldCloseOnSelect={false}
      >
        {columns.map((column) => (
          <DropdownMenuItem id={column.id} key={column.id}>
            {columnLabel(column)}
          </DropdownMenuItem>
        ))}
      </DropdownMenu>
    </DropdownMenuTrigger>
  );
}
