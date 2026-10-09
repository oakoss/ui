import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  Input,
} from '@oakoss/ui/components/ui/inputs/field';
import { TextField } from '@oakoss/ui/components/ui/inputs/text-field';
import { expect } from 'storybook/test';

import { part } from '../parts';

const meta = { component: Field, title: 'Inputs/Field/Layout' } satisfies Meta<
  typeof Field
>;

export default meta;

type Story = StoryObj<typeof meta>;

function box(slot: string) {
  return part(slot).getBoundingClientRect();
}

// Inside a React Aria field, Field only lays out: no role, so it adds no
// unnamed group, and the field still wires its label and description. Its
// children stack full width.
export const Vertical: Story = {
  play: async ({ canvas, canvasElement }) => {
    const field = part('field');
    await expect(field).not.toHaveAttribute('role');
    await expect(field).toHaveAttribute('data-orientation', 'vertical');
    await expect(
      canvas.getByRole('textbox', { name: 'Workspace' }),
    ).toHaveAccessibleDescription('Shown in the sidebar.');
    await expect(box('input').width).toBe(field.clientWidth);
    await expect(box('input').top).toBeGreaterThan(box('field-label').bottom);
    await expect(canvasElement.querySelector('[role=group]')).toBeNull();
  },
  render: () => (
    <TextField>
      <Field className="w-80">
        <FieldLabel>Workspace</FieldLabel>
        <Input />
        <FieldDescription>Shown in the sidebar.</FieldDescription>
      </Field>
    </TextField>
  ),
};

// Side by side, the content takes the free space and the control keeps its
// own width; a FieldContent column lines the row up at its top.
export const Horizontal: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('textbox', { name: 'Seats' }),
    ).toHaveAccessibleDescription('Billed per month.');
    const content = box('field-content');
    const input = box('input');
    await expect(Math.round(input.top)).toBe(Math.round(content.top));
    await expect(content.right).toBeLessThanOrEqual(input.left);
    await expect(content.width).toBeGreaterThan(input.width);
  },
  render: () => (
    <TextField>
      <Field className="w-96" orientation="horizontal">
        <FieldContent>
          <FieldLabel>Seats</FieldLabel>
          <FieldDescription>Billed per month.</FieldDescription>
        </FieldContent>
        <Input className="w-24" />
      </Field>
    </TextField>
  ),
};

function nameField() {
  return (
    <TextField>
      <Field orientation="responsive">
        <FieldLabel>Name</FieldLabel>
        <Input />
      </Field>
    </TextField>
  );
}

function responsive(width: string) {
  return <FieldGroup className={width}>{nameField()}</FieldGroup>;
}

// A responsive field sits in a row once its FieldGroup is at least 28rem
// wide, and stacks below that; outside a FieldGroup it always stacks.
export const ResponsiveWide: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('textbox', { name: 'Name' })).toBeVisible();
    await expect(Math.round(box('input').top)).toBeLessThan(
      Math.round(box('field-label').bottom),
    );
  },
  render: () => responsive('w-120'),
};

export const ResponsiveNarrow: Story = {
  play: async () => {
    await expect(box('input').top).toBeGreaterThanOrEqual(
      box('field-label').bottom,
    );
  },
  render: () => responsive('w-80'),
};

export const ResponsiveAlone: Story = {
  play: async () => {
    await expect(box('input').top).toBeGreaterThanOrEqual(
      box('field-label').bottom,
    );
  },
  render: () => <div className="w-120">{nameField()}</div>,
};

// The text sits centered between two lines, and screen readers meet one
// separator.
export const SeparatorText: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getAllByRole('separator')).toHaveLength(1);
    const lines = part('field-separator').querySelectorAll(
      '[data-slot=separator]',
    );
    await expect(lines).toHaveLength(2);
    const [start, end] = [...lines].map((line) => line.getBoundingClientRect());
    const text = box('field-separator-content');
    await expect(start?.right).toBeLessThanOrEqual(text.left);
    await expect(end?.left).toBeGreaterThanOrEqual(text.right);
    await expect(start?.width).toBeGreaterThan(50);
    await expect(
      Math.abs((start?.width ?? 0) - (end?.width ?? 0)),
    ).toBeLessThan(1);
    await expect(end?.right).toBe(box('field-separator').right);
    await expect(part('field-separator')).toHaveAttribute(
      'data-content',
      'true',
    );
  },
  render: () => (
    <FieldGroup className="w-80">
      <FieldSeparator>Or continue with</FieldSeparator>
    </FieldGroup>
  ),
};

export const SeparatorLine: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('separator').getBoundingClientRect().width,
    ).toBe(320);
    await expect(part('field-separator')).toHaveAttribute(
      'data-content',
      'false',
    );
  },
  render: () => (
    <FieldGroup className="w-80">
      <FieldSeparator />
    </FieldGroup>
  ),
};

// Children that render nothing (`show && 'Or'`) leave a single line.
export const SeparatorEmptyChildren: Story = {
  play: async () => {
    for (const separator of document.querySelectorAll(
      '[data-slot=field-separator]',
    )) {
      await expect(separator).toHaveAttribute('data-content', 'false');
      await expect(
        separator.querySelectorAll('[data-slot=separator]'),
      ).toHaveLength(1);
    }
  },
  render: () => (
    <FieldGroup className="w-80">
      <FieldSeparator>{false}</FieldSeparator>
      <FieldSeparator>{[]}</FieldSeparator>
      <FieldSeparator>{''}</FieldSeparator>
      <FieldSeparator>
        <>{false}</>
      </FieldSeparator>
    </FieldGroup>
  ),
};
