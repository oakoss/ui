import { TextareaField } from '@oakoss/ui/components/ui/inputs/text-field';

export function TextareaRows() {
  return (
    <div className="not-prose flex max-w-sm flex-col gap-4">
      <TextareaField
        description="Starts at two rows and scrolls past five."
        label="Message"
        maxRows={5}
        minRows={2}
      />
    </div>
  );
}
