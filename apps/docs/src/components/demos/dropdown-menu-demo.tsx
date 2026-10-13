import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@oakoss/ui/components/ui/overlays/dropdown-menu';

export function DropdownMenuDemo() {
  return (
    <div className="not-prose">
      <DropdownMenuTrigger>
        <Button variant="outline">Account</Button>
        <DropdownMenu>
          <DropdownMenuGroup>
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuItem id="profile" shortcut="⇧⌘P">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem id="billing" shortcut="⌘B">
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem id="settings" shortcut="⌘,">
              Settings
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem id="sign-out" intent="destructive">
            Sign out
          </DropdownMenuItem>
        </DropdownMenu>
      </DropdownMenuTrigger>
    </div>
  );
}
