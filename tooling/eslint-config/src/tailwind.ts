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
