import { Toaster } from '@oakoss/ui/components/ui/feedback/toast/toast';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { Switch } from '@oakoss/ui/components/ui/inputs/switch';
import { ToastStore } from '@oakoss/ui/lib/toast/toast-store';
import { useRef, useState } from 'react';

// Its own store and Toaster, so `isExpanded` doesn't open the site's stack;
// above phone width, its corner keeps it off the site's stack too.
const store = new ToastStore();

export function ToastStack() {
  const [isExpanded, setIsExpanded] = useState(false);
  const countRef = useRef(0);
  return (
    <div className="not-prose flex flex-wrap items-center gap-5">
      <Button
        onPress={() => {
          countRef.current += 1;
          store.show(`Message ${String(countRef.current)} received`);
        }}
        variant="outline"
      >
        Add a toast
      </Button>
      <Switch isSelected={isExpanded} onChange={setIsExpanded}>
        Keep the stack open
      </Switch>
      <Toaster
        isExpanded={isExpanded}
        messages={{
          region: (n) =>
            `Stack example, ${String(n)} ${n === 1 ? 'toast' : 'toasts'}`,
        }}
        placement="bottom start"
        store={store}
      />
    </div>
  );
}
