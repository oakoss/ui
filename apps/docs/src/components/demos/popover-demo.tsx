import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { TextField } from '@oakoss/ui/components/ui/inputs/text-field';
import {
  Popover,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@oakoss/ui/components/ui/overlays/popover';

export function PopoverDemo() {
  return (
    <div className="not-prose">
      <PopoverTrigger>
        <Button variant="outline">Dimensions</Button>
        <Popover>
          <PopoverHeader>
            <PopoverTitle>Dimensions</PopoverTitle>
            <PopoverDescription>Set the layer’s size.</PopoverDescription>
          </PopoverHeader>
          <div className="grid grid-cols-2 gap-3">
            <TextField defaultValue="100%" label="Width" />
            <TextField defaultValue="25px" label="Height" />
          </div>
        </Popover>
      </PopoverTrigger>
    </div>
  );
}
