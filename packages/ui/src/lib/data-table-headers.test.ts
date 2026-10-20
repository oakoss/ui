import { expect, test } from 'vitest';

import { headerCells } from '#/lib/data-table-headers';

function cells(rows: ReturnType<typeof head>[][]) {
  return headerCells(rows).map((row) =>
    row.map(({ header, rowSpan }) => `${header.id}:${String(rowSpan)}`),
  );
}

function head(id: string, isPlaceholder = false) {
  return {
    column: { id },
    id: `${id}${isPlaceholder ? '-p' : ''}`,
    isPlaceholder,
  };
}

test('a column outside every group spans the group rows', () => {
  expect(
    cells([
      [head('select', true), head('details'), head('amount', true)],
      [head('select'), head('status'), head('email'), head('amount')],
    ]),
  ).toEqual([
    ['select:2', 'details:1', 'amount:2'],
    ['status:1', 'email:1'],
  ]);
});

test('a column two levels below a group spans all three rows', () => {
  expect(
    cells([
      [head('id', true), head('outer')],
      [head('id', true), head('inner')],
      [head('id'), head('status')],
    ]),
  ).toEqual([['id:3', 'outer:1'], ['inner:1'], ['status:1']]);
});

test('a group nested beside a deeper one spans down to its own row', () => {
  expect(
    cells([
      [head('outer'), head('side', true)],
      [head('inner'), head('side')],
      [head('status'), head('email')],
    ]),
  ).toEqual([['outer:1', 'side:2'], ['inner:1'], ['status:1', 'email:1']]);
});

test('a column beside a nested group spans from its own row down', () => {
  expect(
    cells([
      [head('outer'), head('d', true)],
      [head('inner'), head('c', true), head('d', true)],
      [head('a'), head('b'), head('c'), head('d')],
    ]),
  ).toEqual([
    ['outer:1', 'd:3'],
    ['inner:1', 'c:2'],
    ['a:1', 'b:1'],
  ]);
});

test('a header without groups is one row of cells', () => {
  expect(cells([[head('status'), head('email')]])).toEqual([
    ['status:1', 'email:1'],
  ]);
});
