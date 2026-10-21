import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@oakoss/ui/components/ui/layout/carousel';

export function CarouselDemo() {
  return (
    <div className="not-prose w-full max-w-xs px-12">
      <Carousel aria-label="Numbers">
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
    </div>
  );
}
