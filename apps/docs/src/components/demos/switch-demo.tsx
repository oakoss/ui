import { Switch } from '@oakoss/ui/components/ui/inputs/switch';

export function SwitchDemo() {
  return (
    <div className="not-prose flex flex-col gap-5">
      <Switch defaultSelected>Wi-Fi</Switch>
      <Switch description="Turns off wireless connections.">
        Airplane mode
      </Switch>
    </div>
  );
}
