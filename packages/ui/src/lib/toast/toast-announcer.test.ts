import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import {
  announce,
  announcement,
  announcementDelay,
  announcementLifetime,
} from '#/lib/toast/toast-announcer';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function region() {
  const nodes: { remove: () => void; textContent: string }[] = [];
  const element = {
    append(node: (typeof nodes)[number]) {
      nodes.push(node);
    },
    ownerDocument: {
      createElement: () => {
        const node = {
          remove: () => {
            nodes.splice(nodes.indexOf(node), 1);
          },
          textContent: '',
        };
        return node;
      },
    },
  };
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- stands in for the DOM methods announce calls; this package's tests run in Node
  return { element: element as unknown as HTMLElement, nodes };
}

const texts = (nodes: { textContent: string }[]) =>
  nodes.map((node) => node.textContent);

test('a message lands after the delay as its own node, then clears', () => {
  const { element, nodes } = region();
  announce(element, 'Saved.');
  announce(element, 'Saved.');
  expect(nodes).toHaveLength(0);
  vi.advanceTimersByTime(announcementDelay);
  expect(texts(nodes)).toEqual(['Saved.', 'Saved.']);
  vi.advanceTimersByTime(announcementLifetime);
  expect(nodes).toHaveLength(0);
});

test('a blank message or a missing region adds nothing', () => {
  const { element, nodes } = region();
  announce(element, ' '.repeat(3));
  announce(null, 'Saved.');
  vi.advanceTimersByTime(announcementDelay);
  expect(nodes).toHaveLength(0);
});

test('the parts join as sentences, keeping their own end punctuation', () => {
  expect(announcement('Changes saved', 'All files are up to date.')).toBe(
    'Changes saved. All files are up to date.',
  );
  expect(announcement('Done!', 'Saved…')).toBe('Done! Saved…');
  expect(announcement('Saved', null, '  ', undefined)).toBe('Saved.');
  expect(announcement()).toBe('');
});
