import {
  axes,
  families,
  radii,
  styles,
  themeChoices,
  themeItem,
  type ThemeItem,
  themeItemJson,
} from '@oakoss/tokens';

import { themeItemPath, type ThemeOptions } from './theme-state.ts';

const style = styles[axes.style.default];

const choices = new Map(
  themeChoices(Object.values(families)).map((choice) => [
    themeItemPath({
      family: choice.family.id,
      primary: choice.primary,
      radius: choice.radius.name,
    }),
    choice,
  ]),
);

// Prerendered, since nothing links to them.
export const themeItemPaths = choices.keys().toArray();

export function themeItemAt(path: string): string | undefined {
  const choice = choices.get(path);
  return choice === undefined
    ? undefined
    : themeItemJson(themeItem(choice, style));
}

// Each swatch is the primary's light-mode color, read from the item that
// installs it.
export function themeOptions(): ThemeOptions {
  const radius = radii.find(({ value }) => value === style.tokens.radius.value);
  if (radius === undefined) {
    throw new Error(`no radius preset matches ${style.tokens.radius.value}`);
  }
  const family = families[axes.family.default];
  return {
    defaults: {
      family: family.id,
      primary: family.intents.primary.default,
      radius: radius.name,
    },
    families: Object.values(families).map((entry) => ({
      id: entry.id,
      name: entry.name,
      primaries: entry.intents.primary.choices.map((primary) => ({
        id: primary,
        swatch: swatch(themeItem({ family: entry, primary, radius }, style)),
      })),
      primary: entry.intents.primary.default,
    })),
    radii: radii.map(({ name, value }) => ({ name, value })),
  };
}

function swatch(item: ThemeItem): string {
  const color = item.cssVars.light.primary;
  if (color === undefined) throw new Error(`${item.name} has no primary`);
  return color;
}
