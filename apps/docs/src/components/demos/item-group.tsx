import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
} from '@oakoss/ui/components/ui/data/item';

const people = [
  { email: 'ada@example.com', name: 'Ada Lovelace' },
  { email: 'grace@example.com', name: 'Grace Hopper' },
];

export function ItemGroupDemo() {
  return (
    <ItemGroup className="not-prose max-w-md">
      {people.flatMap((person, index) => [
        index > 0 ? <ItemSeparator key={`${person.email}-line`} /> : null,
        <Item key={person.email} size="sm">
          <ItemContent>
            <ItemTitle>{person.name}</ItemTitle>
            <ItemDescription>{person.email}</ItemDescription>
          </ItemContent>
        </Item>,
      ])}
    </ItemGroup>
  );
}
