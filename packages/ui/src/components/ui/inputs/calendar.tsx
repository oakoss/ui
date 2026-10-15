import { type ContextType, createContext, type ReactNode, use } from 'react';
import {
  Button as AriaButton,
  Calendar as AriaCalendar,
  CalendarHeading as AriaCalendarHeading,
  type CalendarHeadingProps as AriaCalendarHeadingProps,
  type CalendarProps as AriaCalendarProps,
  RangeCalendar as AriaRangeCalendar,
  type RangeCalendarProps as AriaRangeCalendarProps,
  ButtonContext,
  type DateValue,
  DEFAULT_SLOT,
  Text,
} from 'react-aria-components';

import * as Icon from '#/components/icons';
import { Spinner } from '#/components/ui/feedback/spinner';
import { buttonStyles } from '#/components/ui/inputs/button';
import {
  CalendarGrid,
  type CalendarGridProps,
} from '#/components/ui/inputs/calendar-cell';
import { cn, cx } from '#/lib/cx';
import { isEmptyNode } from '#/lib/empty-node';

export {
  CalendarCell,
  type CalendarCellProps,
  CalendarGrid,
  type CalendarGridProps,
} from '#/components/ui/inputs/calendar-cell';

export type CalendarHeaderProps = {
  children?: ReactNode;
  hasNext?: boolean;
  hasPrevious?: boolean;
};

export type CalendarProps<
  T extends DateValue,
  M extends 'multiple' | 'single' = 'single',
> = Omit<AriaCalendarProps<T, M>, 'children' | 'visibleDuration'> &
  Shortcut<LayoutProps> &
  VisibleMonths;

export type RangeCalendarProps<T extends DateValue> = Omit<
  AriaRangeCalendarProps<T>,
  'children' | 'visibleDuration'
> &
  Shortcut<LayoutProps> &
  VisibleMonths;

type ButtonContextValue = ContextType<typeof ButtonContext>;

type LayoutProps = {
  errorMessage?: ReactNode;
  footer?: ReactNode;
  heading?: ReactNode;
  isLoading?: boolean;
  loadingLabel?: string;
  renderCell?: CalendarGridProps['renderCell'];
};

// Children replace the default layout, so they can't mix with its props.
// Field's Shortcut, kept here so a calendar doesn't install Field.
type Shortcut<Layout> =
  | ({ children: Exclude<ReactNode, boolean | null | undefined> } & Partial<
      Record<keyof Layout, never>
    >)
  | ({ children?: never } & Layout);

type VisibleMonths = { visibleMonths?: number };

const rootClass = 'flex w-fit flex-col gap-3';

// The button slots around a calendar, which its own ButtonContext hides.
const OuterSlotsContext = createContext<ReturnType<typeof slotsOf>>(undefined);

const stepStyles = buttonStyles({
  intent: 'neutral',
  size: 'icon-sm',
  variant: 'ghost',
});

export function Calendar<
  T extends DateValue,
  M extends 'multiple' | 'single' = 'single',
>({ className, ...props }: CalendarProps<T, M>) {
  return (
    <OuterSlotsContext value={slotsOf(use(ButtonContext))}>
      <AriaCalendar<T, M>
        weeksInMonth={6}
        {...rootProps(props)}
        className={cx(rootClass, className)}
      />
    </OuterSlotsContext>
  );
}

export function CalendarHeader({
  children,
  hasNext = true,
  hasPrevious = true,
}: CalendarHeaderProps) {
  return (
    <div
      className="flex items-center justify-between gap-1"
      data-slot="calendar-header"
    >
      {hasPrevious ? <CalendarStep slot="previous" /> : <StepSpacer />}
      <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
        {isEmptyNode(children) ? <CalendarHeading /> : children}
      </div>
      {hasNext ? <CalendarStep slot="next" /> : <StepSpacer />}
    </div>
  );
}

export function CalendarHeading({
  className,
  ...props
}: AriaCalendarHeadingProps) {
  return (
    <AriaCalendarHeading
      {...props}
      className={cn('text-sm font-medium', className)}
      data-slot="calendar-heading"
    />
  );
}

export function RangeCalendar<T extends DateValue>({
  className,
  ...props
}: RangeCalendarProps<T>) {
  return (
    <OuterSlotsContext value={slotsOf(use(ButtonContext))}>
      <AriaRangeCalendar<T>
        weeksInMonth={6}
        {...rootProps(props)}
        className={cx(rootClass, className)}
      />
    </OuterSlotsContext>
  );
}

// React Aria names the steppers in the user's language.
function CalendarStep({ slot }: { slot: 'next' | 'previous' }) {
  return (
    <AriaButton
      className={cn(stepStyles)}
      data-slot={`calendar-${slot}`}
      slot={slot}
    >
      {slot === 'previous' ? (
        <Icon.ChevronLeft aria-hidden className="rtl:rotate-180" />
      ) : (
        <Icon.ChevronRight aria-hidden className="rtl:rotate-180" />
      )}
    </AriaButton>
  );
}

function Layout({
  errorMessage,
  footer,
  isInvalid,
  ...rest
}: { isInvalid: boolean; months: number } & LayoutProps) {
  return (
    <>
      <Months {...rest} />
      {footer}
      {isInvalid && !isEmptyNode(errorMessage) ? (
        <Text
          className="text-sm text-destructive-text"
          data-slot="calendar-error"
          slot="errorMessage"
        >
          {errorMessage}
        </Text>
      ) : null}
    </>
  );
}

// The heading slot replaces the first month's heading only, so a dropdown
// renders once however many months show.
function Months({
  heading,
  isLoading = false,
  loadingLabel = 'Loading',
  months,
  renderCell,
}: { months: number } & Omit<LayoutProps, 'errorMessage' | 'footer'>) {
  return (
    // React Aria's root drops aria-busy, so the months carry it.
    <div
      aria-busy={isLoading ? true : undefined}
      className="relative flex flex-wrap gap-6"
      data-slot="calendar-months"
    >
      {Array.from({ length: months }, (_, index) => (
        <div
          className={cn(
            'flex flex-col gap-2 transition-opacity',
            isLoading && 'opacity-50',
          )}
          data-slot="calendar-month"
          key={index}
        >
          <CalendarHeader
            hasNext={index === months - 1}
            hasPrevious={index === 0}
          >
            {index === 0 ? (
              heading
            ) : (
              <CalendarHeading offset={{ months: index }} />
            )}
          </CalendarHeader>
          <CalendarGrid offset={{ months: index }} renderCell={renderCell} />
        </div>
      ))}
      {isLoading ? (
        <Spinner
          className="absolute inset-0 flex"
          label={loadingLabel}
          size="lg"
        />
      ) : null}
    </div>
  );
}

// Frees consumers' Buttons from React Aria's required stepper slot and puts
// back the slots from outside the calendar, such as a Dialog's close.
function OwnButtons({ children }: { children: ReactNode }) {
  const outer = use(OuterSlotsContext);
  const slots = slotsOf(use(ButtonContext));
  const value = slots && { slots: { ...outer, ...slots, [DEFAULT_SLOT]: {} } };
  return <ButtonContext value={value ?? null}>{children}</ButtonContext>;
}

// The props both calendars give React Aria's root.
function rootProps<P extends Shortcut<LayoutProps> & VisibleMonths>({
  children,
  errorMessage,
  footer,
  heading,
  isLoading,
  loadingLabel,
  renderCell,
  visibleMonths,
  ...rest
}: P) {
  const months = wholeMonths(visibleMonths);
  const layout = { errorMessage, footer, heading, isLoading, loadingLabel };
  return {
    ...rest,
    children: ({ isInvalid }: { isInvalid: boolean }) => (
      <OwnButtons>
        {isEmptyNode(children) ? (
          <Layout
            {...layout}
            isInvalid={isInvalid}
            months={months}
            renderCell={renderCell}
          />
        ) : (
          children
        )}
      </OwnButtons>
    ),
    'data-slot': 'calendar',
    visibleDuration: { months },
  };
}

function slotsOf(value: ButtonContextValue) {
  return value !== null && value !== undefined && 'slots' in value
    ? value.slots
    : undefined;
}

function StepSpacer() {
  return <span aria-hidden className="size-control-sm shrink-0" />;
}

// React Aria's calendar throws on zero, negative or fractional months.
function wholeMonths(value: number | undefined): number {
  const whole = Math.trunc(value ?? 1);
  return Number.isFinite(whole) && whole > 0 ? whole : 1;
}
