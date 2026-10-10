import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  RadioGroup,
  RadioGroupItem,
} from '@oakoss/ui/components/ui/inputs/radio-group';
import { Select, SelectItem } from '@oakoss/ui/components/ui/inputs/select';
import { useState } from 'react';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

const SingleSelect = Select<Fruit>;

type Fruit = { id: string; name: string };

const fruits: Fruit[] = [
  { id: 'apple', name: 'Apple' },
  { id: 'pear', name: 'Pear' },
];

const meta = {
  args: { label: 'Fruit' },
  component: SingleSelect,
  title: 'Inputs/Select/Composition',
} satisfies Meta<typeof SingleSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

// A valid Select inside an invalid group keeps its normal border: the trigger
// reads its own Select's validation, not any invalid ancestor.
export const ValidInsideInvalidGroup: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /Which one/u });
    for (const animation of button.getAnimations()) animation.finish();
    const probe = document.createElement('div');
    probe.style.color = 'var(--color-input)';
    document.body.append(probe);
    await expect(getComputedStyle(button).borderTopColor).toBe(
      getComputedStyle(probe).color,
    );
    probe.remove();
  },
  render: () => (
    <RadioGroup errorMessage="Choose a plan." isInvalid label="Plan">
      <RadioGroupItem value="free">Free</RadioGroupItem>
      <RadioGroupItem value="other">Other</RadioGroupItem>
      <SingleSelect label="Which one">
        <SelectItem id="a">A</SelectItem>
      </SingleSelect>
    </RadioGroup>
  ),
};

// Options built from items re-render when outside state they read changes,
// through dependencies.
export const Dependencies: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(canvas.getByRole('button', { name: 'Shout' }));
    await userEvent.click(canvas.getByRole('button', { name: /Fruit/u }));
    const list = await screen.findByRole('listbox');
    await waitFor(() =>
      expect(within(list).getByRole('option', { name: 'APPLE' })).toBeVisible(),
    );
  },
  render: function Render() {
    const [shout, setShout] = useState(false);
    return (
      <div className="flex flex-col gap-4">
        <Button onPress={() => setShout(true)} variant="outline">
          Shout
        </Button>
        <SingleSelect dependencies={[shout]} items={fruits} label="Fruit">
          {(item) => (
            <SelectItem>
              {shout ? item.name.toUpperCase() : item.name}
            </SelectItem>
          )}
        </SingleSelect>
      </div>
    );
  },
};
