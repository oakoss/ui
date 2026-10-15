---
'@oakoss/ui': minor
---

Calendar and RangeCalendar: date pickers on React Aria's `Calendar` and `RangeCalendar`, showing one or more months (`visibleMonths`) and always six weeks, so the height holds between months. Days are 36px and grow to 44px wherever a touch pointer is present; today has a dot, never a fill, so it shows inside a range. A range fills its ends and runs a band through the days between, outside-month days included. Unavailable days are struck through, `errorMessage` shows while invalid, `isLoading` fades the months behind a spinner, and `heading` and `footer` take content of your own, such as presets. In Windows High Contrast the selected day takes the system's selection colors. Install with `npx shadcn@latest add oakoss/ui/calendar`; `calendar-month-year-select` adds month and year dropdowns for the heading, which keep the month and day when the year list stops at `minValue` or `maxValue`, and are disabled with the calendar.
