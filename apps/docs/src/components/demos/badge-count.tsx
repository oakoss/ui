import { Badge } from '@oakoss/ui/components/ui/data/badge';

export function BadgeCount() {
  return (
    <div className="not-prose flex items-center gap-2 text-sm">
      Inbox
      <UnreadBadge count={128} />
    </div>
  );
}

// The badge shows a capped number to sighted users and reads the whole count,
// with what it counts, to screen readers.
function UnreadBadge({ count, max = 99 }: { count: number; max?: number }) {
  const format = new Intl.NumberFormat();
  return (
    <Badge intent="destructive">
      <span aria-hidden="true">
        {count > max ? `${format.format(max)}+` : format.format(count)}
      </span>
      <span className="sr-only">{format.format(count)} unread</span>
    </Badge>
  );
}
