import { Spinner } from '@oakoss/ui/components/ui/feedback/spinner';

export function SpinnerDemo() {
  return (
    <div className="not-prose text-muted-foreground">
      <Spinner label="Loading results" size="lg" />
    </div>
  );
}
