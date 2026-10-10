import { TextareaField } from '@oakoss/ui/components/ui/inputs/text-field';

export function TextareaFixed() {
  return (
    <div className="not-prose flex max-w-sm flex-col gap-4">
      <TextareaField autoGrow={false} label="Notes" minRows={4} />
    </div>
  );
}
