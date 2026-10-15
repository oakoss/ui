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

const invoices = [
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

export function TableDemo() {
  return (
    <div className="not-prose w-full">
      <Table>
        <TableCaption>Recent invoices</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead align="end">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
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
    </div>
  );
}
