import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Popover,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@oakoss/ui/components/ui/overlays/popover';

const placements = ['top', 'bottom', 'start', 'end'] as const;

export function PopoverArrow() {
  return (
    <div className="not-prose flex flex-wrap gap-3">
      {placements.map((placement) => (
        <PopoverTrigger key={placement}>
          <Button variant="outline">{placement}</Button>
          <Popover placement={placement} showArrow>
            <PopoverHeader>
              <PopoverTitle>Placed {placement}</PopoverTitle>
              <PopoverDescription>
                The arrow points at the trigger.
              </PopoverDescription>
            </PopoverHeader>
          </Popover>
        </PopoverTrigger>
      ))}
    </div>
  );
}
