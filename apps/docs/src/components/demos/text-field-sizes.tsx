import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { TextField } from '@oakoss/ui/components/ui/inputs/text-field';

const sizes = ['sm', 'md', 'lg'] as const;

export function TextFieldSizes() {
  return (
    <div className="not-prose flex max-w-sm flex-col gap-3">
      {sizes.map((size) => (
        <div className="flex items-end gap-2" key={size}>
          <TextField
            aria-label={`Search, ${size}`}
            placeholder={size}
            size={size}
          />
          <Button size={size} variant="outline">
            Go
          </Button>
        </div>
      ))}
    </div>
  );
}
