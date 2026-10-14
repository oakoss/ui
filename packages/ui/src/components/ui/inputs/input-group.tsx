import {
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
  useId,
} from 'react';
import {
  Group as AriaGroup,
  type GroupProps as AriaGroupProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants/lite';

import type { InputSize } from '#/components/ui/inputs/input';

import {
  Button,
  type ButtonProps,
  ButtonStyleContext,
} from '#/components/ui/inputs/button';
import { fieldLayout, type FieldMessages } from '#/components/ui/inputs/field';
import { cn, cx } from '#/lib/cx';
import { isEmptyNode } from '#/lib/empty-node';

// The group draws the control's border and focus outline, so the Input or
// Textarea inside drops its own and fills the space between the addons.
const groupStyles = tv({
  base: [
    'group/input-group relative flex w-full min-w-0 items-center rounded-control border border-input bg-field text-ui transition-colors',
    'has-[>input:focus,>textarea:focus]:outline-(length:--ring-width) has-[>input:focus,>textarea:focus]:outline-offset-2 has-[>input:focus,>textarea:focus]:outline-ring has-[>input:focus,>textarea:focus]:outline-solid',
    'has-[>:disabled]:opacity-50 has-[>[aria-invalid=true]]:border-destructive-text data-invalid:border-destructive-text',
    'has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto',
    '[&>:is(input,textarea)]:flex-1 [&>:is(input,textarea)]:self-stretch [&>:is(input,textarea)]:rounded-none [&>:is(input,textarea)]:border-0 [&>:is(input,textarea)]:bg-transparent [&>:is(input,textarea):disabled]:opacity-100 [&>:is(input,textarea):focus]:outline-none [&>input]:h-auto',
    'has-[>[data-align=inline-end]]:[&>input]:pe-2 has-[>[data-align=inline-start]]:[&>input]:ps-2',
  ],
  defaultVariants: { size: 'md' },
  variants: {
    size: { lg: 'h-control-lg', md: 'h-control', sm: 'h-control-sm' },
  },
});

const addonStyles = tv({
  base: "flex cursor-text items-center gap-2 text-sm font-medium text-muted-foreground select-none [&>svg:not([class*='size-'])]:size-4",
  defaultVariants: { align: 'inline-start' },
  variants: {
    align: {
      'block-end': 'order-last w-full justify-start px-control-x pb-2',
      'block-start': 'order-first w-full justify-start px-control-x pt-2',
      'inline-end': 'order-last pe-control-x has-[>button]:pe-0.5',
      'inline-start': 'order-first ps-control-x has-[>button]:ps-0.5',
    },
  },
});

export type InputGroupAddonProps = {
  align?: 'block-end' | 'block-start' | 'inline-end' | 'inline-start';
} & ComponentProps<'div'>;

export type InputGroupProps = { size?: InputSize } & Omit<
  AriaGroupProps,
  'role'
>;

export type InputGroupSlots = {
  // Inside the border, before and after the control. Text describes the
  // field; an element is decoration unless it names itself.
  end?: ReactNode;
  start?: ReactNode;
};

// Takes the decorations useFieldShortcut returns, which carry the ids that
// describe the field.
export function DecoratedInputGroup({
  axis,
  children,
  end,
  size,
  start,
}: {
  axis: 'block' | 'inline';
  children: ReactNode;
  size?: InputSize;
} & InputGroupSlots) {
  return (
    <InputGroup size={size}>
      {isEmptyNode(start) ? null : (
        <InputGroupAddon align={`${axis}-start`}>{start}</InputGroupAddon>
      )}
      {children}
      {isEmptyNode(end) ? null : (
        <InputGroupAddon align={`${axis}-end`}>{end}</InputGroupAddon>
      )}
    </InputGroup>
  );
}

// A named group is announced as one; an unnamed one only lays out its
// children. Inside a React Aria field it takes the field's invalid and
// disabled state. Clicking an addon focuses the control, unless the click
// lands on something interactive of its own.
export function InputGroup({
  className,
  onClick,
  size = 'md',
  ...props
}: InputGroupProps) {
  const isNamed =
    (props['aria-label'] ?? '').trim() !== '' ||
    (props['aria-labelledby'] ?? '').trim() !== '';
  function focusControl(event: MouseEvent<HTMLDivElement>) {
    onClick?.(event);
    const { currentTarget, defaultPrevented, target } = event;
    if (
      defaultPrevented ||
      !(target instanceof Element) ||
      !target.closest('[data-slot=input-group-addon]') ||
      target.closest(
        'a, button, input, label, select, textarea, [contenteditable], [tabindex]:not([tabindex="-1"]), [role=button], [role=checkbox], [role=link], [role=switch]',
      )
    ) {
      return;
    }
    currentTarget
      .querySelector<HTMLElement>(':scope > input, :scope > textarea')
      ?.focus();
  }
  return (
    <AriaGroup
      data-slot="input-group"
      {...props}
      className={cx(groupStyles({ size }), className)}
      data-size={size}
      onClick={focusControl}
      role={isNamed ? 'group' : 'presentation'}
    />
  );
}

// Buttons inside are small and ghost, with no 44px hit area, which would
// spill over the control.
export function InputGroupAddon({
  align = 'inline-start',
  className,
  ...props
}: InputGroupAddonProps) {
  return (
    <ButtonStyleContext
      value={{ size: 'sm', targetSize: false, variant: 'ghost' }}
    >
      <div
        data-slot="input-group-addon"
        {...props}
        className={cn(addonStyles({ align }), className)}
        data-align={align}
      />
    </ButtonStyleContext>
  );
}

export function InputGroupButton(props: ButtonProps) {
  return <Button data-slot="input-group-button" {...props} />;
}

export function InputGroupText({
  className,
  ...props
}: ComponentProps<'span'>) {
  return (
    <span
      data-slot="input-group-text"
      {...props}
      className={cn(
        "flex items-center gap-2 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
    />
  );
}

// Text decorations' ids join the field's own aria-describedby, which React
// Aria appends after the description and error; on the input they'd replace
// them. The caller places decorations, in a DecoratedInputGroup or its own
// control.
export function useFieldShortcut<Props extends { 'aria-describedby'?: string }>(
  { end, start, ...messages }: FieldMessages & InputGroupSlots,
  props: Props,
) {
  const startId = useId();
  const endId = useId();
  const before = decoration(start, startId);
  const after = decoration(end, endId);
  return {
    decorations: { end: after.node, start: before.node },
    fieldProps: {
      ...props,
      'aria-describedby':
        [props['aria-describedby'], before.id, after.id]
          .filter(Boolean)
          .join(' ') || undefined,
    },
    isUndecorated: before.node === null && after.node === null,
    layout: (control: ReactNode) => fieldLayout(control, messages),
  };
}

function decoration(
  node: ReactNode,
  id: string,
): { id?: string; node: ReactNode } {
  if (isEmptyNode(node)) return { node: null };
  if (typeof node !== 'string' && typeof node !== 'number') return { node };
  return { id, node: <InputGroupText id={id}>{node}</InputGroupText> };
}
