import { Meter } from '@oakoss/ui/components/ui/feedback/meter';

export function MeterIntents() {
  return (
    <div className="not-prose grid w-full max-w-sm gap-4">
      <Meter intent="success" label="Battery" value={92} />
      <Meter intent="warning" label="Memory" value={78} />
      <Meter intent="destructive" label="Disk" value={96} />
      <Meter intent="info" label="Bandwidth" value={35} />
    </div>
  );
}
