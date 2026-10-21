import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@oakoss/ui/components/ui/layout/carousel';

export function CarouselSizes() {
  return (
    <div className="not-prose w-full max-w-md px-12">
      <Carousel aria-label="Albums" opts={{ slidesToScroll: 'auto' }}>
        <CarouselContent>
          {Array.from({ length: 9 }, (_, index) => (
            <CarouselItem className="basis-1/2 sm:basis-1/3" key={index}>
              <div className="flex aspect-square items-center justify-center rounded-lg border text-2xl font-semibold">
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
