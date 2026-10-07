import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ComponentProps } from 'react';

import { FieldLabel, Input } from '@oakoss/ui/components/ui/inputs/field';
import { TextField } from '@oakoss/ui/components/ui/inputs/text-field';
import { ContextualHelp } from '@oakoss/ui/components/ui/overlays/contextual-help';
import {
  PopoverBody,
  PopoverHeader,
  PopoverTitle,
} from '@oakoss/ui/components/ui/overlays/popover';
import {
  Button as AriaButton,
  Group as AriaGroup,
  Input as AriaInput,
  Label as AriaLabel,
  NumberField as AriaNumberField,
} from 'react-aria-components';
import { expect, screen, userEvent, waitFor } from 'storybook/test';

import { closed } from './dialog-demo';

type DemoProps = Omit<ComponentProps<typeof ContextualHelp>, 'children'>;

function Demo(props: DemoProps) {
  return (
    <div className="grid min-h-80 place-items-center">
      <div className="flex items-center gap-1 text-sm font-medium">
        Workspace ID
        <ContextualHelp {...props}>
          <PopoverHeader>
            <PopoverTitle>What’s a workspace ID?</PopoverTitle>
          </PopoverHeader>
          <PopoverBody>
            The ID other apps use to find this workspace. It never changes.
          </PopoverBody>
        </ContextualHelp>
      </div>
    </div>
  );
}

const meta = {
  render: (args) => <Demo {...args} />,
  title: 'Overlays/ContextualHelp',
} satisfies Meta<DemoProps>;

export default meta;

type Story = StoryObj<typeof meta>;

function iconScale(button: HTMLElement) {
  const svg = button.querySelector('svg');
  if (!svg) throw new Error('No icon');
  return getComputedStyle(svg).scale;
}

function lucideIcon(button: HTMLElement) {
  return button.querySelector('svg')?.getAttribute('class') ?? '';
}

// Measured once the enter transition finishes.
async function settledPanel() {
  const dialog = await screen.findByRole('dialog');
  const panel = dialog.closest('[data-slot=popover-content]');
  if (!(panel instanceof HTMLElement)) throw new Error('No panel');
  await waitFor(async () => {
    await expect(panel).not.toHaveAttribute('data-entering');
  });
  await Promise.all(panel.getAnimations().map((a) => a.finished));
  return { box: panel.getBoundingClientRect(), dialog, panel };
}

// A ghost icon button named "Help" opens a popover named by its title, below
// and aligned to the button's start edge.
export const Default: Story = {
  play: async () => {
    const button = screen.getByRole('button', { name: 'Help' });
    await expect(button).toHaveAttribute(
      'data-slot',
      'contextual-help-trigger',
    );
    await expect(lucideIcon(button)).toContain('circle-question-mark');
    // The small icon size, so it fits beside a label.
    await expect(button.getBoundingClientRect().height).toBe(32);
    await userEvent.click(button);
    const { box, dialog, panel } = await settledPanel();
    await expect(dialog).toHaveAccessibleName('What’s a workspace ID?');
    const buttonBox = button.getBoundingClientRect();
    await expect(panel).toHaveAttribute('data-placement', 'bottom');
    await expect(Math.abs(box.left - buttonBox.left)).toBeLessThan(1);
    await expect(Math.abs(box.top - buttonBox.bottom - 8)).toBeLessThan(1);
  },
};

export const Info: Story = {
  args: { variant: 'info' },
  play: async () => {
    const button = screen.getByRole('button', { name: 'Information' });
    await expect(lucideIcon(button)).toContain('lucide-info');
  },
};

// The labels are props, for translation.
export const Labels: Story = {
  args: { helpLabel: 'Aide' },
  play: async () => {
    await expect(screen.getByRole('button', { name: 'Aide' })).toBeVisible();
  },
};

export const EscapeRestoresFocus: Story = {
  play: async () => {
    const button = screen.getByRole('button', { name: 'Help' });
    await userEvent.click(button);
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await closed();
    await waitFor(async () => {
      await expect(button).toHaveFocus();
    });
  },
};

// In a right-to-left locale, start is the right edge.
export const RightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: async () => {
    const button = screen.getByRole('button', { name: 'Help' });
    // Arabic writes its question mark mirrored (؟), so the icon follows.
    await expect(iconScale(button)).toBe('-1 1');
    await userEvent.click(button);
    const { box } = await settledPanel();
    await expect(
      Math.abs(box.right - button.getBoundingClientRect().right),
    ).toBeLessThan(1);
  },
};

// A consumer's crossOffset reaches the popover.
export const CrossOffset: Story = {
  args: { crossOffset: 20 },
  play: async () => {
    const button = screen.getByRole('button', { name: 'Help' });
    await userEvent.click(button);
    const { box } = await settledPanel();
    await expect(
      Math.abs(box.left - button.getBoundingClientRect().left - 20),
    ).toBeLessThan(1);
  },
};

// Hebrew uses the Latin "?", and the info icon has no direction.
export const Hebrew: Story = {
  globals: { locale: 'he-IL' },
  play: async () => {
    await expect(iconScale(screen.getByRole('button', { name: 'Help' }))).toBe(
      'none',
    );
  },
};

export const InfoInArabic: Story = {
  args: { variant: 'info' },
  globals: { locale: 'ar-EG' },
  play: async () => {
    await expect(
      iconScale(screen.getByRole('button', { name: 'Information' })),
    ).toBe('none');
  },
};

// Beside a field's label, not inside it, the field keeps its own name and the
// label still focuses the input.
export const BesideFieldLabel: Story = {
  play: async () => {
    const input = screen.getByRole('textbox');
    await expect(input).toHaveAccessibleName('Workspace ID');
    await expect(screen.getByRole('button', { name: 'Help' })).toBeVisible();
    await userEvent.click(screen.getByText('Workspace ID'));
    await expect(input).toHaveFocus();
  },
  render: (args) => (
    <TextField defaultValue="ws_8f2k">
      <div className="flex items-center gap-1">
        <FieldLabel>Workspace ID</FieldLabel>
        <ContextualHelp {...args}>
          <PopoverHeader>
            <PopoverTitle>What’s a workspace ID?</PopoverTitle>
          </PopoverHeader>
          <PopoverBody>
            The ID other apps use to find this workspace.
          </PopoverBody>
        </ContextualHelp>
      </div>
      <Input />
    </TextField>
  ),
};

// Inside a disabled field whose buttons take the field's props, the help
// button stays enabled and opens its own popover.
export const InsideDisabledNumberField: Story = {
  play: async () => {
    const help = screen.getByRole('button', { name: 'Help' });
    await expect(help).toBeEnabled();
    await userEvent.click(help);
    await expect(
      await screen.findByRole('dialog', { name: 'Seats' }),
    ).toBeInTheDocument();
    await expect(screen.getByRole('textbox')).toHaveValue('3');
  },
  render: (args) => (
    <AriaNumberField defaultValue={3} isDisabled>
      <div className="flex items-center gap-1">
        <AriaLabel>Seats</AriaLabel>
        <ContextualHelp {...args}>
          <PopoverHeader>
            <PopoverTitle>Seats</PopoverTitle>
          </PopoverHeader>
          <PopoverBody>Each person on the plan uses one seat.</PopoverBody>
        </ContextualHelp>
      </div>
      <AriaGroup>
        <AriaInput />
        <AriaButton slot="increment">+</AriaButton>
      </AriaGroup>
    </AriaNumberField>
  ),
};

// A 44px hit area around the small button, like every icon button.
export const TargetSize: Story = {
  play: async () => {
    const button = screen.getByRole('button', { name: 'Help' });
    await expect(getComputedStyle(button, '::after').minHeight).toBe('44px');
  },
};
