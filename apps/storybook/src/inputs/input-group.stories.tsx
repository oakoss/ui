import type { Meta, StoryObj } from '@storybook/react-vite';

import * as Icon from '@oakoss/ui/components/icons';
import { FieldLabel } from '@oakoss/ui/components/ui/inputs/field';
import { Input } from '@oakoss/ui/components/ui/inputs/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
} from '@oakoss/ui/components/ui/inputs/input-group';
import { Textarea } from '@oakoss/ui/components/ui/inputs/textarea';
import { TextField } from 'react-aria-components';
import { expect, userEvent } from 'storybook/test';

import { part } from '../parts';

const meta = {
  component: InputGroup,
  title: 'Inputs/Input Group',
} satisfies Meta<typeof InputGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

function Website({ isInvalid = false }: { isInvalid?: boolean }) {
  return (
    <TextField isInvalid={isInvalid}>
      <FieldLabel>Website</FieldLabel>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <Input />
        <InputGroupAddon align="inline-end">
          <InputGroupButton aria-label="Copy" size="icon-sm">
            <Icon.Check />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </TextField>
  );
}

// Inside a field the group adds nothing for screen readers; the input keeps
// the field's name.
export const Default: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Website' });
    await expect(input.parentElement).toBe(part('input-group'));
    await expect(part('input-group')).toHaveAttribute('role', 'presentation');
  },
  render: () => <Website />,
};

// A named group is announced; an unnamed one isn't.
export const Named: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'Search' })).toBeVisible();
  },
  render: () => (
    <InputGroup aria-label="Search">
      <InputGroupAddon>
        <Icon.Search aria-hidden />
      </InputGroupAddon>
      <Input aria-label="Query" />
    </InputGroup>
  ),
};

// The group draws one border and one focus outline around the addons and the
// input, which drops its own.
export const FocusRing: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Website' });
    const group = input.parentElement;
    if (!group) throw new Error('No group');
    await userEvent.click(input);
    await expect(getComputedStyle(group).outlineStyle).toBe('solid');
    await expect(getComputedStyle(group).outlineOffset).toBe('2px');
    await expect(getComputedStyle(input).outlineStyle).toBe('none');
    await expect(getComputedStyle(input).borderTopWidth).toBe('0px');
  },
  render: () => <Website />,
};

// A focused addon button shows its own outline, not the group's too.
export const ButtonFocus: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Copy' });
    const group = button.closest<HTMLElement>('[data-slot=input-group]');
    if (!group) throw new Error('No group');
    await userEvent.tab();
    await userEvent.tab();
    await expect(button).toHaveFocus();
    await expect(getComputedStyle(group).outlineStyle).not.toBe('solid');
  },
  render: () => <Website />,
};

// Clicking an addon's text focuses the input; clicking its button doesn't.
export const AddonClick: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Website' });
    await userEvent.click(canvas.getByText('https://'));
    await expect(input).toHaveFocus();
    await userEvent.click(canvas.getByRole('button', { name: 'Copy' }));
    await expect(input).not.toHaveFocus();
  },
  render: () => <Website />,
};

// A native control in an addon keeps the focus a click gives it.
export const AddonSelect: Story = {
  play: async ({ canvas }) => {
    const currency = canvas.getByRole('combobox', { name: 'Currency' });
    await userEvent.click(currency);
    await expect(currency).toHaveFocus();
  },
  render: () => (
    <InputGroup>
      <Input aria-label="Amount" />
      <InputGroupAddon align="inline-end">
        <select aria-label="Currency" className="bg-transparent">
          <option>USD</option>
          <option>EUR</option>
        </select>
      </InputGroupAddon>
    </InputGroup>
  ),
};

// Addon buttons are small with no 44px hit area, which would cover the input.
export const AddonButton: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Copy' });
    await expect(button).toHaveAttribute('data-variant', 'ghost');
    await expect(button.getBoundingClientRect().height).toBe(32);
    await expect(getComputedStyle(button, '::after').minHeight).toBe('0px');
  },
  render: () => <Website />,
};

// One control height, whatever sits inside: the group is the control.
export const Sizes: Story = {
  play: async ({ canvas }) => {
    const heights = ['sm', 'md', 'lg'].map(
      (size) =>
        canvas
          .getByRole('textbox', { name: size })
          .closest('[data-slot=input-group]')
          ?.getBoundingClientRect().height,
    );
    await expect(heights).toEqual([32, 36, 40]);
  },
  render: () => (
    <div className="flex flex-col gap-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <InputGroup key={size} size={size}>
          <InputGroupAddon>
            <InputGroupText>$</InputGroupText>
          </InputGroupAddon>
          <Input aria-label={size} />
        </InputGroup>
      ))}
    </div>
  ),
};

export const Invalid: Story = {
  play: async ({ canvas }) => {
    const group = canvas
      .getByRole('textbox', { name: 'Website' })
      .closest<HTMLElement>('[data-slot=input-group]');
    if (!group) throw new Error('No group');
    await expect(group).toHaveAttribute('data-invalid', 'true');
    for (const animation of group.getAnimations()) animation.finish();
    const probe = document.createElement('div');
    probe.style.color = 'var(--color-destructive-text)';
    document.body.append(probe);
    await expect(getComputedStyle(group).borderTopColor).toBe(
      getComputedStyle(probe).color,
    );
    probe.remove();
  },
  render: () => <Website isInvalid />,
};

// The group fades once; the input inside isn't faded a second time.
export const Disabled: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Notes' });
    const group = input.closest<HTMLElement>('[data-slot=input-group]');
    if (!group) throw new Error('No group');
    await expect(getComputedStyle(group).opacity).toBe('0.5');
    await expect(getComputedStyle(input).opacity).toBe('1');
  },
  render: () => (
    <TextField isDisabled>
      <FieldLabel>Notes</FieldLabel>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>@</InputGroupText>
        </InputGroupAddon>
        <Input />
      </InputGroup>
    </TextField>
  ),
};

// A textarea grows the group, and a block addon sits below it; clicking the
// addon focuses the textarea.
export const WithTextarea: Story = {
  play: async ({ canvas }) => {
    const textarea = canvas.getByRole('textbox', { name: 'Message' });
    const group = textarea.closest<HTMLElement>('[data-slot=input-group]');
    if (!group) throw new Error('No group');
    await expect(getComputedStyle(group).flexDirection).toBe('column');
    await userEvent.click(canvas.getByText('Markdown supported'));
    await expect(textarea).toHaveFocus();
  },
  render: () => (
    <TextField>
      <FieldLabel>Message</FieldLabel>
      <InputGroup>
        <Textarea />
        <InputGroupAddon align="block-end">
          <InputGroupText>Markdown supported</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </TextField>
  ),
};

// The start addon sits at the right right to left.
export const RightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Website' });
    const text = canvas.getByText('https://');
    await expect(text.getBoundingClientRect().left).toBeGreaterThan(
      input.getBoundingClientRect().left,
    );
  },
  render: () => <Website />,
};

// The border stays visible in forced colors, matching a native input's.
export const ForcedColors: Story = {
  play: async ({ canvas }) => {
    const group = canvas
      .getByRole('textbox', { name: 'Website' })
      .closest<HTMLElement>('[data-slot=input-group]');
    if (!group) throw new Error('No group');
    const native = canvas.getByRole('textbox', { name: 'Native' });
    await expect(getComputedStyle(group).borderTopStyle).toBe('solid');
    await expect(getComputedStyle(group).borderTopColor).toBe(
      getComputedStyle(native).borderTopColor,
    );
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <Website />
      <input aria-label="Native" />
    </div>
  ),
  tags: ['forced-colors'],
};
