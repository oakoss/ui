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

type LayoutProps = {
  enterKeyHint?: InputHTMLAttributes<HTMLInputElement>['enterKeyHint'];
  placeholder?: string;
  size?: InputSize;
} & FieldMessages &
  InputGroupSlots;

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

// The span keeps the button, disabled in a read-only field, from fading the
// whole InputGroup.
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
