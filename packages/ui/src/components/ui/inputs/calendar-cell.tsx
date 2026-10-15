import { type ContextType, type ReactNode, use } from 'react';
import {
  CalendarCell as AriaCalendarCell,
  type CalendarCellProps as AriaCalendarCellProps,
  CalendarGrid as AriaCalendarGrid,
  CalendarGridBody as AriaCalendarGridBody,
  CalendarGridHeader as AriaCalendarGridHeader,
  CalendarHeaderCell as AriaCalendarHeaderCell,
  type CalendarCellRenderProps,
  RangeCalendarStateContext,
} from 'react-aria-components';
import { tv } from 'tailwind-variants/lite';

import { cn, cx } from '#/lib/cx';

// The band runs behind a range's days and rounds at its ends and at each
// week's edges; forced colors repaint its fill, so it keeps a border there.
const bandStyles = tv({
  base: 'absolute inset-0 forced-colors:border-y forced-colors:border-[Highlight] [td:first-child_&]:rounded-s-control [td:last-child_&]:rounded-e-control',
  variants: {
    end: { false: '', true: 'rounded-e-control' },
    invalid: { false: 'bg-primary-subtle', true: 'bg-destructive-subtle' },
    start: { false: '', true: 'rounded-s-control' },
  },
});

const faceStyles = tv({
  base: [
    'relative flex size-full items-center justify-center rounded-control bg-linear-to-b from-transparent to-transparent tabular-nums',
    'group-data-hovered/cell:from-current/8 group-data-hovered/cell:to-current/8 group-data-pressed/cell:from-current/12 group-data-pressed/cell:to-current/12',
    'group-data-focus-visible/cell:outline-(length:--ring-width) group-data-focus-visible/cell:outline-offset-2 group-data-focus-visible/cell:outline-ring group-data-focus-visible/cell:outline-solid',
  ],
  variants: {
    // Text on a Highlight fill opts out of forced colors' backplate, and
    // opting out stops the focus outline adapting; the hover layer would wash
    // over the fill there.
    fill: {
      band: 'text-primary-text',
      bandInvalid: 'text-destructive-text',
      invalid:
        'bg-destructive text-destructive-foreground forced-colors:bg-[Mark] forced-colors:bg-none forced-colors:text-[HighlightText] forced-colors:outline-[Highlight] forced-colors:forced-color-adjust-none',
      none: '',
      selected:
        'bg-primary text-primary-foreground forced-colors:bg-[Highlight] forced-colors:bg-none forced-colors:text-[HighlightText] forced-colors:outline-[Highlight] forced-colors:forced-color-adjust-none',
    },
    inactive: {
      false: '',
      true: 'text-muted-foreground forced-colors:text-[GrayText]',
    },
    unavailable: { false: '', true: 'line-through' },
  },
});

export type CalendarCellProps = AriaCalendarCellProps;

export type CalendarGridProps = {
  offset?: { months: number };
  renderCell?: (values: CalendarCellRenderProps) => ReactNode;
};

type Fill = 'band' | 'bandInvalid' | 'invalid' | 'none' | 'selected';

type RangeState = ContextType<typeof RangeCalendarStateContext>;

export function CalendarCell({
  children,
  className,
  ...props
}: CalendarCellProps) {
  const range = use(RangeCalendarStateContext);
  return (
    <AriaCalendarCell
      {...props}
      className={cx(
        'group/cell relative flex size-9 cursor-default items-center justify-center text-sm outline-hidden select-none any-pointer-coarse:size-11',
        className,
      )}
      data-slot="calendar-cell"
    >
      {(values) => {
        const isBand = isInBand(values, range);
        return (
          <>
            {isBand ? <Band values={values} /> : null}
            <span
              className={cn(
                faceStyles({
                  fill: fillOf(values, range !== null, isBand),
                  inactive: values.isDisabled || values.isUnavailable,
                  unavailable: values.isUnavailable,
                }),
              )}
              data-slot="calendar-day"
            >
              {typeof children === 'function'
                ? children({ ...values, defaultChildren: values.formattedDate })
                : (children ?? values.formattedDate)}
              {values.isToday ? <TodayMark /> : null}
            </span>
          </>
        );
      }}
    </AriaCalendarCell>
  );
}

// Days repeated from a neighboring month that's also on screen are hidden.
export function CalendarGrid({ offset, renderCell }: CalendarGridProps) {
  return (
    <AriaCalendarGrid
      className="border-collapse border-spacing-0"
      data-slot="calendar-grid"
      offset={offset}
    >
      <AriaCalendarGridHeader>
        {(day) => (
          <AriaCalendarHeaderCell className="h-8 p-0 text-xs font-normal text-muted-foreground">
            {day}
          </AriaCalendarHeaderCell>
        )}
      </AriaCalendarGridHeader>
      <AriaCalendarGridBody className="[&_td]:p-0 [&_td:has(>[data-outside-month]:not([data-outside-visible-range]))]:invisible">
        {(date) => <CalendarCell date={date}>{renderCell}</CalendarCell>}
      </AriaCalendarGridBody>
    </AriaCalendarGrid>
  );
}

function Band({ values }: { values: CalendarCellRenderProps }) {
  return (
    <span
      aria-hidden
      className={cn(
        bandStyles({
          end: values.isSelectionEnd,
          invalid: values.isInvalid,
          start: values.isSelectionStart,
        }),
      )}
      data-slot="calendar-band"
    />
  );
}

// A range fills only its ends, an outside-month end included; the band shows
// the days between.
function fillOf(
  values: CalendarCellRenderProps,
  isRange: boolean,
  isBand: boolean,
): Fill {
  const isEnd = values.isSelectionStart || values.isSelectionEnd;
  if ((!isRange || isEnd) && (isBand || values.isSelected)) {
    return values.isInvalid ? 'invalid' : 'selected';
  }
  if (!isBand) return 'none';
  return values.isInvalid ? 'bandInvalid' : 'band';
}

// React Aria never selects outside days, so the band is extended through
// those inside the range by hand, skipping the days it wouldn't select.
function isInBand(values: CalendarCellRenderProps, state: RangeState): boolean {
  const range = state?.highlightedRange;
  if (state === null || range === undefined || range === null) return false;
  if (values.isSelected) return true;
  return (
    values.isOutsideMonth &&
    (!values.isUnavailable || values.isInvalid) &&
    !state.isDisabled &&
    !state.isInvalid(values.date) &&
    values.date.compare(range.start) >= 0 &&
    values.date.compare(range.end) <= 0
  );
}

function TodayMark() {
  return (
    <span
      aria-hidden
      className="absolute inset-x-0 bottom-1 mx-auto size-1 rounded-full border-2 border-current"
      data-slot="calendar-today"
    />
  );
}
