import type { ReactNode } from 'react';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselProps,
} from '@oakoss/ui/components/ui/layout/carousel';
import { screen } from 'storybook/test';

import { part } from '#/helpers/parts';

export type CarouselDemoProps = {
  count?: number;
  itemClassName?: string;
  renderSlide?: (index: number) => ReactNode;
} & Partial<CarouselProps>;

export function CarouselDemo({
  count = 5,
  itemClassName,
  renderSlide = slideNumber,
  ...props
}: CarouselDemoProps) {
  return (
    <div className="mx-auto w-80 py-14">
      <Carousel aria-label="Photos" {...props}>
        <CarouselContent
          className={props.orientation === 'vertical' ? 'h-48' : undefined}
        >
          {Array.from({ length: count }, (_, index) => (
            <CarouselItem className={itemClassName} key={index}>
              <div className="flex aspect-square items-center justify-center rounded-md border text-3xl">
                {renderSlide(index)}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
}

// Testing Library's role queries still find inert content, which browsers
// leave out of the accessibility tree.
export function exposed() {
  return slides().filter((slide) => !slide.inert);
}

export async function frames(count: number): Promise<void> {
  if (count <= 0) return;
  await new Promise((resolve) => {
    requestAnimationFrame(resolve);
  });
  await frames(count - 1);
}

export function live() {
  return part('carousel').querySelector('[role=status]');
}

export function next() {
  return screen.getByRole('button', { name: 'Next slide' });
}

export function previous() {
  return screen.getByRole('button', { name: 'Previous slide' });
}

// Where a slide's content sits against the viewport, settled or not.
export function slideOffset(index: number, edge: 'left' | 'right' = 'left') {
  const content = slides()[index]?.firstElementChild?.getBoundingClientRect();
  return (
    (content?.[edge] ?? NaN) -
    part('carousel-content').getBoundingClientRect()[edge]
  );
}

export function slides() {
  return screen.getAllByRole('group', { hidden: true });
}

function slideNumber(index: number) {
  return index + 1;
}
