import type { DateValue } from 'react-aria-components';

import { RangeCalendar } from '@oakoss/ui/components/ui/inputs/calendar';

export function CalendarMaxRange() {
  return (
    <div className="not-prose">
      <RangeCalendar
        aria-label="Leave dates"
        isDateUnavailable={isBeyondLimit}
      />
    </div>
  );
}

// While the user picks the end, React Aria passes the start as the anchor.
function isBeyondLimit(date: DateValue, anchor: DateValue | null) {
  return (
    anchor !== null &&
    (date.compare(anchor.add({ days: 6 })) > 0 ||
      date.compare(anchor.subtract({ days: 6 })) < 0)
  );
}
