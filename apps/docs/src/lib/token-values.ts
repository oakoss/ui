import type {
  TokenGroup,
  TokenReference,
  TokenRow,
} from './token-reference-types.ts';

export type TokenValue = { color: string; source: string } & TokenRow;

/**
A group's rows with their source and color in one family and flavor, the
Primary group's under `primary` when given. Throws on missing data rather
than rendering a blank cell.
*/
export function groupValues(
  reference: TokenReference,
  groupId: string,
  choice: { family: string; flavor: string; primary?: string },
): { group: TokenGroup; values: TokenValue[] } {
  const { family, flavor, primary } = choice;
  const group = reference.groups.find(({ id }) => id === groupId);
  if (group === undefined) throw new Error(`no token group "${groupId}"`);
  const entries =
    groupId === 'primary' && primary !== undefined
      ? reference.primaryThemes[`${family}/${flavor}/${primary}`]
      : reference.themes[`${family}/${flavor}`]?.[groupId];
  if (entries?.length !== group.rows.length) {
    throw new Error(`no ${groupId} tokens for ${family}/${flavor}`);
  }
  const values = group.rows.map((row, index): TokenValue => {
    const [sourceIndex, colorIndex] = entries[index] ?? [];
    const source =
      sourceIndex === undefined ? undefined : reference.sources[sourceIndex];
    const color =
      colorIndex === undefined ? undefined : reference.colors[colorIndex];
    if (source === undefined || color === undefined) {
      throw new Error(`no source or color for ${row.name}`);
    }
    return { ...row, color, source };
  });
  return { group, values };
}
