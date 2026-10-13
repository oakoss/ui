import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from '@oakoss/ui/components/ui/overlays/command';

export function CommandDescriptions() {
  return (
    <div className="not-prose w-full max-w-sm rounded-panel border border-border">
      <Command>
        <CommandInput placeholder="Go to" />
        <CommandList aria-label="Pages">
          <CommandItem
            description="A modal for focused tasks"
            href="/docs/components/dialog"
            id="dialog"
          >
            Dialog
          </CommandItem>
          <CommandItem
            description="Actions opened from a button"
            href="/docs/components/dropdown-menu"
            id="dropdown-menu"
          >
            Dropdown Menu
          </CommandItem>
        </CommandList>
      </Command>
    </div>
  );
}
