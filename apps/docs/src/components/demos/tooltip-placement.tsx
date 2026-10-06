import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Tooltip,
  TooltipTrigger,
} from '@oakoss/ui/components/ui/overlays/tooltip';

const placements = ['top', 'bottom', 'start', 'end'] as const;

export function TooltipPlacement() {
  return (
    <div className="not-prose flex flex-wrap gap-3">
      {placements.map((placement) => (
        <TooltipTrigger key={placement}>
          <Button variant="outline">{placement}</Button>
          <Tooltip placement={placement}>Placed {placement}</Tooltip>
        </TooltipTrigger>
      ))}
    </div>
  );
}
