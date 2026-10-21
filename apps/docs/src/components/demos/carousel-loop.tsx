import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@oakoss/ui/components/ui/layout/carousel';

export function CarouselLoop() {
  return (
    <div className="not-prose w-full max-w-sm px-12">
      <Carousel aria-label="Highlights" opts={{ align: 'start', loop: true }}>
        <CarouselContent>
          {Array.from({ length: 5 }, (_, index) => (
            <CarouselItem className="basis-4/5" key={index}>
              <div className="flex aspect-video items-center justify-center rounded-lg border text-2xl font-semibold">
                {index + 1}
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
