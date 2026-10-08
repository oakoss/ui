import { Skeleton } from '@oakoss/ui/components/ui/feedback/skeleton';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { useState } from 'react';

export function SkeletonLoading() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="not-prose flex w-full max-w-sm flex-col gap-4 rounded-panel bg-background p-6">
      <section
        aria-busy={isLoading}
        aria-label="Profile"
        className="flex items-center gap-4"
      >
        {isLoading ? (
          <>
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </>
        ) : (
          <>
            <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
              AL
            </div>
            <div className="text-sm">
              <p className="font-medium">Ada Lovelace</p>
              <p className="text-muted-foreground">Analyst</p>
            </div>
          </>
        )}
      </section>
      <Button
        className="self-start"
        onPress={() => setIsLoading((value) => !value)}
        size="sm"
        variant="outline"
      >
        {isLoading ? 'Finish loading' : 'Load again'}
      </Button>
    </div>
  );
}
