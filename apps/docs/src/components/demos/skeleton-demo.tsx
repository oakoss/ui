import { Skeleton } from '@oakoss/ui/components/ui/feedback/skeleton';

export function SkeletonDemo() {
  return (
    <div className="not-prose flex items-center gap-4 rounded-panel bg-background p-6">
      <Skeleton className="size-12 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>
    </div>
  );
}
