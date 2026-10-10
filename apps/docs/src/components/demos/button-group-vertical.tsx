import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { ButtonGroup } from '@oakoss/ui/components/ui/inputs/button-group';

export function ButtonGroupVertical() {
  return (
    <ButtonGroup aria-label="Zoom" orientation="vertical" variant="outline">
      <Button>Zoom in</Button>
      <Button>Reset</Button>
      <Button>Zoom out</Button>
    </ButtonGroup>
  );
}
