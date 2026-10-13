import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@oakoss/ui/components/ui/overlays/dropdown-menu';

export function DropdownMenuSelection() {
  return (
    <div className="not-prose">
      <DropdownMenuTrigger>
        <Button variant="outline">View</Button>
        <DropdownMenu>
          <DropdownMenuGroup
            defaultSelectedKeys={['grid']}
            selectionMode="single"
          >
            <DropdownMenuLabel>Layout</DropdownMenuLabel>
            <DropdownMenuItem id="grid">Grid</DropdownMenuItem>
            <DropdownMenuItem id="list">List</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup
            defaultSelectedKeys={['rulers']}
            selectionMode="multiple"
          >
            <DropdownMenuLabel>Show</DropdownMenuLabel>
            <DropdownMenuItem id="rulers">Rulers</DropdownMenuItem>
            <DropdownMenuItem id="guides">Guides</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenu>
      </DropdownMenuTrigger>
    </div>
  );
}
