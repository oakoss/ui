import {
  axes,
  chartRoleMeta,
  type ChartSeries,
  contrastMinimum,
  contrastPairs,
  derivedRoleMeta,
  derivedRoles,
  families,
  intentRoleKinds,
  intentRoleMeta,
  intentStepRuleText,
} from '@oakoss/tokens';

import {
  type File,
  type Node,
  recordExpansion,
  recordMarkdown,
} from './expansion-output';
import { tokenReference } from './token-reference';
import { groupValues, type TokenValue } from './token-values';

type Cell = Node | string;

const family = families[axes.family.default];

type TokenElement = {
  attribute: string;
  expand: (file: File, node: Node, value: string) => Node;
};

/**
Writes `<TokenTable group>` into the `.md` output as a Markdown table of the
default family's light and dark values, while the page keeps the live
table. Expands `<TokenRules set>` into a table on the page and in the
output alike. Both give search one record per table row.
*/
export function remarkTokenDocs() {
  return (tree: Node, file: File) => {
    transform(tree, (node, element) => {
      const value = attribute(node, element.attribute);
      if (value === undefined) {
        throw new Error(`<${node.name}> needs a ${element.attribute}`);
      }
      return element.expand(file, node, value);
    });
  };
}

const elements: Record<string, TokenElement> = {
  TokenRules: {
    attribute: 'set',
    expand: (file, node, set) => {
      const rules = own(ruleSets, set);
      if (rules === undefined) throw new Error(`no token rules "${set}"`);
      const rows = rules();
      return searchable(recordExpansion(file, node, table(rows)), rows);
    },
  },
  TokenTable: {
    attribute: 'group',
    expand: (file, node, group) => {
      const rows = tokenValues(group);
      recordMarkdown(file, node, markdownTable(rows));
      return searchable(node, rows);
    },
  },
};

const ruleSets: Record<string, () => Cell[][]> = {
  charts: chartRows,
  contrast: contrastRows,
  derived: derivedRows,
  intent: intentRows,
  neutral: neutralRows,
};

function attribute(node: Node, name: string): string | undefined {
  const value = node.attributes?.find((entry) => entry.name === name)?.value;
  return typeof value === 'string' ? value : undefined;
}

function cell(token: TokenValue | undefined): string {
  return `\`${token?.source ?? ''}\` \`${token?.color ?? ''}\``;
}

function cellText(cell: Cell): string {
  return typeof cell === 'string'
    ? cell.replaceAll('`', '')
    : (cell.value ?? '');
}

function chartRows(): Cell[][] {
  const { charts } = family;
  return [
    ['Token', 'Description', `${family.name}'s color`],
    ...Object.entries(chartRoleMeta).map(([role, meta], index) => [
      code(`--${role}`),
      described(meta),
      charts.kind === 'ramp'
        ? `Step ${charts.steps[index] ?? ''} of the ${charts.source.intent ?? charts.source.hue} scale`
        : seriesText(charts.series[index]),
    ]),
  ];
}

function code(value: string): Node {
  return { type: 'inlineCode', value };
}

function contrastRows(): Cell[][] {
  return [
    ['Text', 'Background', 'Minimum'],
    ...contrastPairs
      .filter(({ kind }) => kind !== 'decorative')
      .map(({ background, foreground, kind }) => [
        code(`--${foreground}`),
        code(`--${background}`),
        `${contrastMinimum[kind]}:1`,
      ]),
  ];
}

function defaultFamilyTokens(groupId: string) {
  const values = (flavor: string) =>
    groupValues(tokenReference(), groupId, { family: family.id, flavor })
      .values;
  return { dark: values('dark'), light: values('light') };
}

function derivedRows(): Cell[][] {
  const targets = new Map<string, string>(Object.entries(derivedRoles));
  return [
    ['Token', 'Follows', 'Description'],
    ...Object.entries(derivedRoleMeta).map(([role, meta]) => [
      code(`--${role}`),
      code(`--${targets.get(role) ?? ''}`),
      described(meta),
    ]),
  ];
}

// The rule tables read the role metadata directly; the token reference's
// rows arrive with the two already joined.
function described({
  description,
  usage,
}: {
  description: string;
  usage?: string;
}): string {
  return usage === undefined ? description : `${description} ${usage}`;
}

// Role descriptions mark names with backticks, so a string cell's
// backticked parts become inline code.
function inline(text: string): Node[] {
  return text
    .split('`')
    .map((part, index) =>
      index % 2 === 1 ? code(part) : { type: 'text', value: part },
    )
    .filter(({ value }) => value !== '');
}

function intentRows(): Cell[][] {
  const intentName = '{intent}';
  return [
    ['Token', 'Description', 'Step'],
    ...intentRoleKinds.map((kind) => [
      code(kind === 'fill' ? `--${intentName}` : `--${intentName}-${kind}`),
      described(intentRoleMeta[kind]),
      intentStepRuleText[kind],
    ]),
  ];
}

function markdownTable(rows: Cell[][]): string {
  const line = (row: Cell[]) =>
    `| ${row.map((cell) => (typeof cell === 'string' ? cell : `\`${cell.value ?? ''}\``)).join(' | ')} |`;
  const [head = [], ...body] = rows;
  return [
    line(head),
    `| ${head.map(() => '---').join(' | ')} |`,
    ...body.map((row) => line(row)),
  ].join('\n');
}

// Each family maps these by hand, so the table shows the default family's.
function neutralRows(): Cell[][] {
  const { dark, light } = defaultFamilyTokens('neutral');
  return [
    ['Token', 'Description', `${family.name} light`, `${family.name} dark`],
    ...light.map((token, index) => [
      code(`--${token.name}`),
      token.description,
      code(token.source),
      code(dark[index]?.source ?? ''),
    ]),
  ];
}

// A table's own entry, so a name like `toString` isn't read off the prototype.
function own<T>(table: Record<string, T>, key: string): T | undefined {
  return Object.hasOwn(table, key) ? table[key] : undefined;
}

// Search indexes paragraphs, and a table has none, so each row becomes one.
function searchable(node: Node, rows: Cell[][]): Node {
  const contents = rows
    .slice(1)
    .map((row) => ({ content: row.map((cell) => cellText(cell)).join(' ') }));
  return { ...node, data: { structuredData: { contents } } };
}

function seriesText(series: ChartSeries<string> | undefined): string {
  if (series === undefined) return '';
  const { hue, steps } = series;
  return `${hue} ${steps.light} (light), ${steps.dark} (dark)`;
}

function table(rows: Cell[][]): Node {
  return {
    children: rows.map((row) => ({
      children: row.map((cell) => ({
        children: typeof cell === 'string' ? inline(cell) : [cell],
        type: 'tableCell',
      })),
      type: 'tableRow',
    })),
    type: 'table',
  };
}

function tokenValues(groupId: string): Cell[][] {
  const { dark, light } = defaultFamilyTokens(groupId);
  return [
    ['Token', `${family.name} light`, `${family.name} dark`, 'Description'],
    ...light.map((token, index) => [
      code(`--${token.name}`),
      cell(token),
      cell(dark[index]),
      token.description,
    ]),
  ];
}

function transform(
  node: Node,
  expand: (node: Node, element: TokenElement) => Node,
): Node {
  const element =
    node.type === 'mdxJsxFlowElement' && node.name !== undefined
      ? own(elements, node.name)
      : undefined;
  if (element !== undefined) return expand(node, element);
  if (node.children) {
    node.children = node.children.map((child) => transform(child, expand));
  }
  return node;
}
