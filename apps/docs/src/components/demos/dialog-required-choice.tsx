import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@oakoss/ui/components/ui/overlays/dialog';

export function DialogRequiredChoice() {
  return (
    <div className="not-prose">
      <DialogTrigger>
        <Button variant="outline">Review terms</Button>
        <Dialog isDismissable={false} showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Updated terms</DialogTitle>
            <DialogDescription>
              Accept the new terms to keep using the app.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Decline</DialogClose>
            <DialogClose intent="primary" variant="solid">
              Accept
            </DialogClose>
          </DialogFooter>
        </Dialog>
      </DialogTrigger>
    </div>
  );
}
