import { toast } from '@oakoss/ui/components/ui/feedback/toast/toast';
import { Button } from '@oakoss/ui/components/ui/inputs/button';

const intents = [
  ['Neutral', () => toast('Draft kept')],
  ['Info', () => toast.info('A new version is available')],
  ['Success', () => toast.success('Invite sent')],
  ['Warning', () => toast.warning('Storage is almost full')],
  [
    'Destructive',
    () =>
      toast.destructive('Upload failed', {
        description: 'Check your connection and try again.',
      }),
  ],
] as const;

export function ToastIntents() {
  return (
    <div className="not-prose flex flex-wrap gap-3">
      {intents.map(([label, show]) => (
        <Button
          key={label}
          onPress={() => {
            show();
          }}
          variant="outline"
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
