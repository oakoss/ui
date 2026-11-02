import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  CheckboxGroup,
  CheckboxGroupItem,
} from '@oakoss/ui/components/ui/inputs/checkbox-group';
import { expect, userEvent } from 'storybook/test';

const meta = {
  args: { label: 'Toppings' },
  component: CheckboxGroup,
  title: 'Inputs/Checkbox Group/Validation',
} satisfies Meta<typeof CheckboxGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

const noOlives = (value: string[]) =>
  value.includes('olives') ? 'No olives today.' : null;

// The group's errors come from its errors prop, its errorMessage, or its
// validate function, which aria validation shows without a submit.
export const Errors: Story = {
  play: async ({ canvas }) => {
    const [fromErrors, fromMessage, fromValidate] =
      canvas.getAllByRole('group');
    await expect(fromErrors).toHaveAccessibleDescription('Server says no.');
    await expect(fromMessage).toHaveAccessibleDescription('Choose wisely.');
    await expect(fromValidate).toHaveAccessibleDescription('No olives today.');
  },
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <CheckboxGroup errors={['Server says no.']} isInvalid label="Server">
        <Options />
      </CheckboxGroup>
      <CheckboxGroup errorMessage="Choose wisely." isInvalid label="Message">
        <Options />
      </CheckboxGroup>
      <CheckboxGroup
        defaultValue={['olives']}
        label="Validate"
        validate={noOlives}
        validationBehavior="aria"
      >
        <Options />
      </CheckboxGroup>
    </div>
  ),
};

// requiredLabel replaces the message for a required group with nothing
// checked, including when a form passes an empty errors list.
export const RequiredErrors: Story = {
  play: async ({ canvas }) => {
    const [required, emptyErrors] = canvas.getAllByRole('group');
    await expect(required).toHaveAttribute('data-invalid', 'true');
    await expect(required).toHaveAccessibleDescription('Pick a topping.');
    await expect(emptyErrors).toHaveAttribute('data-invalid', 'true');
    await expect(emptyErrors).toHaveAccessibleDescription(
      'Select at least one option.',
    );
  },
  render: () => (
    <div className="flex flex-col items-start gap-6">
      <CheckboxGroup
        isRequired
        label="Required"
        requiredLabel="Pick a topping."
        validationBehavior="aria"
      >
        <Options />
      </CheckboxGroup>
      <CheckboxGroup
        errors={[]}
        isRequired
        label="Form"
        validationBehavior="aria"
      >
        <Options />
      </CheckboxGroup>
    </div>
  ),
};

// Native validation shows nothing until a change or submit commits it.
export const ErrorsOnSubmit: Story = {
  play: async ({ canvas }) => {
    const groups = canvas.getAllByRole('group');
    for (const group of groups) {
      await expect(group).not.toHaveAttribute('data-invalid');
      await expect(group).not.toHaveAccessibleDescription();
    }
    const [fromValidate, required, emptyErrors] = groups;
    const [olives] = canvas.getAllByRole('checkbox', { name: 'Olives' });
    if (!olives) throw new Error('No Olives');
    await userEvent.click(olives);
    await expect(required).not.toHaveAccessibleDescription();
    await userEvent.click(canvas.getByRole('button', { name: 'Order' }));
    await expect(fromValidate).toHaveAccessibleDescription('No olives today.');
    await expect(required).toHaveAccessibleDescription('Pick a topping.');
    await expect(emptyErrors).toHaveAccessibleDescription(
      'Select at least one option.',
    );
  },
  render: () => (
    <form
      className="flex flex-col items-start gap-6"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <CheckboxGroup label="Validate" validate={noOlives}>
        <Options />
      </CheckboxGroup>
      <CheckboxGroup
        isRequired
        label="Required"
        requiredLabel="Pick a topping."
      >
        <Options />
      </CheckboxGroup>
      <CheckboxGroup errors={[]} isRequired label="Form">
        <Options />
      </CheckboxGroup>
      <Button type="submit">Order</Button>
    </form>
  ),
};

function Options() {
  return (
    <>
      <CheckboxGroupItem value="cheese">Cheese</CheckboxGroupItem>
      <CheckboxGroupItem value="olives">Olives</CheckboxGroupItem>
    </>
  );
}
