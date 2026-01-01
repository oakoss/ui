'use client';

import './Button.css';

import {
  Button as RACButton,
  type ButtonProps as RACButtonProps,
} from 'react-aria-components';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'ghost'
  | 'link';

type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  /** The visual style of the button. @default "primary" */
  variant?: ButtonVariant;
  /** The size of the button. @default "md" */
  size?: ButtonSize;
} & RACButtonProps;

function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <RACButton
      {...props}
      className={`react-aria-Button button button-base ${className ?? ''}`}
      data-size={size}
      data-variant={variant}
    />
  );
}

export { Button, type ButtonProps, type ButtonSize, type ButtonVariant };
