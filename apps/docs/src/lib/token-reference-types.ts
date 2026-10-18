export type TokenEntry = [source: number, color: number];

export type TokenGroup = { id: string; rows: TokenRow[]; title: string };

/**
Every family's tokens as plain data for the token reference. `themes` is
keyed `family/flavor`, then by group, with one entry per group row;
`primaryThemes` is keyed `family/flavor/primary`, with one entry per row
of the Primary group under that primary. An entry indexes `sources` and
`colors`, which store each string once.
*/
export type TokenReference = {
  colors: string[];
  defaultFamily: string;
  families: {
    defaultFlavor: string;
    flavors: { id: string; name: string }[];
    id: string;
    name: string;
    primaries: string[];
    primary: string;
  }[];
  groups: TokenGroup[];
  primaryThemes: Record<string, TokenEntry[]>;
  sources: string[];
  themes: Record<string, Record<string, TokenEntry[]>>;
};

export type TokenRow = { description: string; name: string; usage?: string };
