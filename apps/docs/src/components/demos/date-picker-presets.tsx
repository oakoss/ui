import { getLocalTimeZone, today } from '@internationalized/date';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { DatePicker } from '@oakoss/ui/components/ui/inputs/date-picker';
import { use } from 'react';
import { DatePickerStateContext } from 'react-aria-components';

const presets = [
  { days: 0, label: 'Today' },
  { days: 1, label: 'Tomorrow' },
  { days: 7, label: 'In a week' },
];

export function DatePickerPresets() {
  return (
    <div className="not-prose flex flex-col gap-4">
      <DatePicker
        calendarProps={{ footer: <Presets /> }}
        className="w-60"
        label="Follow up"
      />
    </div>
  );
}

// Reads today when pressed, so a page left open overnight stays right.
function Presets() {
  const state = use(DatePickerStateContext);
  return (
    <div className="flex flex-wrap gap-2">
      {presets.map(({ days, label }) => (
        <Button
          key={label}
          onPress={() => {
            state?.setValue(today(getLocalTimeZone()).add({ days }));
            state?.close();
          }}
          size="sm"
          variant="outline"
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
