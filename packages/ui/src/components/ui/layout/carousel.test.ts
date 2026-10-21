import { expect, test } from 'vitest';

import type {
  CarouselProps,
  useCarousel,
} from '#/components/ui/layout/carousel';

// Checked by typecheck: each @ts-expect-error fails the build if its line
// starts compiling.
test('a carousel requires a name', () => {
  const named: CarouselProps[] = [
    { 'aria-label': 'Photos' },
    { 'aria-labelledby': 'photos-title' },
    { 'aria-label': 'Photos', orientation: 'vertical' },
  ];
  // @ts-expect-error no accessible name
  const unnamed: CarouselProps = {};
  // @ts-expect-error options aren't a name
  const optionsOnly: CarouselProps = { opts: { loop: true } };
  expect([...named, unnamed, optionsOnly]).toHaveLength(5);
});

// Code copied from shadcn, such as its CarouselContent, reads these.
test("useCarousel returns shadcn's members", () => {
  const members: (keyof ReturnType<typeof useCarousel>)[] = [
    'api',
    'canScrollNext',
    'canScrollPrev',
    'carouselRef',
    'opts',
    'orientation',
    'scrollNext',
    'scrollPrev',
  ];
  expect(members).toHaveLength(8);
});
