import { defineConfig } from '@terrazzo/cli';
import css from '@terrazzo/plugin-css';
import tailwind from '@terrazzo/plugin-tailwind';

export default defineConfig({
  tokens: ['./src/mauve.tokens.json'],
  outDir: './dist/',
  plugins: [
    css({ filename: 'tokens.css' }),
    tailwind({
      // Resolved relative to outDir, so the root-level template is "../".
      template: '../tailwind.template.css',
      filename: 'theme.css',
      theme: { color: { mauve: ['color.mauve.**'] } },
    }),
  ],
});
