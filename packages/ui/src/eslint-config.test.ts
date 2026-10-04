import { ESLint } from 'eslint';
import path from 'node:path';
import { expect, test } from 'vitest';

const root = path.join(import.meta.dirname, '..');
// The real config, minus type information: fixtures aren't in the tsconfig,
// and only no-restricted-syntax is under test.
const eslint = new ESLint({
  cwd: root,
  overrideConfig: {
    languageOptions: { parserOptions: { projectService: false } },
  },
  ruleFilter: ({ ruleId }) => ruleId === 'no-restricted-syntax',
});

// Lints source as if it lived at `file`; returns where user-facing text was
// flagged, and throws on any other message so a parse failure can't pass.
async function textHits(source: string, file: string): Promise<string[]> {
  const [result] = await eslint.lintText(source, {
    filePath: path.join(root, file),
  });
  const messages = result?.messages ?? [];
  const other = messages.filter(
    ({ message }) => !message.startsWith('Make user-facing text'),
  );
  if (other.length > 0) throw new Error(JSON.stringify(other));
  return messages.map(
    ({ column, line }) => `${String(line)}:${String(column)}`,
  );
}

const component = 'src/components/ui/inputs/fixture.tsx';
const wrap = (jsx: string) =>
  `export function Fixture() {\n  return ${jsx};\n}\n`;

test.each([
  ['JSX text', '<span>Loading</span>'],
  ['a string child', "<span>{'Loading'}</span>"],
  ['a template child', '<span>{`Loading`}</span>'],
  ['aria-label', '<button aria-label="Close" />'],
  ['an aria-label expression', "<button aria-label={'Close'} />"],
  ['placeholder', '<input placeholder="Search" />'],
  ['title', '<span title="More" />'],
  ['alt', '<img alt="Logo" />'],
  ['a fallback label', "<button aria-label={label ?? 'Close'} />"],
  ['a conditional label', "<button aria-label={open ? 'Close' : label} />"],
  ['a conditional child', "<span>{open ? label : 'Open'}</span>"],
  ['a conditional child consequent', "<span>{open ? 'Open' : label}</span>"],
  [
    'a conditional label alternate',
    "<button aria-label={open ? label : 'Close'} />",
  ],
  ['a logical child', "<span>{invalid && 'Required'}</span>"],
  ['a string child in a fragment', "<>{'Loading'}</>"],
  // oxlint-disable-next-line no-template-curly-in-string -- fixture source text
  ['a template with words', '<span>{`${count} items`}</span>'],
  ['a spread label', "<button {...{ 'aria-label': 'Close' }} />"],
])('flags %s in a component', async (_, jsx) => {
  expect(await textHits(wrap(jsx), component)).toHaveLength(1);
});

test('allows text that comes from props, and non-text values', async () => {
  const source = [
    "export function Fixture({ label = 'Pending' }: { label?: string }) {",
    '  return (',
    '    <span aria-label={label} className="text-sm" data-slot="x" title={label}>',
    // oxlint-disable-next-line no-template-curly-in-string -- fixture source text
    "      {label} * 42 {required ? '*' : null} {`${a}${b}`}",
    "      {state === 'open' ? a : b}",
    '      <img alt="" />',
    '    </span>',
    '  );',
    '}',
    '',
  ].join('\n');
  expect(await textHits(source, component)).toEqual([]);
});

test('applies to component files only', async () => {
  const source = wrap('<span>Loading</span>');
  expect(await textHits(source, component)).toHaveLength(1);
  expect(
    await textHits(source, 'src/components/ui/inputs/fixture.test.tsx'),
  ).toEqual([]);
  expect(await textHits(source, 'src/lib/fixture.tsx')).toEqual([]);
});
