import { Separator } from '@oakoss/ui/components/ui/layout/separator';

export function SeparatorDemo() {
  return (
    <div className="not-prose w-full max-w-sm text-sm">
      <p className="font-medium">Release notes</p>
      <p className="text-muted-foreground">What changed in this version.</p>
      <Separator className="my-4" />
      <div className="flex h-5 items-center gap-4">
        Docs
        <Separator orientation="vertical" />
        Source
        <Separator orientation="vertical" />
        Changelog
      </div>
    </div>
  );
}
