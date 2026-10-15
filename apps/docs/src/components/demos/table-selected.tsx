import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@oakoss/ui/components/ui/data/table';

const members = [
  { email: 'ada@example.com', name: 'Ada Lovelace', role: 'Owner' },
  { email: 'grace@example.com', name: 'Grace Hopper', role: 'Admin' },
  { email: 'alan@example.com', name: 'Alan Turing', role: 'Member' },
];

export function TableSelected() {
  return (
    <div className="not-prose w-full">
      <Table aria-label="Team members" interactive>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow
              aria-selected={member.role === 'Admin'}
              key={member.email}
            >
              <TableHead>{member.name}</TableHead>
              <TableCell>{member.email}</TableCell>
              <TableCell>{member.role}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
