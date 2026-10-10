import {
  createContext,
  type ReactNode,
  use,
  useCallback,
  useId,
  useRef,
  useState,
} from 'react';
import {
  Slider as AriaSlider,
  SliderFill as AriaSliderFill,
  SliderOutput as AriaSliderOutput,
  type SliderOutputProps as AriaSliderOutputProps,
  type SliderProps as AriaSliderProps,
  SliderThumb as AriaSliderThumb,
  SliderTrack as AriaSliderTrack,
  type SliderTrackProps as AriaSliderTrackProps,
  DEFAULT_SLOT,
  TextContext,
} from 'react-aria-components';

import {
  FieldDescription,
  FieldLabel,
  type FieldMessages,
  isEmptyNode,
  type Shortcut,
} from '#/components/ui/inputs/field';
import { cn, cx } from '#/lib/cx';
import { focusRing } from '#/lib/recipes';

export type SliderProps<T extends SliderValue = number> = Omit<
  AriaSliderProps<T>,
  'children'
> &
  Shortcut<Pick<FieldMessages, 'description' | 'label'>> &
  ThumbLabels<T>;

export type SliderTrackProps = Omit<AriaSliderTrackProps, 'children'>;

type SliderValue = number | number[];

// A range's thumbs share the slider's label, so each needs its own name too
// ("Minimum Price", "Maximum Price"). Unless the value is known to be one
// number, it may be a range.
type ThumbLabels<T extends SliderValue> = [T] extends [number]
  ? { thumbLabels?: never }
  : { thumbLabels: readonly string[] };

// The Slider takes the names in either form; its track reads them here.
const ThumbLabelsContext = createContext<readonly string[] | undefined>(
  undefined,
);

export function Slider<T extends SliderValue = number>({
  'aria-describedby': describedBy,
  children,
  className,
  description,
  label,
  render,
  thumbLabels,
  ...props
}: SliderProps<T>) {
  const { describers, slots } = useDescriptionSlot(describedBy);
  return (
    <AriaSlider
      {...props}
      aria-describedby={describers}
      className={cx(
        'group/slider flex w-full flex-col select-none orientation-vertical:w-auto orientation-vertical:items-center orientation-vertical:gap-2',
        className,
      )}
      data-slot="slider"
      // React Aria marks only the inputs disabled. On the group it also tells
      // contrast checkers the faded label and value are inactive, which WCAG
      // exempts from its minimum.
      render={(domProps, values) => {
        const merged = {
          ...domProps,
          'aria-disabled': values.isDisabled || undefined,
        };
        return render ? render(merged, values) : <div {...merged} />;
      }}
    >
      <ThumbLabelsContext value={thumbLabels}>
        <TextContext value={slots}>
          {/* Children that render nothing would leave no track to operate. */}
          {isEmptyNode(children) ? (
            <Layout description={description} label={label} />
          ) : (
            children
          )}
        </TextContext>
      </ThumbLabelsContext>
    </AriaSlider>
  );
}

export function SliderOutput({ className, ...props }: AriaSliderOutputProps) {
  return (
    <AriaSliderOutput
      {...props}
      className={cx(
        'text-sm text-muted-foreground tabular-nums disabled:opacity-50',
        className,
      )}
      data-slot="slider-output"
    />
  );
}

// The track is the press area, 44px across the rail; its margin keeps the
// thumbs, centered on each end, inside the slider's box.
export function SliderTrack({ className, ...props }: SliderTrackProps) {
  const thumbLabels = use(ThumbLabelsContext);
  return (
    <AriaSliderTrack
      {...props}
      className={cx(
        'relative disabled:opacity-50 orientation-horizontal:mx-2 orientation-horizontal:h-11 orientation-vertical:my-2 orientation-vertical:min-h-40 orientation-vertical:w-11 orientation-vertical:grow',
        className,
      )}
      data-slot="slider-track"
    >
      {({ isDisabled, state }) => (
        <>
          <Rail isDisabled={isDisabled} />
          {state.values.map((_, index) => (
            <Thumb
              index={index}
              isDisabled={isDisabled}
              // oxlint-disable-next-line react/no-array-index-key -- React Aria identifies a thumb by its index
              key={index}
              label={thumbLabels?.[index]}
            />
          ))}
        </>
      )}
    </AriaSliderTrack>
  );
}

function Layout({
  description,
  label,
}: {
  description: ReactNode;
  label: ReactNode;
}) {
  return (
    <>
      {isEmptyNode(label) ? null : (
        <div className="flex items-center justify-between gap-2">
          <FieldLabel>{label}</FieldLabel>
          <SliderOutput />
        </div>
      )}
      <SliderTrack />
      {isEmptyNode(description) ? null : (
        <FieldDescription>{description}</FieldDescription>
      )}
    </>
  );
}

function Rail({ isDisabled }: { isDisabled: boolean }) {
  return (
    <div
      className="absolute group-orientation-horizontal/slider:inset-x-0 group-orientation-horizontal/slider:top-1/2 group-orientation-horizontal/slider:h-1.5 group-orientation-horizontal/slider:-translate-y-1/2 group-orientation-vertical/slider:inset-y-0 group-orientation-vertical/slider:start-0 group-orientation-vertical/slider:end-0 group-orientation-vertical/slider:mx-auto group-orientation-vertical/slider:w-1.5"
      data-slot="slider-rail"
    >
      {/* A border, not a fill: forced colors repaint fills as the page. There
          the line thins to an outline, so the solid fill stands out by shape
          when Highlight is close to the text color. */}
      <div
        className={cn(
          'absolute inset-0 rounded-full border-3 border-input forced-colors:border',
          isDisabled && 'forced-colors:border-[GrayText]',
        )}
      />
      <AriaSliderFill
        className={cn(
          'rounded-full bg-primary forced-colors:bg-[Highlight]',
          isDisabled && 'forced-colors:bg-[GrayText]',
        )}
        data-slot="slider-range"
      />
    </div>
  );
}

function Thumb({
  index,
  isDisabled,
  label,
}: {
  index: number;
  isDisabled: boolean;
  label: string | undefined;
}) {
  return (
    <AriaSliderThumb
      aria-label={label}
      className={cn(
        focusRing,
        'size-4 rounded-full border-2 border-primary bg-background forced-colors:border-[ButtonText]',
        isDisabled && 'forced-colors:border-[GrayText]',
        // React Aria places a thumb along the rail and pulls it back by half
        // its size on both axes; this centers it on the other axis.
        'group-orientation-horizontal/slider:top-1/2 group-orientation-vertical/slider:start-0 group-orientation-vertical/slider:end-0 group-orientation-vertical/slider:mx-auto group-orientation-vertical/slider:translate-x-1/2',
      )}
      data-slot="slider-thumb"
      index={index}
    />
  );
}

// React Aria's Slider has no description slot, so the slider provides one and
// points the thumbs at it while a description is mounted, by the id it
// rendered with (a consumer's own id wins over the slot's). The ref fires only
// on mount and unmount, so an observer follows the id if it changes.
function useDescriptionSlot(describedBy: string | undefined) {
  const id = useId();
  const observerRef = useRef<MutationObserver | null>(null);
  const [mountedId, setMountedId] = useState<string>();
  const ref = useCallback((node: HTMLElement | null) => {
    observerRef.current?.disconnect();
    setMountedId(node?.id);
    if (!node) return;
    observerRef.current = new MutationObserver(() => {
      setMountedId(node.id);
    });
    observerRef.current.observe(node, { attributeFilter: ['id'] });
  }, []);
  return {
    describers: [mountedId, describedBy].filter(Boolean).join(' '),
    slots: { slots: { [DEFAULT_SLOT]: {}, description: { id, ref } } },
  };
}
