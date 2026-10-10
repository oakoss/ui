import { type ComponentProps, createContext, use } from 'react';
import {
  Link as AriaLink,
  type LinkProps as AriaLinkProps,
} from 'react-aria-components';
import { tv, type VariantProps } from 'tailwind-variants/lite';

import { cn, cx } from '#/lib/cx';

// Passed to the title link; `render` hands it to a router's own link.
export type ItemLinkProps = Pick<
  AriaLinkProps,
  'href' | 'rel' | 'render' | 'routerOptions' | 'target'
>;

export type ItemMediaProps = ComponentProps<'div'> &
  VariantProps<typeof mediaStyles>;

export type ItemProps = ComponentProps<'div'> &
  ItemLinkProps &
  VariantProps<typeof itemStyles>;

export type ItemTitleProps = {
  // A heading level makes the title a heading; by default it's text.
  level?: 1 | 2 | 3 | 4 | 5 | 6;
} & ComponentProps<'div'>;

// An ItemGroup's direct Items are its list items.
const ItemGroupContext = createContext(false);
const ItemLinkContext = createContext<ItemLinkProps | null>(null);

// A linked Item's title link covers the row, so the row's hover and focus
// follow the link's. In forced colors only the default look drops its box,
// so a plain list doesn't become a stack of rows.
const itemStyles = tv({
  base: [
    'relative flex w-full flex-wrap items-center rounded-control border text-sm transition-colors duration-100',
    'has-[[data-slot=item-title][data-hovered]]:bg-muted',
    'has-[[data-slot=item-title][data-focus-visible]]:outline-(length:--ring-width) has-[[data-slot=item-title][data-focus-visible]]:outline-offset-2 has-[[data-slot=item-title][data-focus-visible]]:outline-ring has-[[data-slot=item-title][data-focus-visible]]:outline-solid',
  ],
  defaultVariants: { size: 'md', variant: 'default' },
  variants: {
    size: {
      md: 'gap-3.5 px-4 py-3.5',
      sm: 'gap-2.5 px-3 py-2.5',
      xs: 'gap-2 px-2.5 py-2',
    },
    variant: {
      default: 'border-transparent forced-colors:border-[Canvas]',
      muted: 'border-transparent bg-muted/50',
      outline: 'border-border',
    },
  },
});

const mediaStyles = tv({
  base: 'flex shrink-0 items-center justify-center gap-2 group-has-data-[slot=item-description]/item:translate-y-0.5 group-has-data-[slot=item-description]/item:self-start [&_svg]:pointer-events-none',
  defaultVariants: { variant: 'default' },
  variants: {
    variant: {
      default: 'bg-transparent',
      icon: "[&_svg:not([class*='size-'])]:size-4",
      image:
        'size-10 overflow-hidden rounded-sm group-data-[size=sm]/item:size-8 group-data-[size=xs]/item:size-6 [&_img]:size-full [&_img]:object-cover',
    },
  },
});

// Items nested in this one, or in an overlay opened from it, aren't the
// group's list items, since React context crosses portals.
export function Item({
  children,
  className,
  href,
  rel,
  render,
  routerOptions,
  size = 'md',
  target,
  variant = 'default',
  ...props
}: ItemProps) {
  const isInGroup = use(ItemGroupContext);
  // An undefined href links nowhere, so it makes no link.
  const link =
    typeof href === 'string'
      ? { href, rel, render, routerOptions, target }
      : null;
  return (
    <ItemLinkContext value={link}>
      <div
        data-slot="item"
        {...props}
        className={cn('group/item', itemStyles({ size, variant }), className)}
        data-size={size}
        data-variant={variant}
        role={props.role ?? (isInGroup ? 'listitem' : undefined)}
      >
        <ItemGroupContext value={false}>{children}</ItemGroupContext>
      </div>
    </ItemLinkContext>
  );
}

// Sits above a linked Item's title link, so its controls stay pressable.
export function ItemActions({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-actions"
      {...props}
      className={cn('relative z-10 flex items-center gap-2', className)}
    />
  );
}

export function ItemContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="item-content"
      {...props}
      className={cn(
        'flex min-w-0 flex-1 flex-col gap-1 group-data-[size=xs]/item:gap-0 [&+[data-slot=item-content]]:flex-none',
        className,
      )}
    />
  );
}

// Links in the description sit above a linked Item's title link.
export function ItemDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot="item-description"
      {...props}
      className={cn(
        'line-clamp-2 text-start text-sm leading-normal font-normal text-muted-foreground group-data-[size=xs]/item:text-xs [&_a]:relative [&_a]:z-10 [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-primary-text',
        className,
      )}
    />
  );
}

// A list of Items: each direct Item is a list item.
export function ItemGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <ItemGroupContext value>
      <div
        data-slot="item-group"
        role="list"
        {...props}
        className={cn(
          'flex w-full flex-col gap-4 has-data-[size=sm]:gap-2.5 has-data-[size=xs]:gap-2',
          className,
        )}
      />
    </ItemGroupContext>
  );
}

// Decoration unless named: the title already says what the row is. A named
// media is an image.
export function ItemMedia({
  className,
  variant = 'default',
  ...props
}: ItemMediaProps) {
  const isNamed =
    (props['aria-label'] ?? '').trim() !== '' ||
    (props['aria-labelledby'] ?? '').trim() !== '';
  return (
    <div
      aria-hidden={isNamed ? undefined : true}
      role={isNamed ? 'img' : undefined}
      {...props}
      className={cn(mediaStyles({ variant }), className)}
      data-slot="item-media"
      data-variant={variant}
    />
  );
}

// A list allows only list items as children, so the line is hidden from
// screen readers; the Items already separate the rows.
export function ItemSeparator({ className, ...props }: ComponentProps<'hr'>) {
  return (
    <hr
      aria-hidden="true"
      data-slot="item-separator"
      {...props}
      className={cn('my-2 w-full shrink-0 border-t border-border', className)}
    />
  );
}

// A linked Item's title is its link, stretched over the row, so the link's
// name is the title alone and the row's controls stay valid outside it.
export function ItemTitle({
  children,
  className,
  level,
  ...props
}: ItemTitleProps) {
  const link = use(ItemLinkContext);
  const styles = 'line-clamp-1 text-sm leading-snug font-medium';
  const content = link ? (
    <AriaLink
      {...link}
      className={cx(
        'outline-none after:absolute after:inset-0 after:rounded-control',
      )}
      data-slot="item-title"
    >
      {children}
    </AriaLink>
  ) : (
    children
  );
  if (level !== undefined) {
    const Heading = `h${level}` as const;
    return (
      <Heading
        data-slot={link ? undefined : 'item-title'}
        {...props}
        className={cn(styles, className)}
      >
        {content}
      </Heading>
    );
  }
  return (
    <div
      data-slot={link ? undefined : 'item-title'}
      {...props}
      className={cn(styles, className)}
    >
      {content}
    </div>
  );
}
