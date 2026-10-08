import { ScrollArea } from '@oakoss/ui/components/ui/layout/scroll-area';

const releases = ['Aurora', 'Basalt', 'Cedar', 'Delta', 'Ember', 'Fjord'];

export function ScrollAreaHorizontal() {
  return (
    <ScrollArea
      aria-label="Releases"
      className="not-prose w-full max-w-sm rounded-md border"
      orientation="horizontal"
      role="region"
    >
      <ul className="flex w-max gap-4 p-4">
        {releases.map((name) => (
          <li
            className="flex h-24 w-36 items-end rounded-md bg-muted p-3 text-sm font-medium"
            key={name}
          >
            {name}
          </li>
        ))}
      </ul>
    </ScrollArea>
  );
}
