import type { ComponentProps } from 'react';

import {
  Link as AriaLink,
  type LinkProps as AriaLinkProps,
} from 'react-aria-components';

import * as Icon from '#/components/icons';
import {
  type ButtonStyleProps,
  buttonStyles,
} from '#/components/ui/inputs/button';
import { cn, cx } from '#/lib/cx';

export type PaginationEllipsisProps = {
  label?: string;
} & ComponentProps<'span'>;

export type PaginationLinkProps = {
  isActive?: boolean;
  // Names a page link from its text, "Page 2" from 2.
  pageLabel?: (page: string) => string;
  size?: ButtonStyleProps['size'];
} & AriaLinkProps;

export type PaginationProps = { label?: string } & Omit<
  ComponentProps<'nav'>,
  'aria-label'
>;

export type PaginationStepProps = { text?: string } & Omit<
  PaginationLinkProps,
  'children' | 'isActive' | 'pageLabel'
>;

// The current page is marked by weight and a 3:1 border, not color alone. In
// forced colors it takes the system's selection colors and opts out of the
// text backplate that would hide its number, so it sets its focus outline too.
const current =
  'current:border-input current:font-semibold forced-colors:current:border-[Highlight] forced-colors:current:bg-[Highlight] forced-colors:current:bg-none forced-colors:current:text-[HighlightText] forced-colors:current:focus-visible:outline-[Highlight] forced-colors:current:forced-color-adjust-none';

export function Pagination({
  className,
  label = 'Pagination',
  ...props
}: PaginationProps) {
  return (
    <nav
      data-slot="pagination"
      {...props}
      aria-label={label.trim() === '' ? undefined : label}
      className={cn('mx-auto flex w-full justify-center', className)}
    />
  );
}

export function PaginationContent({
  className,
  ...props
}: ComponentProps<'ul'>) {
  return (
    <ul
      data-slot="pagination-content"
      {...props}
      className={cn('flex items-center gap-2', className)}
    />
  );
}

export function PaginationEllipsis({
  className,
  label = 'More pages',
  ...props
}: PaginationEllipsisProps) {
  return (
    <span
      data-slot="pagination-ellipsis"
      {...props}
      className={cn(
        "flex size-control items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
    >
      <Icon.Ellipsis />
      {label.trim() === '' ? null : <span className="sr-only">{label}</span>}
    </span>
  );
}

export function PaginationItem(props: ComponentProps<'li'>) {
  return <li data-slot="pagination-item" {...props} />;
}

export function PaginationLink({
  children,
  className,
  isActive = false,
  pageLabel = defaultPageLabel,
  size = 'icon',
  ...props
}: PaginationLinkProps) {
  const isNamed =
    (props['aria-label'] ?? '').trim() !== '' ||
    (props['aria-labelledby'] ?? '').trim() !== '';
  const page =
    typeof children === 'string' || typeof children === 'number'
      ? String(children)
      : undefined;
  return (
    <AriaLink
      aria-current={isActive ? 'page' : undefined}
      data-slot="pagination-link"
      {...props}
      aria-label={
        isNamed || page === undefined ? props['aria-label'] : pageLabel(page)
      }
      className={cx(
        [
          buttonStyles({
            intent: 'neutral',
            size,
            variant: isActive ? 'outline' : 'ghost',
          }),
          current,
        ],
        className,
      )}
    >
      {children}
    </AriaLink>
  );
}

// The text is the name, so on small screens it's hidden visually but still
// read, and the link takes an icon button's size, chevron centered.
export function PaginationNext({
  className,
  text = 'Next',
  ...props
}: PaginationStepProps) {
  return (
    <PaginationLink
      rel="next"
      size="md"
      {...props}
      className={cx('max-sm:size-control max-sm:has-data-icon:px-0', className)}
    >
      <span className="max-sm:sr-only">{text}</span>
      <Icon.ChevronRight className="rtl:rotate-180" data-icon="inline-end" />
    </PaginationLink>
  );
}

export function PaginationPrevious({
  className,
  text = 'Previous',
  ...props
}: PaginationStepProps) {
  return (
    <PaginationLink
      rel="prev"
      size="md"
      {...props}
      className={cx('max-sm:size-control max-sm:has-data-icon:px-0', className)}
    >
      <Icon.ChevronLeft className="rtl:rotate-180" data-icon="inline-start" />
      <span className="max-sm:sr-only">{text}</span>
    </PaginationLink>
  );
}

function defaultPageLabel(page: string) {
  return `Page ${page}`;
}
