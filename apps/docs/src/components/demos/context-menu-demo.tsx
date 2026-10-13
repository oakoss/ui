import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@oakoss/ui/components/ui/overlays/context-menu';
import { Pressable } from 'react-aria-components';

export function ContextMenuDemo() {
  return (
    <div className="not-prose w-full max-w-sm">
      <ContextMenuTrigger>
        <Pressable>
          <div
            aria-label="report.pdf"
            className="grid h-32 place-items-center rounded-panel border border-dashed border-input text-sm text-muted-foreground outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring"
            role="button"
            tabIndex={0}
          >
            Right-click or long press here
          </div>
        </Pressable>
        <ContextMenu>
          <ContextMenuItem id="open">Open</ContextMenuItem>
          <ContextMenuItem id="rename">Rename</ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem id="delete" intent="destructive">
            Delete
          </ContextMenuItem>
        </ContextMenu>
      </ContextMenuTrigger>
    </div>
  );
}
