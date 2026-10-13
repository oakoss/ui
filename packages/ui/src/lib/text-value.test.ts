import { createElement } from 'react';
import { expect, test } from 'vitest';

import { itemTextValue } from '#/lib/text-value';

test('a textValue wins over the label', () => {
  expect(itemTextValue('Rename', 'Edit name')).toBe('Rename');
});

test('a blank textValue falls back to a text label', () => {
  expect(itemTextValue('', 'Copy')).toBe('Copy');
  expect(itemTextValue('  ', 'Copy')).toBe('Copy');
});

test('an interpolated label joins its parts', () => {
  expect(itemTextValue(undefined, ['Delete ', 3, ' files'])).toBe(
    'Delete 3 files',
  );
});

test('a label that is not all text has no text value', () => {
  expect(
    itemTextValue(undefined, ['Delete ', createElement('b', null, '3')]),
  ).toBeUndefined();
  expect(itemTextValue(undefined, createElement('span'))).toBeUndefined();
});

test('an empty or blank label has no text value', () => {
  expect(itemTextValue(undefined, [])).toBeUndefined();
  expect(itemTextValue(undefined, '')).toBeUndefined();
  expect(itemTextValue('', ' '.repeat(3))).toBeUndefined();
});
