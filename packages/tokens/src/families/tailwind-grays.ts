import { oklch } from '#/color';
import { authored, type AuthoredScale } from '#/scale';

// shadcn's gray primaries: near-black in light mode, near-white in dark.
const gray = (steps: AuthoredScale['steps']) =>
  authored({ dark: 200, light: 900 }, steps);

/**
 * Tailwind CSS 4.3.3's gray scales that shadcn offers as base colors
 * (`theme.css`), copied unchanged.
 */
export const tailwindGrays = {
  mauve: gray({
    100: oklch(96, 0.003, 325.6),
    200: oklch(92.2, 0.005, 325.62),
    300: oklch(86.5, 0.012, 325.68),
    400: oklch(71.1, 0.019, 323.02),
    50: oklch(98.5, 0, null),
    500: oklch(54.2, 0.034, 322.5),
    600: oklch(43.5, 0.029, 321.78),
    700: oklch(36.4, 0.029, 323.89),
    800: oklch(26.3, 0.024, 320.12),
    900: oklch(21.2, 0.019, 322.12),
    950: oklch(14.5, 0.008, 326),
  }),
  mist: gray({
    100: oklch(96.3, 0.002, 197.1),
    200: oklch(92.5, 0.005, 214.3),
    300: oklch(87.2, 0.007, 219.6),
    400: oklch(72.3, 0.014, 214.4),
    50: oklch(98.7, 0.002, 197.1),
    500: oklch(56, 0.021, 213.5),
    600: oklch(45, 0.017, 213.2),
    700: oklch(37.8, 0.015, 216),
    800: oklch(27.5, 0.011, 216.9),
    900: oklch(21.8, 0.008, 223.9),
    950: oklch(14.8, 0.004, 228.8),
  }),
  neutral: gray({
    100: oklch(97, 0, null),
    200: oklch(92.2, 0, null),
    300: oklch(87, 0, null),
    400: oklch(70.8, 0, null),
    50: oklch(98.5, 0, null),
    500: oklch(55.6, 0, null),
    600: oklch(43.9, 0, null),
    700: oklch(37.1, 0, null),
    800: oklch(26.9, 0, null),
    900: oklch(20.5, 0, null),
    950: oklch(14.5, 0, null),
  }),
  olive: gray({
    100: oklch(96.6, 0.005, 106.5),
    200: oklch(93, 0.007, 106.5),
    300: oklch(88, 0.011, 106.6),
    400: oklch(73.7, 0.021, 106.9),
    50: oklch(98.8, 0.003, 106.5),
    500: oklch(58, 0.031, 107.3),
    600: oklch(46.6, 0.025, 107.3),
    700: oklch(39.4, 0.023, 107.4),
    800: oklch(28.6, 0.016, 107.4),
    900: oklch(22.8, 0.013, 107.4),
    950: oklch(15.3, 0.006, 107.1),
  }),
  stone: gray({
    100: oklch(97, 0.001, 106.424),
    200: oklch(92.3, 0.003, 48.717),
    300: oklch(86.9, 0.005, 56.366),
    400: oklch(70.9, 0.01, 56.259),
    50: oklch(98.5, 0.001, 106.423),
    500: oklch(55.3, 0.013, 58.071),
    600: oklch(44.4, 0.011, 73.639),
    700: oklch(37.4, 0.01, 67.558),
    800: oklch(26.8, 0.007, 34.298),
    900: oklch(21.6, 0.006, 56.043),
    950: oklch(14.7, 0.004, 49.25),
  }),
  taupe: gray({
    100: oklch(96, 0.002, 17.2),
    200: oklch(92.2, 0.005, 34.3),
    300: oklch(86.8, 0.007, 39.5),
    400: oklch(71.4, 0.014, 41.2),
    50: oklch(98.6, 0.002, 67.8),
    500: oklch(54.7, 0.021, 43.1),
    600: oklch(43.8, 0.017, 39.3),
    700: oklch(36.7, 0.016, 35.7),
    800: oklch(26.8, 0.011, 36.5),
    900: oklch(21.4, 0.009, 43.1),
    950: oklch(14.7, 0.004, 49.3),
  }),
  zinc: gray({
    100: oklch(96.7, 0.001, 286.375),
    200: oklch(92, 0.004, 286.32),
    300: oklch(87.1, 0.006, 286.286),
    400: oklch(70.5, 0.015, 286.067),
    50: oklch(98.5, 0, null),
    500: oklch(55.2, 0.016, 285.938),
    600: oklch(44.2, 0.017, 285.786),
    700: oklch(37, 0.013, 285.805),
    800: oklch(27.4, 0.006, 286.033),
    900: oklch(21, 0.006, 285.885),
    950: oklch(14.1, 0.005, 285.823),
  }),
};

export type Gray = keyof typeof tailwindGrays;
