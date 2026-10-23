import { toast } from '@oakoss/ui/components/ui/feedback/toast/toast';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { useState } from 'react';

export function ToastAction() {
  const [archived, setArchived] = useState(0);

  function archive() {
    setArchived((count) => count + 1);
    toast('Thread archived', {
      action: {
        label: 'Undo',
        onPress: async () => {
          await new Promise((resolve) => {
            setTimeout(resolve, 1000);
          });
          setArchived((count) => count - 1);
        },
      },
    });
  }

  return (
    <div className="not-prose flex items-center gap-3">
      <Button onPress={archive} variant="outline">
        Archive thread
      </Button>
      <span className="text-sm text-muted-foreground">{archived} archived</span>
    </div>
  );
}
