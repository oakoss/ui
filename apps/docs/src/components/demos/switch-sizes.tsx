import { Switch } from '@oakoss/ui/components/ui/inputs/switch';

export function SwitchSizes() {
  return (
    <div className="not-prose flex flex-col gap-5">
      <Switch defaultSelected size="sm">
        Small
      </Switch>
      <Switch defaultSelected>Medium</Switch>
    </div>
  );
}
