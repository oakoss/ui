import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@oakoss/ui/components/ui/layout/resizable';

export function ResizableDemo() {
  return (
    <div className="not-prose h-56 w-full max-w-lg">
      <ResizablePanelGroup className="rounded-lg border">
        <ResizablePanel className="p-4 text-sm" defaultSize="30%" minSize="20%">
          Sidebar
        </ResizablePanel>
        <ResizableHandle aria-label="Resize sidebar" />
        <ResizablePanel className="p-4 text-sm">Content</ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
