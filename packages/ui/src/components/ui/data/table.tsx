import {
  type ComponentProps,
  createContext,
  type ReactNode,
  use,
  useId,
  useMemo,
  useRef,
} from 'react';
import { tv } from 'tailwind-variants/lite';

import { useScrollRegion } from '#/hooks/use-scroll-region';
import { cn } from '#/lib/cx';
import { focusRing } from '#/lib/recipes';

export type TableCellProps = { align?: Align; isSticky?: boolean } & Omit<
  ComponentProps<'td'>,
  'align'
>;

export type TableHeadProps = {
  align?: Align;
  isSticky?: boolean;
  scope?: 'col' | 'colgroup' | 'row' | 'rowgroup';
} & Omit<ComponentProps<'th'>, 'align' | 'scope'>;

export type TableProps = {
  containerClassName?: string;
  size?: 'md' | 'sm';
  stickyColumn?: boolean;
  stickyHeader?: boolean;
  striped?: boolean;
} & ComponentProps<'table'>;

type Align = 'center' | 'end' | 'start';

const TableContext = createContext<
  Required<
    Pick<TableProps, 'size' | 'stickyColumn' | 'stickyHeader' | 'striped'>
  >
>({ size: 'md', stickyColumn: false, stickyHeader: false, striped: false });
const SectionContext = createContext<'body' | 'footer' | 'header'>('body');
// Per Table, so a nested table's shadows follow its own scrolling.
const ScrollContext = createContext({ isPastStart: false, isPastTop: false });

const cellStyles = tv({
  base: 'border-b border-border align-middle whitespace-nowrap',
  variants: {
    align: {
      center: 'text-center',
      end: 'text-end tabular-nums',
      start: 'text-start',
    },
    isPastStart: { false: 'first:before:opacity-0', true: '' },
    size: { md: 'p-2', sm: 'px-2 py-1' },
    // A sticky cell paints the table's surface under its row's tint, so
    // content scrolls out of sight beneath it.
    stickyColumn: {
      false: '',
      true: 'first:sticky first:start-0 first:z-1 first:bg-(--table-bg) first:before:pointer-events-none first:before:absolute first:before:inset-y-0 first:before:-end-2 first:before:w-2 first:before:bg-linear-to-r first:before:from-black/10 first:before:transition-opacity rtl:first:before:bg-linear-to-l dark:first:before:from-black/40 forced-colors:first:border-e',
    },
  },
});

// Tints paint on the cells, over a sticky cell's surface too; each state
// excludes the others so none depends on CSS order.
const rowStyles = tv({
  base: '*:bg-linear-to-b *:from-transparent *:to-transparent forced-colors:aria-selected:*:bg-[Highlight] forced-colors:aria-selected:*:bg-none forced-colors:aria-selected:*:text-[HighlightText] forced-colors:aria-selected:*:forced-color-adjust-none',
  variants: {
    section: {
      body: 'hover:not-aria-selected:*:from-muted hover:not-aria-selected:*:to-muted aria-selected:not-hover:*:from-primary/10 aria-selected:not-hover:*:to-primary/10 aria-selected:hover:*:from-primary/15 aria-selected:hover:*:to-primary/15',
      footer: '*:from-muted/50 *:to-muted/50',
      header: '',
    },
    striped: {
      false: '',
      true: 'even:not-hover:not-aria-selected:*:from-muted/50 even:not-hover:not-aria-selected:*:to-muted/50',
    },
  },
});

// The header sticks as a whole, so header rows keep their order.
const headerStyles = tv({
  variants: {
    isPastTop: { false: '*:*:after:opacity-0', true: '' },
    stickyHeader: {
      false: '',
      true: 'sticky top-0 z-2 *:*:relative *:*:bg-(--table-bg) *:*:after:pointer-events-none *:*:after:absolute *:*:after:inset-x-0 *:*:after:-bottom-2 *:*:after:h-2 *:*:after:bg-linear-to-b *:*:after:from-black/10 *:*:after:transition-opacity dark:*:*:after:from-black/40',
    },
  },
});

export function Table({
  children,
  className,
  containerClassName,
  size = 'md',
  stickyColumn = false,
  stickyHeader = false,
  striped = false,
  ...props
}: TableProps) {
  const context = useMemo(
    () => ({ size, stickyColumn, stickyHeader, striped }),
    [size, stickyColumn, stickyHeader, striped],
  );
  return (
    <TableContainer
      containerClassName={containerClassName}
      name={{
        'aria-label': props['aria-label'],
        'aria-labelledby': props['aria-labelledby'],
        findLabel: findCaption,
      }}
    >
      <table
        className={cn(
          'w-full caption-bottom border-separate border-spacing-0 text-sm',
          className,
        )}
        data-slot="table"
        {...props}
      >
        <TableContext value={context}>
          <SectionContext value="body">{children}</SectionContext>
        </TableContext>
      </table>
    </TableContainer>
  );
}

export function TableBody({ className, ...props }: ComponentProps<'tbody'>) {
  return (
    <SectionContext value="body">
      <tbody
        className={cn('[&>tr:last-child>*]:border-b-0', className)}
        data-slot="table-body"
        {...props}
      />
    </SectionContext>
  );
}

export function TableCaption({
  className,
  id,
  ...props
}: ComponentProps<'caption'>) {
  const generatedId = useId();
  return (
    <caption
      className={cn('mt-4 text-sm text-muted-foreground', className)}
      data-slot="table-caption"
      id={id ?? generatedId}
      {...props}
    />
  );
}

export function TableCell({
  align,
  className,
  isSticky = true,
  ...props
}: TableCellProps) {
  return (
    <td
      className={cn(useCellStyles(align, isSticky, props.colSpan), className)}
      data-slot="table-cell"
      {...props}
    />
  );
}

export function TableFooter({ className, ...props }: ComponentProps<'tfoot'>) {
  return (
    <SectionContext value="footer">
      <tfoot
        className={cn(
          'font-medium *:*:border-t *:last:*:border-b-0',
          className,
        )}
        data-slot="table-footer"
        {...props}
      />
    </SectionContext>
  );
}

export function TableHead({
  align = 'start',
  className,
  isSticky = true,
  scope,
  ...props
}: TableHeadProps) {
  const { size } = use(TableContext);
  const section = use(SectionContext);
  return (
    <th
      className={cn(
        useCellStyles(align, isSticky, props.colSpan),
        'font-medium text-foreground',
        section === 'header' && (size === 'sm' ? 'h-8 py-0' : 'h-10 py-0'),
        className,
      )}
      data-slot="table-head"
      {...props}
      scope={scope ?? (section === 'header' ? 'col' : 'row')}
    />
  );
}

export function TableHeader({ className, ...props }: ComponentProps<'thead'>) {
  const { stickyHeader } = use(TableContext);
  const { isPastTop } = use(ScrollContext);
  return (
    <SectionContext value="header">
      <thead
        className={cn(headerStyles({ isPastTop, stickyHeader }), className)}
        data-slot="table-header"
        {...props}
      />
    </SectionContext>
  );
}

export function TableRow({ className, ...props }: ComponentProps<'tr'>) {
  const { striped } = use(TableContext);
  const section = use(SectionContext);
  return (
    <tr
      className={cn(
        rowStyles({ section, striped: section === 'body' && striped }),
        className,
      )}
      data-slot="table-row"
      {...props}
    />
  );
}

// A caption names the scroll region only while it renders text.
function findCaption(container: HTMLElement) {
  return container.querySelector(':scope > table > caption');
}

function TableContainer({
  children,
  containerClassName,
  name,
}: {
  children: ReactNode;
  containerClassName: string | undefined;
  name: Parameters<typeof useScrollRegion>[1];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { onScroll, regionProps, scrolled } = useScrollRegion(ref, name);
  return (
    <div
      className={cn(
        focusRing,
        'relative w-full overflow-auto [--table-bg:var(--color-background)] focus-visible:-outline-offset-3',
        containerClassName,
      )}
      data-scrolled-x={scrolled.isPastStart || undefined}
      data-scrolled-y={scrolled.isPastTop || undefined}
      data-slot="table-container"
      onScroll={onScroll}
      ref={ref}
      {...regionProps}
    >
      <ScrollContext value={scrolled}>{children}</ScrollContext>
    </div>
  );
}

// A first cell spanning several columns would cover them if it stuck. One
// below a cell spanning rows sits in column two, so it takes isSticky={false}.
function useCellStyles(
  align: Align | undefined,
  isSticky: boolean,
  colSpan: number | undefined,
) {
  const { size, stickyColumn } = use(TableContext);
  const { isPastStart } = use(ScrollContext);
  return cellStyles({
    align,
    isPastStart,
    size,
    stickyColumn: stickyColumn && isSticky && (colSpan ?? 1) <= 1,
  });
}
