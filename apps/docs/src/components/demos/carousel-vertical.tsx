import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@oakoss/ui/components/ui/layout/carousel';

export function CarouselVertical() {
  return (
    <div className="not-prose w-full max-w-xs py-12">
      <Carousel aria-label="Steps" orientation="vertical">
        <CarouselContent className="h-48">
          {Array.from({ length: 5 }, (_, index) => (
            <CarouselItem className="basis-1/2" key={index}>
              <div className="flex h-full items-center justify-center rounded-lg border text-2xl font-semibold">
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
