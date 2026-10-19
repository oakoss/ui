import type { ReactNode } from 'react';

// Keeps a demo that fixes itself to the viewport, such as a sidebar, inside
// the preview: a transform makes the frame the box fixed children position
// against, and the sidebar fills the frame's height instead of the screen's.
export function DemoFrame({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose relative h-120 transform-gpu overflow-hidden rounded-md border [&_[data-slot=sidebar-container]]:h-full [&_[data-slot=sidebar-wrapper]]:min-h-full">
      {children}
    </div>
  );
}
