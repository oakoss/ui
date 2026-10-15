import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@oakoss/ui/components/ui/data/table';

const notes = [
  { id: 'INV001', note: 'Paid in two installments after the first reminder' },
  { id: 'INV002', note: 'Waiting on the purchase order number from finance' },
];

export function TableTruncate() {
  return (
    <div className="not-prose w-full">
      <Table aria-label="Invoice notes">
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {notes.map((row) => (
            <TableRow key={row.id}>
              <TableHead>{row.id}</TableHead>
              <TableCell>
                <span className="block max-w-48 truncate" title={row.note}>
                  {row.note}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
