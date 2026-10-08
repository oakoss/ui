import { Separator } from '@oakoss/ui/components/ui/layout/separator';

export function SeparatorVertical() {
  return (
    <div className="not-prose flex h-5 items-center gap-4 text-sm">
      Blog
      <Separator orientation="vertical" />
      Docs
      <Separator orientation="vertical" />
      Source
    </div>
  );
}
