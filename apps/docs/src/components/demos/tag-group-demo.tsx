import { Tag, TagGroup } from '@oakoss/ui/components/ui/data/tag-group';
import { useState } from 'react';

const initial = [
  { id: 'design', name: 'Design' },
  { id: 'research', name: 'Research' },
  { id: 'writing', name: 'Writing' },
];

export function TagGroupDemo() {
  const [skills, setSkills] = useState(initial);
  return (
    <TagGroup
      className="not-prose"
      emptyLabel="No skills added"
      items={skills}
      label="Skills"
      onRemove={(keys) => {
        setSkills((current) => current.filter(({ id }) => !keys.has(id)));
      }}
    >
      {(skill) => <Tag>{skill.name}</Tag>}
    </TagGroup>
  );
}
