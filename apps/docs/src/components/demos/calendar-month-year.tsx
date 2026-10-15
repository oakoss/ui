import { getLocalTimeZone, today } from '@internationalized/date';
import { Calendar } from '@oakoss/ui/components/ui/inputs/calendar';
import { CalendarMonthYearSelect } from '@oakoss/ui/components/ui/inputs/calendar-month-year-select';

export function CalendarMonthYear() {
  return (
    <div className="not-prose">
      <Calendar
        aria-label="Renewal date"
        heading={<CalendarMonthYearSelect visibleYears={10} />}
        minValue={today(getLocalTimeZone())}
      />
    </div>
  );
}
