import type { ReactNode } from 'react';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  DropdownMenu,
  DropdownMenuItem,
  type DropdownMenuProps,
  DropdownMenuTrigger,
} from '@oakoss/ui/components/ui/overlays/dropdown-menu';

export type DropdownMenuDemoProps = {
  children?: ReactNode;
  defaultOpen?: boolean;
  triggerLabel?: string;
} & Omit<DropdownMenuProps, 'children' | 'items'>;

const actions = (
  <>
    <DropdownMenuItem id="edit">Edit</DropdownMenuItem>
    <DropdownMenuItem id="duplicate">Duplicate</DropdownMenuItem>
    <DropdownMenuItem id="archive">Archive</DropdownMenuItem>
  </>
);

export function DropdownMenuDemo({
  children = actions,
  defaultOpen = false,
  triggerLabel = 'Options',
  ...props
}: DropdownMenuDemoProps) {
  return (
    <div className="grid min-h-96 place-items-center">
      <DropdownMenuTrigger defaultOpen={defaultOpen}>
        <Button variant="outline">{triggerLabel}</Button>
        <DropdownMenu aria-label={triggerLabel} {...props}>
          {children}
        </DropdownMenu>
      </DropdownMenuTrigger>
    </div>
  );
}
