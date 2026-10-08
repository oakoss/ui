import { Kbd, KbdGroup } from '@oakoss/ui/components/ui/data/kbd';

export function KbdDemo() {
  return (
    <div className="not-prose flex flex-col items-center gap-4 text-sm">
      <KbdGroup>
        <Kbd label="Command">⌘</Kbd>
        <Kbd label="Shift">⇧</Kbd>
        <Kbd label="Option">⌥</Kbd>
        <Kbd label="Control">⌃</Kbd>
      </KbdGroup>
      <KbdGroup>
        <Kbd>Ctrl</Kbd>
        <span aria-hidden="true">+</span>
        <Kbd>B</Kbd>
      </KbdGroup>
    </div>
  );
}
