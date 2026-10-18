import {
  parseZonedDateTime,
  type ZonedDateTime,
} from '@internationalized/date';
import { DatePicker } from '@oakoss/ui/components/ui/inputs/date-picker';
import { useState } from 'react';

export function DatesDemo() {
  const [value, setValue] = useState<null | ZonedDateTime>(() =>
    parseZonedDateTime('2026-03-14T09:30[America/New_York]'),
  );
  return (
    <div className="not-prose flex flex-col gap-4">
      <DatePicker<ZonedDateTime>
        className="w-80"
        granularity="minute"
        label="Meeting"
        onChange={setValue}
        value={value}
      />
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-muted-foreground">toString()</dt>
        <dd className="font-mono break-all">{value?.toString() ?? '—'}</dd>
        <dt className="text-muted-foreground">toAbsoluteString()</dt>
        <dd className="font-mono break-all">
          {value?.toAbsoluteString() ?? '—'}
        </dd>
        <dt className="text-muted-foreground">toDate()</dt>
        <dd className="font-mono break-all">
          {value?.toDate().toISOString() ?? '—'}
        </dd>
      </dl>
    </div>
  );
}
