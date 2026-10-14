import {
  CheckboxGroup,
  CheckboxGroupItem,
} from '@oakoss/ui/components/ui/inputs/checkbox-group';

export function CheckboxGroupDemo() {
  return (
    <div className="not-prose flex flex-col gap-4">
      <CheckboxGroup
        defaultValue={['email']}
        description="Select all that apply."
        label="Notify me by"
      >
        <CheckboxGroupItem value="email">Email</CheckboxGroupItem>
        <CheckboxGroupItem description="Standard rates apply." value="sms">
          Text message
        </CheckboxGroupItem>
        <CheckboxGroupItem value="push">Push notification</CheckboxGroupItem>
      </CheckboxGroup>
    </div>
  );
}
