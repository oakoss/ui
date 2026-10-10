import * as Icon from '@oakoss/ui/components/icons';
import { TextField } from '@oakoss/ui/components/ui/inputs/text-field';

export function TextFieldDecorations() {
  return (
    <div className="not-prose flex max-w-sm flex-col gap-4">
      <TextField end="kg" label="Weight, in kilograms" placeholder="70" />
      <TextField
        aria-label="Search the docs"
        placeholder="Search"
        start={<Icon.Search aria-hidden />}
      />
    </div>
  );
}
