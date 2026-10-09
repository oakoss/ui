import { Checkbox } from '@oakoss/ui/components/ui/inputs/checkbox';

export function CheckboxDemo() {
  return (
    <div className="not-prose flex flex-col gap-5">
      <Checkbox defaultSelected>Sync folders</Checkbox>
      <Checkbox>Show hidden files</Checkbox>
    </div>
  );
}
