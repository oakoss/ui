import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { expect, test } from 'vitest';

import {
  type MeterProps,
  MeterTrack,
  type MeterTrackProps,
  type MeterValueProps,
} from '#/components/ui/feedback/meter';

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('Meter takes a label or children that replace the layout', () => {
  const valid: MeterProps[] = [
    { label: 'Storage', value: 40 },
    { children: createElement('span'), value: 40 },
    { children: ({ valueText }) => valueText, value: 40 },
  ];
  // @ts-expect-error children replace the layout, so the label would be lost
  const both: MeterProps = { children: createElement('span'), label: 'Disk' };
  // @ts-expect-error intent is one of the five
  const intent: MeterProps = { intent: 'danger' };
  // @ts-expect-error a meter always has a value
  const indeterminate: MeterProps = { isIndeterminate: true };
  // @ts-expect-error an empty child would render the layout with no label
  const empty: MeterProps = { children: null };
  expect([...valid, both, intent, indeterminate, empty]).toHaveLength(7);
});

test('Meter parts need a Meter around them', () => {
  expect(() => renderToStaticMarkup(createElement(MeterTrack))).toThrow(
    'Meter parts must be inside a Meter.',
  );
});

test('MeterValue renders only the value it formats', () => {
  const valid: MeterValueProps[] = [{}, { children: (text) => `${text} used` }];
  // @ts-expect-error the value is the content; children only wrap it
  const node: MeterValueProps = { children: 'Full' };
  // @ts-expect-error React rejects children with dangerouslySetInnerHTML
  const html: MeterValueProps = { dangerouslySetInnerHTML: { __html: 'x' } };
  expect([...valid, node, html]).toHaveLength(4);
});

test('MeterTrack draws its own fill', () => {
  const valid: MeterTrackProps = { className: 'h-2' };
  // @ts-expect-error the fill is the track's content
  const children: MeterTrackProps = { children: 'x' };
  // @ts-expect-error React rejects children with dangerouslySetInnerHTML
  const html: MeterTrackProps = { dangerouslySetInnerHTML: { __html: 'x' } };
  expect([valid, children, html]).toHaveLength(3);
});
