import { Progress } from '@oakoss/ui/components/ui/feedback/progress';

export function ProgressIntents() {
  return (
    <div className="not-prose grid w-full max-w-sm gap-4">
      <Progress intent="success" label="Backup" value={100} />
      <Progress intent="warning" label="Storage" value={86} />
      <Progress intent="destructive" label="Monthly quota" value={97} />
      <Progress intent="info" label="Syncing contacts" value={45} />
    </div>
  );
}
