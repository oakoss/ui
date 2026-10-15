import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@oakoss/ui/components/ui/data/table';

const regions = ['North', 'South', 'East', 'West', 'Central', 'Coastal'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

export function TableSticky() {
  return (
    <div className="not-prose w-full">
      <Table containerClassName="max-h-56" stickyColumn stickyHeader>
        <TableCaption>Monthly sales by region, in units</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Region</TableHead>
            {months.map((month) => (
              <TableHead align="end" key={month}>
                {month}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {regions.map((region, row) => (
            <TableRow key={region}>
              <TableHead>{region}</TableHead>
              {months.map((month, column) => (
                <TableCell align="end" key={month}>
                  {((row + 3) * (column + 7) * 37) % 900}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
