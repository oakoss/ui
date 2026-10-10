import { type ReactNode, useId } from 'react';
import {
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
} from 'react-aria-components';

import {
  fieldLayout,
  type FieldMessages,
  isEmptyNode,
  type Shortcut,
} from '#/components/ui/inputs/field';
import { Input, type InputSize } from '#/components/ui/inputs/input';
import {
  InputGroup,
  InputGroupAddon,
  type InputGroupAddonProps,
  InputGroupText,
} from '#/components/ui/inputs/input-group';
import { Textarea, type TextareaProps } from '#/components/ui/inputs/textarea';
import { cx } from '#/lib/cx';

export type TextareaFieldProps = Omit<
  AriaTextFieldProps,
  'children' | 'pattern' | 'type'
> &
  Shortcut<
    LayoutProps & Pick<TextareaProps, 'autoGrow' | 'maxRows' | 'minRows'>
  >;

export type TextFieldProps = Omit<AriaTextFieldProps, 'children'> &
  Shortcut<LayoutProps>;

type Align = NonNullable<InputGroupAddonProps['align']>;

type Decorations = Pick<LayoutProps, 'end' | 'start'>;

type LayoutProps = {
  // Inside the border, before and after the text. Text describes the field;
  // an element is decoration unless it names itself.
  end?: ReactNode;
  placeholder?: string;
  size?: InputSize;
  start?: ReactNode;
} & FieldMessages;

export function TextareaField({
  autoGrow,
  children,
  className,
  description,
  end,
  errorMessage,
  errors,
  label,
  maxRows,
  minRows,
  placeholder,
  size,
  start,
  ...props
}: TextareaFieldProps) {
  const decorated = useDecorations({ end, start }, props['aria-describedby']);
  return (
    <AriaTextField
      {...props}
      aria-describedby={decorated.describedBy}
      className={cx('flex flex-col gap-2', className)}
      data-slot="textarea-field"
    >
      {children ??
        fieldLayout(
          decorated.around(
            <Textarea
              autoGrow={autoGrow}
              maxRows={maxRows}
              minRows={minRows}
              placeholder={placeholder}
              size={size}
            />,
            size,
            ['block-start', 'block-end'],
          ),
          { description, errorMessage, errors, label },
        )}
    </AriaTextField>
  );
}

export function TextField({
  children,
  className,
  description,
  end,
  errorMessage,
  errors,
  label,
  placeholder,
  size,
  start,
  ...props
}: TextFieldProps) {
  const decorated = useDecorations({ end, start }, props['aria-describedby']);
  return (
    <AriaTextField
      {...props}
      aria-describedby={decorated.describedBy}
      className={cx('flex flex-col gap-2', className)}
      data-slot="text-field"
    >
      {children ??
        fieldLayout(
          decorated.around(
            <Input placeholder={placeholder} size={size} />,
            size,
            ['inline-start', 'inline-end'],
          ),
          { description, errorMessage, errors, label },
        )}
    </AriaTextField>
  );
}

function isText(node: ReactNode) {
  return typeof node === 'string' || typeof node === 'number';
}

// React Aria appends a field's own aria-describedby after its description
// and error ids, so text decorations are read last.
function useDecorations({ end, start }: Decorations, describedBy?: string) {
  const startId = useId();
  const endId = useId();
  const slots = [
    { id: startId, node: start },
    { id: endId, node: end },
  ].filter(({ node }) => !isEmptyNode(node));
  return {
    around(
      control: ReactNode,
      size: InputSize | undefined,
      [startAlign, endAlign]: [Align, Align],
    ) {
      if (slots.length === 0) return control;
      const addon = (node: ReactNode, id: string, align: typeof startAlign) =>
        isEmptyNode(node) ? null : (
          <InputGroupAddon align={align}>
            {isText(node) ? (
              <InputGroupText id={id}>{node}</InputGroupText>
            ) : (
              node
            )}
          </InputGroupAddon>
        );
      return (
        <InputGroup size={size}>
          {addon(start, startId, startAlign)}
          {control}
          {addon(end, endId, endAlign)}
        </InputGroup>
      );
    },
    describedBy:
      [
        describedBy,
        ...slots.filter(({ node }) => isText(node)).map(({ id }) => id),
      ]
        .filter(Boolean)
        .join(' ') || undefined,
  };
}
