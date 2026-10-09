import { Toggle } from '@oakoss/ui/components/ui/inputs/toggle';

export function ToggleSizes() {
  return (
    <div className="not-prose flex items-center gap-3">
      <Toggle size="sm" variant="outline">
        Small
      </Toggle>
      <Toggle variant="outline">Medium</Toggle>
      <Toggle size="lg" variant="outline">
        Large
      </Toggle>
    </div>
  );
}
