import { Button } from '@oakoss/ui/components/ui/inputs/button';

export function ButtonCustomColors() {
  return (
    <div className="not-prose flex flex-wrap items-center gap-3">
      <Button className="[--btn-bg:var(--color-emerald-700)] [--btn-fg:white] [--btn-hover:var(--color-emerald-800)]">
        Publish
      </Button>
      <Button
        className="[--btn-subtle:var(--color-violet-100)] [--btn-text:var(--color-violet-800)]"
        variant="soft"
      >
        Preview
      </Button>
    </div>
  );
}
