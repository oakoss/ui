import {
  ToggleButton as AriaToggleButton,
  type ToggleButtonProps as AriaToggleButtonProps,
} from 'react-aria-components';

import {
  type ButtonSizeProps,
  type ButtonStyleProps,
  buttonStyles,
} from '#/components/ui/inputs/button';
import { cn, cx } from '#/lib/cx';

export type ToggleProps = {
  // A 44px hit area; turn it off where toggles sit closer than that, as in a
  // toolbar, or neighbors take each other's clicks.
  targetSize?: boolean;
  variant?: ToggleVariant;
} & AriaToggleButtonProps &
  ButtonSizeProps;

export type ToggleStyleProps = {
  className?: string;
  size?: ButtonStyleProps['size'];
  targetSize?: boolean;
  variant?: ToggleVariant;
};

export type ToggleVariant = Extract<
  ButtonStyleProps['variant'],
  'ghost' | 'outline'
>;

// Forced colors' text backplate would hide the selected label, so a selected
// toggle opts out and sets the system colors, focus outline included, itself.
const selected =
  'selected:border-transparent selected:bg-(--btn-bg) selected:text-(--btn-fg) forced-colors:selected:border-[Highlight] forced-colors:selected:bg-[Highlight] forced-colors:selected:bg-none forced-colors:selected:text-[HighlightText] forced-colors:selected:focus-visible:outline-[Highlight] forced-colors:selected:forced-color-adjust-none';

export function Toggle({
  className,
  size = 'md',
  targetSize = true,
  variant = 'ghost',
  ...props
}: ToggleProps) {
  return (
    <AriaToggleButton
      data-slot="toggle"
      {...props}
      className={cx(toggleStyles({ size, targetSize, variant }), className)}
      data-size={size}
      data-variant={variant}
    />
  );
}

export function toggleStyles({
  className,
  size = 'md',
  targetSize = true,
  variant = 'ghost',
}: ToggleStyleProps = {}): string {
  return cn(
    buttonStyles({ intent: 'neutral', size, targetSize, variant }),
    selected,
    className,
  );
}
