import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  type SheetSize,
  SheetTitle,
  SheetTrigger,
} from '@oakoss/ui/components/ui/overlays/sheet';

const sizes: SheetSize[] = ['sm', 'md', 'lg'];

export function SheetSizes() {
  return (
    <div className="not-prose flex flex-wrap gap-3">
      {sizes.map((size) => (
        <SheetTrigger key={size}>
          <Button variant="outline">{size}</Button>
          <Sheet size={size}>
            <SheetHeader>
              <SheetTitle>Size {size}</SheetTitle>
              <SheetDescription>
                A side sheet at the {size} width.
              </SheetDescription>
            </SheetHeader>
          </Sheet>
        </SheetTrigger>
      ))}
    </div>
  );
}
