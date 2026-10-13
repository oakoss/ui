import {
  Command,
  CommandGroup,
  CommandHeader,
  CommandInput,
  CommandItem,
  CommandList,
} from '@oakoss/ui/components/ui/overlays/command';

export function CommandDemo() {
  return (
    <div className="not-prose w-full max-w-sm rounded-panel border border-border">
      <Command>
        <CommandInput placeholder="Type a command" />
        <CommandList aria-label="Commands">
          <CommandGroup>
            <CommandHeader>Files</CommandHeader>
            <CommandItem id="new" keywords={['create']} shortcut="⌘N">
              New file
            </CommandItem>
            <CommandItem id="open" shortcut="⌘O">
              Open file
            </CommandItem>
          </CommandGroup>
          <CommandGroup>
            <CommandHeader>View</CommandHeader>
            <CommandItem id="theme" keywords={['dark', 'light']}>
              Toggle theme
            </CommandItem>
            <CommandItem id="sidebar">Toggle sidebar</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
