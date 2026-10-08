import * as Icon from '@oakoss/ui/components/icons';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@oakoss/ui/components/ui/feedback/empty';
import { Button } from '@oakoss/ui/components/ui/inputs/button';

export function EmptyDemo() {
  return (
    <Empty className="not-prose">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Icon.Search />
        </EmptyMedia>
        <EmptyTitle>No projects yet</EmptyTitle>
        <EmptyDescription>
          Create a project to start tracking your work.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button>New project</Button>
      </EmptyContent>
    </Empty>
  );
}
