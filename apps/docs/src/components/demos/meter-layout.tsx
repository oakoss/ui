import {
  Meter,
  MeterLabel,
  MeterTrack,
  MeterValue,
} from '@oakoss/ui/components/ui/feedback/meter';

export function MeterLayout() {
  return (
    <Meter className="not-prose max-w-sm" value={42}>
      <MeterTrack className="h-2" />
      <MeterLabel className="text-muted-foreground">CPU</MeterLabel>
      <MeterValue>{(valueText) => `${valueText} in use`}</MeterValue>
    </Meter>
  );
}
