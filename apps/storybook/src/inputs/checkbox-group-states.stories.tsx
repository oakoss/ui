import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  CheckboxGroup,
  CheckboxGroupItem,
} from '@oakoss/ui/components/ui/inputs/checkbox-group';
import { expect, fn, userEvent } from 'storybook/test';

import { part } from '#/helpers/parts';

const meta = {
  args: {
    children: (
      <>
        <CheckboxGroupItem value="cheese">Cheese</CheckboxGroupItem>
        <CheckboxGroupItem value="olives">Olives</CheckboxGroupItem>
      </>
    ),
    label: 'Toppings',
  },
  component: CheckboxGroup,
  title: 'Inputs/Checkbox Group/States',
} satisfies Meta<typeof CheckboxGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

// Each box's hit area grows to 44px, and stacked options sit far enough
// apart that two boxes' areas only meet.
export const TargetSize: Story = {
  play: async () => {
    const area = getComputedStyle(part('checkbox-indicator'), '::after');
    await expect(area.minWidth).toBe('44px');
    const [first, second] = [
      ...document.querySelectorAll('[data-slot=checkbox-indicator]'),
    ].map((box) => box.getBoundingClientRect());
    await expect((second?.top ?? 0) - (first?.top ?? 0)).toBeGreaterThanOrEqual(
      44,
    );
  },
};

// In a row too, the last pixel of a label still belongs to its own option.
export const TargetSpacingHorizontal: Story = {
  args: { orientation: 'horizontal' },
  play: async () => {
    const [first] = [
      ...document.querySelectorAll<HTMLElement>(
        '[data-slot=checkbox-group-item]',
      ),
    ];
    if (!first) throw new Error('No option');
    const { bottom, right, top } = first.getBoundingClientRect();
    await expect(document.elementFromPoint(right - 1, (top + bottom) / 2)).toBe(
      first,
    );
  },
};

export const TargetSizeOff: Story = {
  args: { targetSize: false },
  play: async () => {
    const area = getComputedStyle(part('checkbox-indicator'), '::after');
    await expect(area.minWidth).not.toBe('44px');
  },
};

// The group's errors come from its errors prop, its errorMessage, or its
// validate function, and requiredLabel replaces the message for a group
// with nothing checked, including when a form passes an empty errors list.
export const Errors: Story = {
  play: async ({ canvas }) => {
    const [fromErrors, fromMessage, fromValidate, required, emptyErrors] =
      canvas.getAllByRole('group');
    await expect(fromErrors).toHaveAccessibleDescription('Server says no.');
    await expect(fromMessage).toHaveAccessibleDescription('Choose wisely.');
    const olives = canvas.getAllByRole('checkbox', { name: 'Olives' })[2];
    if (!olives) throw new Error('No Olives');
    await userEvent.click(olives);
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
      <CheckboxGroup errors={['Server says no.']} isInvalid label="Server">
        <Options />
      </CheckboxGroup>
      <CheckboxGroup errorMessage="Choose wisely." isInvalid label="Message">
        <Options />
      </CheckboxGroup>
      <CheckboxGroup
        label="Validate"
        validate={(value) =>
          value.includes('olives') ? 'No olives today.' : null
        }
      >
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

const onTerms = fn<() => void>();

// A link in a card's description stays a link, above the stretched label.
export const CardLink: Story = {
  args: {
    children: (
      <CheckboxGroupItem
        description={
          <>
            Includes the{' '}
            <a
              href="#terms"
              onClick={(event) => {
                // Following it would navigate the test page away.
                event.preventDefault();
                onTerms();
              }}
            >
              service terms
            </a>
            .
          </>
        }
        value="backups"
      >
        Backups
      </CheckboxGroupItem>
    ),
    variant: 'card',
  },
  beforeEach: () => {
    onTerms.mockClear();
  },
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'service terms' });
    const { height, left, top, width } = link.getBoundingClientRect();
    await expect(
      document.elementFromPoint(left + width / 2, top + height / 2),
    ).toBe(link);
    await userEvent.click(link);
    await expect(onTerms).toHaveBeenCalledOnce();
    await expect(
      canvas.getByRole('checkbox', { name: 'Backups' }),
    ).not.toBeChecked();
  },
};

// A disabled option fades, and a disabled card fades once, at the card.
export const Disabled: Story = {
  play: async ({ canvas }) => {
    const [option, card] = canvas.getAllByRole('checkbox', { name: 'Truffle' });
    const label = option?.closest<HTMLElement>(
      '[data-slot=checkbox-group-item]',
    );
    const field = card?.closest<HTMLElement>(
      '[data-slot=checkbox-group-item-field]',
    );
    const cardLabel = card?.closest<HTMLElement>(
      '[data-slot=checkbox-group-item]',
    );
    if (!label || !field || !cardLabel) throw new Error('No options');
    await expect(getComputedStyle(label).opacity).toBe('0.5');
    await expect(getComputedStyle(field).opacity).toBe('0.5');
    await expect(getComputedStyle(cardLabel).opacity).toBe('1');
  },
  render: () => (
    <div className="flex flex-col gap-6">
      <CheckboxGroup label="Default">
        <CheckboxGroupItem isDisabled value="truffle">
          Truffle
        </CheckboxGroupItem>
      </CheckboxGroup>
      <CheckboxGroup label="Cards" variant="card">
        <CheckboxGroupItem isDisabled value="truffle">
          Truffle
        </CheckboxGroupItem>
      </CheckboxGroup>
    </div>
  ),
};

// Right to left, a horizontal group starts on the right, and a
// description lines up under its label text.
export const RightToLeft: Story = {
  args: {
    children: (
      <>
        <CheckboxGroupItem description="ذائب" value="cheese">
          جبن
        </CheckboxGroupItem>
        <CheckboxGroupItem value="olives">زيتون</CheckboxGroupItem>
      </>
    ),
    label: 'إضافات',
    orientation: 'horizontal',
  },
  globals: { locale: 'ar-EG' },
  play: async ({ canvas }) => {
    const [first, second] = canvas
      .getAllByRole('checkbox')
      .map((box) =>
        box.closest('[data-slot=checkbox-group-item]')?.getBoundingClientRect(),
      );
    await expect(first?.left).toBeGreaterThan(second?.right ?? 0);
    const description = canvas.getByText('ذائب').getBoundingClientRect();
    await expect(Math.round(description.right)).toBe(
      Math.round((first?.right ?? 0) - 24),
    );
  },
};

// Forced colors outline a selected card in the system's highlight color.
export const ForcedColorsCard: Story = {
  args: {
    children: (
      <>
        <CheckboxGroupItem value="backups">Backups</CheckboxGroupItem>
        <CheckboxGroupItem value="support">Support</CheckboxGroupItem>
      </>
    ),
    defaultValue: ['support'],
    variant: 'card',
  },
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async ({ canvas }) => {
    const [backups, support] = canvas
      .getAllByRole('checkbox')
      .map((box) =>
        getComputedStyle(
          box.closest('[data-slot=checkbox-group-item-field]') ?? document.body,
        ),
      );
    await expect(support?.borderTopColor).not.toBe(backups?.borderTopColor);
  },
  tags: ['forced-colors'],
};

function Options() {
  return (
    <>
      <CheckboxGroupItem value="cheese">Cheese</CheckboxGroupItem>
      <CheckboxGroupItem value="olives">Olives</CheckboxGroupItem>
    </>
  );
}
