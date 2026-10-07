import { ContextualHelp } from '@oakoss/ui/components/ui/overlays/contextual-help';
import {
  PopoverBody,
  PopoverHeader,
  PopoverTitle,
} from '@oakoss/ui/components/ui/overlays/popover';

export function ContextualHelpDemo() {
  return (
    <div className="not-prose flex items-center gap-1 text-sm font-medium">
      Workspace ID
      <ContextualHelp>
        <PopoverHeader>
          <PopoverTitle>What’s a workspace ID?</PopoverTitle>
        </PopoverHeader>
        <PopoverBody>
          The ID other apps use to find this workspace. It never changes.
        </PopoverBody>
      </ContextualHelp>
    </div>
  );
}
