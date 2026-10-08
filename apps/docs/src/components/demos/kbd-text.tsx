import { Kbd, KbdGroup } from '@oakoss/ui/components/ui/data/kbd';

export function KbdText() {
  return (
    <p className="not-prose text-sm text-muted-foreground">
      Press{' '}
      <KbdGroup>
        <Kbd label="Command">⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>{' '}
      to open search.
    </p>
  );
}
