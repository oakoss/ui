import type { Key } from 'react-aria-components';

import { Select, SelectItem } from '@oakoss/ui/components/ui/inputs/select';
import {
  ToggleGroup,
  ToggleGroupItem,
} from '@oakoss/ui/components/ui/inputs/toggle-group';
import { useState } from 'react';
import { tokenReference } from 'virtual:token-reference';

import type {
  TokenEntry,
  TokenGroup,
  TokenRow,
} from '#/lib/token-reference-types';

import { CopyButton } from '#/components/copy-button';

const {
  colors,
  defaultFamily,
  families,
  groups,
  primaryThemes,
  sources,
  themes,
} = tokenReference;

type ControlProps = {
  family: Family;
  onChange: (selection: Selection) => void;
  selection: Selection;
};

type Family = (typeof families)[number];

type Selection = { family: string; flavor: string; primary: string };

/**
One group of the token reference, with its own family, flavor and, for the
Primary group, primary switcher. Swatches take the color inline, so a group
can show light values on a dark page.
*/
export function TokenTable({ group: groupId }: { group: string }) {
  const group = groups.find(({ id }) => id === groupId);
  if (group === undefined) throw new Error(`no token group "${groupId}"`);
  const first = familyById(defaultFamily);
  const [selection, setSelection] = useState<Selection>({
    family: first.id,
    flavor: first.defaultFlavor,
    primary: first.primary,
  });
  const family = familyById(selection.family);
  const entries = themeEntries(group, selection);

  return (
    <div aria-label={group.title} className="not-prose my-6" role="group">
      <Controls
        family={family}
        hasPrimary={group.id === 'primary'}
        onChange={setSelection}
        selection={selection}
      />
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-fd-muted text-fd-muted-foreground text-start">
            <tr>
              {['Token', 'Source', 'Value', 'Description'].map((heading) => (
                <th
                  className="px-3 py-2 text-start font-medium"
                  key={heading}
                  scope="col"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {group.rows.map((row, index) => (
              <Row entry={entryAt(entries, index)} key={row.name} row={row} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Controls({
  hasPrimary,
  ...props
}: { hasPrimary: boolean } & ControlProps) {
  const { family, onChange, selection } = props;
  return (
    <div className="mb-3 flex flex-wrap items-end gap-3">
      <Select
        className="w-40"
        label="Family"
        onChange={(key) => {
          if (typeof key === 'string') onChange(withFamily(selection, key));
        }}
        value={family.id}
      >
        {families.map(({ id, name }) => (
          <SelectItem id={id} key={id}>
            {name}
          </SelectItem>
        ))}
      </Select>
      {hasPrimary && (
        <Select
          className="w-40"
          label="Primary"
          onChange={(key) => {
            if (typeof key === 'string')
              onChange({ ...selection, primary: key });
          }}
          value={selection.primary}
        >
          {family.primaries.map((id) => (
            <SelectItem id={id} key={id}>
              {`${id.charAt(0).toUpperCase()}${id.slice(1)}`}
            </SelectItem>
          ))}
        </Select>
      )}
      <FlavorChoice {...props} />
    </div>
  );
}

function entryAt(entries: TokenEntry[], index: number): TokenEntry {
  const entry = entries[index];
  if (entry === undefined) throw new Error(`no token entry ${index}`);
  return entry;
}

function familyById(id: string): Family {
  const family = families.find((entry) => entry.id === id);
  if (family === undefined) throw new Error(`no family "${id}"`);
  return family;
}

function FlavorChoice({ family, onChange, selection }: ControlProps) {
  return (
    <ToggleGroup
      aria-label="Flavor"
      disallowEmptySelection
      onSelectionChange={(keys: Set<Key>) => {
        const [key] = keys;
        if (typeof key === 'string') onChange({ ...selection, flavor: key });
      }}
      selectedKeys={[selection.flavor]}
      size="sm"
      variant="outline"
    >
      {family.flavors.map(({ id, name }) => (
        <ToggleGroupItem id={id} key={id}>
          {name}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

function Row({ entry, row }: { entry: TokenEntry; row: TokenRow }) {
  const [sourceIndex, colorIndex] = entry;
  const source = sources[sourceIndex];
  const value = colors[colorIndex];
  if (source === undefined || value === undefined) {
    throw new Error(`no source or color for ${row.name}`);
  }
  return (
    <tr className="border-t">
      <td className="px-3 py-2">
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-6 shrink-0 rounded-md border"
            data-token={row.name}
            style={{ background: value }}
          />
          <CopyButton
            aria-label={`Copy var(--${row.name})`}
            className="font-mono"
            text={() => `var(--${row.name})`}
            variant="ghost"
          >
            {`--${row.name}`}
          </CopyButton>
        </span>
      </td>
      <td className="px-3 py-2 font-mono whitespace-nowrap">{source}</td>
      <td className="px-3 py-2 font-mono whitespace-nowrap">{value}</td>
      <td className="text-fd-muted-foreground px-3 py-2">
        {withCode(
          row.usage === undefined
            ? row.description
            : `${row.description} ${row.usage}`,
        )}
      </td>
    </tr>
  );
}

function themeEntries(
  group: TokenGroup,
  { family, flavor, primary }: Selection,
): TokenEntry[] {
  const entries =
    group.id === 'primary'
      ? primaryThemes[`${family}/${flavor}/${primary}`]
      : themes[`${family}/${flavor}`]?.[group.id];
  if (entries?.length !== group.rows.length) {
    throw new Error(`no ${group.id} tokens for ${family}/${flavor}`);
  }
  return entries;
}

// Token descriptions mark names with backticks, as Markdown does.
function withCode(text: string) {
  return text
    .split('`')
    .map((part, index) =>
      index % 2 === 1 ? <code key={part}>{part}</code> : part,
    );
}

function withFamily(selection: Selection, id: string): Selection {
  const next = familyById(id);
  return {
    family: next.id,
    flavor: next.flavors.some((flavor) => flavor.id === selection.flavor)
      ? selection.flavor
      : next.defaultFlavor,
    primary: next.primaries.includes(selection.primary)
      ? selection.primary
      : next.primary,
  };
}
