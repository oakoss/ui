import { badgeStyles } from '@oakoss/ui/components/ui/data/badge';
import { Link } from 'react-aria-components';

export function BadgeLink() {
  return (
    <div className="not-prose flex flex-wrap gap-2">
      <Link className={badgeStyles({ variant: 'soft' })} href="#release-notes">
        v2.4 release notes
      </Link>
      <Link
        className={badgeStyles({ intent: 'neutral', variant: 'outline' })}
        href="#design"
      >
        Design
      </Link>
    </div>
  );
}
