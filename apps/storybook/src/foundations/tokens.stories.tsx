import type { Meta, StoryObj } from '@storybook/react-vite';
import type { CSSProperties } from 'react';

import { families, formatColor, resolveTheme } from '@oakoss/tokens';
import { expect } from 'storybook/test';

type FamilyId = keyof typeof families;

type Swatch = CSSProperties & Record<'--swatch', string>;

function flavorTokens(family: FamilyId, flavor: string) {
  const theme = resolveTheme(families[family], flavor);
  if (Array.isArray(theme)) throw new Error(theme.join('\n'));
  return Object.entries(theme.tokens).map(
    ([name, color]) => [name, formatColor(color)] as const,
  );
}

// The browser writes alpha as a fraction (`/ 0.1`) where the CSS says `/ 10%`.
function serialized(color: string): string {
  const probe = document.createElement('span');
  probe.style.backgroundColor = color;
  return probe.style.backgroundColor;
}

// Swatches take their color inline, so both flavors show side by side
// whichever theme the story runs in.
function TokenSwatches({ family }: { family: FamilyId }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      {Object.entries(families[family].flavors).map(([flavor, { name }]) => (
        <section aria-label={name} key={flavor}>
          <h2 className="mb-2 text-sm font-medium">{name}</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            {flavorTokens(family, flavor).map(([token, value]) => {
              const swatch: Swatch = { '--swatch': value };
              return (
                <li className="flex items-center gap-2" key={token}>
                  <span
                    aria-hidden
                    className="size-5 shrink-0 rounded-sm border bg-(--swatch)"
                    data-token={token}
                    style={swatch}
                  />
                  <span className="font-mono">{token}</span>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

const meta = {
  component: TokenSwatches,
  // Every swatch shows the color the generator resolved for its token.
  play: async ({ args, canvasElement }) => {
    const flavors = Object.entries(families[args.family].flavors);
    for (const [flavor, { name }] of flavors) {
      const section = canvasElement.querySelector(
        `section[aria-label="${CSS.escape(name)}"]`,
      );
      const swatches = section?.querySelectorAll<HTMLElement>('[data-token]');
      const shown = [...(swatches ?? [])].map((swatch) => [
        swatch.dataset.token,
        getComputedStyle(swatch).backgroundColor,
      ]);
      const expected = flavorTokens(args.family, flavor).map(
        ([token, value]) => [token, serialized(value)],
      );
      await expect(shown).toEqual(expected);
    }
  },
  title: 'Foundations/Tokens',
} satisfies Meta<typeof TokenSwatches>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Zinc: Story = { args: { family: 'zinc' } };
export const Neutral: Story = { args: { family: 'neutral' } };
export const Stone: Story = { args: { family: 'stone' } };
export const Mauve: Story = { args: { family: 'mauve' } };
export const Olive: Story = { args: { family: 'olive' } };
export const Mist: Story = { args: { family: 'mist' } };
export const Taupe: Story = { args: { family: 'taupe' } };
export const Catppuccin: Story = { args: { family: 'catppuccin' } };
