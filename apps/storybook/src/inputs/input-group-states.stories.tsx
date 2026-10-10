import type { Meta, StoryObj } from '@storybook/react-vite';

import * as Icon from '@oakoss/ui/components/icons';
import { Input } from '@oakoss/ui/components/ui/inputs/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
} from '@oakoss/ui/components/ui/inputs/input-group';
import { expect, fn, userEvent } from 'storybook/test';

const meta = {
  component: InputGroup,
  title: 'Inputs/Input Group/States',
} satisfies Meta<typeof InputGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

const onClick = fn((event: { preventDefault: () => void }) => {
  event.preventDefault();
});

function group(input: HTMLElement) {
  const element = input.closest<HTMLElement>('[data-slot=input-group]');
  if (!element) throw new Error('No group');
  for (const animation of element.getAnimations()) animation.finish();
  return element;
}

function resolved(value: string) {
  const probe = document.createElement('div');
  probe.style.color = value;
  document.body.append(probe);
  const { color } = getComputedStyle(probe);
  probe.remove();
  return color;
}

// Outside a field the border follows the input's own aria-invalid, or the
// group's isInvalid.
export const InvalidOutsideField: Story = {
  play: async ({ canvas }) => {
    const destructive = resolved('var(--color-destructive-text)');
    for (const name of ['Amount', 'Total']) {
      const input = canvas.getByRole('textbox', { name });
      await expect(getComputedStyle(group(input)).borderTopColor).toBe(
        destructive,
      );
    }
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <InputGroup>
        <Input aria-invalid aria-label="Amount" />
      </InputGroup>
      <InputGroup isInvalid>
        <Input aria-label="Total" />
      </InputGroup>
    </div>
  ),
};

export const NamedByLabelledBy: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('group', { name: 'Price' })).toBeVisible();
  },
  render: () => (
    <div>
      <span id="price-label">Price</span>
      <InputGroup aria-labelledby="price-label">
        <Input aria-label="Amount" />
      </InputGroup>
    </div>
  ),
};

// Text beside an addon keeps a small gap; an addon holding a button sits
// close to the edge, since the button brings its own padding.
export const Spacing: Story = {
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Website' });
    await expect(getComputedStyle(input).paddingInlineStart).toBe('8px');
    await expect(getComputedStyle(input).paddingInlineEnd).toBe('8px');
    const addon = (name: string) => {
      const element = canvas
        .getByRole('button', { name })
        .closest<HTMLElement>('[data-slot=input-group-addon]');
      if (!element) throw new Error('No addon');
      return getComputedStyle(element);
    };
    await expect(addon('Search').paddingInlineEnd).toBe('2px');
    await expect(addon('Scheme').paddingInlineStart).toBe('2px');
  },
  render: () => (
    <div className="flex flex-col gap-4">
      <InputGroup>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <Input aria-label="Website" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton aria-label="Search" size="icon-sm">
            <Icon.Search />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <InputGroup>
        <InputGroupAddon>
          <InputGroupButton aria-label="Scheme" size="icon-sm">
            <Icon.ChevronDown />
          </InputGroupButton>
        </InputGroupAddon>
        <Input aria-label="Host" />
      </InputGroup>
    </div>
  ),
};

// A button with no size of its own takes the addon's small size.
export const ButtonSize: Story = {
  play: async ({ canvas }) => {
    const button = canvas.getByRole('button', { name: 'Send' });
    await expect(button).toHaveAttribute('data-size', 'sm');
    await expect(button).toHaveAttribute('data-variant', 'ghost');
  },
  render: () => (
    <InputGroup>
      <Input aria-label="Message" />
      <InputGroupAddon align="inline-end">
        <InputGroupButton>Send</InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  ),
};

// A consumer's onClick runs first, and preventing it keeps focus where it is.
export const PreventedClick: Story = {
  beforeEach: () => {
    onClick.mockClear();
  },
  play: async ({ canvas }) => {
    const input = canvas.getByRole('textbox', { name: 'Website' });
    await userEvent.click(canvas.getByText('https://'));
    await expect(onClick).toHaveBeenCalledOnce();
    await expect(input).not.toHaveFocus();
  },
  render: () => (
    <InputGroup onClick={onClick}>
      <InputGroupAddon>
        <InputGroupText>https://</InputGroupText>
      </InputGroupAddon>
      <Input aria-label="Website" />
    </InputGroup>
  ),
};

// A custom control in an addon keeps the focus a click gives it. This one is
// out of the Tab order, so only its role keeps the focus.
export const AddonSwitch: Story = {
  play: async ({ canvas }) => {
    const toggle = canvas.getByRole('switch', { name: 'Exact match' });
    await userEvent.click(toggle);
    await expect(toggle).toHaveFocus();
  },
  render: () => (
    <InputGroup>
      <Input aria-label="Query" />
      <InputGroupAddon align="inline-end">
        <span
          aria-checked="false"
          aria-label="Exact match"
          role="switch"
          tabIndex={-1}
        >
          Aa
        </span>
      </InputGroupAddon>
    </InputGroup>
  ),
};
