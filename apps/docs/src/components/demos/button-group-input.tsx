import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  ButtonGroup,
  ButtonGroupText,
} from '@oakoss/ui/components/ui/inputs/button-group';
import { Input } from '@oakoss/ui/components/ui/inputs/field';

export function ButtonGroupInput() {
  return (
    <ButtonGroup variant="outline">
      <ButtonGroupText>https://</ButtonGroupText>
      <Input aria-label="Website" placeholder="example.com" />
      <Button>Save</Button>
    </ButtonGroup>
  );
}
