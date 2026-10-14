import { SearchField } from '@oakoss/ui/components/ui/inputs/search-field';
import { useState } from 'react';

const recipes = [
  'Tomato soup',
  'Tomato salad',
  'Mushroom risotto',
  'Lentil soup',
  'Pea and mint soup',
];

export function SearchFieldFilter() {
  const [query, setQuery] = useState('');
  const matches = recipes.filter((recipe) =>
    recipe.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="not-prose flex w-72 flex-col gap-3">
      <SearchField label="Filter recipes" onChange={setQuery} value={query} />
      <p className="text-sm text-muted-foreground" role="status">
        {matches.length === 1 ? '1 recipe' : `${matches.length} recipes`}
      </p>
      <ul className="flex flex-col gap-1 text-sm">
        {matches.map((recipe) => (
          <li key={recipe}>{recipe}</li>
        ))}
      </ul>
    </div>
  );
}
