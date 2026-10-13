import type { ReactNode } from 'react';

import {
  Header as AriaHeader,
  type HeaderProps as AriaHeaderProps,
  Keyboard as AriaKeyboard,
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
  type MenuItemProps as AriaMenuItemProps,
  type MenuProps as AriaMenuProps,
  MenuSection as AriaMenuSection,
  type MenuSectionProps as AriaMenuSectionProps,
  Separator as AriaSeparator,
  type SeparatorProps as AriaSeparatorProps,
  Text as AriaText,
  KeyboardContext,
} from 'react-aria-components';
import { tv } from 'tailwind-variants/lite';

import * as Icon from '#/components/icons';
import {
  PopoverContent,
  type PopoverContentProps,
} from '#/components/ui/overlays/popover';
import { cn, cx } from '#/lib/cx';
import { listItem } from '#/lib/recipes';

export type MenuContentProps<T extends object = object> = {
  className?: string;
  // Shown when the menu has no items.
  emptyLabel?: string;
} & Omit<AriaMenuProps<T>, 'className' | 'renderEmptyState' | 'style'> &
  Pick<
    PopoverContentProps,
    'crossOffset' | 'offset' | 'placement' | 'shouldFlip'
  >;

// An item's props without its label. Omit flattens MenuItemLabel's union, so
// a wrapper omits from this and adds MenuItemLabel back.
export type MenuItemBaseProps<T extends object = object> = {
  description?: ReactNode;
  // Lines the label up with items that show an icon or selection mark.
  inset?: boolean;
  intent?: 'destructive' | 'neutral';
  shortcut?: ReactNode;
} & Omit<AriaMenuItemProps<T>, 'children' | 'textValue'>;

// Typeahead matches an item's text, so a label that isn't plain text needs
// textValue.
export type MenuItemLabel =
  | {
      children: number | readonly (number | string)[] | string;
      textValue?: string;
    }
  | { children?: ReactNode; textValue: string };

// The label is the children; the shortcut and description describe the item.
export type MenuItemProps<T extends object = object> = MenuItemBaseProps<T> &
  MenuItemLabel;

// Each part takes the component it belongs to, which names its data-slot.
export type MenuKind = 'context-menu' | 'dropdown-menu';

export type MenuSubTriggerProps<T extends object = object> = MenuItemLabel &
  Omit<MenuItemBaseProps<T>, 'shortcut'>;

const itemStyles = tv({
  // A submenu's trigger stays highlighted while focus is in the submenu, and
  // items in a selecting menu leave room at the start for the mark.
  base: [
    listItem,
    'open:bg-accent open:text-accent-foreground data-selection-mode:ps-8 focus:[&_kbd]:text-inherit [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
  ],
  variants: {
    inset: { false: '', true: 'ps-8' },
    intent: {
      destructive:
        'text-(--menu-text) [--menu-subtle:var(--color-destructive-subtle)] [--menu-text:var(--color-destructive-text)] open:bg-(--menu-subtle) open:text-(--menu-text) focus:bg-(--menu-subtle) focus:text-(--menu-text)',
      neutral: '',
    },
  },
});

// A submenu opens beside its item, with its first item level with the trigger.
export function MenuContent<T extends object>({
  className,
  crossOffset,
  emptyLabel,
  isSubmenu = false,
  kind,
  offset,
  placement,
  shouldFlip,
  ...props
}: { isSubmenu?: boolean; kind: MenuKind } & MenuContentProps<T>) {
  return (
    <PopoverContent
      className={cn('w-auto min-w-32 p-1', className)}
      crossOffset={crossOffset ?? (isSubmenu ? -5 : undefined)}
      data-slot={`${kind}-${isSubmenu ? 'sub-content' : 'content'}`}
      offset={offset ?? popoverOffset(kind, isSubmenu)}
      placement={placement ?? (isSubmenu ? 'end top' : 'bottom start')}
      shouldFlip={shouldFlip}
    >
      <AriaMenu<T>
        className="max-h-[inherit] overflow-y-auto outline-hidden"
        data-slot={`${kind}-list`}
        renderEmptyState={
          emptyLabel === undefined
            ? undefined
            : () => (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  {emptyLabel}
                </div>
              )
        }
        {...props}
      />
    </PopoverContent>
  );
}

export function MenuGroup<T extends object>({
  kind,
  ...props
}: { kind: MenuKind } & AriaMenuSectionProps<T>) {
  return <AriaMenuSection<T> data-slot={`${kind}-group`} {...props} />;
}

// A string label becomes the item's typeahead text. `end` sits after the
// label, where a submenu's chevron goes.
export function MenuItem<T extends object>({
  children,
  className,
  description,
  end,
  inset = false,
  intent = 'neutral',
  kind,
  shortcut,
  textValue,
  ...props
}: { end?: ReactNode; kind: MenuKind } & MenuItemProps<T>) {
  return (
    <AriaMenuItem<T>
      className={cx(itemStyles({ inset, intent }), className)}
      data-intent={intent}
      data-slot={`${kind}-item`}
      textValue={textValue ?? plainText(children)}
      {...props}
    >
      {({ isSelected, selectionMode }) => (
        <>
          {selectionMode === 'none' ? null : (
            <span
              aria-hidden
              className="pointer-events-none absolute start-2 flex size-4 items-center justify-center"
              data-slot={`${kind}-${selectionMode === 'single' ? 'radio' : 'checkbox'}-item-indicator`}
            >
              {isSelected ? <SelectionMark mode={selectionMode} /> : null}
            </span>
          )}
          <ItemContent description={description}>{children}</ItemContent>
          {shortcut === undefined || shortcut === null ? null : (
            <MenuShortcut kind={kind}>{shortcut}</MenuShortcut>
          )}
          {end}
        </>
      )}
    </AriaMenuItem>
  );
}

export function MenuLabel({
  className,
  inset = false,
  kind,
  ...props
}: { inset?: boolean; kind: MenuKind } & AriaHeaderProps) {
  return (
    <AriaHeader
      className={cn(
        'px-2 py-1.5 text-xs font-medium text-muted-foreground',
        inset && 'ps-8',
        className,
      )}
      data-inset={inset || undefined}
      data-slot={`${kind}-label`}
      {...props}
    />
  );
}

export function MenuSeparator({
  className,
  kind,
  ...props
}: { kind: MenuKind } & AriaSeparatorProps) {
  return (
    <AriaSeparator
      className={cn('-mx-1 my-1 border-t border-border', className)}
      data-slot={`${kind}-separator`}
      {...props}
    />
  );
}

// Opens a submenu: wrap it with the submenu's content in a SubmenuTrigger.
export function MenuSubTrigger<T extends object>({
  kind,
  ...props
}: { kind: MenuKind } & MenuSubTriggerProps<T>) {
  return (
    <MenuItem<T>
      {...props}
      data-slot={`${kind}-sub-trigger`}
      end={
        <Icon.ChevronRight
          aria-hidden
          className="ms-auto size-4 rtl:rotate-180"
        />
      }
      kind={kind}
    />
  );
}

function ItemContent({
  children,
  description,
}: {
  children: ReactNode;
  description: ReactNode;
}) {
  return (
    <span className="flex min-w-0 flex-1 flex-col">
      <AriaText className="flex items-center gap-2" slot="label">
        {children}
      </AriaText>
      {description === undefined || description === null ? null : (
        <AriaText slot="description">{description}</AriaText>
      )}
    </span>
  );
}

// React Aria gives the item's shortcut an id through KeyboardContext; keys
// inside it get none, so ids stay unique.
function MenuShortcut({
  children,
  kind,
}: {
  children: ReactNode;
  kind: MenuKind;
}) {
  return (
    <AriaKeyboard
      className="ms-auto ps-4 font-sans text-xs tracking-widest text-muted-foreground"
      data-slot={`${kind}-shortcut`}
    >
      <KeyboardContext value={{}}>{children}</KeyboardContext>
    </AriaKeyboard>
  );
}

// JSX like `Delete {count} files` passes its text as an array.
function plainText(children: ReactNode): string | undefined {
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  if (!Array.isArray(children)) return undefined;
  const parts = children.map((child: ReactNode) => plainText(child));
  return parts.every((part) => part !== undefined) ? parts.join('') : undefined;
}

// A context menu opens at the pointer, so it sits right on it.
function popoverOffset(kind: MenuKind, isSubmenu: boolean) {
  if (isSubmenu) return 0;
  return kind === 'context-menu' ? 0 : 4;
}

function SelectionMark({ mode }: { mode: 'multiple' | 'single' }) {
  return mode === 'single' ? (
    <Icon.Circle className="size-2 fill-current" />
  ) : (
    <Icon.Check className="size-4" />
  );
}
