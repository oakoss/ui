import type { InputHTMLAttributes, ReactNode } from 'react';

import {
  Button as AriaButton,
  SearchField as AriaSearchField,
  type SearchFieldProps as AriaSearchFieldProps,
  ButtonContext,
} from 'react-aria-components';

import * as Icon from '#/components/icons';
import {
  type FieldMessages,
  type Shortcut,
} from '#/components/ui/inputs/field';
import { Input, type InputSize } from '#/components/ui/inputs/input';
import {
  InputGroup,
  InputGroupAddon,
  type InputGroupSlots,
  useFieldShortcut,
} from '#/components/ui/inputs/input-group';
import { cn, cx } from '#/lib/cx';
import { isEmptyNode } from '#/lib/empty-node';
import { stateLayer } from '#/lib/recipes';

const defaultSearchLabel = 'Search';

export type SearchFieldProps = Omit<AriaSearchFieldProps, 'children'> &
  Shortcut<LayoutProps>;

// enterKeyHint labels the on-screen keyboard's Enter key; iOS shows Search
// for a search input only inside a form with an action.
type LayoutProps = {
  enterKeyHint?: InputHTMLAttributes<HTMLInputElement>['enterKeyHint'];
  placeholder?: string;
  size?: InputSize;
} & FieldMessages &
  InputGroupSlots;

// A search icon leads, and a clear button ends the field once there's text.
// It's named Search unless it has a label or a name of its own.
export function SearchField({
  'aria-label': ariaLabel = '',
  children,
  className,
  description,
  end,
  enterKeyHint = 'search',
  errorMessage,
  errors,
  label,
  placeholder,
  size,
  start,
  ...props
}: SearchFieldProps) {
  // A blank label is no label, so the field still gets its fallback name.
  const shownLabel =
    typeof label === 'string' && label.trim() === '' ? undefined : label;
  const isNamed =
    !isEmptyNode(shownLabel) ||
    ariaLabel.trim() !== '' ||
    (props['aria-labelledby'] ?? '').trim() !== '';
  const { decorations, fieldProps, layout } = useFieldShortcut(
    { description, end, errorMessage, errors, label: shownLabel, start },
    props,
  );
  return (
    <AriaSearchField
      {...fieldProps}
      aria-label={
        isNamed || children !== undefined
          ? ariaLabel || undefined
          : defaultSearchLabel
      }
      className={cx('group/search-field flex flex-col gap-2', className)}
      data-slot="search-field"
    >
      {children ??
        layout(
          <Control
            {...decorations}
            enterKeyHint={enterKeyHint}
            placeholder={placeholder}
            size={size}
          />,
        )}
    </AriaSearchField>
  );
}

// React Aria names it "Clear search", translated, and keeps it out of the tab
// order: Escape clears from the keyboard. Hidden while the field is empty or
// read-only, where it would do nothing, which also takes it out of the
// accessibility tree. The wrapper keeps it, disabled in a read-only field,
// from counting as the group's disabled control, which fades the whole
// field.
export function SearchFieldClear() {
  return (
    <span className="contents">
      <AriaButton
        className={cn(
          stateLayer,
          'order-last flex aspect-square shrink-0 items-center justify-center self-stretch text-muted-foreground outline-hidden transition-colors select-none group-data-empty/search-field:invisible group-data-readonly/search-field:invisible hover:text-foreground max-sm:min-w-11 [&>svg]:size-4',
        )}
        data-slot="search-field-clear"
      >
        <Icon.X aria-hidden />
      </AriaButton>
    </span>
  );
}

function Control({
  end,
  enterKeyHint,
  placeholder,
  size,
  start,
}: { end: ReactNode; start: ReactNode } & Pick<
  LayoutProps,
  'enterKeyHint' | 'placeholder' | 'size'
>) {
  return (
    <InputGroup className="overflow-hidden" size={size}>
      <InputGroupAddon>
        <Icon.Search aria-hidden />
      </InputGroupAddon>
      {start === null ? null : (
        <Decoration align="inline-start">{start}</Decoration>
      )}
      <Input
        enterKeyHint={enterKeyHint}
        placeholder={placeholder}
        size={size}
      />
      {end === null ? null : <Decoration align="inline-end">{end}</Decoration>}
      <SearchFieldClear />
    </InputGroup>
  );
}

// React Aria hands its clear button's name, handler and tab order to any
// button in the field, so a button in a decoration gets none of them.
function Decoration({
  align,
  children,
}: {
  align: 'inline-end' | 'inline-start';
  children: ReactNode;
}) {
  return (
    <ButtonContext value={null}>
      <InputGroupAddon align={align}>{children}</InputGroupAddon>
    </ButtonContext>
  );
}
