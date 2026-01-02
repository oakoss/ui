import { ChevronDown } from 'lucide-react';

/**
 * Icon components mapped from lucide-react.
 * Swap this file to change icon libraries without updating components.
 *
 * @example
 * import { Icons } from '@/components/ui/icons';
 * <Icons.ChevronDown className="size-4" />
 */
export const Icons = {
  ChevronDown: ChevronDown,
} as const;

export type IconName = keyof typeof Icons;
export type IconProps = React.ComponentProps<(typeof Icons)[IconName]>;
