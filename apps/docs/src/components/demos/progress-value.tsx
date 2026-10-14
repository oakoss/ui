import { Progress } from '@oakoss/ui/components/ui/feedback/progress';

export function ProgressValueDemo() {
  return (
    <div className="not-prose grid w-full max-w-sm gap-4">
      <Progress
        formatOptions={{ style: 'unit', unit: 'megabyte' }}
        label="Downloading update"
        maxValue={240}
        value={96}
      />
      <Progress label="Setting up" value={60} valueLabel="Step 3 of 5" />
    </div>
  );
}
