import {
  Toaster,
  type ToasterPlacement,
} from '@oakoss/ui/components/ui/feedback/toast/toast';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { ToastStore } from '@oakoss/ui/lib/toast/toast-store';
import { useState } from 'react';

const placements: ToasterPlacement[] = [
  'top start',
  'top center',
  'top end',
  'bottom start',
  'bottom center',
  'bottom end',
];

// Its own store and Toaster, so these toasts don't move the site's.
const store = new ToastStore();

export function ToastPlacement() {
  const [placement, setPlacement] = useState<ToasterPlacement>('bottom end');
  return (
    <div className="not-prose flex flex-wrap gap-3">
      {placements.map((value) => (
        <Button
          key={value}
          onPress={() => {
            setPlacement(value);
            store.show(`Shown at ${value}`);
          }}
          variant="outline"
        >
          {value}
        </Button>
      ))}
      <Toaster
        messages={{
          region: (count) =>
            `Placement example, ${String(count)} ${count === 1 ? 'toast' : 'toasts'}`,
        }}
        placement={placement}
        store={store}
      />
    </div>
  );
}
