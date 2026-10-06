import {
  HoverCard,
  HoverCardTrigger,
} from '@oakoss/ui/components/ui/overlays/hover-card';
import { Link } from 'react-aria-components';

export function HoverCardDemo() {
  return (
    <div className="not-prose text-sm">
      Built on{' '}
      <HoverCardTrigger>
        <Link
          className="font-medium underline underline-offset-3"
          href="https://react-aria.adobe.com"
        >
          React Aria
        </Link>
        <HoverCard aria-label="React Aria">
          <p className="font-medium">React Aria</p>
          <p className="text-muted-foreground">
            Accessible, unstyled components and hooks from Adobe.
          </p>
        </HoverCard>
      </HoverCardTrigger>
      .
    </div>
  );
}
