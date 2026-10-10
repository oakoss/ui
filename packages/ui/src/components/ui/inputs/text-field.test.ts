import { expect, test } from 'vitest';

import type { InputProps } from '#/components/ui/inputs/input';
import type {
  TextareaFieldProps,
  TextFieldProps,
} from '#/components/ui/inputs/text-field';
import type { TextareaProps } from '#/components/ui/inputs/textarea';

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('children and the layout props are exclusive', () => {
  const valid: TextFieldProps[] = [
    {},
    { description: 'Shown below', label: 'Email', size: 'sm' },
    { children: 'Custom' },
    { children: undefined, label: 'Email' },
  ];
  const mixed: TextFieldProps[] = [
    // @ts-expect-error children replace the layout
    { children: 'Custom', label: 'Email' },
    // @ts-expect-error children replace the layout
    { children: 'Custom', description: 'Shown below' },
    // @ts-expect-error children replace the layout
    { children: 'Custom', size: 'sm' },
    // @ts-expect-error children replace the layout
    { children: 'Custom', errors: [] },
  ];
  // @ts-expect-error empty children would render no input
  const empty: TextFieldProps = { children: null };
  expect([...valid, ...mixed, empty]).toHaveLength(9);
});

test("TextareaField's children and layout props are exclusive", () => {
  const valid: TextareaFieldProps[] = [
    { label: 'Bio', maxRows: 8, minRows: 2 },
    { children: 'Custom' },
  ];
  const mixed: TextareaFieldProps[] = [
    // @ts-expect-error children replace the layout
    { children: 'Custom', minRows: 2 },
    // @ts-expect-error children replace the layout
    { autoGrow: false, children: 'Custom' },
  ];
  expect([...valid, ...mixed]).toHaveLength(4);
});

test('each field takes only its own control props', () => {
  // @ts-expect-error rows belong to TextareaField
  const rows: TextFieldProps = { minRows: 2 };
  // @ts-expect-error an input's type has no textarea counterpart
  const type: TextareaFieldProps = { type: 'email' };
  // @ts-expect-error nor does its pattern
  const pattern: TextareaFieldProps = { pattern: '[a-z]+' };
  expect([rows, type, pattern]).toHaveLength(3);
});

test("Textarea's minRows replaces rows", () => {
  const valid: TextareaProps[] = [{ minRows: 2 }, { maxRows: 6 }];
  // @ts-expect-error minRows sets the starting rows
  const rows: TextareaProps = { rows: 4 };
  expect([...valid, rows]).toHaveLength(3);
});

test("Input's size is the control height", () => {
  const valid: InputProps[] = [{ size: 'sm' }, { size: 'lg' }];
  // @ts-expect-error HTML's character-width size
  const htmlSize: InputProps = { size: 20 };
  expect([...valid, htmlSize]).toHaveLength(3);
});
