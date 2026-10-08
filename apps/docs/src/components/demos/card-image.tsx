import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@oakoss/ui/components/ui/surfaces/card';

const landscape =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"%3E%3Cdefs%3E%3ClinearGradient id="g" x2="0" y2="1"%3E%3Cstop offset="0" stop-color="%2393c5fd"/%3E%3Cstop offset="1" stop-color="%23fde68a"/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="16" height="9" fill="url(%23g)"/%3E%3Cpath d="M0 9 5 4l3 3 3-2 5 4z" fill="%23475569"/%3E%3C/svg%3E';

export function CardImage() {
  return (
    <Card className="not-prose w-full max-w-xs">
      <img
        alt=""
        className="aspect-video w-full object-cover"
        src={landscape}
      />
      <CardHeader>
        <CardTitle>Lake at dawn</CardTitle>
        <CardDescription>
          Photographed at 5:40, before the fog lifted.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
