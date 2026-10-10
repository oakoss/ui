import type { CSSProperties } from 'react';

import {
  TextArea as AriaTextArea,
  type TextAreaProps as AriaTextAreaProps,
  composeRenderProps,
} from 'react-aria-components';
import { tv } from 'tailwind-variants/lite';

import type { InputSize } from '#/components/ui/inputs/field';

import { cx } from '#/lib/cx';
import { fieldControl } from '#/lib/recipes';

// One row is exactly an Input of the same size, with its text on the same
// line. Auto-grow hides the resize handle where it works, since a drag fixes
// the height; browsers without it keep preflight's vertical handle to grow the
// box.
const styles = tv({
  base: [
    fieldControl,
    // Without maxRows its variable is unset, so max-h computes to none.
    'max-h-[calc(var(--textarea-height)+(var(--textarea-max-rows)-1)*1lh)] min-h-[calc(var(--textarea-height)+(var(--textarea-min-rows)-1)*1lh)] py-[calc((var(--textarea-height)-1lh-2px)/2)] disabled:resize-none',
  ],
  defaultVariants: { autoGrow: true, size: 'md' },
  variants: {
    autoGrow: {
      false: '',
      true: 'field-sizing-content supports-[field-sizing:content]:resize-none',
    },
    size: {
      lg: '[--textarea-height:var(--spacing-control-lg)]',
      md: '[--textarea-height:var(--spacing-control)]',
      sm: '[--textarea-height:var(--spacing-control-sm)]',
    },
  },
});

export type TextareaProps = {
  autoGrow?: boolean;
  maxRows?: number;
  minRows?: number;
  size?: InputSize;
} & Omit<AriaTextAreaProps, 'rows'>;

export function Textarea({
  autoGrow = true,
  className,
  maxRows,
  minRows = 3,
  size = 'md',
  style,
  ...props
}: TextareaProps) {
  return (
    <AriaTextArea
      className={cx(styles({ autoGrow, size }), className)}
      data-size={size}
      data-slot="textarea"
      {...props}
      // A fixed or non-growing box takes its height from rows, whose HTML
      // default of 2 would beat a smaller minRows.
      rows={minRows}
      style={composeRenderProps(
        style,
        (value) =>
          ({
            '--textarea-max-rows': maxRows,
            '--textarea-min-rows': minRows,
            ...value,
          }) as CSSProperties,
      )}
    />
  );
}
