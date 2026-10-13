import type { ReactNode } from 'react';

import {
  Autocomplete as AriaAutocomplete,
  type AutocompleteProps as AriaAutocompleteProps,
  Menu as AriaMenu,
  type MenuProps as AriaMenuProps,
  type MenuSectionProps as AriaMenuSectionProps,
  SearchField as AriaSearchField,
  type SearchFieldProps as AriaSearchFieldProps,
  type SeparatorProps as AriaSeparatorProps,
  SearchFieldContext,
  useFilter,
} from 'react-aria-components';

import * as Icon from '#/components/icons';
import { Input } from '#/components/ui/inputs/input';
import {
  InputGroup,
  InputGroupAddon,
} from '#/components/ui/inputs/input-group';
import { Dialog, type DialogProps } from '#/components/ui/overlays/dialog';
import {
  MenuGroup,
  MenuItem,
  type MenuItemProps,
  MenuLabel,
  type MenuLabelProps,
  MenuSeparator,
} from '#/components/ui/overlays/menu';
import { cn, cx } from '#/lib/cx';
import { itemTextValue } from '#/lib/text-value';

// title names the dialog, which shows no heading.
export type CommandDialogProps = {
  'aria-label'?: never;
  'aria-labelledby'?: never;
  title?: string;
} & Omit<DialogProps, 'aria-label' | 'aria-labelledby'>;

// Command owns the input's value: use its inputValue, defaultInputValue and
// onInputChange.
export type CommandInputProps = {
  defaultValue?: never;
  placeholder?: string;
  value?: never;
} & Omit<AriaSearchFieldProps, 'children' | 'defaultValue' | 'value'>;

// Words that find the item without appearing in it.
export type CommandItemProps<T extends object = object> = {
  keywords?: readonly string[];
} & MenuItemProps<T>;

export type CommandListProps<T extends object = object> = {
  className?: string;
  // Shown when nothing matches what's typed.
  emptyLabel?: string;
} & Omit<AriaMenuProps<T>, 'className' | 'renderEmptyState' | 'style'>;

export type CommandProps = { children: ReactNode; className?: string } & Omit<
  AriaAutocompleteProps,
  'children'
>;

// Filters the list by what's typed in the input, ignoring case and accents.
export function Command({ className, filter, ...props }: CommandProps) {
  const { contains } = useFilter({ sensitivity: 'base' });
  return (
    <div
      className={cn('flex size-full flex-col overflow-hidden', className)}
      data-slot="command"
    >
      <AriaAutocomplete filter={filter ?? contains} {...props} />
    </div>
  );
}

const defaultTitle = 'Command palette';
const defaultSearchLabel = 'Search';

// An untyped spread's aria-label or aria-labelledby is dropped so it can't
// replace the title; a blank title falls back to the default.
export function CommandDialog({
  'aria-label': _ariaLabel,
  'aria-labelledby': _ariaLabelledby,
  children,
  className,
  showCloseButton = false,
  title = defaultTitle,
  ...props
}: CommandDialogProps) {
  return (
    <Dialog
      className={cn('gap-0 p-0 sm:mt-16 sm:self-start', className)}
      data-slot="command-dialog"
      showCloseButton={showCloseButton}
      {...props}
      aria-label={title.trim() === '' ? defaultTitle : title}
    >
      <SearchFieldContext value={{ autoFocus: true }}>
        {children}
      </SearchFieldContext>
    </Dialog>
  );
}

// Sections divide themselves, as Select's and Combobox's do.
export function CommandGroup<T extends object>({
  className,
  ...props
}: AriaMenuSectionProps<T>) {
  return (
    <MenuGroup<T>
      {...props}
      className={cn(
        'not-first:-mx-1 not-first:mt-1 not-first:border-t not-first:border-border not-first:px-1 not-first:pt-1',
        className,
      )}
      kind="command"
    />
  );
}

export function CommandHeader(props: MenuLabelProps) {
  return <MenuLabel {...props} kind="command" />;
}

// The input keeps focus while the arrow keys move through the list, and
// Escape clears what's typed. CommandDialog focuses it on open; inline, it
// waits for the user. It's named Search unless it has a name of its own.
export function CommandInput({
  'aria-label': ariaLabel = '',
  className,
  placeholder,
  ...props
}: CommandInputProps) {
  const isNamed =
    ariaLabel.trim() !== '' || (props['aria-labelledby'] ?? '').trim() !== '';
  return (
    <AriaSearchField
      className={cx('border-b border-border p-2', className)}
      data-slot="command-input-wrapper"
      {...props}
      aria-label={isNamed ? ariaLabel || undefined : defaultSearchLabel}
    >
      <InputGroup>
        <InputGroupAddon>
          <Icon.Search aria-hidden />
        </InputGroupAddon>
        <Input
          className="[&::-webkit-search-cancel-button]:hidden"
          data-slot="command-input"
          placeholder={placeholder}
        />
      </InputGroup>
    </AriaSearchField>
  );
}

export function CommandItem<T extends object>({
  keywords,
  ...props
}: CommandItemProps<T>) {
  const label = itemTextValue(props.textValue, props.children);
  return (
    <MenuItem<T>
      {...props}
      kind="command"
      textValue={[label, ...(keywords ?? [])].filter(Boolean).join(' ')}
    />
  );
}

export function CommandList<T extends object>({
  className,
  emptyLabel = 'No results',
  ...props
}: CommandListProps<T>) {
  return (
    <AriaMenu<T>
      className={cn(
        'max-h-72 scroll-py-1 overflow-y-auto p-1 outline-hidden',
        className,
      )}
      data-slot="command-list"
      renderEmptyState={
        emptyLabel.trim() === ''
          ? undefined
          : () => (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {emptyLabel}
              </div>
            )
      }
      {...props}
    />
  );
}

export function CommandSeparator(props: AriaSeparatorProps) {
  return <MenuSeparator {...props} kind="command" />;
}
