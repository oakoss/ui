import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@oakoss/ui/components/ui/surfaces/card';
import { Link } from 'react-aria-components';

export function CardClickable() {
  return (
    <Card className="not-prose relative w-full max-w-sm has-[a[data-focus-visible]]:outline-(length:--ring-width) has-[a[data-focus-visible]]:outline-offset-2 has-[a[data-focus-visible]]:outline-ring has-[a[data-focus-visible]]:outline-solid">
      <CardHeader>
        <CardTitle>
          <Link
            className="outline-hidden after:absolute after:inset-0"
            href="#release-notes"
          >
            Release notes
          </Link>
        </CardTitle>
        <CardDescription>What changed in version 2.4.</CardDescription>
        <CardAction>
          <Button className="relative" size="sm" variant="outline">
            Subscribe
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        Faster search, keyboard shortcuts for every action, and two new themes.
      </CardContent>
    </Card>
  );
}
