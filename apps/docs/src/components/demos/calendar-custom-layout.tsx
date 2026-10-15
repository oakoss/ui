import { getLocalTimeZone, today } from '@internationalized/date';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Calendar,
  CalendarGrid,
  CalendarHeader,
  CalendarHeading,
} from '@oakoss/ui/components/ui/inputs/calendar';
import { useState } from 'react';

export function CalendarCustomLayout() {
  const [focused, setFocused] = useState(() => today(getLocalTimeZone()));
  return (
    <div className="not-prose">
      <Calendar
        aria-label="Delivery date"
        focusedValue={focused}
        onFocusChange={setFocused}
      >
        <CalendarHeader>
          <CalendarHeading />
        </CalendarHeader>
        <CalendarGrid />
        <Button
          onPress={() => {
            setFocused(today(getLocalTimeZone()));
          }}
          size="sm"
          variant="outline"
        >
          Today
        </Button>
      </Calendar>
    </div>
  );
}
