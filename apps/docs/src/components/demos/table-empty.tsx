import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@oakoss/ui/components/ui/data/table';

export function TableEmpty() {
  return (
    <div className="not-prose w-full">
      <Table aria-label="Invoices">
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead align="end">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell
              align="center"
              className="h-24 text-muted-foreground"
              colSpan={3}
            >
              No invoices yet.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
