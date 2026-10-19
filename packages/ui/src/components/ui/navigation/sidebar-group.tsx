import {
  type ComponentProps,
  createContext,
  use,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import {
  Button as AriaButton,
  type ButtonProps as AriaButtonProps,
} from 'react-aria-components';

import * as Icon from '#/components/icons';
import {
  Collapsible,
  CollapsibleContent,
} from '#/components/ui/layout/collapsible';
import {
  currentPage,
  useSidebarLayout,
} from '#/components/ui/navigation/sidebar-provider';
import { cn, cx } from '#/lib/cx';
import { focusRing } from '#/lib/recipes';

export type SidebarGroupActionProps = (
  | { 'aria-label': string }
  | { 'aria-labelledby': string }
) &
  AriaButtonProps;

// Only a collapsible group takes the expansion props.
export type SidebarGroupProps = (
  | {
      defaultExpanded?: boolean;
      isCollapsible: true;
      isExpanded?: boolean;
      onExpandedChange?: (isExpanded: boolean) => void;
    }
  | {
      defaultExpanded?: never;
      isCollapsible?: false;
      isExpanded?: never;
      onExpandedChange?: never;
    }
) &
  Omit<ComponentProps<'div'>, 'ref'>;

// Set inside a collapsible group; isInstant skips the height animation.
const GroupContext = createContext<{ isInstant: boolean } | null>(null);

const label =
  'flex h-control-sm w-full shrink-0 items-center gap-2 rounded-md px-2 text-start text-xs font-medium text-sidebar-foreground/70 transition-[margin,opacity,visibility] duration-200 ease-linear group-data-[collapsible=icon]:invisible group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0 [&>svg]:size-4 [&>svg]:shrink-0';

// In icon mode a collapsible group shows its items, and groups after the first
// are divided by a line where their labels were.
export function SidebarGroup({
  children,
  className,
  defaultExpanded,
  isCollapsible = false,
  isExpanded,
  onExpandedChange,
  ...props
}: SidebarGroupProps) {
  const { isIcon } = useSidebarLayout();
  const {
    isExpanded: isOwnExpanded,
    isInstant,
    setElement,
    setExpanded,
  } = useExpanded(isCollapsible ? defaultExpanded : false, onExpandedChange);
  return (
    <div
      className={cn(
        'relative flex w-full min-w-0 flex-col p-2 group-data-[collapsible=icon]:not-first:border-t group-data-[collapsible=icon]:not-first:border-sidebar-border',
        className,
      )}
      data-slot="sidebar-group"
      ref={setElement}
      {...props}
    >
      {isCollapsible ? (
        <GroupContext value={{ isInstant }}>
          <Collapsible
            className="contents"
            isExpanded={isIcon || (isExpanded ?? isOwnExpanded)}
            onExpandedChange={setExpanded}
          >
            {children}
          </Collapsible>
        </GroupContext>
      ) : (
        children
      )}
    </div>
  );
}

export function SidebarGroupAction({
  className,
  ...props
}: SidebarGroupActionProps) {
  return (
    <AriaButton
      data-slot="sidebar-group-action"
      {...props}
      className={cx(
        [
          focusRing,
          'absolute end-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground transition-transform group-data-[collapsible=icon]:hidden after:absolute after:-inset-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:after:hidden [&>svg]:size-4 [&>svg]:shrink-0',
        ],
        className,
      )}
    />
  );
}

export function SidebarGroupContent({
  className,
  ...props
}: ComponentProps<'div'>) {
  const group = use(GroupContext);
  const content = (
    <div
      className={cn('w-full text-sm', className)}
      data-slot="sidebar-group-content"
      {...props}
    />
  );
  return group ? (
    <CollapsibleContent className={cn(group.isInstant && 'transition-none')}>
      {content}
    </CollapsibleContent>
  ) : (
    content
  );
}

// In a collapsible group the label is the button that opens it. In icon mode
// it fades out of the way and out of the tab order.
export function SidebarGroupLabel({
  children,
  className,
  id,
}: Pick<ComponentProps<'div'>, 'children' | 'className' | 'id'>) {
  if (use(GroupContext) === null) {
    return (
      <div
        className={cn(label, className)}
        data-slot="sidebar-group-label"
        id={id}
      >
        {children}
      </div>
    );
  }
  return (
    <AriaButton
      className={cn(
        focusRing,
        label,
        'group/label hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        className,
      )}
      data-slot="sidebar-group-label"
      id={id}
      slot="trigger"
    >
      {children}
      <Icon.ChevronDown className="ms-auto transition-transform group-aria-expanded/label:rotate-180" />
    </AriaButton>
  );
}

// Opens when a link becomes current, at once on mount; one that stays current,
// even moved, doesn't reopen a group the user closed.
function useExpanded(
  defaultExpanded: boolean | undefined,
  onExpandedChange: ((isExpanded: boolean) => void) | undefined,
) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded ?? false);
  const [isInstant, setIsInstant] = useState(false);
  const isDetected = defaultExpanded === undefined;
  useLayoutEffect(() => {
    let previous = new Set<Element>();
    const open = (isMount: boolean) => {
      if (!isDetected || !element) return;
      const current = new Set(element.querySelectorAll(currentPage));
      // A loop rather than Set's isSubsetOf, which Safari 16 lacks.
      let isNew = false;
      for (const link of current) isNew ||= !previous.has(link);
      previous = current;
      if (!isNew) return;
      setIsInstant(isMount);
      setIsExpanded(true);
    };
    open(true);
    const observer = new MutationObserver(() => open(false));
    if (isDetected && element) {
      observer.observe(element, {
        attributeFilter: ['aria-current'],
        childList: true,
        subtree: true,
      });
    }
    return () => observer.disconnect();
  }, [element, isDetected]);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsInstant(false));
    return () => cancelAnimationFrame(frame);
  }, [isInstant]);
  return {
    isExpanded,
    isInstant,
    setElement,
    setExpanded: (isNextExpanded: boolean) => {
      setIsExpanded(isNextExpanded);
      onExpandedChange?.(isNextExpanded);
    },
  };
}
