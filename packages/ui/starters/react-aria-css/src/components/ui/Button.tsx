'use client';

import {
  Button as RACButton,
  type ButtonProps as RACButtonProps,
} from 'react-aria-components';
import './Button.css';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'ghost'
  | 'link';

type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends RACButtonProps {
  /** The visual style of the button. @default "primary" */
  variant?: ButtonVariant;
  /** The size of the button. @default "md" */
  size?: ButtonSize;
}

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
      data-variant={variant}
      data-size={size}
    />
  );
}

export { Button, type ButtonProps, type ButtonVariant, type ButtonSize };
