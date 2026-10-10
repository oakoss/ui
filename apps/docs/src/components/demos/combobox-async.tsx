import {
  Combobox,
  ComboboxItem,
} from '@oakoss/ui/components/ui/inputs/combobox';
import { useAsyncList } from 'react-aria-components';

type Country = { id: string; name: string };

const countries: Country[] = [
  { id: 'ca', name: 'Canada' },
  { id: 'cl', name: 'Chile' },
  { id: 'cn', name: 'China' },
  { id: 'fr', name: 'France' },
  { id: 'jp', name: 'Japan' },
  { id: 'mx', name: 'Mexico' },
  { id: 'us', name: 'United States' },
];

export function ComboboxAsync() {
  const list = useAsyncList<Country>({
    load: async ({ filterText = '', signal }) => ({
      items: await search(filterText, signal),
    }),
  });
  return (
    <div className="not-prose flex max-w-sm flex-col gap-4">
      <Combobox
        inputValue={list.filterText}
        items={list.items}
        label="Country"
        loadingState={list.loadingState}
        onInputChange={(text) => {
          list.setFilterText(text);
        }}
      >
        {(country) => <ComboboxItem>{country.name}</ComboboxItem>}
      </Combobox>
    </div>
  );
}

// Stands in for a server search.
async function search(query: string, signal: AbortSignal) {
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, 800);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
  return countries.filter((country) =>
    country.name.toLowerCase().includes(query.toLowerCase()),
  );
}
