import {
  type HTMLAttributes,
  type Ref,
  type RefObject,
  type UIEvent,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

// Selectors run against the container. labelSelector finds an element whose
// text names the region when neither label is set, such as a caption;
// stickyTop and stickyStart find elements that may stick to those edges. A
// caller's own ref to the container goes in `ref`.
type RegionOptions<T> = {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  labelSelector?: string;
  ref?: Ref<T>;
  stickyStart?: string;
  stickyTop?: string;
};

type Scrolled = { isPastStart: boolean; isPastTop: boolean };

// The props for a container that takes a caller's div props: their label
// names the region while it scrolls (a name on a div with no role fails
// axe), or always when they set a role, their ref still reaches it, and a
// tabIndex they set wins.
export function useScrollContainer<T extends HTMLElement>({
  'aria-label': label,
  'aria-labelledby': labelledBy,
  ref,
  ...props
}: { ref?: Ref<T> } & HTMLAttributes<T>) {
  const name = { 'aria-label': label, 'aria-labelledby': labelledBy };
  const { props: region } = useScrollRegion<T>({ ...name, ref });
  return {
    ...region,
    ...props,
    ...(props.role !== undefined && name),
    ref: region.ref,
  };
}

// A scroll container that's a tab stop only while its content overflows, and
// a region only while it has a name. Spread `props` on the container; `ref`
// reads it. Watches it and its children, reports whether each axis has
// scrolled from the start (scrollLeft is negative in RTL), and pads scrolling
// by whatever sticks to its edges, so an element scrolled into view lands
// clear of it.
export function useScrollRegion<T extends HTMLElement>(
  options: RegionOptions<T>,
) {
  const ref = useRef<T>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const { scrolled, update } = useScrolled();
  const labelId = useLabelId(ref, options.labelSelector);
  const { stickyStart, stickyTop } = options;
  useImperativeHandle<null | T, null | T>(options.ref, () => ref.current, []);

  useLayoutEffect(() => {
    const element = ref.current;
    return element
      ? watchSize(
          element,
          () => {
            setIsScrollable(scrolls(element));
            update(element);
            padInsets(element, stickyTop, stickyStart);
          },
          () => {
            clearInsets(element, stickyTop, stickyStart);
          },
        )
      : undefined;
  }, [stickyStart, stickyTop, update]);

  // An inset can stick or unstick without resizing anything.
  useLayoutEffect(() => {
    if (ref.current) padInsets(ref.current, stickyTop, stickyStart);
  });

  const onScroll = useCallback(
    (event: UIEvent<T>) => update(event.currentTarget),
    [update],
  );

  const label = regionLabel(options, labelId);
  const props = {
    onScroll,
    ref,
    ...(isScrollable && {
      ...label,
      role: label === undefined ? undefined : 'region',
      tabIndex: 0,
    }),
  };
  return { props, scrolled };
}

function canScroll(overflow: string) {
  return overflow === 'auto' || overflow === 'scroll';
}

function clearInsets(element: HTMLElement, top?: string, start?: string) {
  if (top !== undefined) element.style.scrollPaddingTop = '';
  if (start !== undefined) element.style.scrollPaddingInlineStart = '';
}

// Skips an element that doesn't stick, such as a cell spanning columns.
function insetSize(
  container: HTMLElement,
  selector: string | undefined,
  axis: 'height' | 'width',
) {
  const found =
    selector === undefined ? [] : [...container.querySelectorAll(selector)];
  const inset = found.find(
    (element) => getComputedStyle(element).position === 'sticky',
  );
  return inset ? `${inset.getBoundingClientRect()[axis]}px` : '';
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

// Leaves an edge with no selector alone, so a caller's own scroll padding
// stands.
function padInsets(element: HTMLElement, top?: string, start?: string) {
  if (top !== undefined) {
    element.style.scrollPaddingTop = insetSize(element, top, 'height');
  }
  if (start !== undefined) {
    element.style.scrollPaddingInlineStart = insetSize(element, start, 'width');
  }
}

// A label from an untyped caller may not be a string, and a blank one names
// nothing.
function regionLabel(
  options: RegionOptions<HTMLElement>,
  labelId: string | undefined,
) {
  if (isText(options['aria-labelledby'])) {
    return { 'aria-labelledby': options['aria-labelledby'] };
  }
  if (isText(options['aria-label'])) {
    return { 'aria-label': options['aria-label'] };
  }
  return labelId === undefined ? undefined : { 'aria-labelledby': labelId };
}

// An axis counts only where it can scroll: content spilling out of an
// overflow-visible container scrolls an ancestor instead.
function scrolls(element: HTMLElement) {
  const { overflowX, overflowY } = getComputedStyle(element);
  return (
    (canScroll(overflowX) && element.scrollWidth > element.clientWidth) ||
    (canScroll(overflowY) && element.scrollHeight > element.clientHeight)
  );
}

// The id of the element labelSelector finds while it has text, read from the
// page as its text and the container's content change.
function useLabelId(
  container: RefObject<HTMLElement | null>,
  labelSelector: string | undefined,
) {
  const [labelId, setLabelId] = useState<string>();
  useLayoutEffect(() => {
    const element = container.current;
    const read = () => {
      const label =
        element && labelSelector !== undefined
          ? element.querySelector(labelSelector)
          : null;
      const hasText = (label?.textContent ?? '').trim() !== '';
      const id = label?.id ?? '';
      setLabelId(hasText && id !== '' ? id : undefined);
    };
    const observer = new MutationObserver(read);
    read();
    if (element) {
      observer.observe(element, {
        attributeFilter: ['id'],
        characterData: true,
        childList: true,
        subtree: true,
      });
    }
    return () => observer.disconnect();
  }, [container, labelSelector]);
  return labelId;
}

function useScrolled() {
  const [scrolled, setScrolled] = useState<Scrolled>({
    isPastStart: false,
    isPastTop: false,
  });
  const update = useCallback((element: HTMLElement) => {
    const isPastStart = Math.abs(element.scrollLeft) > 0;
    const isPastTop = element.scrollTop > 0;
    setScrolled((previous) =>
      previous.isPastStart === isPastStart && previous.isPastTop === isPastTop
        ? previous
        : { isPastStart, isPastTop },
    );
  }, []);
  return { scrolled, update };
}

// Runs `measure` now and whenever the container or a child resizes, or a
// child is added: content can grow without any one child resizing. Runs
// `onStop` when the watch ends.
function watchSize(
  element: HTMLElement,
  measure: () => void,
  onStop: () => void,
) {
  const resizes = new ResizeObserver(measure);
  const observeChildren = () => {
    for (const child of element.children) resizes.observe(child);
    measure();
  };
  const mutations = new MutationObserver(observeChildren);
  resizes.observe(element);
  observeChildren();
  mutations.observe(element, { childList: true });
  return () => {
    resizes.disconnect();
    mutations.disconnect();
    onStop();
  };
}
