import useEmblaCarousel, {
  type UseEmblaCarouselType,
} from 'embla-carousel-react';
import {
  type ComponentProps,
  createContext,
  type RefObject,
  use,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useLocale } from 'react-aria-components';

import * as Icon from '#/components/icons';
import { Button, type ButtonProps } from '#/components/ui/inputs/button';
import {
  type CarouselState,
  type CarouselDirection as Direction,
  isOwnDrag,
  useCarouselState,
  useCarouselSteps,
} from '#/hooks/use-carousel-state';
import { cn, cx } from '#/lib/cx';

export type CarouselApi = UseEmblaCarouselType[1];

export type CarouselMessages = {
  carousel: string;
  next: string;
  previous: string;
  // The slides at least half on screen, numbered from 1 in reading order,
  // announced when the carousel settles.
  showing: (slides: number[], count: number) => string;
  slide: (index: number, count: number) => string;
  slideRole: string;
};

export type CarouselOptions = EmblaParameters[0];

export type CarouselPlugin = EmblaParameters[1];

export type CarouselProps = (
  | { 'aria-label': string; 'aria-labelledby'?: string }
  | { 'aria-label'?: string; 'aria-labelledby': string }
) & {
  messages?: Partial<CarouselMessages>;
  opts?: CarouselOptions;
  orientation?: Orientation;
  plugins?: CarouselPlugin;
  setApi?: (api: CarouselApi) => void;
} & ComponentProps<'div'>;

export type CarouselStepProps = { 'aria-label'?: string } & Omit<
  ButtonProps,
  'aria-label' | 'children'
>;

type CarouselContextValue = {
  carouselRef: UseEmblaCarouselType[0];
  go: (direction: Direction) => void;
  handoffRef: RefObject<Direction | null>;
  messages: CarouselMessages;
  orientation: Orientation;
  refs: Record<Direction, RefObject<HTMLButtonElement | null>>;
  state: CarouselState;
};

type EmblaParameters = Parameters<typeof useEmblaCarousel>;

type Orientation = 'horizontal' | 'vertical';

const defaultMessages: CarouselMessages = {
  carousel: 'carousel',
  next: 'Next slide',
  previous: 'Previous slide',
  showing: (slides, count) => {
    const [first = 0, last = 0] = [slides.at(0), slides.at(-1)];
    const isRun = slides.every(
      (n, i) => i === 0 || n === (slides[i - 1] ?? 0) + 1,
    );
    if (slides.length === 1)
      return `Slide ${String(first)} of ${String(count)}`;
    return isRun
      ? `Slides ${String(first)} to ${String(last)} of ${String(count)}`
      : `Slides ${slides.slice(0, -1).join(', ')} and ${String(last)} of ${String(count)}`;
  },
  slide: (index, count) => `${String(index)} of ${String(count)}`,
  slideRole: 'slide',
};

const steps = {
  horizontal: {
    next: { icon: Icon.ChevronRight, position: 'inset-y-0 -end-12 my-auto' },
    previous: {
      icon: Icon.ChevronLeft,
      position: 'inset-y-0 -start-12 my-auto',
    },
  },
  vertical: {
    next: { icon: Icon.ChevronDown, position: 'inset-x-0 -bottom-12 mx-auto' },
    previous: { icon: Icon.ChevronUp, position: 'inset-x-0 -top-12 mx-auto' },
  },
} as const;

const CarouselContext = createContext<CarouselContextValue | null>(null);

export function Carousel({
  children,
  className,
  messages,
  opts,
  orientation = 'horizontal',
  plugins,
  setApi,
  ...props
}: CarouselProps) {
  const { direction } = useLocale();
  const [carouselRef, api] = useEmblaCarousel(
    {
      direction,
      watchDrag: isOwnDrag,
      ...opts,
      axis: orientation === 'horizontal' ? 'x' : 'y',
    },
    plugins,
  );
  const state = useCarouselState(api);
  const text = { ...defaultMessages, ...messages };

  useEffect(() => {
    if (api) setApi?.(api);
  }, [api, setApi]);

  return (
    <CarouselContext
      value={{
        carouselRef,
        messages: text,
        orientation,
        state,
        ...useCarouselSteps(api),
      }}
    >
      <div
        aria-roledescription={text.carousel}
        data-slot="carousel"
        role="region"
        {...props}
        className={cn('relative', className)}
      >
        {children}
        <CarouselStatus />
      </div>
    </CarouselContext>
  );
}

export function CarouselContent({
  className,
  ...props
}: ComponentProps<'div'>) {
  const { carouselRef, orientation } = useCarousel();
  return (
    <div
      className="overflow-hidden"
      data-slot="carousel-content"
      ref={carouselRef}
    >
      <div
        {...props}
        className={cn(
          'flex',
          orientation === 'horizontal' ? '-ms-4' : '-mt-4 flex-col',
          className,
        )}
      />
    </div>
  );
}

// Slides out of view leave the tab order and the accessibility tree, unless
// focus is inside one, as when a drag carries a focused link away.
export function CarouselItem({
  className,
  ref,
  ...props
}: ComponentProps<'div'>) {
  const { messages, orientation, state } = useCarousel();
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  // Set by a stable callback as it mounts, so a mount effect can read it.
  const nodeRef = useRef<HTMLDivElement>(null);
  useImperativeHandle<HTMLDivElement | null, HTMLDivElement | null>(
    ref,
    () => nodeRef.current,
    [],
  );
  const attach = useCallback((element: HTMLDivElement | null) => {
    nodeRef.current = element;
    setNode(element);
  }, []);
  const index = node === null ? -1 : state.slides.indexOf(node);
  const isHidden =
    index !== -1 && !state.inView.includes(index) && state.focused !== index;
  const count = state.slides.length;
  const name = index === -1 ? undefined : messages.slide(index + 1, count);
  return (
    <div
      aria-label={name}
      aria-roledescription={messages.slideRole}
      data-slot="carousel-item"
      inert={isHidden}
      ref={attach}
      role="group"
      {...props}
      className={cn(
        'min-w-0 shrink-0 grow-0 basis-full',
        orientation === 'horizontal' ? 'ps-4' : 'pt-4',
        className,
      )}
    />
  );
}

export function CarouselNext(props: CarouselStepProps) {
  return <CarouselStep direction="next" {...props} />;
}

export function CarouselPrevious(props: CarouselStepProps) {
  return <CarouselStep direction="previous" {...props} />;
}

export function useCarousel() {
  const context = use(CarouselContext);
  if (context === null) {
    throw new Error('useCarousel must be used within a <Carousel />');
  }
  return context;
}

function CarouselStatus() {
  const { messages, state } = useCarousel();
  return (
    <div className="sr-only" role="status">
      {state.announced.length > 0 &&
        messages.showing(
          state.announced.map((index) => index + 1),
          state.slides.length,
        )}
    </div>
  );
}

function CarouselStep({
  'aria-label': label,
  className,
  direction,
  ref,
  size = 'icon-sm',
  variant = 'outline',
  ...props
}: { direction: Direction } & CarouselStepProps) {
  const { go, handoffRef, messages, orientation, refs, state } = useCarousel();
  useImperativeHandle<HTMLButtonElement | null, HTMLButtonElement | null>(
    ref,
    () => refs[direction].current,
    [direction, refs],
  );
  const isNext = direction === 'next';
  const isDisabled = isNext ? !state.canScrollNext : !state.canScrollPrev;
  const { icon: StepIcon, position } = steps[orientation][direction];
  useLayoutEffect(() => {
    if (isDisabled || handoffRef.current !== direction) return;
    handoffRef.current = null;
    refs[direction].current?.focus();
  });
  return (
    <Button
      data-slot={`carousel-${direction}`}
      intent="neutral"
      isDisabled={isDisabled}
      onPress={() => {
        go(direction);
      }}
      variant={variant}
      {...props}
      aria-label={label ?? messages[direction]}
      className={cx(['absolute touch-manipulation', position], className)}
      ref={refs[direction]}
      size={size}
    >
      <StepIcon
        className={cn(orientation === 'horizontal' && 'rtl:rotate-180')}
      />
    </Button>
  );
}
