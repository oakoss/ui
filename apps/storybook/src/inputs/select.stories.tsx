import type { Meta, StoryObj } from '@storybook/react-vite';

import { FieldLabel } from '@oakoss/ui/components/ui/inputs/field';
import {
  Select,
  SelectContent,
  SelectHeader,
  SelectItem,
  SelectSection,
  SelectTrigger,
  SelectValue,
} from '@oakoss/ui/components/ui/inputs/select';
import { Select as AriaSelect } from 'react-aria-components';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';

const SingleSelect = Select<object>;

const onChange = fn<(value: unknown) => void>();

const fruits = (
  <>
    <SelectItem id="apple">Apple</SelectItem>
    <SelectItem id="banana">Banana</SelectItem>
    <SelectItem id="pear">Pear</SelectItem>
  </>
);

const meta = {
  args: { children: fruits, label: 'Fruit', onChange },
  beforeEach: () => {
    onChange.mockClear();
  },
  component: SingleSelect,
  title: 'Inputs/Select',
} satisfies Meta<typeof SingleSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

async function open(trigger: HTMLElement) {
  await userEvent.click(trigger);
  return screen.findByRole('listbox');
}

// The trigger is named by its value and the label; choosing an option shows
// it in the trigger.
export const Default: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: /Fruit/u });
    await expect(trigger).toHaveAttribute('data-slot', 'select-trigger');
    const list = await open(trigger);
    await userEvent.click(within(list).getByRole('option', { name: 'Apple' }));
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    await expect(trigger).toHaveTextContent('Apple');
    await expect(onChange).toHaveBeenCalledWith('apple');
  },
};

export const Keyboard: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: /Fruit/u });
    trigger.focus();
    await userEvent.keyboard('{ArrowDown}');
    const list = await screen.findByRole('listbox');
    await expect(trigger).toHaveAttribute('aria-controls', list.id);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await waitFor(() => expect(list).not.toBeInTheDocument());
    await expect(onChange).toHaveBeenCalledOnce();
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

const textItems = (
  <>
    <SelectItem id="copy" textValue=" ">
      Copy
    </SelectItem>
    <SelectItem id="delete">Delete {3} files</SelectItem>
  </>
);

// Typeahead reads an interpolated label as one string.
export const TypeaheadInterpolated: Story = {
  args: { children: textItems },
  play: async ({ canvas }) => {
    canvas.getByRole('button', { name: /Fruit/u }).focus();
    await userEvent.keyboard('d');
    await expect(onChange).toHaveBeenLastCalledWith('delete');
  },
};

// A blank textValue falls back to the label for typeahead.
export const TypeaheadBlankTextValue: Story = {
  args: { children: textItems },
  play: async ({ canvas }) => {
    canvas.getByRole('button', { name: /Fruit/u }).focus();
    await userEvent.keyboard('c');
    await expect(onChange).toHaveBeenLastCalledWith('copy');
  },
};

export const WithDescription: Story = {
  args: { description: 'Picked fresh daily.' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('button', { name: /Fruit/u }),
    ).toHaveAccessibleDescription('Picked fresh daily.');
  },
};

// The error describes the trigger, and its border turns destructive.
export const Invalid: Story = {
  args: { errors: ['Choose a fruit.'], isInvalid: true },
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: /Fruit/u });
    await expect(trigger).toHaveAccessibleDescription('Choose a fruit.');
    for (const animation of trigger.getAnimations()) animation.finish();
    const probe = document.createElement('div');
    probe.style.color = 'var(--color-destructive-text)';
    document.body.append(probe);
    await expect(getComputedStyle(trigger).borderTopColor).toBe(
      getComputedStyle(probe).color,
    );
    probe.remove();
  },
};

export const Required: Story = {
  args: { isRequired: true },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('*')).toBeVisible();
  },
};

// An option's description describes it in the list but stays out of the
// trigger, which shows the label alone.
export const ItemDescription: Story = {
  args: {
    children: (
      <>
        <SelectItem description="Up to 5 seats" id="team">
          Team
        </SelectItem>
        <SelectItem description="Unlimited" id="org">
          Organization
        </SelectItem>
      </>
    ),
    label: 'Plan',
  },
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: /Plan/u });
    const list = await open(trigger);
    const team = within(list).getByRole('option', { name: 'Team' });
    await expect(team).toHaveAccessibleDescription('Up to 5 seats');
    // Opened by mouse the list itself has focus; descriptions stay muted.
    const probe = document.createElement('div');
    probe.style.color = 'var(--color-muted-foreground)';
    document.body.append(probe);
    await expect(
      getComputedStyle(within(list).getByText('Unlimited')).color,
    ).toBe(getComputedStyle(probe).color);
    probe.remove();
    await userEvent.click(team);
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    await expect(trigger).toHaveAccessibleName(/Team/u);
    await expect(trigger).not.toHaveAccessibleName(/Up to 5 seats/u);
  },
};

// The list is at least the trigger's width, and long options aren't cut off.
export const ListWidth: Story = {
  args: {
    children: (
      <>
        <SelectItem id="short">Short</SelectItem>
        <SelectItem id="long">
          A much longer option than the trigger is wide
        </SelectItem>
      </>
    ),
    className: 'w-96',
  },
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: /Fruit/u });
    const list = await open(trigger);
    const option = within(list).getByRole('option', { name: /longer/u });
    const popover = list.closest<HTMLElement>('[data-slot=select-content]');
    if (!popover) throw new Error('No popover');
    for (const animation of popover.getAnimations()) animation.finish();
    await expect(popover.getBoundingClientRect().width).toBeGreaterThanOrEqual(
      trigger.getBoundingClientRect().width,
    );
    await expect(option.scrollWidth).toBeLessThanOrEqual(option.clientWidth);
  },
};

export const Sections: Story = {
  args: {
    children: (
      <>
        <SelectSection>
          <SelectHeader>Fruit</SelectHeader>
          <SelectItem id="apple">Apple</SelectItem>
        </SelectSection>
        <SelectSection>
          <SelectHeader>Vegetables</SelectHeader>
          <SelectItem id="carrot">Carrot</SelectItem>
        </SelectSection>
      </>
    ),
    label: 'Produce',
  },
  play: async ({ canvas }) => {
    const list = await open(canvas.getByRole('button', { name: /Produce/u }));
    const vegetables = within(list).getByRole('group', { name: 'Vegetables' });
    await expect(getComputedStyle(vegetables).borderTopWidth).toBe('1px');
    await expect(
      getComputedStyle(within(list).getByRole('group', { name: 'Fruit' }))
        .borderTopWidth,
    ).toBe('0px');
  },
};

// A custom layout built on React Aria's Select still turns the trigger's
// border destructive when invalid.
export const InvalidCustomLayout: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /Country/u });
    for (const animation of button.getAnimations()) animation.finish();
    const probe = document.createElement('div');
    probe.style.color = 'var(--color-destructive-text)';
    document.body.append(probe);
    await expect(getComputedStyle(button).borderTopColor).toBe(
      getComputedStyle(probe).color,
    );
    probe.remove();
  },
  render: () => (
    <AriaSelect className="flex flex-col gap-2" isInvalid>
      <FieldLabel>Country</FieldLabel>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem id="ca">Canada</SelectItem>
      </SelectContent>
    </AriaSelect>
  ),
};

// The selected option is marked, and the list is a single-select listbox.
export const Selected: Story = {
  args: { defaultValue: 'pear' },
  play: async ({ canvas }) => {
    const list = await open(canvas.getByRole('button', { name: /Fruit/u }));
    const pear = within(list).getByRole('option', { name: 'Pear' });
    await expect(pear).toHaveAttribute('aria-selected', 'true');
    await expect(
      pear.querySelector('[data-slot=select-item-indicator]'),
    ).not.toBeNull();
    // Options leave room at the end for the check, so a label can't run under it.
    await expect(getComputedStyle(pear).paddingInlineEnd).toBe('32px');
  },
};
