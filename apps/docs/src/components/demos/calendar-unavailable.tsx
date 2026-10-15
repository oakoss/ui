import { isWeekend } from '@internationalized/date';
import { Calendar } from '@oakoss/ui/components/ui/inputs/calendar';
import { type DateValue, useLocale } from 'react-aria-components';

const holidays = new Set(['1-1', '12-25', '7-4']);

export function CalendarUnavailable() {
  const { locale } = useLocale();
  const isUnavailable = (date: DateValue) =>
    isWeekend(date, locale) || holidays.has(`${date.month}-${date.day}`);
  return (
    <div className="not-prose flex flex-col gap-2">
      <p className="text-sm text-muted-foreground" id="booking-rule">
        Weekends and public holidays are unavailable.
      </p>
      <Calendar
        aria-describedby="booking-rule"
        aria-label="Appointment date"
        isDateUnavailable={isUnavailable}
      />
    </div>
  );
}
