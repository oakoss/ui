import { ContextualHelp } from '@oakoss/ui/components/ui/overlays/contextual-help';
import {
  PopoverBody,
  PopoverHeader,
  PopoverTitle,
} from '@oakoss/ui/components/ui/overlays/popover';

export function ContextualHelpInfo() {
  return (
    <div className="not-prose flex items-center gap-1 text-sm font-medium">
      Storage used
      <ContextualHelp variant="info">
        <PopoverHeader>
          <PopoverTitle>How storage is counted</PopoverTitle>
        </PopoverHeader>
        <PopoverBody>
          Files count once, even when they appear in several folders.
        </PopoverBody>
      </ContextualHelp>
    </div>
  );
}
