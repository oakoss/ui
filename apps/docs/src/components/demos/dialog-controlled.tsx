import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@oakoss/ui/components/ui/overlays/dialog';
import { useState } from 'react';

export function DialogControlled() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="not-prose flex items-center gap-3">
      <Button onPress={() => setIsOpen(true)} variant="outline">
        Show summary
      </Button>
      <span className="text-sm text-muted-foreground">
        {isOpen ? 'Open' : 'Closed'}
      </span>
      <Dialog isOpen={isOpen} onOpenChange={setIsOpen}>
        <DialogHeader>
          <DialogTitle>Weekly summary</DialogTitle>
        </DialogHeader>
        <p>12 tasks done, 3 in progress.</p>
        <DialogFooter showCloseButton />
      </Dialog>
    </div>
  );
}
