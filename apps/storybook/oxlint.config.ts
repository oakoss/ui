import base from '@oakoss/oxlint-config/base';
import { compose } from '@oakoss/oxlint-config/compose';
import react from '@oakoss/oxlint-config/react';
import tailwind from '@oakoss/oxlint-config/tailwind';
import vitest from '@oakoss/oxlint-config/vitest';
import { defineConfig } from 'oxlint';

// Play functions drive one pointer and keyboard, so each interaction has to
// finish before the next.
const stories = defineConfig({
  overrides: [
    { files: ['**/*.stories.tsx'], rules: { 'no-await-in-loop': 'off' } },
  ],
});

export default defineConfig(compose(base, react, tailwind, vitest, stories));
