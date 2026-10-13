import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@oakoss/ui/components/ui/overlays/dropdown-menu';

export function DropdownMenuDescriptions() {
  return (
    <div className="not-prose">
      <DropdownMenuTrigger>
        <Button variant="outline">New</Button>
        <DropdownMenu>
          <DropdownMenuItem description="Visible to you" id="draft">
            Draft
          </DropdownMenuItem>
          <DropdownMenuItem description="Visible to your team" id="shared">
            Shared document
          </DropdownMenuItem>
          <DropdownMenuItem href="/docs/components" id="templates">
            Browse templates
          </DropdownMenuItem>
        </DropdownMenu>
      </DropdownMenuTrigger>
    </div>
  );
}
