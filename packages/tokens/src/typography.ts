export const fontRoles = ['sans', 'mono', 'heading'] as const;

export type FontRole = (typeof fontRoles)[number];

// Each field maps to Tailwind's `--text-x` / `--text-x--{line-height,letter-spacing,font-weight}`.
export type TextStyle = {
  letterSpacing?: string;
  lineHeight: string;
  size: string;
  weight?: number;
};

export type Typography<Size extends string = string> = {
  fonts: Readonly<Record<FontRole, string>>;
  id: string;
  name: string;
  scale: Readonly<Record<Size, TextStyle>>;
};

export function defineTypography<const Size extends string>(
  typography: Typography<Size>,
): Typography<Size> {
  return typography;
}
