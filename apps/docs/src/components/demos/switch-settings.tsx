import { Switch } from '@oakoss/ui/components/ui/inputs/switch';

export function SwitchSettings() {
  return (
    <div className="not-prose flex w-full max-w-sm flex-col gap-5">
      <Switch defaultSelected labelPlacement="start">
        Notifications
      </Switch>
      <Switch
        description="Plays a sound for each new message."
        labelPlacement="start"
      >
        Sounds
      </Switch>
    </div>
  );
}
