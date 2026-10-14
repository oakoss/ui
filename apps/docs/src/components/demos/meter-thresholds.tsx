import { Meter } from '@oakoss/ui/components/ui/feedback/meter';

const limit = 20;

export function MeterThresholds() {
  return (
    <div className="not-prose grid w-full max-w-sm gap-4">
      {[8, 16, 19].map((used) => {
        const { intent, note } = quota(used);
        return (
          <Meter
            intent={intent}
            key={used}
            label="Mailbox"
            maxValue={limit}
            value={used}
            valueLabel={`${used} of ${limit} GB, ${note}`}
          />
        );
      })}
    </div>
  );
}

function quota(used: number) {
  const share = used / limit;
  if (share >= 0.9) {
    return { intent: 'destructive', note: 'almost full' } as const;
  }
  if (share >= 0.75) return { intent: 'warning', note: 'running low' } as const;
  return { intent: 'success', note: 'plenty left' } as const;
}
