import {
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@oakoss/ui/components/ui/inputs/field';
import { TextareaField } from '@oakoss/ui/components/ui/inputs/text-field';
import { Textarea } from '@oakoss/ui/components/ui/inputs/textarea';

export function TextareaCustomLayout() {
  return (
    <div className="not-prose flex max-w-sm flex-col gap-4">
      <TextareaField isRequired>
        <FieldLabel>Feedback</FieldLabel>
        <FieldDescription>What should we improve?</FieldDescription>
        <Textarea minRows={2} size="sm" />
        <FieldError />
      </TextareaField>
    </div>
  );
}
