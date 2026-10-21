import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@oakoss/ui/components/ui/layout/resizable';
import { useState } from 'react';
import { usePanelRef } from 'react-resizable-panels';

export function ResizableCollapsible() {
  const panelRef = usePanelRef();
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <div className="not-prose flex w-full max-w-lg flex-col gap-3">
      <Button
        className="self-start"
        onPress={() => {
          if (isCollapsed) panelRef.current?.expand();
          else panelRef.current?.collapse();
        }}
        size="sm"
        variant="outline"
      >
        {isCollapsed ? 'Show sidebar' : 'Hide sidebar'}
      </Button>
      <div className="h-56">
        <ResizablePanelGroup className="rounded-lg border">
          <ResizablePanel
            className="p-4 text-sm"
            collapsible
            defaultSize="30%"
            minSize="20%"
            onResize={(size) => {
              setIsCollapsed(size.asPercentage === 0);
            }}
            panelRef={panelRef}
          >
            Sidebar
          </ResizablePanel>
          <ResizableHandle aria-label="Resize sidebar" />
          <ResizablePanel className="p-4 text-sm">Content</ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
