import {
  HoverCard,
  HoverCardTrigger,
} from '@oakoss/ui/components/ui/overlays/hover-card';
import { Link } from 'react-aria-components';

export function HoverCardArrow() {
  return (
    <div className="not-prose text-sm">
      <HoverCardTrigger>
        <Link className="font-medium underline underline-offset-3" href="#ada">
          @ada
        </Link>
        <HoverCard aria-label="Ada Lovelace" showArrow>
          <p className="font-medium">Ada Lovelace</p>
          <p className="text-muted-foreground">Wrote the first program.</p>
        </HoverCard>
      </HoverCardTrigger>
    </div>
  );
}
