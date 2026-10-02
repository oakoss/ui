import type { NeutralRole } from '#/roles';

export type Style<Name extends string = string> = {
  colors: Readonly<Record<'field', { dark: StyleColor; light: StyleColor }>>;
  id: string;
  name: string;
  tokens: Readonly<Record<Name, StyleToken>>;
};

export type StyleColor = 'transparent' | { alpha: number; role: NeutralRole };

// `lineHeight` is emitted as `--text-x--line-height`, so only text tokens take it.
export type StyleToken =
  | {
      description: string;
      lineHeight?: never;
      namespace: Exclude<ThemeNamespace, 'text'>;
      value: string;
    }
  | {
      description: string;
      lineHeight?: string;
      namespace: 'text';
      value: string;
    };

// `null` emits a plain variable, for values Tailwind has no namespace for.
export type ThemeNamespace = 'radius' | 'spacing' | 'text' | null;

export function defineStyle<const Name extends string>(
  style: Style<Name>,
): Style<Name> {
  return style;
}
