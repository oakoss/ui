export type HeaderCell<T> = { header: T; rowSpan: number };

type HeaderLike = { column: { id: string }; isPlaceholder: boolean };

// TanStack fills the rows above a column outside any group with placeholder
// headers. The column gets one cell instead, spanning down from the first of
// them to its own header, so no header cell is left empty.
export function headerCells<T extends HeaderLike>(
  rows: readonly (readonly T[])[],
): HeaderCell<T>[][] {
  return rows.map((row, index) =>
    row
      .map((header) => cellAt(rows, index, header))
      .filter((cell) => cell !== undefined),
  );
}

// The header's cell in this row, or none when a cell above already spans it.
function cellAt<T extends HeaderLike>(
  rows: readonly (readonly T[])[],
  index: number,
  header: T,
): HeaderCell<T> | undefined {
  const { id } = header.column;
  const above = rows[index - 1] ?? [];
  if (above.some((cell) => cell.column.id === id)) return undefined;
  if (!header.isPlaceholder) return { header, rowSpan: 1 };
  const ownRow = rows.findIndex(
    (cells, at) => at > index && cells.some((cell) => isOwn(cell, id)),
  );
  const own = rows[ownRow]?.find((cell) => isOwn(cell, id));
  return own ? { header: own, rowSpan: ownRow - index + 1 } : undefined;
}

function isOwn(header: HeaderLike, id: string) {
  return header.column.id === id && !header.isPlaceholder;
}
