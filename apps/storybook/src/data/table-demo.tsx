import type { ComponentProps } from 'react';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@oakoss/ui/components/ui/data/table';

export const invoices = [
  { amount: '$250.00', id: 'INV001', method: 'Credit card', status: 'Paid' },
  { amount: '$150.00', id: 'INV002', method: 'PayPal', status: 'Pending' },
  {
    amount: '$350.00',
    id: 'INV003',
    method: 'Bank transfer',
    status: 'Unpaid',
  },
  { amount: '$450.00', id: 'INV004', method: 'Credit card', status: 'Paid' },
];

export type InvoiceTableProps = {
  caption?: string;
  rows?: number;
  selected?: string;
} & ComponentProps<typeof Table>;

// The cell at `column` in the row whose first cell reads `id`.
export function cellOf(id: string, column: number) {
  const row = [...document.querySelectorAll('tr')].find(
    (candidate) => candidate.cells[0]?.textContent === id,
  );
  const cell = row?.cells[column];
  if (!cell) throw new Error(`No cell ${column} in ${id}`);
  return cell;
}

// The first color of a computed linear-gradient, the tint a row paints.
export function gradientColor(image: string) {
  const start = image.indexOf('(') + 1;
  let depth = 0;
  for (let index = start; index < image.length; index += 1) {
    if (image[index] === '(') depth += 1;
    if (image[index] === ')') depth -= 1;
    if (depth === 0 && /[ ,]/u.test(image[index] ?? '')) {
      return image.slice(start, index);
    }
  }
  return '';
}

// Invoices, repeated to rows, with each row headed by its invoice number.
export function InvoiceTable({
  caption = 'Recent invoices',
  rows = invoices.length,
  selected,
  ...props
}: InvoiceTableProps) {
  const list = Array.from({ length: rows }, (_, index) => ({
    ...invoices[index % invoices.length],
    id: `INV${String(index + 1).padStart(3, '0')}`,
  }));
  return (
    <Table {...props}>
      {caption === '' ? null : <TableCaption>{caption}</TableCaption>}
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead align="end">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {list.map((invoice) => (
          <TableRow aria-selected={invoice.id === selected} key={invoice.id}>
            <TableHead>{invoice.id}</TableHead>
            <TableCell>{invoice.status}</TableCell>
            <TableCell>{invoice.method}</TableCell>
            <TableCell align="end">{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableHead colSpan={3}>Total</TableHead>
          <TableCell align="end">$1,200.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}
