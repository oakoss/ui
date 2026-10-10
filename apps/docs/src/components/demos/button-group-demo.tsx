import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from '@oakoss/ui/components/ui/inputs/button-group';

export function ButtonGroupDemo() {
  return (
    <ButtonGroup aria-label="Message actions" variant="outline">
      <Button>Archive</Button>
      <Button>Report</Button>
      <ButtonGroupSeparator />
      <Button>Snooze</Button>
    </ButtonGroup>
  );
}
