import type { ReactNode } from 'react';

import * as Icon from '@oakoss/ui/components/icons';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@oakoss/ui/components/ui/overlays/context-menu';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@oakoss/ui/components/ui/overlays/dropdown-menu';
import { Pressable } from 'react-aria-components';

export function ContextMenuVisible() {
  return (
    <div className="not-prose flex w-full max-w-sm items-center gap-2 rounded-panel border border-border p-2">
      <ContextMenuTrigger>
        <Pressable>
          <div
            className="flex-1 rounded-control px-2 py-1.5 text-sm outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
            role="button"
            tabIndex={0}
          >
            report.pdf
          </div>
        </Pressable>
        <ContextMenu>{actions(ContextMenuItem)}</ContextMenu>
      </ContextMenuTrigger>
      <DropdownMenuTrigger>
        <Button aria-label="More actions" size="icon-sm" variant="ghost">
          <Icon.Ellipsis />
        </Button>
        <DropdownMenu placement="bottom end">
          {actions(DropdownMenuItem)}
        </DropdownMenu>
      </DropdownMenuTrigger>
    </div>
  );
}

function actions(Item: typeof ContextMenuItem | typeof DropdownMenuItem) {
  return [
    <Item id="open" key="open">
      Open
    </Item>,
    <Item id="delete" intent="destructive" key="delete">
      Delete
    </Item>,
  ] satisfies ReactNode[];
}
