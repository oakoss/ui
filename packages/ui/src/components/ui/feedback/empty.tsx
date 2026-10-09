import type { ComponentProps } from 'react';

import { tv } from 'tailwind-variants/lite';

import { cn } from '#/lib/cx';

export type EmptyMediaProps = {
  variant?: 'default' | 'icon';
} & ComponentProps<'div'>;

export type EmptyTitleProps = {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
} & ComponentProps<'h3'>;

const mediaStyles = tv({
  base: 'mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0',
  variants: {
    variant: {
      default: 'bg-transparent',
      // Forced colors repaint the fill as the page color; the transparent
      // border keeps the tile's outline.
      icon: 'size-10 rounded-lg border border-transparent bg-muted text-foreground [&_svg:not([class*=size-])]:size-6',
    },
  },
});

export function Empty({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex w-full min-w-0 flex-1 flex-col items-center justify-center gap-4 rounded-lg border-dashed p-12 text-center text-balance',
        className,
      )}
      data-slot="empty"
      {...props}
    />
  );
}

export function EmptyContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance',
        className,
      )}
      data-slot="empty-content"
      {...props}
    />
  );
}

export function EmptyDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'text-sm/relaxed text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-foreground',
        className,
      )}
      data-slot="empty-description"
      {...props}
    />
  );
}

export function EmptyHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex max-w-sm flex-col items-center gap-2', className)}
      data-slot="empty-header"
      {...props}
    />
  );
}

// Decoration unless named: the title already says what's empty. A named
// media is an image.
export function EmptyMedia({
  className,
  variant = 'default',
  ...props
}: EmptyMediaProps) {
  const isNamed =
    (props['aria-label'] ?? '').trim() !== '' ||
    (props['aria-labelledby'] ?? '').trim() !== '';
  return (
    <div
      aria-hidden={isNamed ? undefined : true}
      role={isNamed ? 'img' : undefined}
      {...props}
      className={cn(mediaStyles({ variant }), className)}
      data-slot="empty-media"
      data-variant={variant}
    />
  );
}

export function EmptyTitle({
  className,
  level = 3,
  ...props
}: EmptyTitleProps) {
  const Heading = `h${level}` as const;
  return (
    <Heading
      className={cn(
        'font-heading text-lg font-medium tracking-tight',
        className,
      )}
      data-slot="empty-title"
      {...props}
    />
  );
}
