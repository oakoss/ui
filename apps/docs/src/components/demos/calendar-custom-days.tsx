import { Calendar } from '@oakoss/ui/components/ui/inputs/calendar';
// Screen readers hear only the date, so the price is decoration here.
export function CalendarCustomDays() {
  return (
    <div className="not-prose">
      <Calendar
        aria-label="Departure date"
        renderCell={({ date, formattedDate, isToday }) => (
          <span
            className={`flex flex-col items-center leading-none ${isToday ? 'font-bold' : ''}`}
          >
            {formattedDate}
            <span aria-hidden className="text-[0.625rem] opacity-70">
              ${date.day % 2 === 0 ? 89 : 129}
            </span>
          </span>
        )}
      />
    </div>
  );
}
