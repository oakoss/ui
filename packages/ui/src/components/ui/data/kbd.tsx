import type { ComponentProps } from 'react';

import { Keyboard, KeyboardContext } from 'react-aria-components';

import { cn } from '#/lib/cx';

export type KbdProps = {
  // What screen readers say for a glyph ("Command" for ⌘).
  label?: string;
} & ComponentProps<'kbd'>;

// Forced colors repaint the fill as the page color; the transparent border
// keeps the key's outline.
export function Kbd({ children, className, label, ...props }: KbdProps) {
  return (
    <Keyboard
      className={cn(
        'pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-sm border border-transparent bg-muted px-1 font-sans text-xs font-medium text-muted-foreground select-none in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background dark:in-data-[slot=tooltip-content]:bg-background/10 [&_svg:not([class*=size-])]:size-3',
        className,
      )}
      data-slot="kbd"
      {...props}
    >
      {label === undefined || label === '' ? (
        children
      ) : (
        <>
          <span aria-hidden="true">{children}</span>
          <span className="sr-only">{label}</span>
        </>
      )}
    </Keyboard>
  );
}

// A menu item gives its shortcut an id through KeyboardContext; the group
// takes it and its keys get none, so ids stay unique and the item's
// description reads the whole shortcut.
export function KbdGroup({
  children,
  className,
  ...props
}: ComponentProps<'kbd'>) {
  return (
    <Keyboard
      className={cn('inline-flex items-center gap-1', className)}
      data-slot="kbd-group"
      {...props}
    >
      <KeyboardContext value={{}}>{children}</KeyboardContext>
    </Keyboard>
  );
}
