import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { TextField } from '@oakoss/ui/components/ui/inputs/text-field';
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@oakoss/ui/components/ui/overlays/dialog';

export function DialogDemo() {
  return (
    <div className="not-prose">
      <DialogTrigger>
        <Button variant="outline">Edit profile</Button>
        <Dialog>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Changes save when you press Save.
            </DialogDescription>
          </DialogHeader>
          <TextField defaultValue="Ada Lovelace" label="Name" />
          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <DialogClose intent="primary" variant="solid">
              Save
            </DialogClose>
          </DialogFooter>
        </Dialog>
      </DialogTrigger>
    </div>
  );
}
