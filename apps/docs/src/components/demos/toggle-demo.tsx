import { Toggle } from '@oakoss/ui/components/ui/inputs/toggle';

export function ToggleDemo() {
  return (
    <div className="not-prose flex gap-3">
      <Toggle>Bold</Toggle>
      <Toggle defaultSelected variant="outline">
        Italic
      </Toggle>
    </div>
  );
}
