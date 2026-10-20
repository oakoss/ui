import { type ReactNode, type RefObject, useLayoutEffect, useRef } from 'react';
import { Toolbar, type ToolbarProps } from 'react-aria-components';

import type { DataTableSelection } from '#/lib/data-table-selection';

import { Button } from '#/components/ui/inputs/button';
import {
  type DataTableSelectionSummary,
  useDataTableSelection,
} from '#/hooks/use-data-table-selection';
import { useLatest } from '#/hooks/use-latest';
import { cn } from '#/lib/cx';

export type DataTableActionBarProps = {
  allSelectedLabel?: (count: number) => string;
  children?: ((selection: DataTableActionSelection) => ReactNode) | ReactNode;
  className?: string;
  clearLabel?: string;
  hiddenLabel?: (count: number) => string;
  label?: string;
  selectAllLabel?: (count: number) => string;
  selectedLabel?: (count: number) => string;
} & Omit<ToolbarProps, 'children' | 'className'>;

export type DataTableActionSelection = {
  selection: DataTableSelection;
} & DataTableSelectionSummary;

type Labels = Required<
  Pick<
    DataTableActionBarProps,
    | 'allSelectedLabel'
    | 'clearLabel'
    | 'hiddenLabel'
    | 'label'
    | 'selectAllLabel'
    | 'selectedLabel'
  >
>;

const defaultLabels: Labels = {
  allSelectedLabel: (count) => `All ${String(count)} selected`,
  clearLabel: 'Clear selection',
  hiddenLabel: (count) => `${String(count)} hidden by filter`,
  label: 'Selected rows',
  selectAllLabel: (count) => `Select all ${String(count)} matching`,
  selectedLabel: (count) => `${String(count)} selected`,
};

const clearSelector = '[data-slot=data-table-action-bar-clear]';

// Sticks to the bottom of the screen while rows are selected. It sits after
// the table, so appearing moves only what follows, never the rows being
// ticked. Escape inside it clears the selection.
export function DataTableActionBar({
  allSelectedLabel = defaultLabels.allSelectedLabel,
  clearLabel = defaultLabels.clearLabel,
  hiddenLabel = defaultLabels.hiddenLabel,
  label = defaultLabels.label,
  selectAllLabel = defaultLabels.selectAllLabel,
  selectedLabel = defaultLabels.selectedLabel,
  ...props
}: DataTableActionBarProps) {
  const { selected } = useDataTableSelection();
  if (selected === 0) return null;
  return (
    <ActionBar
      labels={{
        allSelectedLabel,
        clearLabel,
        hiddenLabel,
        label,
        selectAllLabel,
        selectedLabel,
      }}
      {...props}
    />
  );
}

function ActionBar({
  children,
  className,
  labels,
  ...props
}: { labels: Labels } & Omit<DataTableActionBarProps, keyof Labels>) {
  const { clear, selectAllMatching, selection, ...summary } =
    useDataTableSelection();
  const ref = useRef<HTMLDivElement>(null);
  useBarFocus(ref, clear);
  return (
    <div className="sticky bottom-4 z-(--z-sticky)" ref={ref}>
      <Toolbar
        aria-label={labels.label}
        className={cn(
          'flex flex-wrap items-center gap-2 rounded-panel border bg-popover p-2 text-sm text-popover-foreground shadow-md',
          className,
        )}
        data-slot="data-table-action-bar"
        {...props}
      >
        <SelectionStatus
          labels={labels}
          onSelectAll={() => {
            selectAllMatching();
            // The button goes once everything is selected, so focus moves on.
            requestAnimationFrame(() =>
              ref.current?.querySelector<HTMLElement>(clearSelector)?.focus(),
            );
          }}
          summary={summary}
        />
        <div className="ms-auto flex flex-wrap items-center gap-2">
          {typeof children === 'function'
            ? children({ ...summary, selection })
            : children}
          <Button
            data-slot="data-table-action-bar-clear"
            intent="neutral"
            onPress={clear}
            size="sm"
            variant="outline"
          >
            {labels.clearLabel}
          </Button>
        </div>
      </Toolbar>
    </div>
  );
}

// The page's select box, or with no rows left to select, the body's first
// control, such as Clear filters.
function focusTable(root: Element | null | undefined) {
  root
    ?.querySelector<HTMLElement>(
      ':scope thead input[type=checkbox]:not(:disabled), :scope tbody :is(a[href], button:not(:disabled), input:not(:disabled))',
    )
    ?.focus();
}

function SelectionStatus({
  labels,
  onSelectAll,
  summary,
}: {
  labels: Labels;
  onSelectAll: () => void;
  summary: DataTableSelectionSummary;
}) {
  const isAll = summary.isAllMatching && summary.selected === summary.matching;
  const canSelectAll =
    !summary.isAllMatching &&
    summary.isPageSelected &&
    summary.matching > summary.selected - summary.hidden;
  return (
    <>
      <p className="px-2 font-medium">
        {isAll
          ? labels.allSelectedLabel(summary.selected)
          : labels.selectedLabel(summary.selected)}
        {summary.hidden > 0 ? (
          <span className="text-muted-foreground">
            {` (${labels.hiddenLabel(summary.hidden)})`}
          </span>
        ) : null}
      </p>
      {canSelectAll ? (
        <Button
          intent="neutral"
          onPress={onSelectAll}
          size="sm"
          variant="ghost"
        >
          {labels.selectAllLabel(summary.matching)}
        </Button>
      ) : null}
    </>
  );
}

// React Aria's Toolbar takes no key handlers. Focus left in the bar, or in a
// dialog whose trigger went with it, would drop to the page.
function useBarFocus(ref: RefObject<HTMLDivElement | null>, clear: () => void) {
  const clearRef = useLatest(clear);
  useLayoutEffect(() => {
    const bar = ref.current;
    const root = bar?.closest('[data-slot=data-table]');
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') clearRef.current();
    };
    bar?.addEventListener('keydown', onKeyDown);
    return () => {
      bar?.removeEventListener('keydown', onKeyDown);
      const active = document.activeElement;
      const dialog =
        active?.closest('[role=dialog],[role=alertdialog]') ?? null;
      if (dialog === null && bar?.contains(active) !== true) return;
      requestAnimationFrame(() => {
        const now = document.activeElement;
        if (now === null || now === document.body || !now.isConnected) {
          focusTable(root);
        }
      });
    };
  }, [clearRef, ref]);
}
