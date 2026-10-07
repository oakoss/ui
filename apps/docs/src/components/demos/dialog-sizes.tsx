import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  type DialogSize,
  DialogTitle,
  DialogTrigger,
} from '@oakoss/ui/components/ui/overlays/dialog';

const sizes: DialogSize[] = ['sm', 'md', 'lg', 'full'];

export function DialogSizes() {
  return (
    <div className="not-prose flex flex-wrap gap-3">
      {sizes.map((size) => (
        <DialogTrigger key={size}>
          <Button variant="outline">{size}</Button>
          <Dialog size={size}>
            <DialogHeader>
              <DialogTitle>Size {size}</DialogTitle>
            </DialogHeader>
            <DialogFooter showCloseButton />
          </Dialog>
        </DialogTrigger>
      ))}
    </div>
  );
}
