import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@oakoss/ui/components/ui/data/table';

const deploys = [
  { duration: '1m 12s', id: 'a3f9c1e', status: 'Succeeded' },
  { duration: '2m 40s', id: 'b81d4f0', status: 'Failed' },
  { duration: '1m 05s', id: 'c02e7aa', status: 'Succeeded' },
  { duration: '58s', id: 'd5c9b13', status: 'Succeeded' },
  { duration: '3m 21s', id: 'e7a0f62', status: 'Cancelled' },
];

export function TableStriped() {
  return (
    <div className="not-prose w-full">
      <Table aria-label="Deploys" size="sm" striped>
        <TableHeader>
          <TableRow>
            <TableHead>Commit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead align="end">Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deploys.map((deploy) => (
            <TableRow key={deploy.id}>
              <TableHead className="font-mono">{deploy.id}</TableHead>
              <TableCell>{deploy.status}</TableCell>
              <TableCell align="end">{deploy.duration}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
