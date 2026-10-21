import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@oakoss/ui/components/ui/layout/resizable';

export function ResizableVertical() {
  return (
    <div className="not-prose h-72 w-full max-w-lg">
      <ResizablePanelGroup className="rounded-lg border" orientation="vertical">
        <ResizablePanel className="p-4 text-sm" defaultSize="40%">
          Editor
        </ResizablePanel>
        <ResizableHandle aria-label="Resize editor" withHandle />
        <ResizablePanel className="p-4 text-sm">Terminal</ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
