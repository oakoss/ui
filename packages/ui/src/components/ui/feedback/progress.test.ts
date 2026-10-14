import { createElement } from 'react';
import { expect, test } from 'vitest';

import type {
  ProgressProps,
  ProgressTrackProps,
  ProgressValueProps,
} from '#/components/ui/feedback/progress';

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('Progress takes a label or children that replace the layout', () => {
  const valid: ProgressProps[] = [
    { label: 'Uploading', value: 40 },
    { children: createElement('span'), value: 40 },
    { children: ({ valueText }) => valueText, value: 40 },
  ];
  // @ts-expect-error children replace the layout, so the label would be lost
  const both: ProgressProps = { children: createElement('span'), label: 'Up' };
  // @ts-expect-error intent is one of the five
  const intent: ProgressProps = { intent: 'danger' };
  // @ts-expect-error an empty child would render the layout with no label
  const empty: ProgressProps = { children: null };
  expect([...valid, both, intent, empty]).toHaveLength(6);
});

test('ProgressValue renders only the value it formats', () => {
  const valid: ProgressValueProps[] = [
    {},
    { children: (text) => `${text} done` },
  ];
  // @ts-expect-error the value is the content; children only wrap it
  const node: ProgressValueProps = { children: 'Done' };
  // @ts-expect-error React rejects children with dangerouslySetInnerHTML
  const html: ProgressValueProps = { dangerouslySetInnerHTML: { __html: 'x' } };
  expect([...valid, node, html]).toHaveLength(4);
});

test('ProgressTrack draws its own fill', () => {
  const valid: ProgressTrackProps = { className: 'h-2' };
  // @ts-expect-error the fill is the track's content
  const children: ProgressTrackProps = { children: 'x' };
  // @ts-expect-error React rejects children with dangerouslySetInnerHTML
  const html: ProgressTrackProps = { dangerouslySetInnerHTML: { __html: 'x' } };
  expect([valid, children, html]).toHaveLength(3);
});
