import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@oakoss/ui/components/ui/data/table';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { useEffect, useState, useSyncExternalStore } from 'react';

const statuses = ['Paid', 'Pending', 'Unpaid'];
const invoices = Array.from({ length: 20 }, (_, index) => ({
  amount: `$${String((index + 1) * 50)}.00`,
  id: `INV${String(index + 1).padStart(3, '0')}`,
  status: statuses[index % statuses.length],
}));

export function TableLinked() {
  const [linked, link] = useLinkedInvoice();
  return (
    <div className="not-prose flex w-full flex-col gap-4">
      <div className="flex gap-2">
        {['INV004', 'INV014', 'INV019'].map((id) => (
          <Button key={id} onPress={() => link(id)} variant="outline">
            {`Link ${id}`}
          </Button>
        ))}
      </div>
      <Table aria-label="Invoices" containerClassName="max-h-56" stickyHeader>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead align="end">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => {
            const isLinked = invoice.id === linked;
            return (
              <TableRow
                aria-current={isLinked ? 'true' : undefined}
                key={invoice.id}
              >
                <TableHead id={invoice.id} tabIndex={isLinked ? -1 : undefined}>
                  {invoice.id}
                </TableHead>
                <TableCell>{invoice.status}</TableCell>
                <TableCell align="end">{invoice.amount}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function linkedFromUrl() {
  return new URLSearchParams(location.search).get('invoice');
}

// The demo changes the URL only through link(), which sets state itself.
function subscribeToNothing() {
  return () => {
    // Nothing to unsubscribe.
  };
}

// The URL is read only once the page is in the browser.
function useLinkedInvoice() {
  const fromUrl = useSyncExternalStore(
    subscribeToNothing,
    linkedFromUrl,
    () => null,
  );
  const [chosen, setChosen] = useState<null | string>(null);
  const linked = chosen ?? fromUrl;
  useEffect(() => {
    if (linked === null || linked === '') return;
    const head = document.querySelector<HTMLElement>(`#${CSS.escape(linked)}`);
    head?.scrollIntoView({ block: 'center' });
    head?.focus({ preventScroll: true });
  }, [linked]);
  const link = (id: string) => {
    const url = new URL(location.href);
    url.searchParams.set('invoice', id);
    history.replaceState(history.state, '', url);
    setChosen(id);
  };
  return [linked, link] as const;
}
