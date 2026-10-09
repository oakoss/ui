import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  Input,
} from '@oakoss/ui/components/ui/inputs/field';
import { TextField } from '@oakoss/ui/components/ui/inputs/text-field';
import { Button, Form, Link, SearchField } from 'react-aria-components';
import { expect, userEvent } from 'storybook/test';

import { part } from '../parts';

const meta = { component: FieldError, title: 'Inputs/Field' } satisfies Meta<
  typeof FieldError
>;

export default meta;

type Story = StoryObj<typeof meta>;

// Children replace TextField's layout; the parts still wire up, and each
// takes the consumer's className.
export const Composed: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByLabelText('Password');
    await expect(input).toHaveAccessibleDescription(
      'At least 12 characters. Use a passphrase.',
    );
    await expect(canvas.getByRole('link', { name: 'Forgot?' })).toBeVisible();
    for (const [slot, className] of [
      ['field-label', 'tracking-wide'],
      ['input', 'font-mono'],
      ['field-description', 'italic'],
      ['field-error', 'underline'],
    ] as const) {
      const part = canvas
        .getByRole('textbox', { hidden: true })
        .closest('[data-slot=text-field]')
        ?.querySelector(`[data-slot=${CSS.escape(slot)}]`);
      await expect(part).toHaveClass(className);
    }
  },
  render: () => (
    <TextField isInvalid>
      <div className="flex items-center justify-between">
        <FieldLabel className="tracking-wide">Password</FieldLabel>
        <Link href="#">Forgot?</Link>
      </div>
      <Input className="font-mono" />
      <FieldDescription className="italic">
        At least 12 characters.
      </FieldDescription>
      <FieldError className="underline">Use a passphrase.</FieldError>
    </TextField>
  ),
};

// The parts work inside other React Aria fields too, disabled state included.
export const InSearchField: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('searchbox', { name: 'Search docs' }),
    ).toHaveAccessibleDescription('Press / to focus.');
    await expect(
      getComputedStyle(canvas.getByText('Search docs')).opacity,
    ).toBe('0.5');
  },
  render: () => (
    <SearchField className="flex flex-col gap-2" isDisabled>
      <FieldLabel>Search docs</FieldLabel>
      <Input />
      <FieldDescription>Press / to focus.</FieldDescription>
    </SearchField>
  ),
};

// Form libraries pass whatever validators return: strings and objects with a
// string message show, one per line; duplicates, blanks and anything else drop.
export const ErrorList: Story = {
  play: async ({ canvas }) => {
    const error = canvas
      .getByRole('textbox', { name: 'Email' })
      .closest('[data-slot=text-field]')
      ?.querySelector('[data-slot=field-error]');
    const lines = [...(error?.children ?? [])].map((line) =>
      line.textContent.trim(),
    );
    await expect(lines).toEqual(['Too short.', 'Needs an @.', 'From a list.']);
    // The matcher drops the separating spaces and flex layout hides their
    // absence, so the raw text is what pins them.
    await expect(error?.textContent).toBe(
      'Too short. Needs an @. From a list.',
    );
    await expect(
      canvas.getByRole('textbox', { name: 'Email' }),
    ).toHaveAccessibleDescription('Too short. Needs an @. From a list.');
  },
  render: () => (
    <TextField isInvalid>
      <FieldLabel>Email</FieldLabel>
      <Input />
      <FieldError
        errors={[
          'Too short.',
          { message: 'Needs an @.' },
          'Too short.',
          undefined,
          '',
          ' '.repeat(3),
          { code: 42 },
          { message: 42 },
          [{ message: 'From a list.' }],
        ]}
      />
    </TextField>
  ),
};

// Children win over errors, but empty children (`cond && 'msg'`) fall through.
export const ChildrenOverErrors: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('textbox', { name: 'Custom' }),
    ).toHaveAccessibleDescription('Custom message.');
    await expect(
      canvas.getByRole('textbox', { name: 'Empty' }),
    ).toHaveAccessibleDescription('From validator.');
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <TextField
        errorMessage="Custom message."
        errors={['From validator.']}
        isInvalid
        label="Custom"
      />
      <TextField
        errorMessage={false}
        errors={['From validator.']}
        isInvalid
        label="Empty"
      />
    </div>
  ),
};

// FieldError follows React Aria: it renders only while the field is invalid,
// so errors alone show nothing.
export const ErrorsNeedInvalid: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.queryByText('Too short.')).toBeNull();
  },
  render: () => (
    <TextField>
      <FieldLabel>Email</FieldLabel>
      <Input />
      <FieldError errors={['Too short.']} />
    </TextField>
  ),
};

// Without children or errors, FieldError shows React Aria's own validation.
// Composed children get no built-in asterisk.
export const NativeValidation: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.queryByText('*')).toBeNull();
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));
    const input = canvas.getByRole('textbox', { name: 'Name' });
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    const error = input
      .closest('[data-slot=text-field]')
      ?.querySelector('[data-slot=field-error]');
    await expect(error?.textContent).toBeTruthy();
    await expect(input).toHaveAccessibleDescription(error?.textContent);
  },
  render: () => (
    <Form className="flex flex-col gap-4">
      <TextField isRequired name="name">
        <FieldLabel>Name</FieldLabel>
        <Input />
        <FieldError />
      </TextField>
      <Button type="submit">Submit</Button>
    </Form>
  ),
};

// A label pointed at its own control with htmlFor names that control only,
// not the React Aria field it sits in.
export const LabelFor: Story = {
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByRole('textbox')).toHaveAccessibleName('Name');
    await expect(canvas.getByRole('checkbox')).toHaveAccessibleName(
      'Use as display name',
    );
    const ids = [...canvasElement.querySelectorAll('[id]')].map(
      (element) => element.id,
    );
    await expect(new Set(ids).size).toBe(ids.length);
  },
  render: () => (
    <TextField>
      <FieldLabel>Name</FieldLabel>
      <Input />
      <div className="flex items-center gap-2">
        <input id="display-name" type="checkbox" />
        <FieldLabel htmlFor="display-name">Use as display name</FieldLabel>
      </div>
    </TextField>
  ),
};

// htmlFor pointing at the field's own input keeps the field's wiring.
export const LabelForField: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Email' });
    await expect(input).toHaveAttribute(
      'aria-labelledby',
      part('field-label').id,
    );
  },
  render: () => (
    <TextField id="email">
      <FieldLabel htmlFor="email">Email</FieldLabel>
      <Input />
    </TextField>
  ),
};

// A link in a description is underlined, so it doesn't rely on color, even
// nested in other text.
export const DescriptionLinks: Story = {
  play: async ({ canvas }) => {
    for (const name of ['Privacy', 'terms']) {
      await expect(
        getComputedStyle(canvas.getByRole('link', { name })).textDecorationLine,
      ).toBe('underline');
    }
  },
  render: () => (
    <TextField>
      <FieldLabel>Email</FieldLabel>
      <Input />
      <FieldDescription>
        <a href="#privacy">Privacy</a> and{' '}
        <strong>
          <a href="#terms">terms</a>
        </strong>
        .
      </FieldDescription>
    </TextField>
  ),
};

export const FieldSetLayout: Story = {
  play: async ({ canvas }) => {
    const group = canvas.getByRole('group', { name: 'Shipping address' });
    await expect(group).toHaveAttribute('data-slot', 'field-set');
    await expect(group.querySelector('[data-slot=field-group]')).not.toBeNull();
    const [legend, label] = group.querySelectorAll('[data-slot=field-legend]');
    await expect(legend).toHaveAttribute('data-variant', 'legend');
    await expect(label).toHaveAttribute('data-variant', 'label');
    await expect(getComputedStyle(legend ?? group).fontSize).toBe('16px');
    await expect(getComputedStyle(label ?? group).fontSize).toBe('14px');
    await expect(canvas.getByRole('textbox', { name: 'Street' })).toBeVisible();
  },
  render: () => (
    <FieldSet>
      <FieldLegend>Shipping address</FieldLegend>
      <FieldGroup>
        <TextField label="Street" />
        <FieldSet>
          <FieldLegend variant="label">Unit</FieldLegend>
          <TextField label="Apartment" />
        </FieldSet>
      </FieldGroup>
    </FieldSet>
  ),
};
