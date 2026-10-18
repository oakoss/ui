import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { Select, SelectItem } from '@oakoss/ui/components/ui/inputs/select';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@oakoss/ui/components/ui/inputs/toggle-group';
import {
  Popover,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@oakoss/ui/components/ui/overlays/popover';
import {
  Tooltip,
  TooltipTrigger,
} from '@oakoss/ui/components/ui/overlays/tooltip';
import { Palette } from 'lucide-react';
import { type ReactNode, useId, useState } from 'react';
import { type Key, Link } from 'react-aria-components';
import { themeOptions } from 'virtual:theme-options';

import { CopyButton } from '#/components/copy-button';
import { packageManagerKey, packageManagers } from '#/lib/package-managers';
import { siteUrl } from '#/lib/site';
import {
  applyTheme,
  pickTheme,
  themeItemPath,
  type ThemeState,
  themeStorageKey,
} from '#/lib/theme-state';

type Update = (change: null | Partial<ThemeState>) => void;

export function ThemePanel() {
  const [theme, setTheme] = useState(themeOptions.defaults);

  // Any primary the new family lacks falls back to its default; null resets.
  const update: Update = (change) => {
    const next =
      change === null
        ? themeOptions.defaults
        : pickTheme(themeOptions, [{ ...theme, ...change }]);
    setTheme(next);
    applyTheme(themeOptions, next);
    try {
      if (change === null) localStorage.removeItem(themeStorageKey);
      else localStorage.setItem(themeStorageKey, JSON.stringify(next));
    } catch {
      // Storage can be blocked; the theme still applies to this page.
    }
  };

  return (
    <PopoverTrigger
      onOpenChange={(open) => {
        if (open) setTheme(current());
      }}
    >
      <TooltipTrigger>
        <Button aria-label="Theme" size="icon-sm" variant="ghost">
          <Palette aria-hidden />
        </Button>
        <Tooltip>Theme</Tooltip>
      </TooltipTrigger>
      <Popover aria-label="Theme" className="w-80">
        <PopoverHeader>
          <PopoverTitle>Theme</PopoverTitle>
          <PopoverDescription>
            Restyles the component previews. The site keeps its own theme.
          </PopoverDescription>
        </PopoverHeader>
        <Controls theme={theme} update={update} />
        <Install theme={theme} update={update} />
      </Popover>
    </PopoverTrigger>
  );
}

function Choices({
  children,
  label,
  onChange,
  selected,
  size,
}: {
  children: ReactNode;
  label: string;
  onChange: (key: string) => void;
  selected: string;
  size: 'icon-sm' | 'sm';
}) {
  const labelId = useId();
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium" id={labelId}>
        {label}
      </span>
      <ToggleGroup
        aria-labelledby={labelId}
        className="flex-wrap gap-1"
        disallowEmptySelection
        onSelectionChange={(keys: Set<Key>) => {
          const [key] = keys;
          if (typeof key === 'string') onChange(key);
        }}
        selectedKeys={[selected]}
        size={size}
        variant="outline"
      >
        {children}
      </ToggleGroup>
    </div>
  );
}

function Controls({ theme, update }: { theme: ThemeState; update: Update }) {
  return (
    <>
      <Select
        label="Family"
        onChange={(key) => {
          if (typeof key === 'string') update({ family: key });
        }}
        value={theme.family}
      >
        {themeOptions.families.map(({ id, name }) => (
          <SelectItem id={id} key={id}>
            {name}
          </SelectItem>
        ))}
      </Select>
      <Choices
        label="Primary"
        onChange={(primary) => update({ primary })}
        selected={theme.primary}
        size="icon-sm"
      >
        {themeOptions.families
          .find(({ id }) => id === theme.family)
          ?.primaries.map((primary) => (
            <Swatch key={primary.id} {...primary} />
          ))}
      </Choices>
      <Choices
        label="Radius"
        onChange={(radius) => update({ radius })}
        selected={theme.radius}
        size="sm"
      >
        {themeOptions.radii.map(({ name }) => (
          <ToggleGroupItem className="capitalize" id={name} key={name}>
            {name}
          </ToggleGroupItem>
        ))}
      </Choices>
    </>
  );
}

function current(): ThemeState {
  const { family, primary, radius } = document.documentElement.dataset;
  return pickTheme(themeOptions, [{ family, primary, radius }]);
}

// Fumadocs keeps the install tabs' pick in session storage, then local storage.
function dlx(): string {
  let name: null | string = null;
  try {
    name =
      sessionStorage.getItem(packageManagerKey) ??
      localStorage.getItem(packageManagerKey);
  } catch {
    // Storage can be blocked; npm is the tabs' default too.
  }
  return packageManagers.find((manager) => manager.name === name)?.dlx ?? 'npx';
}

function Install({ theme, update }: { theme: ThemeState; update: Update }) {
  const command = `${dlx()} shadcn@latest add ${siteUrl}${themeItemPath(theme)}`;
  return (
    <div className="flex flex-col gap-2">
      <code className="rounded-md bg-muted p-2 font-mono text-xs break-all">
        {command}
      </code>
      <div className="flex gap-2">
        <CopyButton text={() => command}>Copy command</CopyButton>
        <CopyButton text={() => shareUrl(theme)}>Copy link</CopyButton>
        <Button
          className="ms-auto"
          onPress={() => update(null)}
          size="sm"
          variant="ghost"
        >
          Reset
        </Button>
      </div>
      <Link
        className="text-xs text-muted-foreground underline underline-offset-3 hover:text-foreground"
        href="/docs/installation#switch-themes-at-runtime"
      >
        Switching themes at runtime? Install them all
      </Link>
    </div>
  );
}

function shareUrl(theme: ThemeState): string {
  return `${location.origin}${location.pathname}?${new URLSearchParams(theme)}`;
}

function Swatch({
  id,
  label,
  swatch,
}: {
  id: string;
  label: string;
  swatch: string;
}) {
  return (
    <TooltipTrigger>
      <ToggleGroupItem aria-label={label} id={id}>
        {/* Forced colors would drop the background, leaving every swatch
            blank. */}
        <span
          className="size-4 rounded-full border border-foreground/15 forced-color-adjust-none"
          style={{ background: swatch }}
        />
      </ToggleGroupItem>
      <Tooltip>{label}</Tooltip>
    </TooltipTrigger>
  );
}
