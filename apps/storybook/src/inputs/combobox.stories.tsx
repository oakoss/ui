import type { Meta, StoryObj } from '@storybook/react-vite';

import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Combobox,
  ComboboxItem,
} from '@oakoss/ui/components/ui/inputs/combobox';
import { expect, fn, screen, userEvent, waitFor, within } from 'storybook/test';

import { whilePressed } from '#/helpers/press';

const FruitCombobox = Combobox<object>;

const onChange = fn<(value: unknown) => void>();

const fruits = (
  <>
    <ComboboxItem id="apple">Apple</ComboboxItem>
    <ComboboxItem id="apricot">Apricot</ComboboxItem>
    <ComboboxItem id="pear">Pear</ComboboxItem>
  </>
);

const meta = {
  args: { children: fruits, label: 'Fruit', onChange },
  beforeEach: () => {
    onChange.mockClear();
  },
  component: FruitCombobox,
  title: 'Inputs/Combobox',
} satisfies Meta<typeof FruitCombobox>;

export default meta;

type Story = StoryObj<typeof meta>;

// Typing filters the options; choosing one fills the input. With no start
// decoration, nothing renders before the input.
export const Default: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('combobox', { name: 'Fruit' });
    await expect(
      input
        .closest('[data-slot=input-group]')
        ?.querySelector('[data-align=inline-start]'),
    ).toBeNull();
    await userEvent.type(input, 'ap');
    const list = await screen.findByRole('listbox');
    await expect(input).toHaveAttribute('aria-controls', list.id);
    await expect(within(list).getAllByRole('option')).toHaveLength(2);
    await userEvent.click(
      within(list).getByRole('option', { name: 'Apricot' }),
    );
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    await expect(input).toHaveValue('Apricot');
    await expect(onChange).toHaveBeenCalledWith('apricot');
  },
};

// Arrows move through the options and Enter chooses one. Escape puts back the
// chosen option's text, and deleting the text clears the choice.
export const Keyboard: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('combobox', { name: 'Fruit' });
    await userEvent.type(input, 'ap');
    await screen.findByRole('listbox');
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    await waitFor(() => expect(screen.queryByRole('listbox')).toBeNull());
    await expect(input).toHaveValue('Apricot');
    await expect(onChange).toHaveBeenLastCalledWith('apricot');
    await userEvent.type(input, 'zz');
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveValue('Apricot');
    await userEvent.clear(input);
    await expect(onChange).toHaveBeenLastCalledWith(null);
  },
};

// The trigger is named by React Aria, stays out of the Tab order, and doesn't
// hold a pressed look while the list is open.
export const Trigger: Story = {
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole('button', { name: /Show suggestions/u });
    await expect(trigger).toHaveAttribute('tabindex', '-1');
    const resting = getComputedStyle(trigger).backgroundImage;
    await userEvent.click(trigger);
    await screen.findByRole('listbox');
    await userEvent.unhover(trigger);
    await expect(trigger).toHaveAttribute('data-pressed', 'true');
    for (const animation of trigger.getAnimations()) animation.finish();
    await expect(['1', 'none']).toContain(getComputedStyle(trigger).scale);
    await expect(getComputedStyle(trigger).backgroundImage).toBe(resting);
    // The press that closes the list doesn't shrink it either.
    const closing = await whilePressed(
      trigger,
      () => getComputedStyle(trigger).scale,
    );
    await expect(screen.queryByRole('listbox')).toBeNull();
    await expect(['1', 'none']).toContain(closing);
  },
};

// The clear button empties the input and puts focus back in it; it isn't a
// Tab stop.
export const Clear: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('combobox', { name: 'Fruit' });
    await expect(canvas.queryByRole('button', { name: 'Clear' })).toBeNull();
    await userEvent.type(input, 'pe');
    // React Aria hides all but the input and list from screen readers while
    // the list is open.
    const clear = canvas.getByRole('button', { hidden: true, name: 'Clear' });
    await expect(clear).toHaveAttribute('tabindex', '-1');
    await userEvent.click(clear);
    await expect(input).toHaveValue('');
    await expect(input).toHaveFocus();
    await expect(
      canvas.queryByRole('button', { hidden: true, name: 'Clear' }),
    ).toBeNull();
  },
};

// Clearing a chosen value clears the selection and moves focus to the input.
export const ClearSelection: Story = {
  args: { defaultValue: 'pear' },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('combobox', { name: 'Fruit' });
    await expect(input).toHaveValue('Pear');
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(input).toHaveValue('');
    await expect(onChange).toHaveBeenCalledWith(null);
    await expect(input).toHaveFocus();
  },
};

// With nothing matching, the list says so instead of closing.
export const Empty: Story = {
  args: { emptyLabel: 'No fruit found' },
  play: async ({ canvas }) => {
    await userEvent.type(canvas.getByRole('combobox', { name: 'Fruit' }), 'zz');
    const list = await screen.findByRole('listbox');
    // React Aria gives the empty state the option role.
    await expect(within(list).getByRole('option')).toHaveTextContent(
      'No fruit found',
    );
    const style = getComputedStyle(within(list).getByText('No fruit found'));
    await expect(style.paddingInline).toBe('8px');
    await expect(style.paddingBlock).toBe('6px');
  },
};

export const WithDescription: Story = {
  args: { description: 'Fresh this week.' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('combobox', { name: 'Fruit' }),
    ).toHaveAccessibleDescription('Fresh this week.');
  },
};

// The error describes the input, and the group's border turns destructive.
export const Invalid: Story = {
  args: { errors: ['Choose a fruit.'], isInvalid: true },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('combobox', { name: 'Fruit' });
    await expect(input).toHaveAccessibleDescription('Choose a fruit.');
    const group = input.closest<HTMLElement>('[data-slot=input-group]');
    if (!group) throw new Error('No group');
    for (const animation of group.getAnimations()) animation.finish();
    const probe = document.createElement('div');
    probe.style.color = 'var(--color-destructive-text)';
    document.body.append(probe);
    await expect(getComputedStyle(group).borderTopColor).toBe(
      getComputedStyle(probe).color,
    );
    probe.remove();
  },
};

// Text decorations describe the input after the description.
export const Decorations: Story = {
  args: { description: 'Pick one.', start: 'Fruit:' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('combobox', { name: 'Fruit' }),
    ).toHaveAccessibleDescription('Pick one. Fruit:');
  },
};

const onFilters = fn<() => void>();
const onScope = fn<() => void>();

// A button in a decoration keeps its own name, tab stop and action rather
// than the trigger's: pressing it doesn't open the list.
export const ButtonDecorations: Story = {
  args: {
    end: (
      <Button onPress={onFilters} variant="ghost">
        Filters
      </Button>
    ),
    start: (
      <Button onPress={onScope} variant="ghost">
        Scope
      </Button>
    ),
  },
  beforeEach: () => {
    onFilters.mockClear();
    onScope.mockClear();
  },
  play: async ({ canvas }) => {
    for (const [name, onPress] of [
      ['Filters', onFilters],
      ['Scope', onScope],
    ] as const) {
      const button = canvas.getByRole('button', { name });
      await expect(button).not.toHaveAttribute('tabindex', '-1');
      await expect(button).not.toHaveAttribute('aria-haspopup');
      await userEvent.click(button);
      await expect(onPress).toHaveBeenCalledOnce();
      await expect(screen.queryByRole('listbox')).toBeNull();
    }
    await expect(
      canvas.getByRole('button', { name: /Show suggestions/u }),
    ).toBeInTheDocument();
  },
};

// Tab reaches each decoration button, and Enter presses it without opening
// the list.
export const ButtonDecorationsKeyboard: Story = {
  ...ButtonDecorations,
  play: async ({ canvas }) => {
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Scope' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(onScope).toHaveBeenCalledOnce();
    await userEvent.tab();
    await expect(canvas.getByRole('combobox', { name: 'Fruit' })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Filters' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(onFilters).toHaveBeenCalledOnce();
    await expect(screen.queryByRole('listbox')).toBeNull();
  },
};

// A full-width field's list stays inside React Aria's 12px viewport padding,
// or scrolling an option into view scrolls the page and closes the list.
export const FullWidthList: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('combobox', { name: 'Fruit' });
    const viewport = document.documentElement.clientWidth;
    await expect(
      input.closest('[data-slot=input-group]')?.getBoundingClientRect().width,
    ).toBe(viewport);
    await userEvent.type(input, 'ap');
    const list = await screen.findByRole('listbox');
    const popover = list.closest<HTMLElement>('[data-slot=combobox-content]');
    if (!popover) throw new Error('No popover');
    for (const animation of popover.getAnimations()) animation.finish();
    await expect(popover.getBoundingClientRect().right).toBeLessThanOrEqual(
      viewport - 12,
    );
  },
};

// className sizes the field, and the list is at least as wide as the input
// and buttons together.
export const ListWidth: Story = {
  args: { className: 'w-96' },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('combobox', { name: 'Fruit' });
    await userEvent.click(
      canvas.getByRole('button', { name: /Show suggestions/u }),
    );
    const list = await screen.findByRole('listbox');
    const popover = list.closest<HTMLElement>('[data-slot=combobox-content]');
    const group = input.closest<HTMLElement>('[data-slot=input-group]');
    if (!popover || !group) throw new Error('No popover or group');
    await expect(group.getBoundingClientRect().width).toBe(384);
    for (const animation of popover.getAnimations()) animation.finish();
    await expect(popover.getBoundingClientRect().width).toBeGreaterThanOrEqual(
      group.getBoundingClientRect().width,
    );
  },
};
