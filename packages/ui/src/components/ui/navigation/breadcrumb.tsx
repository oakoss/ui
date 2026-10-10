import { type ComponentProps, useId } from 'react';
import {
  Breadcrumb as AriaBreadcrumb,
  type BreadcrumbProps as AriaBreadcrumbProps,
  Breadcrumbs as AriaBreadcrumbs,
  type BreadcrumbsProps as AriaBreadcrumbsProps,
  Link as AriaLink,
  type LinkProps as AriaLinkProps,
  BreadcrumbsContext,
  composeRenderProps,
} from 'react-aria-components';

import * as Icon from '#/components/icons';
import { cn, cx } from '#/lib/cx';

export type BreadcrumbItemProps = {
  separatorClassName?: string;
} & AriaBreadcrumbProps;

// The list's id names the nav, so it isn't the consumer's to set.
export type BreadcrumbListProps<T> = Omit<AriaBreadcrumbsProps<T>, 'id'>;

// Links show the outline only on keyboard focus: an outline at rest, which
// forced colors paint, would box every crumb.
const linkStyles =
  'rounded-xs outline-none transition-colors focus-visible:outline-(length:--ring-width) focus-visible:outline-offset-2 focus-visible:outline-ring focus-visible:outline-solid';

// The nav takes the name React Aria gives the list, translated, unless the
// consumer names it.
export function Breadcrumb({ children, ...props }: ComponentProps<'nav'>) {
  const listId = useId();
  const isNamed =
    (props['aria-label'] ?? '').trim() !== '' ||
    (props['aria-labelledby'] ?? '').trim() !== '';
  return (
    <nav
      data-slot="breadcrumb"
      {...props}
      aria-labelledby={isNamed ? props['aria-labelledby'] : listId}
    >
      <BreadcrumbsContext value={{ id: listId }}>{children}</BreadcrumbsContext>
    </nav>
  );
}

export function BreadcrumbEllipsis({
  className,
  ...props
}: ComponentProps<'span'>) {
  return (
    <span
      aria-hidden="true"
      data-slot="breadcrumb-ellipsis"
      {...props}
      className={cn(
        'flex size-5 items-center justify-center [&>svg]:size-4',
        className,
      )}
    >
      <Icon.Ellipsis />
    </span>
  );
}

export function BreadcrumbItem({
  children,
  className,
  separatorClassName,
  ...props
}: BreadcrumbItemProps) {
  return (
    <AriaBreadcrumb
      data-slot="breadcrumb-item"
      {...props}
      className={cx('inline-flex items-center gap-1.5', className)}
    >
      {composeRenderProps(children, (value, { isCurrent }) => (
        <>
          {value}
          {!isCurrent && (
            <span
              aria-hidden="true"
              className={cn('[&>svg]:size-3.5', separatorClassName)}
              data-slot="breadcrumb-separator"
            >
              <Icon.ChevronRight className="rtl:rotate-180" />
            </span>
          )}
        </>
      ))}
    </AriaBreadcrumb>
  );
}

export function BreadcrumbLink({ className, ...props }: AriaLinkProps) {
  return (
    <AriaLink
      data-slot="breadcrumb-link"
      {...props}
      className={cx(
        [
          linkStyles,
          'hover:text-foreground disabled:not-current:opacity-50 current:text-foreground',
        ],
        className,
      )}
    />
  );
}

export function BreadcrumbList<T extends object>({
  className,
  ...props
}: BreadcrumbListProps<T>) {
  return (
    <AriaBreadcrumbs
      data-slot="breadcrumb-list"
      {...props}
      className={cn(
        'flex flex-wrap items-center gap-1.5 text-sm wrap-break-word text-muted-foreground sm:gap-2.5',
        className,
      )}
    />
  );
}

// React Aria marks the last item's link as the current page and disables it.
export function BreadcrumbPage({ className, ...props }: AriaLinkProps) {
  return (
    <AriaLink
      data-slot="breadcrumb-page"
      {...props}
      className={cx([linkStyles, 'font-normal text-foreground'], className)}
    />
  );
}
