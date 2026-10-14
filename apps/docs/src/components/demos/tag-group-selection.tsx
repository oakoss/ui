import type { Selection } from 'react-aria-components';

import { Tag, TagGroup } from '@oakoss/ui/components/ui/data/tag-group';
import { useState } from 'react';

export function TagGroupSelection() {
  const [selected, setSelected] = useState<Selection>(() => new Set(['open']));
  return (
    <TagGroup
      className="not-prose"
      description="Shows issues with any selected status."
      label="Status"
      onSelectionChange={setSelected}
      selectedKeys={selected}
      selectionMode="multiple"
    >
      <Tag id="open">Open</Tag>
      <Tag id="in-review">In review</Tag>
      <Tag id="closed">Closed</Tag>
    </TagGroup>
  );
}
