import base from '@oakoss/oxlint-config/base';
import { compose } from '@oakoss/oxlint-config/compose';
import react from '@oakoss/oxlint-config/react';
import vitest from '@oakoss/oxlint-config/vitest';
import { defineConfig } from 'oxlint';

export default defineConfig(compose(base, react, vitest));
