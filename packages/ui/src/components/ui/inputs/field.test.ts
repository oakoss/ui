import { createElement, Fragment } from 'react';
import { expect, test } from 'vitest';

import { isEmptyNode } from '#/components/ui/inputs/field';

// Values that render nothing, so the part that would hold them never mounts.
test.each([
  ['undefined', undefined],
  ['null', null],
  ['false', false],
  ['true', true],
  ['an empty string', ''],
  ['an empty array', []],
  ['an array of empty values', [null, false, '']],
  ['an empty fragment', createElement(Fragment)],
  ['a fragment of empty values', createElement(Fragment, null, false, null)],
  [
    'a fragment in an array',
    [createElement(Fragment, null, createElement(Fragment))],
  ],
])('%s is empty', (_, node) => {
  expect(isEmptyNode(node)).toBe(true);
});

test.each([
  ['text', 'Email'],
  ['zero', 0],
  ['an element', createElement('span')],
  ['text in a fragment', createElement(Fragment, null, false, 'Email')],
  ['text in an array', [null, 'Email']],
])('%s is not empty', (_, node) => {
  expect(isEmptyNode(node)).toBe(false);
});

function* label() {
  yield 'Email';
}

// Reading a one-shot iterable would use it up before it renders, so it
// counts as content and stays unread.
test('a generator counts as content and is left unread', () => {
  const node = label();
  expect(isEmptyNode(node)).toBe(false);
  expect(node.next().value).toBe('Email');
});
