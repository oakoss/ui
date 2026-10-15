import { RangeCalendar } from '@oakoss/ui/components/ui/inputs/calendar';

export function CalendarRange() {
  return (
    <div className="not-prose">
      <RangeCalendar aria-label="Trip dates" visibleMonths={2} />
    </div>
  );
}
