import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { SearchField } from '@oakoss/ui/components/ui/inputs/search-field';
import { useState } from 'react';

export function SearchFieldSubmit() {
  const [query, setQuery] = useState('');

  return (
    <div className="not-prose flex flex-col gap-3">
      <form
        aria-label="Site"
        className="flex items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          const value = new FormData(event.currentTarget).get('q');
          setQuery(typeof value === 'string' ? value : '');
        }}
        role="search"
      >
        <SearchField className="w-72" label="Search the site" name="q" />
        <Button type="submit">Search</Button>
      </form>
      <p className="text-sm text-muted-foreground">
        {query === '' ? 'No search yet.' : `Searched for “${query}”.`}
      </p>
    </div>
  );
}
