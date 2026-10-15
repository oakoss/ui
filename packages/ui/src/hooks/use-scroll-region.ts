import {
  type RefObject,
  type UIEvent,
  useCallback,
  useLayoutEffect,
  useState,
} from 'react';

type RegionName = {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  // Finds an element whose text names the region when neither label is set,
  // such as a table's caption; it must be stable across renders.
  findLabel?: (container: HTMLElement) => Element | null;
};

type Scrolled = { isPastStart: boolean; isPastTop: boolean };

// A scroll container that's a tab stop only while its content overflows, and
// a region only while it has a name. Watches the container and its first
// child, and reports whether each axis has scrolled from the start
// (scrollLeft is negative in RTL).
export function useScrollRegion(
  container: RefObject<HTMLElement | null>,
  name: RegionName,
) {
  const [isScrollable, setIsScrollable] = useState(false);
  const { scrolled, update } = useScrolled();
  const labelId = useLabelId(container, name.findLabel);

  useLayoutEffect(() => {
    const element = container.current;
    const measure = () => {
      if (!element) return;
      setIsScrollable(
        element.scrollWidth > element.clientWidth ||
          element.scrollHeight > element.clientHeight,
      );
      update(element);
    };
    const observer = new ResizeObserver(measure);
    measure();
    if (element) observer.observe(element);
    if (element?.firstElementChild) observer.observe(element.firstElementChild);
    return () => observer.disconnect();
  }, [container, update]);

  const onScroll = useCallback(
    (event: UIEvent<HTMLElement>) => update(event.currentTarget),
    [update],
  );

  const label = regionLabel(name, labelId);
  const regionProps = isScrollable
    ? {
        ...label,
        role: label === undefined ? undefined : 'region',
        tabIndex: 0,
      }
    : {};

  return { onScroll, regionProps, scrolled };
}

function regionLabel(name: RegionName, labelId: string | undefined) {
  if ((name['aria-labelledby'] ?? '').trim() !== '') {
    return { 'aria-labelledby': name['aria-labelledby'] };
  }
  if ((name['aria-label'] ?? '').trim() !== '') {
    return { 'aria-label': name['aria-label'] };
  }
  return labelId === undefined ? undefined : { 'aria-labelledby': labelId };
}

// The id of the element findLabel returns while it has text, read from the
// page as its text and the container's content change.
function useLabelId(
  container: RefObject<HTMLElement | null>,
  findLabel: RegionName['findLabel'],
) {
  const [labelId, setLabelId] = useState<string>();
  useLayoutEffect(() => {
    const element = container.current;
    const read = () => {
      const label = element && findLabel ? findLabel(element) : null;
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
  }, [container, findLabel]);
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
