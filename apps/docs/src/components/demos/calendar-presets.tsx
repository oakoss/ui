import {
  endOfMonth,
  getLocalTimeZone,
  startOfMonth,
  today,
} from '@internationalized/date';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { RangeCalendar } from '@oakoss/ui/components/ui/inputs/calendar';
import { useState } from 'react';
import { type DateRange } from 'react-aria-components';

// Saving a preset's id rather than its dates keeps "Last 7 days" relative.
const presets = [
  {
    getValue: () => {
      const now = today(getLocalTimeZone());
      return { end: now, start: now.subtract({ days: 6 }) };
    },
    id: 'last-7-days',
    label: 'Last 7 days',
  },
  {
    getValue: () => {
      const now = today(getLocalTimeZone());
      return { end: endOfMonth(now), start: startOfMonth(now) };
    },
    id: 'this-month',
    label: 'This month',
  },
];

export function CalendarPresets() {
  const [range, setRange] = useState<DateRange | null>(null);
  const [focused, setFocused] = useState(() => today(getLocalTimeZone()));
  return (
    <div className="not-prose">
      <RangeCalendar
        aria-label="Report period"
        focusedValue={focused}
        footer={
          <div className="flex gap-2">
            {presets.map((preset) => (
              <Button
                key={preset.id}
                onPress={() => {
                  const value = preset.getValue();
                  setRange(value);
                  setFocused(value.end);
                }}
                size="sm"
                variant="outline"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        }
        onChange={setRange}
        onFocusChange={setFocused}
        value={range}
      />
    </div>
  );
}
