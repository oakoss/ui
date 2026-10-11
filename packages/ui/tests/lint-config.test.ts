import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, expect, test } from 'vitest';

import config from '../oxlint.config';

const oxlint = path.join(
  path.dirname(createRequire(import.meta.url).resolve('oxlint/package.json')),
  'bin/oxlint',
);

const directory = mkdtempSync(path.join(tmpdir(), 'oxlint-config-'));
afterAll(() => {
  rmSync(directory, { force: true, recursive: true });
});

// Runs the package's real config on a file at `filePath`; returns the classes
// shadcn/no-arbitrary-values reports.
function arbitraryValues(filePath: string, classes: string[]): string[] {
  const file = path.join(directory, filePath);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(path.join(directory, '.oxlintrc.json'), JSON.stringify(config));
  writeFileSync(
    file,
    `export function Fixture() {\n  return <div className=${JSON.stringify(classes.join(' '))} />;\n}\n`,
  );
  // oxlint exits nonzero when it reports, so read stdout either way.
  const run = spawnSync(
    oxlint,
    ['-c', path.join(directory, '.oxlintrc.json'), '-f', 'json', file],
    { encoding: 'utf-8' },
  );
  const report: unknown = parseJson(run.stdout);
  if (!isReport(report)) {
    throw new Error(
      `oxlint gave no report (status ${String(run.status)}): ${run.stderr}${String(run.error ?? '')}`,
    );
  }
  return report.diagnostics
    .filter(({ code }) => code === 'shadcn(no-arbitrary-values)')
    .flatMap(({ message }) => /^"([^"]+)"/u.exec(message)?.[1] ?? []);
}

function isReport(
  value: unknown,
): value is { diagnostics: { code: string; message: string }[] } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'diagnostics' in value &&
    Array.isArray(value.diagnostics)
  );
}

function parseJson(text: string | undefined): unknown {
  try {
    return JSON.parse(text ?? '');
  } catch {
    return undefined;
  }
}

// @shadcn/lint doesn't document how allow patterns match, so pin it.
test('button may set its variables to named theme colors and its neutral hover', () => {
  expect(
    arbitraryValues('src/components/ui/inputs/button.tsx', [
      '[--btn-bg:var(--color-primary)]',
      '[--btn-fg:var(--color-primary-foreground)]',
      'gap-[inherit]',
      'gap-[13px]',
      '[--btn-hover:color-mix(in_oklab,var(--color-foreground)_90%,transparent)]',
      '[--btn-hover:color-mix(in_oklab,var(--color-foreground)_50%,transparent)]',
      '[--btn-bg:var(--color-primary,#ff0000)]',
      '[--btn-bg:#ff0000]',
      '[--btn-bg:var(--color-nope)]',
      '[--btn-bg:var(--spacing-control)]',
      '[--primary:var(--color-destructive)]',
      'p-[13px]',
    ]),
  ).toEqual([
    'gap-[13px]',
    '[--btn-hover:color-mix(in_oklab,var(--color-foreground)_50%,transparent)]',
    '[--btn-bg:var(--color-primary,#ff0000)]',
    '[--btn-bg:#ff0000]',
    '[--btn-bg:var(--color-nope)]',
    '[--btn-bg:var(--spacing-control)]',
    '[--primary:var(--color-destructive)]',
    'p-[13px]',
  ]);
});

test("other components can't set button variables", () => {
  expect(
    arbitraryValues('src/components/ui/display/badge.tsx', [
      '[--btn-bg:var(--color-primary)]',
    ]),
  ).toEqual(['[--btn-bg:var(--color-primary)]']);
});
