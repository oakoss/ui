import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@oakoss/ui/components/ui/layout/carousel';
import { useEffect, useState } from 'react';

export function CarouselCounter() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => {
      setCount(api?.scrollSnapList().length ?? 0);
      setCurrent((api?.selectedScrollSnap() ?? 0) + 1);
    };
    update();
    api?.on('select', update).on('reInit', update);
    return () => {
      api?.off('select', update).off('reInit', update);
    };
  }, [api]);

  return (
    <div className="not-prose w-full max-w-xs px-12">
      <Carousel aria-label="Photos" setApi={setApi}>
        <CarouselContent>
          {Array.from({ length: 5 }, (_, index) => (
            <CarouselItem key={index}>
              <div className="flex aspect-square items-center justify-center rounded-lg border text-4xl font-semibold">
                {index + 1}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      {/* The carousel announces each slide, so the counter isn't repeated. */}
      <p aria-hidden className="mt-2 text-center text-sm text-muted-foreground">
        {current} / {count}
      </p>
    </div>
  );
}
