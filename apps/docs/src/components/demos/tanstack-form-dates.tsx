import type { CalendarDate } from '@internationalized/date';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { DatePicker } from '@oakoss/ui/components/ui/inputs/date-picker';
import { DateRangePicker } from '@oakoss/ui/components/ui/inputs/date-range-picker';
import { revalidateLogic, useForm } from '@tanstack/react-form';
import { useState } from 'react';
import { Form, type RangeValue } from 'react-aria-components';
import * as z from 'zod';

type Leave = {
  dates: null | RangeValue<CalendarDate>;
  reviewBy: CalendarDate | null;
};

const schema = z
  .object({
    dates: z
      .custom<Leave['dates']>()
      .refine((dates) => dates !== null, {
        abort: true,
        message: 'Pick your dates.',
      })
      .refine(
        (dates) => dates.end.compare(dates.start) >= 0,
        'End on or after the first day.',
      )
      .refine(
        (dates) => dates.end.compare(dates.start) < 14,
        'Take 14 days at most.',
      ),
    reviewBy: z
      .custom<Leave['reviewBy']>()
      .refine((date) => date !== null, {
        abort: true,
        message: 'Pick a review date.',
      }),
  })
  .refine(({ dates, reviewBy }) => reviewBy.compare(dates.start) < 0, {
    message: 'Review before the leave starts.',
    path: ['reviewBy'],
  });

const defaultValues: Leave = { dates: null, reviewBy: null };

export function TanStackFormDates() {
  const [requested, setRequested] = useState<string>();
  const form = useLeaveForm(setRequested);

  return (
    <Form
      className="not-prose flex max-w-sm flex-col gap-4 rounded-lg border p-6"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
      validationBehavior="aria"
    >
      <form.Field name="dates">
        {(field) => (
          <DateRangePicker<CalendarDate>
            errors={field.state.meta.errors}
            isInvalid={!field.state.meta.isValid}
            label="Leave"
            onBlur={field.handleBlur}
            onChange={field.handleChange}
            value={field.state.value}
          />
        )}
      </form.Field>
      <form.Field name="reviewBy">
        {(field) => (
          <DatePicker<CalendarDate>
            errors={field.state.meta.errors}
            isInvalid={!field.state.meta.isValid}
            label="Manager review by"
            onBlur={field.handleBlur}
            onChange={field.handleChange}
            value={field.state.value}
          />
        )}
      </form.Field>
      <Button type="submit">Request leave</Button>
      <p aria-live="polite" className="text-sm">
        {requested === undefined ? null : `Requested ${requested}.`}
      </p>
    </Form>
  );
}

function useLeaveForm(onRequest: (dates: string) => void) {
  return useForm({
    defaultValues,
    onSubmit: ({ value: { dates } }) => {
      if (dates)
        onRequest(`${dates.start.toString()} to ${dates.end.toString()}`);
    },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: schema },
  });
}
