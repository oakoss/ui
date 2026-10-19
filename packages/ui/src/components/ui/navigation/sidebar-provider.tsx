import {
  type ComponentProps,
  createContext,
  type RefObject,
  use,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useCookieState } from '#/hooks/use-cookie-state';
import { useMediaQuery } from '#/hooks/use-media-query';
import { cn } from '#/lib/cx';

export type SidebarCollapsible = 'icon' | 'none' | 'offcanvas';

export type SidebarContextValue = {
  isMobile: boolean;
  isOpen: boolean;
  isOpenMobile: boolean;
  setOpen: (isOpen: boolean) => void;
  setOpenMobile: (isOpen: boolean) => void;
  state: 'collapsed' | 'expanded';
  toggleSidebar: () => void;
};

export type SidebarLayout = { isIcon: boolean; side: SidebarSide };

export type SidebarProviderProps = {
  defaultOpen?: boolean;
  isOpen?: boolean;
  // The key that toggles the sidebar with Cmd or Ctrl; false turns it off.
  keyboardShortcut?: false | string;
  onOpenChange?: (isOpen: boolean) => void;
  // The cookie an uncontrolled sidebar keeps its state in; false keeps none.
  persistKey?: false | string;
} & ComponentProps<'div'>;

export type SidebarSide = 'end' | 'start';

// What the parts share beyond the public state.
type Internals = {
  collapsible: SidebarCollapsible;
  keyboardShortcut: false | string;
  setCollapsible: (collapsible: SidebarCollapsible) => void;
  sidebarId: string;
  sidebarRef: RefObject<HTMLDivElement | null>;
} & SidebarContextValue;

type StateOptions = Pick<
  SidebarProviderProps,
  'isOpen' | 'onOpenChange' | 'persistKey'
> &
  Required<Pick<SidebarProviderProps, 'defaultOpen' | 'keyboardShortcut'>>;

// A link a router or the isCurrent prop marks as the current page.
export const currentPage = '[aria-current]:not([aria-current=false])';

// The same width as Tailwind's `md` breakpoint, which the layout classes use.
export const mobileQuery = '(width < 48rem)';

const wrapperSlot = '[data-slot=sidebar-wrapper]';

const SidebarContext = createContext<Internals | null>(null);

// What the parts inside a sidebar render differently in icon mode.
export const SidebarLayoutContext = createContext<SidebarLayout>({
  isIcon: false,
  side: 'start',
});

// A blank name is no name, so a part falls back to its default.
export function nameOr(name: string | undefined, fallback: string) {
  return name === undefined || name.trim() === '' ? fallback : name;
}

export function SidebarProvider({
  children,
  className,
  defaultOpen = true,
  isOpen,
  keyboardShortcut = 'b',
  onOpenChange,
  persistKey = 'sidebar_state',
  ...props
}: SidebarProviderProps) {
  const value = useSidebarState({
    defaultOpen,
    isOpen,
    keyboardShortcut,
    onOpenChange,
    persistKey: isOpen === undefined ? persistKey : false,
  });
  useShortcut(value);
  return (
    <SidebarContext value={value}>
      <div
        className={cn(
          'group/sidebar-wrapper flex min-h-svh w-full [--sidebar-width-icon:3rem] [--sidebar-width:16rem] has-data-[variant=inset]:bg-sidebar',
          className,
        )}
        data-slot="sidebar-wrapper"
        {...props}
      >
        {children}
      </div>
    </SidebarContext>
  );
}

// Focus can't stay in a sidebar that hides off-canvas or unmounts as the
// window narrows to a phone, so it moves to a trigger outside the sidebar, or
// leaves the page's controls if there's none. The panel is gone by the time
// its cleanup runs, so whether it held focus is tracked while it's mounted.
// The panel passes its own collapse mode, which the provider learns only after
// the panel's first effects run.
export function useFocusHandoff(collapsible: SidebarCollapsible) {
  const { sidebarRef, state } = useSidebarInternals();
  useLayoutEffect(() => {
    const sidebar = sidebarRef.current;
    if (
      state === 'collapsed' &&
      collapsible === 'offcanvas' &&
      sidebar?.contains(document.activeElement) === true
    ) {
      handOffFocus(sidebar, sidebar.closest(wrapperSlot));
    }
  }, [collapsible, sidebarRef, state]);
  useLayoutEffect(() => {
    const sidebar = sidebarRef.current;
    const wrapper = sidebar?.closest(wrapperSlot) ?? null;
    // A part can take focus as it mounts, before these listeners attach.
    let hasFocus = sidebar?.contains(document.activeElement) === true;
    const onFocusIn = () => {
      hasFocus = true;
    };
    // Focus lost to nothing, as when CSS hides the panel at a phone's width
    // before React unmounts it, still counts as the sidebar's.
    const onFocusOut = ({ relatedTarget }: FocusEvent) => {
      if (
        relatedTarget instanceof Node &&
        sidebar?.contains(relatedTarget) !== true
      ) {
        hasFocus = false;
      }
    };
    sidebar?.addEventListener('focusin', onFocusIn);
    sidebar?.addEventListener('focusout', onFocusOut);
    return () => {
      sidebar?.removeEventListener('focusin', onFocusIn);
      sidebar?.removeEventListener('focusout', onFocusOut);
      // Checked once the commit ends: a panel still in the page was only
      // re-run, as Strict Mode does, and focus the user moved stays put.
      queueMicrotask(() => {
        const focused = document.activeElement;
        const isStranded = focused === null || focused === document.body;
        if (hasFocus && isStranded && sidebar?.isConnected === false) {
          handOffFocus(sidebar, wrapper);
        }
      });
    };
  }, [sidebarRef]);
}

export function useSidebar(): SidebarContextValue {
  return useSidebarInternals();
}

export function useSidebarInternals() {
  const context = use(SidebarContext);
  if (!context) throw new Error('useSidebar needs a SidebarProvider.');
  return context;
}

export function useSidebarLayout() {
  return use(SidebarLayoutContext);
}

function handOffFocus(sidebar: HTMLElement, wrapper: Element | null) {
  const outside = [
    ...(wrapper?.querySelectorAll<HTMLElement>('[data-slot=sidebar-trigger]') ??
      []),
  ].find((trigger) => !sidebar.contains(trigger));
  if (outside) outside.focus();
  else if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }
}

function isEditable(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.closest('input, textarea, select') !== null)
  );
}

// Cmd or Ctrl and the key toggle the sidebar, except with other modifiers,
// on key repeat and while typing, where Cmd+B is bold.
function useShortcut({
  collapsible,
  keyboardShortcut,
  toggleSidebar,
}: Internals) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        collapsible === 'none' ||
        keyboardShortcut === false ||
        event.key.toLowerCase() !== keyboardShortcut.toLowerCase() ||
        !(event.metaKey || event.ctrlKey) ||
        event.altKey ||
        event.shiftKey ||
        event.repeat ||
        isEditable(event.target)
      ) {
        return;
      }
      event.preventDefault();
      toggleSidebar();
    };
    addEventListener('keydown', onKeyDown);
    return () => removeEventListener('keydown', onKeyDown);
  }, [collapsible, keyboardShortcut, toggleSidebar]);
}

function useSidebarState({
  defaultOpen,
  isOpen: isOpenProp,
  keyboardShortcut,
  onOpenChange,
  persistKey,
}: StateOptions) {
  const isMobile = useMediaQuery(mobileQuery);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [collapsible, setCollapsible] =
    useState<SidebarCollapsible>('offcanvas');
  const stored = useCookieState(persistKey ?? false, defaultOpen);
  const isOpen = isOpenProp ?? stored.value;
  const sidebarId = useId();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const shortcut =
    keyboardShortcut === false || keyboardShortcut.trim() === ''
      ? false
      : keyboardShortcut;
  const setOpen = useCallback(
    (isNextOpen: boolean) => {
      stored.setValue(isNextOpen);
      onOpenChange?.(isNextOpen);
    },
    [onOpenChange, stored],
  );
  return useMemo<Internals>(
    () => ({
      collapsible,
      isMobile,
      isOpen,
      isOpenMobile,
      keyboardShortcut: shortcut,
      setCollapsible,
      setOpen,
      setOpenMobile: setIsOpenMobile,
      sidebarId,
      sidebarRef,
      state: isOpen ? 'expanded' : 'collapsed',
      toggleSidebar: () =>
        isMobile ? setIsOpenMobile(!isOpenMobile) : setOpen(!isOpen),
    }),
    [collapsible, isMobile, isOpen, isOpenMobile, setOpen, shortcut, sidebarId],
  );
}
