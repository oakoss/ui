import betterTailwindcss from 'eslint-plugin-better-tailwindcss';

export function tailwind({
  entryPoint,
  tsconfig,
}: {
  readonly entryPoint: string;
  readonly tsconfig: string;
}) {
  return [
    {
      plugins: { tailwind: betterTailwindcss },
      rules: {
        // Right-to-left locales mirror ps-/ms-/start- but not pl-/ml-/left-.
        // Block-axis spacing and sizes only change in vertical writing modes,
        // which we don't support, so those stay physical.
        'tailwind/enforce-logical-properties': [
          'error',
          {
            ignore: [
              String.raw`(^|:)!?-?(scroll-)?[mp][bt]-`,
              String.raw`(^|:)!?-?(bottom|top)-`,
              String.raw`(^|:)!?border-[bt](-|$)`,
              String.raw`(^|:)!?(max-|min-)?[hw]-`,
              String.raw`(^|:)!?size-`,
            ],
          },
        ],
        'tailwind/enforce-shorthand-classes': 'warn',
        'tailwind/no-deprecated-classes': 'warn',
        'tailwind/no-duplicate-classes': 'warn',
      },
      settings: {
        'better-tailwindcss': { entryPoint, rootFontSize: 16, tsconfig },
      },
    },
  ];
}
