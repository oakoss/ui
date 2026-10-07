import { FieldLabel, Input } from '@oakoss/ui/components/ui/inputs/field';
import { TextField } from '@oakoss/ui/components/ui/inputs/text-field';
import { ContextualHelp } from '@oakoss/ui/components/ui/overlays/contextual-help';
import {
  PopoverBody,
  PopoverHeader,
  PopoverTitle,
} from '@oakoss/ui/components/ui/overlays/popover';

export function ContextualHelpField() {
  return (
    <div className="not-prose w-64">
      <TextField defaultValue="ws_8f2k">
        <div className="flex items-center gap-1">
          <FieldLabel>Workspace ID</FieldLabel>
          <ContextualHelp>
            <PopoverHeader>
              <PopoverTitle>What’s a workspace ID?</PopoverTitle>
            </PopoverHeader>
            <PopoverBody>
              The ID other apps use to find this workspace. It never changes.
            </PopoverBody>
          </ContextualHelp>
        </div>
        <Input />
      </TextField>
    </div>
  );
}
