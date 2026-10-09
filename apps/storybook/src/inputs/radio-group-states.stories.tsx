import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  RadioGroup,
  RadioGroupItem,
} from '@oakoss/ui/components/ui/inputs/radio-group';
import { expect, fn, userEvent } from 'storybook/test';

import { contrast, tokenColor } from '../color';
import { part } from '../parts';

const meta = {
  args: {
    'aria-label': 'Plan',
    children: (
      <>
        <RadioGroupItem value="free">Free</RadioGroupItem>
        <RadioGroupItem value="team">Team</RadioGroupItem>
      </>
    ),
  },
  component: RadioGroup,
  title: 'Inputs/RadioGroup/States',
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

function dots() {
  return [
    ...document.querySelectorAll<HTMLElement>(
      '[data-slot=radio-group-indicator]',
    ),
  ].map((dot) => getComputedStyle(dot));
}

function page() {
  return getComputedStyle(document.body).backgroundColor;
}

async function settle() {
  await Promise.all(
    document.getAnimations().map((animation) => animation.finished),
  );
}

// An unselected dot's border meets 3:1; a selected one is a thick ring.
export const Dot: Story = {
  args: { defaultValue: 'team' },
  play: async () => {
    const [free, team] = dots();
    await expect(contrast(free?.borderTopColor ?? '', page())).toBeGreaterThan(
      3,
    );
    await expect(free?.borderTopWidth).toBe('1px');
    await expect(team?.borderTopWidth).toBe('4px');
  },
};

export const FocusRing: Story = {
  play: async () => {
    await userEvent.tab();
    const [free] = dots();
    await expect(free?.outlineStyle).toBe('solid');
  },
};

// A selected option that's invalid keeps the error color.
export const InvalidSelected: Story = {
  args: { defaultValue: 'team', isInvalid: true },
  play: async ({ canvasElement }) => {
    const [, team] = dots();
    await expect(team?.borderTopColor).toBe(
      tokenColor('--color-destructive-text', canvasElement),
    );
  },
};

export const TargetSize: Story = {
  play: async () => {
    const area = getComputedStyle(part('radio-group-indicator'), '::after');
    await expect(area.minWidth).toBe('44px');
  },
};

// Stacked options sit far enough apart that their hit areas only meet: a
// point between two dots belongs to one of them, never both.
export const TargetSpacing: Story = {
  play: async () => {
    const [first, second] = [
      ...document.querySelectorAll('[data-slot=radio-group-indicator]'),
    ].map((dot) => dot.getBoundingClientRect());
    const pitch = (second?.top ?? 0) - (first?.top ?? 0);
    await expect(pitch).toBeGreaterThanOrEqual(44);
  },
};

// In a row too, the last pixel of a label still belongs to its own option.
export const TargetSpacingHorizontal: Story = {
  args: {
    children: (
      <>
        <RadioGroupItem value="s">S</RadioGroupItem>
        <RadioGroupItem value="m">M</RadioGroupItem>
        <RadioGroupItem value="l">L</RadioGroupItem>
      </>
    ),
    orientation: 'horizontal',
  },
  play: async () => {
    const labels = [
      ...document.querySelectorAll<HTMLElement>('[data-slot=radio-group-item]'),
    ];
    const followed = labels.slice(0, -1);
    for (const label of followed) {
      const { bottom, right, top } = label.getBoundingClientRect();
      await expect(
        document.elementFromPoint(right - 1, (top + bottom) / 2),
      ).toBe(label);
    }
  },
};

export const TargetSizeOff: Story = {
  args: { targetSize: false },
  play: async () => {
    const area = getComputedStyle(part('radio-group-indicator'), '::after');
    await expect(area.minWidth).not.toBe('44px');
    await expect(
      part('radio-group-item').getBoundingClientRect().height,
    ).toBeGreaterThanOrEqual(24);
  },
};

function cards() {
  return (
    <>
      <RadioGroupItem
        description="One project, community support."
        value="free"
      >
        Free
      </RadioGroupItem>
      <RadioGroupItem description="Up to 20 seats." value="team">
        Team
      </RadioGroupItem>
    </>
  );
}

// A card selects from anywhere on it, its description included, and keeps
// its option's name; the card shows focus and selection, not the dot.
export const Card: Story = {
  args: { children: cards(), variant: 'card' },
  play: async ({ canvas, canvasElement }) => {
    const team = canvas.getByRole('radio', { name: 'Team' });
    await expect(team).toHaveAccessibleDescription('Up to 20 seats.');
    // What a pointer over the description hits: the label stretched over
    // the card, not the description beneath it.
    const { height, left, top, width } = canvas
      .getByText('Up to 20 seats.')
      .getBoundingClientRect();
    const target = document.elementFromPoint(
      left + width / 2,
      top + height / 2,
    );
    if (!(target instanceof HTMLElement)) throw new Error('Nothing there');
    await expect(team.closest('label')).toBe(target);
    await userEvent.click(target);
    await expect(team).toBeChecked();
    await settle();
    const card = team.closest<HTMLElement>(
      '[data-slot=radio-group-item-field]',
    );
    if (!card) throw new Error('No card');
    await expect(getComputedStyle(card).borderTopColor).toBe(
      tokenColor('--color-primary', canvasElement),
    );
    await expect(
      getComputedStyle(part('radio-group-indicator'), '::after').minWidth,
    ).not.toBe('44px');
  },
};

const onTerms = fn();

// A link in a card's description stays a link, above the stretched label,
// even nested in other text.
export const CardLink: Story = {
  args: {
    children: (
      <RadioGroupItem
        description={
          <>
            Includes the{' '}
            <strong>
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
            </strong>
            .
          </>
        }
        value="team"
      >
        Team
      </RadioGroupItem>
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
    await expect(canvas.getByRole('radio', { name: 'Team' })).not.toBeChecked();
  },
};

export const CardFocusRing: Story = {
  args: { children: cards(), variant: 'card' },
  play: async () => {
    await userEvent.tab();
    const card = part('radio-group-item-field');
    await expect(getComputedStyle(card).outlineStyle).toBe('solid');
    const [free] = dots();
    await expect(free?.outlineStyle).toBe('none');
  },
};

// Forced colors keep both dots outlined and tell the selected one by its
// thick ring.
export const ForcedColors: Story = {
  args: { defaultValue: 'team' },
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async () => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const [free, team] = dots();
    await expect(contrast(free?.borderTopColor ?? '', page())).toBeGreaterThan(
      3,
    );
    await expect(contrast(team?.borderTopColor ?? '', page())).toBeGreaterThan(
      3,
    );
    await expect(team?.borderTopWidth).toBe('4px');
  },
  tags: ['forced-colors'],
};

export const ForcedColorsCard: Story = {
  args: { children: cards(), defaultValue: 'team', variant: 'card' },
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async ({ canvas }) => {
    const [free, team] = canvas
      .getAllByRole('radio')
      .map((radio) =>
        getComputedStyle(
          radio.closest('[data-slot=radio-group-item-field]') ?? document.body,
        ),
      );
    await expect(team?.borderTopColor).not.toBe(free?.borderTopColor);
  },
  tags: ['forced-colors'],
};
