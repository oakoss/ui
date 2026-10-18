---
'@oakoss/ui': minor
---

Date Field and Time Field: segmented inputs on React Aria's `DateField` and `TimeField`, with a label, description, error and `start` and `end` decorations inside the border. Each unit is its own segment, in the user's locale's order, digits and hour cycle; a focused segment fills with the accent color, red when the field is invalid, and the system's highlight color in Windows High Contrast. Segments of a long locale scroll rather than overflow. `granularity` is typed by the value, so a `CalendarDate` can't take an hour granularity, which React Aria throws on at render. Install with `npx shadcn@latest add oakoss/ui/date-field` or `oakoss/ui/time-field`.

Date Picker: a Date Field with a calendar trigger and our Calendar in a popover, placed under the field from its start edge and as wide as its months. `calendarProps` reaches the calendar's heading, footer, months, cells and loading state, so month and year dropdowns and presets work inside it. A date and time value adds a time field under the calendar, named by `timeLabel`. Install with `npx shadcn@latest add oakoss/ui/date-picker`.

Date Range Picker: start and end inputs that scroll together, with a range calendar in the same popover and start and end time fields when the value includes a time, named by `startTimeLabel` and `endTimeLabel`. A form gets each end from hidden inputs named by `startName` and `endName`. Install with `npx shadcn@latest add oakoss/ui/date-range-picker`.

Input Group takes its name from a React Aria field's group as well as its props, so a picker's input and trigger are announced as one group named by the label. In Windows High Contrast a disabled field inside an Input Group, such as a decorated Text Field, stays at full opacity and grays its decorations, where it faded before.

The docs add a Dates and Times guide, on converting values to and from strings and JavaScript dates, time zones and forms, and a date example in the TanStack Form guide.
