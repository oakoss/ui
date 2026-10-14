import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Tag,
  TagGroup,
  type TagGroupProps,
} from '@oakoss/ui/components/ui/data/tag-group';
import { expect, userEvent } from 'storybook/test';

import { computedColor, tokenColor } from '#/helpers/color';
import { setState, transitioned } from '#/helpers/state';

const meta = {
  args: { label: 'Filters', selectionMode: 'multiple' },
  component: TagGroup,
  title: 'Data/TagGroup/States',
} satisfies Meta<typeof TagGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

const intents = [
  'neutral',
  'primary',
  'success',
  'warning',
  'destructive',
  'info',
] as const;

// A selected tag turns solid, so selection shows as a fill and not as color
// alone, and darkens on hover and press; a resting selectable tag tints with
// a state layer. Selectable tags take a pointer.
export const Selection: Story = {
  play: async ({ canvas }) => {
    const tag = canvas.getByRole('row', { name: 'Open' });
    const rest = canvas.getByRole('row', { name: 'Closed' });
    await expect(tag).toHaveAttribute('aria-selected', 'false');
    await expect(getComputedStyle(tag).cursor).toBe('pointer');
    await userEvent.click(tag);
    await expect(tag).toHaveAttribute('aria-selected', 'true');
    await setState(tag, 'resting');
    await expect(getComputedStyle(tag).backgroundColor).toBe(
      tokenColor('--color-foreground'),
    );
    await expect(getComputedStyle(tag).color).toBe(
      tokenColor('--color-background'),
    );
    const hover = computedColor(
      'color-mix(in oklab, var(--color-foreground) 90%, transparent)',
    );
    for (const state of ['pressed', 'hovered'] as const) {
      await setState(tag, state);
      await expect(getComputedStyle(tag).backgroundColor).toBe(hover);
      await expect(getComputedStyle(tag).backgroundImage).toBe('none');
    }
    await setState(rest, 'resting');
    const layer = getComputedStyle(rest).backgroundImage;
    await setState(rest, 'hovered');
    await expect(getComputedStyle(rest).backgroundImage).not.toBe(layer);
  },
  render: (args) => (
    <TagGroup {...groupArgs(args)}>
      <Tag id="open">Open</Tag>
      <Tag id="closed">Closed</Tag>
    </TagGroup>
  ),
};

// Each intent's tag is soft at rest and solid when selected; axe checks the
// contrast of both in light and dark.
export const Intents: Story = {
  args: { defaultSelectedKeys: intents.map((intent) => `${intent}-on`) },
  play: async ({ canvas }) => {
    for (const intent of intents) {
      const rest = getComputedStyle(
        canvas.getByRole('row', { name: `${intent} off` }),
      );
      const on = getComputedStyle(
        canvas.getByRole('row', { name: `${intent} on` }),
      );
      const isNeutral = intent === 'neutral';
      await expect(rest.backgroundColor).toBe(
        tokenColor(
          isNeutral ? '--color-secondary' : `--color-${intent}-subtle`,
        ),
      );
      await expect(rest.color).toBe(
        tokenColor(isNeutral ? '--color-foreground' : `--color-${intent}-text`),
      );
      await expect(on.backgroundColor).toBe(
        tokenColor(isNeutral ? '--color-foreground' : `--color-${intent}`),
      );
    }
  },
  render: (args) => (
    <TagGroup {...groupArgs(args)}>
      {intents.flatMap((intent) => [
        <Tag id={`${intent}-off`} intent={intent} key={`${intent}-off`}>
          {`${intent} off`}
        </Tag>,
        <Tag id={`${intent}-on`} intent={intent} key={`${intent}-on`}>
          {`${intent} on`}
        </Tag>,
      ])}
    </TagGroup>
  ),
};

// A disabled tag fades, can't be selected, and the keyboard skips it.
export const Disabled: Story = {
  args: { disabledKeys: ['closed'] },
  play: async ({ canvas }) => {
    const disabled = canvas.getByRole('row', { name: 'Closed' });
    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await expect(getComputedStyle(disabled).opacity).toBe('0.5');
    await userEvent.click(disabled);
    await expect(disabled).not.toHaveAttribute('aria-selected', 'true');
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    await expect(canvas.getByRole('row', { name: 'Draft' })).toHaveFocus();
  },
  render: (args) => (
    <TagGroup {...groupArgs(args)}>
      <Tag id="open">Open</Tag>
      <Tag id="closed">Closed</Tag>
      <Tag id="draft">Draft</Tag>
    </TagGroup>
  ),
};

// In forced colors a selected tag takes the system's selection colors, and a
// disabled one the system's disabled color, like a native disabled button.
export const ForcedColors: Story = {
  args: {
    defaultSelectedKeys: ['open', 'closed'],
    disabledKeys: ['closed', 'archived'],
  },
  parameters: {
    a11y: { config: { rules: [{ enabled: false, id: 'color-contrast' }] } },
  },
  play: async ({ canvas }) => {
    await expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const open = canvas.getByRole('row', { name: 'Open' });
    await transitioned(open);
    const selected = getComputedStyle(open);
    const rest = getComputedStyle(canvas.getByRole('row', { name: 'Draft' }));
    const native = getComputedStyle(canvas.getByText('Native'));
    const disabled = getComputedStyle(
      canvas.getByRole('row', { name: 'Closed' }),
    );
    await expect(selected.backgroundColor).not.toBe(rest.backgroundColor);
    await expect(selected.borderTopColor).toBe(selected.backgroundColor);
    await expect(selected.color).not.toBe(rest.color);
    const archived = getComputedStyle(
      canvas.getByRole('row', { name: 'Archived' }),
    );
    // Disabled, selected or not, a tag paints like a native disabled button.
    await expect(disabled.backgroundColor).toBe(rest.backgroundColor);
    for (const style of [disabled, archived]) {
      await expect(style.color).toBe(native.color);
      await expect(style.opacity).toBe('1');
    }
    // The remove button on the selected tag draws its outline in Highlight.
    await userEvent.tab();
    await userEvent.tab();
    const remove = canvas.getByRole('button', { name: 'Remove Open' });
    await expect(remove).toHaveFocus();
    await expect(getComputedStyle(remove).outlineColor).toBe(
      selected.backgroundColor,
    );
  },
  render: (args) => (
    <div className="grid gap-3">
      <TagGroup {...groupArgs(args)} onRemove={() => undefined}>
        <Tag id="open">Open</Tag>
        <Tag id="closed">Closed</Tag>
        <Tag id="draft">Draft</Tag>
        <Tag id="archived">Archived</Tag>
      </TagGroup>
      <button disabled type="button">
        Native
      </button>
    </div>
  ),
  tags: ['forced-colors'],
};

// A story's args without the tag items, so a render can pass its own tags.
function groupArgs({
  children: _children,
  dependencies: _dependencies,
  items: _items,
  ...args
}: Partial<TagGroupProps<object>>) {
  return args;
}
