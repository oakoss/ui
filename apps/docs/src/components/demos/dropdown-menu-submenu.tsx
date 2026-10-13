import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@oakoss/ui/components/ui/overlays/dropdown-menu';

export function DropdownMenuSubmenu() {
  return (
    <div className="not-prose">
      <DropdownMenuTrigger>
        <Button variant="outline">Share</Button>
        <DropdownMenu>
          <DropdownMenuItem id="copy">Copy link</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Send to</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem id="email">Email</DropdownMenuItem>
              <DropdownMenuItem id="message">Message</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenu>
      </DropdownMenuTrigger>
    </div>
  );
}
