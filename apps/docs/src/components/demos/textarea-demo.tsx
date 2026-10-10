import { TextareaField } from '@oakoss/ui/components/ui/inputs/text-field';

export function TextareaDemo() {
  return (
    <div className="not-prose flex max-w-sm flex-col gap-4">
      <TextareaField
        description="Shown on your profile."
        label="Bio"
        placeholder="A few words about you"
      />
    </div>
  );
}
