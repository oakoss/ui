import { SearchField } from '@oakoss/ui/components/ui/inputs/search-field';

export function SearchFieldDemo() {
  return (
    <div className="not-prose flex flex-col gap-4">
      <SearchField
        className="w-72"
        description="Search by name or ingredient."
        label="Recipes"
        placeholder="Tomato soup"
      />
    </div>
  );
}
