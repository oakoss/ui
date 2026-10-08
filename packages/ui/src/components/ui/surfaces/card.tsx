import type { ComponentProps } from 'react';

import { tv } from 'tailwind-variants/lite';

import { cn } from '#/lib/cx';

// The parts read the nearest card's spacing and title size from variables,
// so a card nested in a card of another size keeps its own.
const styles = tv({
  // The transparent border is what forced colors repaint; the ring isn't.
  base: 'flex flex-col gap-(--card-spacing) overflow-hidden rounded-panel border border-transparent bg-card py-(--card-spacing) text-sm text-card-foreground shadow-xs ring-1 ring-foreground/10 has-[>img:first-child]:pt-0 *:[img:last-child]:rounded-b-panel',
  variants: {
    size: {
      md: '[--card-spacing:var(--spacing-panel)] [--card-title-size:var(--text-base)]',
      sm: '[--card-spacing:var(--spacing-popover)] [--card-title-size:var(--text-sm)]',
    },
  },
});

export type CardProps = { size?: 'md' | 'sm' } & ComponentProps<'div'>;

export type CardTitleProps = {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
} & ComponentProps<'h3'>;

export function Card({ className, size = 'md', ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      {...props}
      className={cn(styles({ size }), className)}
      data-size={size}
    />
  );
}

export function CardAction({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
        className,
      )}
      data-slot="card-action"
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('px-(--card-spacing)', className)}
      data-slot="card-content"
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      className={cn('text-sm text-muted-foreground', className)}
      data-slot="card-description"
      {...props}
    />
  );
}

export function CardFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex items-center px-(--card-spacing) [.border-t]:pt-(--card-spacing)',
        className,
      )}
      data-slot="card-footer"
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        // CardAction's col-start-2 adds an implicit auto column beside this one.
        'grid auto-rows-min grid-cols-1 items-start gap-1 px-(--card-spacing) [.border-b]:pb-(--card-spacing)',
        className,
      )}
      data-slot="card-header"
      {...props}
    />
  );
}

export function CardTitle({ className, level = 3, ...props }: CardTitleProps) {
  const Heading = `h${level}` as const;
  return (
    <Heading
      className={cn(
        'font-heading text-(length:--card-title-size) leading-normal font-medium',
        className,
      )}
      data-slot="card-title"
      {...props}
    />
  );
}
