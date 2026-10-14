import {
  Progress,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from '@oakoss/ui/components/ui/feedback/progress';

export function ProgressLayout() {
  return (
    <Progress className="not-prose max-w-sm" maxValue={12} value={7}>
      <ProgressTrack />
      <ProgressLabel className="text-muted-foreground">
        Lessons complete
      </ProgressLabel>
      <ProgressValue>{(valueText) => `${valueText} done`}</ProgressValue>
    </Progress>
  );
}
