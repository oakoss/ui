import { type CalendarDate, isWeekend } from '@internationalized/date';
import { Calendar } from '@oakoss/ui/components/ui/inputs/calendar';
import { useState } from 'react';
import { useLocale } from 'react-aria-components';

export function CalendarValidation() {
  const { locale } = useLocale();
  const [date, setDate] = useState<CalendarDate | null>(null);
  return (
    <div className="not-prose">
      <Calendar
        aria-label="Delivery date"
        errorMessage="Deliveries run on weekdays."
        isInvalid={date !== null && isWeekend(date, locale)}
        onChange={setDate}
        value={date}
      />
    </div>
  );
}
