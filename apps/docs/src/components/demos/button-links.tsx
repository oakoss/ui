import { buttonStyles } from '@oakoss/ui/components/ui/inputs/button';
import { createLink } from '@tanstack/react-router';
import { Link as AriaLink } from 'react-aria-components';

const Link = createLink(AriaLink);

export function ButtonLinks() {
  return (
    <div className="not-prose flex flex-wrap items-center gap-3">
      <Link
        className={buttonStyles({ variant: 'outline' })}
        params={{ _splat: 'installation' }}
        to="/docs/$"
      >
        Installation
      </Link>
      <Link
        className={buttonStyles({ intent: 'neutral', variant: 'link' })}
        params={{ _splat: 'guides/localization' }}
        to="/docs/$"
      >
        Localization
      </Link>
    </div>
  );
}
