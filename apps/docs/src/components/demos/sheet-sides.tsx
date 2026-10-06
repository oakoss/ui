import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Sheet,
  SheetDescription,
  SheetHeader,
  type SheetSide,
  SheetTitle,
  SheetTrigger,
} from '@oakoss/ui/components/ui/overlays/sheet';

const sides: SheetSide[] = ['start', 'end', 'top', 'bottom'];

export function SheetSides() {
  return (
    <div className="not-prose flex flex-wrap gap-3">
      {sides.map((side) => (
        <SheetTrigger key={side}>
          <Button variant="outline">{side}</Button>
          <Sheet side={side}>
            <SheetHeader>
              <SheetTitle>Side {side}</SheetTitle>
              <SheetDescription>
                Slides in from the {side} edge.
              </SheetDescription>
            </SheetHeader>
          </Sheet>
        </SheetTrigger>
      ))}
    </div>
  );
}
