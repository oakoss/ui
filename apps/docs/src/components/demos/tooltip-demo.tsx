import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Tooltip,
  TooltipTrigger,
} from '@oakoss/ui/components/ui/overlays/tooltip';

export function TooltipDemo() {
  return (
    <div className="not-prose">
      <TooltipTrigger>
        <Button variant="outline">Save</Button>
        <Tooltip>Save your changes</Tooltip>
      </TooltipTrigger>
    </div>
  );
}
