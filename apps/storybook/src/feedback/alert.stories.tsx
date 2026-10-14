import type { Meta, StoryObj } from '@storybook/react-vite';

import * as Icon from '@oakoss/ui/components/icons';
import {
  Alert,
  AlertAction,
  AlertDescription,
  type AlertProps,
  AlertTitle,
} from '@oakoss/ui/components/ui/feedback/alert';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { expect } from 'storybook/test';

import { part } from '#/helpers/parts';

function AlertDemo(props: AlertProps) {
  return (
    <Alert {...props}>
      <AlertTitle>Payment method expiring</AlertTitle>
      <AlertDescription>
        Your card ends in 4242 and expires next month.{' '}
        <a href="#billing">Update it</a> to keep your plan.
      </AlertDescription>
    </Alert>
  );
}

const meta = {
  args: { className: 'w-[36rem]' },
  component: AlertDemo,
  title: 'Feedback/Alert',
} satisfies Meta<typeof AlertDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

const intents = ['info', 'success', 'warning', 'destructive'] as const;

// Static by default: no role, so screen readers read it in place rather than
// interrupting. Neutral shows no icon and takes the card's colors.
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(part('alert')).not.toHaveAttribute('role');
    await expect(canvas.queryByRole('alert')).toBeNull();
    await expect(canvas.queryByRole('status')).toBeNull();
    await expect(document.querySelector('[data-slot=alert-icon]')).toBeNull();
    await expect(part('alert')).toHaveAttribute('data-intent', 'neutral');
    await expectColors(part('alert'), {
      bg: 'card',
      border: 'border',
      fg: 'card-foreground',
      muted: 'muted-foreground',
    });
  },
};

// Each intent shows its icon, hidden from screen readers, and colors the
// alert with its roles; axe checks the contrast in light and dark.
export const Intents: Story = {
  play: async () => {
    for (const intent of intents) {
      const alert = document.querySelector<HTMLElement>(
        `[data-slot=alert][data-intent=${CSS.escape(intent)}]`,
      );
      if (!alert) throw new Error(`No ${intent} alert`);
      const icon = part('alert-icon', alert);
      await expect(icon).toHaveAttribute('aria-hidden', 'true');
      await expect(icon.querySelector('svg')).not.toBeNull();
      await expectColors(alert, {
        bg: `${intent}-subtle`,
        border: `${intent}-border`,
        fg: `${intent}-text`,
        muted: `${intent}-text`,
      });
    }
  },
  render: (args) => (
    <div className="grid gap-3">
      {intents.map((intent) => (
        <AlertDemo key={intent} {...args} intent={intent} />
      ))}
    </div>
  ),
};

// icon replaces the intent's icon, and a value that renders nothing shows
// none, with the text at the alert's padding rather than beside an empty
// column.
export const IconOverride: Story = {
  play: async ({ canvas }) => {
    const [custom, ...none] =
      document.querySelectorAll<HTMLElement>('[data-slot=alert]');
    if (!custom || none.length !== 5) throw new Error('No alerts');
    await expect(part('alert-icon', custom)).toContainElement(
      canvas.getByTestId('custom-icon'),
    );
    for (const alert of none) {
      await expect(alert.querySelector('[data-slot=alert-icon]')).toBeNull();
      const style = getComputedStyle(alert);
      await expect(
        part('alert-title', alert).getBoundingClientRect().left -
          alert.getBoundingClientRect().left,
      ).toBe(px(style.borderLeftWidth) + px(style.paddingLeft));
    }
  },
  render: (args) => (
    <div className="grid gap-3">
      <AlertDemo {...args} icon={<Icon.Help data-testid="custom-icon" />} />
      <AlertDemo {...args} icon={null} intent="warning" />
      <AlertDemo {...args} icon={false} intent="warning" />
      <AlertDemo {...args} icon="" intent="warning" />
      <AlertDemo {...args} icon={[null, false]} intent="warning" />
      <AlertDemo {...args} icon={<></>} intent="warning" />
    </div>
  ),
};

// The icon sits on the title's first line, not centered on the whole text.
export const IconAlignment: Story = {
  args: { intent: 'info' },
  play: async () => {
    const svg = part('alert-icon')
      .querySelector('svg')
      ?.getBoundingClientRect();
    if (!svg) throw new Error('No icon');
    const icon = part('alert-icon').getBoundingClientRect();
    const title = part('alert-title').getBoundingClientRect();
    await expect(icon.top).toBe(title.top);
    await expect(icon.height).toBe(title.height);
    await expect(svg.height).toBe(16);
    await expect(svg.top + svg.height / 2).toBe(title.top + title.height / 2);
  },
};

// A one-line alert is as tall as its line: the icon adds no empty row.
export const OneLine: Story = {
  args: { intent: 'success' },
  play: async () => {
    const alert = part('alert');
    const style = getComputedStyle(alert);
    await expect(
      alert.clientHeight - px(style.paddingTop) - px(style.paddingBottom),
    ).toBe(part('alert-title').getBoundingClientRect().height);
  },
  render: (args) => (
    <Alert {...args}>
      <AlertTitle>Domain verified</AlertTitle>
    </Alert>
  ),
};

// A message that appears while the user is on the page opts in to a live
// role: alert interrupts, status waits.
export const LiveRoles: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('alert')).toHaveTextContent('Upload failed');
    await expect(canvas.getByRole('status')).toHaveTextContent('Saved');
  },
  render: (args) => (
    <div className="grid gap-3">
      <Alert {...args} intent="destructive" role="alert">
        <AlertTitle>Upload failed</AlertTitle>
      </Alert>
      <Alert {...args} intent="success" role="status">
        <AlertTitle>Saved</AlertTitle>
      </Alert>
    </div>
  ),
};

function ActionDemo(props: AlertProps) {
  return (
    <Alert intent="warning" {...props}>
      <AlertTitle>Your trial ends in 3 days</AlertTitle>
      <AlertDescription>
        Add a payment method to keep your work.
      </AlertDescription>
      <AlertAction>
        <Button size="sm" variant="outline">
          Upgrade
        </Button>
      </AlertAction>
    </Alert>
  );
}

// On a wide alert the action sits after the text, level with the title,
// rather than over it, and its height doesn't push the description down.
export const ActionWide: Story = {
  play: async () => {
    const action = part('alert-action').getBoundingClientRect();
    const title = part('alert-title').getBoundingClientRect();
    const description = part('alert-description').getBoundingClientRect();
    const { rowGap } = getComputedStyle(part('alert'));
    await expect(action.left).toBeGreaterThanOrEqual(description.right);
    await expect(action.left).toBeGreaterThanOrEqual(title.right);
    await expect(action.top).toBe(title.top);
    await expect(description.top - title.bottom).toBe(px(rowGap));
  },
  render: (args) => <ActionDemo {...args} />,
};

// On a narrow alert the action drops below the text, lined up with it.
export const ActionNarrow: Story = {
  args: { className: 'w-72' },
  play: async () => {
    const action = part('alert-action').getBoundingClientRect();
    const title = part('alert-title').getBoundingClientRect();
    const description = part('alert-description').getBoundingClientRect();
    await expect(action.top).toBeGreaterThanOrEqual(description.bottom);
    await expect(action.left).toBe(title.left);
  },
  render: (args) => <ActionDemo {...args} />,
};

// Without an icon, a narrow alert's action still lines up with the text.
export const ActionNarrowWithoutIcon: Story = {
  args: { className: 'w-72', icon: null },
  play: async () => {
    const action = part('alert-action').getBoundingClientRect();
    const title = part('alert-title').getBoundingClientRect();
    await expect(action.top).toBeGreaterThan(title.bottom);
    await expect(action.left).toBe(title.left);
  },
  render: (args) => <ActionDemo {...args} />,
};

// In a right-to-left locale the icon leads on the right and the action
// trails on the left.
export const RightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: async () => {
    const icon = part('alert-icon').getBoundingClientRect();
    const title = part('alert-title').getBoundingClientRect();
    const action = part('alert-action').getBoundingClientRect();
    await expect(icon.left).toBeGreaterThanOrEqual(title.right);
    await expect(action.right).toBeLessThanOrEqual(title.left);
  },
  render: (args) => <ActionDemo {...args} />,
};

// A link in the text is underlined, so it doesn't rely on color.
export const DescriptionLink: Story = {
  play: async ({ canvas }) => {
    const link = canvas.getByRole('link', { name: 'Update it' });
    await expect(getComputedStyle(link).textDecorationLine).toBe('underline');
  },
};

// Forced colors repaint the fill as the page color and the border in a
// system color, so the border keeps the alert's edge.
export const ForcedColors: Story = {
  args: { intent: 'warning' },
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    await expect(getComputedStyle(part('alert')).borderTopWidth).toBe('1px');
  },
  tags: ['forced-colors'],
};

// The computed color a CSS color value resolves to here.
function colorOf(value: string) {
  const probe = document.createElement('span');
  probe.style.color = value;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

async function expectColors(
  alert: HTMLElement,
  roles: { bg: string; border: string; fg: string; muted: string },
) {
  const style = getComputedStyle(alert);
  await expect(style.backgroundColor).toBe(colorOf(`var(--color-${roles.bg})`));
  await expect(style.borderTopColor).toBe(
    colorOf(`var(--color-${roles.border})`),
  );
  await expect(style.color).toBe(colorOf(`var(--color-${roles.fg})`));
  await expect(getComputedStyle(part('alert-description', alert)).color).toBe(
    colorOf(`var(--color-${roles.muted})`),
  );
}

function px(value: string) {
  return Number(value.replace('px', ''));
}
