import {
  Tooltip,
  TooltipTrigger,
} from '@oakoss/ui/components/ui/overlays/tooltip';
import { Focusable } from 'react-aria-components';

export function TooltipFocusable() {
  return (
    <div className="not-prose">
      <TooltipTrigger>
        <Focusable>
          <a className="text-sm underline underline-offset-3" href="#shortcuts">
            Shortcuts
          </a>
        </Focusable>
        <Tooltip>Every keyboard shortcut in one list</Tooltip>
      </TooltipTrigger>
    </div>
  );
}
