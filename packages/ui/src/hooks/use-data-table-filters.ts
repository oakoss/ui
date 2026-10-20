import { createContext, use } from 'react';

import { useDataTableContext } from '#/hooks/use-data-table';

// Counts clears, so a search drops text still waiting to apply even when the
// applied search was already empty and clearing changed nothing.
export const DataTableClearsContext = createContext<{
  clears: number;
  onClear: () => void;
} | null>(null);

// The control that cleared the filters goes away with them, so focus moves
// to the table's search field rather than dropping to the page.
export function focusSearch(from: Element) {
  from
    .closest('[data-slot=data-table]')
    ?.querySelector<HTMLElement>('[data-slot=search-field] input')
    ?.focus();
}

export function useClearFilters() {
  const table = useDataTableContext();
  const { onClear } = useDataTableClears();
  return (from: Element) => {
    table.resetColumnFilters(true);
    table.setGlobalFilter('');
    onClear();
    focusSearch(from);
  };
}

export function useDataTableClears() {
  const clears = use(DataTableClearsContext);
  if (clears === null) {
    throw new Error('Data table parts render inside a DataTable.');
  }
  return clears;
}
