import { Progress } from '@oakoss/ui/components/ui/feedback/progress';

export function ProgressIndeterminate() {
  return (
    <Progress
      className="not-prose max-w-sm"
      isIndeterminate
      label="Preparing your export"
    />
  );
}
