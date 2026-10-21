import type { UseEmblaCarouselType } from 'embla-carousel-react';

import { useEffect, useRef, useState } from 'react';

export type CarouselDirection = 'next' | 'previous';

export type CarouselState = {
  // The slides at least half on screen, in reading order, once the carousel
  // has moved and settled; empty before, so nothing is announced on load.
  announced: number[];
  canScrollNext: boolean;
  canScrollPrev: boolean;
  // The index of the slide holding focus, or -1.
  focused: number;
  // The slides with any part on screen.
  inView: number[];
  slides: HTMLElement[];
};

type Api = NonNullable<UseEmblaCarouselType[1]>;

const initialState: CarouselState = {
  announced: [],
  canScrollNext: false,
  canScrollPrev: false,
  focused: -1,
  inView: [],
  slides: [],
};

// A drag that starts in a carousel nested in a slide moves only that one.
export function isOwnDrag(api: Api, event: Event) {
  return (
    event.target instanceof Element &&
    event.target.closest('[data-slot=carousel-content]') === api.rootNode()
  );
}

// What an Embla carousel shows and where focus is, read again whenever
// either changes.
export function useCarouselState(api: UseEmblaCarouselType[1]) {
  const [state, setState] = useState(initialState);
  useEffect(() => (api ? watch(api, setState) : undefined), [api]);
  return state;
}

// Steps for the Previous and Next buttons. A focused button that disables
// drops focus to the page as the attribute lands, so `handoffRef` names the
// other button, which takes focus once it renders enabled.
export function useCarouselSteps(api: UseEmblaCarouselType[1]) {
  const nextRef = useRef<HTMLButtonElement>(null);
  const previousRef = useRef<HTMLButtonElement>(null);
  const handoffRef = useRef<CarouselDirection | null>(null);
  const refs = { next: nextRef, previous: previousRef };
  const go = (direction: CarouselDirection) => {
    if (!api) return;
    const wasFocused = refs[direction].current === document.activeElement;
    // Embla animates in script, which the reduced-motion CSS can't reach.
    const isReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (direction === 'next') api.scrollNext(isReduced);
    else api.scrollPrev(isReduced);
    const canGoOn =
      direction === 'next' ? api.canScrollNext() : api.canScrollPrev();
    if (wasFocused && !canGoOn) {
      handoffRef.current = direction === 'next' ? 'previous' : 'next';
    }
  };
  return { go, handoffRef, refs };
}

// What the status region says: the slides at rest after a move, held while
// a pointer grabs the row and cleared when the slides change.
function announcer(api: Api, onChange: () => void) {
  let announced: number[] = [];
  let cancelRest: (() => void) | undefined;
  let isPending = false;
  const wait = () => {
    cancelRest?.();
    cancelRest = waitForRest(api, () => {
      isPending = false;
      announced = slidesInView(api.rootNode(), api.slideNodes(), 0.5);
      onChange();
    });
  };
  return {
    cancel: () => cancelRest?.(),
    clear: () => {
      cancelRest?.();
      isPending = false;
      announced = [];
    },
    hold: () => cancelRest?.(),
    read: () => announced,
    release: () => {
      if (isPending) wait();
    },
    schedule: () => {
      isPending = true;
      wait();
    },
  };
}

function indexOfSlide(slides: HTMLElement[], target: EventTarget | null) {
  return target instanceof Node
    ? slides.findIndex((slide) => slide.contains(target))
    : -1;
}

// The slides showing at least `share` of their size, in reading order.
// Embla's own list counts a slide that only touches the viewport's edge,
// and is empty until its observer first reports.
function slidesInView(root: HTMLElement, slides: HTMLElement[], share = 0) {
  const view = root.getBoundingClientRect();
  const isRtl = getComputedStyle(root).direction === 'rtl';
  const row = slides[0]?.parentElement;
  const isColumn = row
    ? getComputedStyle(row).flexDirection === 'column'
    : false;
  return slides
    .map((slide, index) => ({ box: slide.getBoundingClientRect(), index }))
    .filter(({ box }) => {
      const width =
        Math.min(box.right, view.right) - Math.max(box.left, view.left);
      const height =
        Math.min(box.bottom, view.bottom) - Math.max(box.top, view.top);
      return (
        width >= Math.max(1, box.width * share) &&
        height >= Math.max(1, box.height * share)
      );
    })
    .toSorted((a, b) => {
      if (isColumn) return a.box.top - b.box.top;
      return isRtl ? b.box.right - a.box.right : a.box.left - b.box.left;
    })
    .map(({ index }) => index);
}

// Calls onRest once the slide row moves under half a pixel for two frames,
// and returns a cancel. Embla's settle event can wait on a fraction of a
// pixel that never closes, and its easing creeps for a second.
function waitForRest(api: Api, onRest: () => void) {
  let frame = 0;
  let last = NaN;
  let stillFrames = 0;
  const check = () => {
    const box = api.containerNode().getBoundingClientRect();
    const position = box.left + box.top;
    stillFrames = Math.abs(position - last) < 0.5 ? stillFrames + 1 : 0;
    last = position;
    if (stillFrames < 2) frame = requestAnimationFrame(check);
    else onRest();
  };
  frame = requestAnimationFrame(check);
  return () => {
    cancelAnimationFrame(frame);
  };
}

function watch(api: Api, setState: (state: CarouselState) => void) {
  const root = api.rootNode();
  const update = (focus: EventTarget | null) => {
    setState({
      announced: status.read(),
      canScrollNext: api.canScrollNext(),
      canScrollPrev: api.canScrollPrev(),
      focused: indexOfSlide(api.slideNodes(), focus),
      inView: slidesInView(root, api.slideNodes()),
      slides: api.slideNodes(),
    });
  };
  const onChange = () => {
    update(document.activeElement);
  };
  const status = announcer(api, onChange);
  // Slides added, removed or resized make the last announcement stale.
  const onLayout = () => {
    status.clear();
    onChange();
  };
  const onSelect = () => {
    status.schedule();
    onChange();
  };
  const handlers = [
    ['pointerDown', status.hold],
    ['pointerUp', status.release],
    ['reInit', onLayout],
    ['resize', onLayout],
    ['select', onSelect],
    ['slidesInView', onChange],
  ] as const;
  // Focus leaving a slide that's out of view hides it; its relatedTarget is
  // where focus is going.
  const onFocusOut = (event: FocusEvent) => {
    update(event.relatedTarget);
  };
  onChange();
  for (const [event, handler] of handlers) api.on(event, handler);
  root.addEventListener('focusout', onFocusOut);
  return () => {
    for (const [event, handler] of handlers) api.off(event, handler);
    status.cancel();
    root.removeEventListener('focusout', onFocusOut);
  };
}
