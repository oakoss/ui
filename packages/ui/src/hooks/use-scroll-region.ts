import {
  type RefObject,
  type UIEvent,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

// Selectors run against the container. labelSelector finds an element whose
// text names the region when neither label is set, such as a caption;
// stickyTop and stickyStart find elements that may stick to those edges.
type RegionOptions = {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  labelSelector?: string;
  stickyStart?: string;
  stickyTop?: string;
};

type Scrolled = { isPastStart: boolean; isPastTop: boolean };

// A scroll container that's a tab stop only while its content overflows, and
// a region only while it has a name. Spread `props` on the container. Watches
// it and its first child, reports whether each axis has scrolled from the
// start (scrollLeft is negative in RTL), and pads scrolling by whatever sticks
// to its edges, so an element scrolled into view lands clear of it.
export function useScrollRegion<T extends HTMLElement>(options: RegionOptions) {
  const ref = useRef<T>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const { scrolled, update } = useScrolled();
  const labelId = useLabelId(ref, options.labelSelector);
  const { stickyStart, stickyTop } = options;

  useLayoutEffect(() => {
    const element = ref.current;
    const measure = () => {
      if (!element) return;
      setIsScrollable(
        element.scrollWidth > element.clientWidth ||
          element.scrollHeight > element.clientHeight,
      );
      update(element);
      padInsets(element, stickyTop, stickyStart);
    };
    const observer = new ResizeObserver(measure);
    measure();
    if (element) observer.observe(element);
    if (element?.firstElementChild) observer.observe(element.firstElementChild);
    return () => observer.disconnect();
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

function padInsets(element: HTMLElement, top?: string, start?: string) {
  element.style.scrollPaddingTop = insetSize(element, top, 'height');
  element.style.scrollPaddingInlineStart = insetSize(element, start, 'width');
}

// A label from an untyped caller may not be a string, and a blank one names
// nothing.
function regionLabel(options: RegionOptions, labelId: string | undefined) {
  if (isText(options['aria-labelledby'])) {
    return { 'aria-labelledby': options['aria-labelledby'] };
  }
  if (isText(options['aria-label'])) {
    return { 'aria-label': options['aria-label'] };
  }
  return labelId === undefined ? undefined : { 'aria-labelledby': labelId };
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
