import { Badge } from '@oakoss/ui/components/ui/data/badge';

export function BadgeDemo() {
  return (
    <div className="not-prose flex flex-wrap items-center gap-2">
      <Badge>New</Badge>
      <Badge intent="neutral" variant="soft">
        Draft
      </Badge>
      <Badge intent="success" variant="soft">
        Paid
      </Badge>
      <Badge intent="destructive" variant="outline">
        Overdue
      </Badge>
    </div>
  );
}
