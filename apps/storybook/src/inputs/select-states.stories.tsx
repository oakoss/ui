import type { Meta, StoryObj } from '@storybook/react-vite';

import { Select, SelectItem } from '@oakoss/ui/components/ui/inputs/select';
import { setInteractionModality } from 'react-aria-components';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

const SingleSelect = Select<object>;
const MultipleSelect = Select<object, 'multiple'>;

const fruits = (
  <>
    <SelectItem id="apple">Apple</SelectItem>
    <SelectItem id="banana">Banana</SelectItem>
    <SelectItem id="pear">Pear</SelectItem>
  </>
);

const meta = {
  args: { children: fruits, label: 'Fruit' },
  component: SingleSelect,
  title: 'Inputs/Select/States',
} satisfies Meta<typeof SingleSelect>;

export default meta;

type Story = StoryObj<typeof meta>;

function trigger(canvas: { getByRole: typeof screen.getByRole }) {
  return canvas.getByRole('button', { name: /Fruit/u });
}

// Several picks show as a list in the user's language, and the list stays
// open between picks.
export const Multiple: Story = {
  play: async ({ canvas }) => {
    await userEvent.click(trigger(canvas));
    const list = await screen.findByRole('listbox');
    await expect(list).toHaveAttribute('aria-multiselectable', 'true');
    await userEvent.click(within(list).getByRole('option', { name: 'Apple' }));
    await userEvent.click(within(list).getByRole('option', { name: 'Pear' }));
    await expect(list).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    await expect(trigger(canvas)).toHaveTextContent('Apple and Pear');
  },
  render: (args) => (
    <MultipleSelect label={args.label} selectionMode="multiple">
      {fruits}
    </MultipleSelect>
  ),
};

// The trigger matches Input's heights.
export const Sizes: Story = {
  play: async ({ canvas }) => {
    const heights = ['Small', 'Medium', 'Large'].map(
      (name) =>
        canvas
          .getByRole('button', { name: new RegExp(name, 'u') })
          .getBoundingClientRect().height,
    );
    await expect(heights).toEqual([32, 36, 40]);
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <SingleSelect label="Small" size="sm">
        {fruits}
      </SingleSelect>
      <SingleSelect label="Medium">{fruits}</SingleSelect>
      <SingleSelect label="Large" size="lg">
        {fruits}
      </SingleSelect>
    </div>
  ),
};

// A button shows the focus outline on keyboard focus only.
export const FocusRing: Story = {
  play: async ({ canvas }) => {
    const button = trigger(canvas);
    setInteractionModality('pointer');
    button.focus();
    // Styles recompute on the next frame.
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        resolve(undefined);
      });
    });
    await expect(getComputedStyle(button).outlineStyle).not.toBe('solid');
    button.blur();
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(getComputedStyle(button).outlineStyle).toBe('solid');
  },
};

// A disabled option fades, and takes the system's disabled color in forced
// colors.
export const DisabledItem: Story = {
  args: { disabledKeys: ['banana'] },
  play: async ({ canvas }) => {
    await userEvent.click(trigger(canvas));
    const list = await screen.findByRole('listbox');
    const banana = within(list).getByRole('option', { name: 'Banana' });
    await expect(banana).toHaveAttribute('aria-disabled', 'true');
    await expect(getComputedStyle(banana).opacity).toBe('0.5');
  },
};

export const DisabledItemForcedColors: Story = {
  args: { disabledKeys: ['banana'] },
  play: async ({ canvas }) => {
    await userEvent.click(trigger(canvas));
    const list = await screen.findByRole('listbox');
    const banana = within(list).getByRole('option', { name: 'Banana' });
    const probe = document.createElement('div');
    probe.style.color = 'GrayText';
    document.body.append(probe);
    await expect(getComputedStyle(banana).color).toBe(
      getComputedStyle(probe).color,
    );
    probe.remove();
  },
  tags: ['forced-colors'],
};

// The focused option takes the accent fill, and its description follows the
// option's text color.
export const FocusedOption: Story = {
  args: {
    children: (
      <>
        <SelectItem description="Crisp" id="apple">
          Apple
        </SelectItem>
        <SelectItem id="pear">Pear</SelectItem>
      </>
    ),
  },
  play: async ({ canvas }) => {
    trigger(canvas).focus();
    await userEvent.keyboard('{ArrowDown}');
    const list = await screen.findByRole('listbox');
    const apple = within(list).getByRole('option', { name: 'Apple' });
    await waitFor(() => expect(apple).toHaveAttribute('data-focused', 'true'));
    for (const animation of apple.getAnimations()) animation.finish();
    const probe = document.createElement('div');
    probe.style.backgroundColor = 'var(--color-accent)';
    document.body.append(probe);
    await expect(getComputedStyle(apple).backgroundColor).toBe(
      getComputedStyle(probe).backgroundColor,
    );
    probe.remove();
    await expect(getComputedStyle(within(apple).getByText('Crisp')).color).toBe(
      getComputedStyle(apple).color,
    );
  },
};

// The trigger keeps its height, with a 44px hit area around it.
export const HitArea: Story = {
  play: async ({ canvas }) => {
    const button = trigger(canvas);
    await expect(button.getBoundingClientRect().height).toBe(36);
    await expect(getComputedStyle(button, '::after').minHeight).toBe('44px');
  },
};

// A list taller than the space scrolls inside the popover.
export const LongList: Story = {
  args: {
    children: Array.from({ length: 60 }, (_, index) => (
      <SelectItem id={`item-${index}`} key={index}>
        {`Item ${index + 1}`}
      </SelectItem>
    )),
  },
  play: async ({ canvas }) => {
    await userEvent.click(trigger(canvas));
    const list = await screen.findByRole('listbox');
    await expect(getComputedStyle(list).overflowY).toBe('auto');
    await expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
  },
};

export const Placeholder: Story = {
  args: { placeholder: 'Pick a fruit' },
  play: async ({ canvas }) => {
    const value = canvas.getByText('Pick a fruit');
    await expect(value).toHaveAttribute('data-placeholder', 'true');
    const probe = document.createElement('div');
    probe.style.color = 'var(--color-muted-foreground)';
    document.body.append(probe);
    await expect(getComputedStyle(value).color).toBe(
      getComputedStyle(probe).color,
    );
    probe.remove();
  },
};

export const Disabled: Story = {
  args: { isDisabled: true },
  play: async ({ canvas }) => {
    await expect(trigger(canvas)).toBeDisabled();
    await expect(getComputedStyle(trigger(canvas)).opacity).toBe('0.5');
  },
};

// The chevron sits at the trigger's end, on the left right to left.
export const RightToLeft: Story = {
  args: { label: 'فاكهة' },
  globals: { locale: 'ar-EG' },
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: /فاكهة/u });
    const chevron = button.querySelector('svg');
    if (!chevron) throw new Error('No chevron');
    await expect(chevron.getBoundingClientRect().left).toBeLessThan(
      button.getBoundingClientRect().left + 24,
    );
  },
};

// The focused option takes the system's selection colors in forced colors.
export const ForcedColors: Story = {
  play: async ({ canvas }) => {
    trigger(canvas).focus();
    await userEvent.keyboard('{ArrowDown}');
    const list = await screen.findByRole('listbox');
    const focused = await waitFor(() => {
      const option = within(list)
        .getAllByRole('option')
        .find((element) => Object.hasOwn(element.dataset, 'focused'));
      if (!option) throw new Error('No focused option');
      return option;
    });
    const probe = document.createElement('div');
    probe.style.backgroundColor = 'Highlight';
    document.body.append(probe);
    await expect(getComputedStyle(focused).backgroundColor).toBe(
      getComputedStyle(probe).backgroundColor,
    );
    probe.remove();
  },
  tags: ['forced-colors'],
};
