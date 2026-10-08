import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@oakoss/ui/components/ui/feedback/empty';

export function EmptyOutline() {
  return (
    <Empty className="not-prose border">
      <EmptyHeader>
        <EmptyTitle>No files</EmptyTitle>
        <EmptyDescription>
          Drop files here, or <a href="#upload">upload them</a>.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
