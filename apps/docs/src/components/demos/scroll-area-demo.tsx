import { ScrollArea } from '@oakoss/ui/components/ui/layout/scroll-area';
import { Separator } from '@oakoss/ui/components/ui/layout/separator';
import { Fragment } from 'react';

const tags = Array.from({ length: 30 }, (_, index) => `v1.${30 - index}.0`);

export function ScrollAreaDemo() {
  return (
    <ScrollArea
      aria-label="Tags"
      className="not-prose h-72 w-48 rounded-md border"
      orientation="vertical"
      role="region"
    >
      <div className="p-4 text-sm">
        <p className="mb-4 font-medium">Tags</p>
        {tags.map((tag) => (
          <Fragment key={tag}>
            <div>{tag}</div>
            <Separator className="my-2" />
          </Fragment>
        ))}
      </div>
    </ScrollArea>
  );
}
