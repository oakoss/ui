import { Kbd, KbdGroup } from '@oakoss/ui/components/ui/data/kbd';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandItem,
  CommandList,
} from '@oakoss/ui/components/ui/overlays/command';
import { DialogTrigger } from '@oakoss/ui/components/ui/overlays/dialog';
import { useEffect, useState } from 'react';

export function CommandDialogDemo() {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (
        event.key.toLowerCase() !== 'j' ||
        !(event.metaKey || event.ctrlKey)
      ) {
        return;
      }
      event.preventDefault();
      setIsOpen((open) => !open);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);
  return (
    <div className="not-prose">
      <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
        <Button variant="outline">
          Open the palette
          <KbdGroup>
            <Kbd label="Command">⌘</Kbd>
            <Kbd>J</Kbd>
          </KbdGroup>
        </Button>
        <CommandDialog>
          <Command>
            <CommandInput placeholder="Type a command" />
            <CommandList
              aria-label="Commands"
              onAction={() => {
                setIsOpen(false);
              }}
            >
              <CommandItem id="settings">Settings</CommandItem>
              <CommandItem id="profile">Profile</CommandItem>
              <CommandItem id="sign-out" intent="destructive">
                Sign out
              </CommandItem>
            </CommandList>
          </Command>
        </CommandDialog>
      </DialogTrigger>
    </div>
  );
}
