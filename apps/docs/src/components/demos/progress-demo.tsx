import { Progress } from '@oakoss/ui/components/ui/feedback/progress';

export function ProgressDemo() {
  return (
    <Progress
      className="not-prose max-w-sm"
      label="Uploading photos"
      value={62}
    />
  );
}
