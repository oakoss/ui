'use client';

import './Button.css';

import {
  Button as ButtonPrimitive,
  type ButtonProps as ButtonPrimitiveProps,
  composeRenderProps,
} from 'react-aria-components';

import { type Prettify } from '@/starters/react-aria-css/src/types/utils';

type ButtonVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'ghost'
  | 'link';

type ButtonSize = 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg';

type ButtonProps = Prettify<
  {
    /** The visual style of the button. @default "default" */
    variant?: ButtonVariant;
    /** The size of the button. @default "default" */
    size?: ButtonSize;
    /** Icon to display before the button content */
    iconLeft?: React.ReactNode;
    /** Icon to display after the button content */
    iconRight?: React.ReactNode;
  } & ButtonPrimitiveProps
>;

/**
 * Spinner component for loading state
 */
function Spinner({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`button-spinner ${className ?? ''}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="button-spinner-track"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="button-spinner-head"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        fill="currentColor"
      />
    </svg>
  );
}

function Button({
  variant = 'default',
  size = 'default',
  iconLeft,
  iconRight,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      {...props}
      className={`react-aria-Button button button-base ${className ?? ''}`}
      data-size={size}
      data-slot="button"
      data-variant={variant}
    >
      {composeRenderProps(children, (children, { isPending }) => (
        <>
          {isPending ? (
            <Spinner
              className={
                children || iconLeft || iconRight
                  ? 'button-spinner-absolute'
                  : undefined
              }
            />
          ) : (
            iconLeft
          )}
          <span
            className={
              isPending && !size?.startsWith('icon')
                ? 'button-content-hidden'
                : undefined
            }
          >
            {children}
          </span>
          {!isPending && iconRight}
        </>
      ))}
    </ButtonPrimitive>
  );
}

export { Button, Spinner };
export type { ButtonProps, ButtonSize, ButtonVariant };
