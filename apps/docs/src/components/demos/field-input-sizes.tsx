import { FieldLabel, Input } from '@oakoss/ui/components/ui/inputs/field';
import { TextField } from '@oakoss/ui/components/ui/inputs/text-field';

const sizes = ['sm', 'md', 'lg'] as const;

export function FieldInputSizes() {
  return (
    <div className="not-prose flex max-w-sm flex-col gap-4">
      {sizes.map((size) => (
        <TextField key={size}>
          <FieldLabel>Size {size}</FieldLabel>
          <Input size={size} />
        </TextField>
      ))}
    </div>
  );
}
