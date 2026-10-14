import { Tag, TagGroup } from '@oakoss/ui/components/ui/data/tag-group';

export function TagGroupIntents() {
  return (
    <TagGroup
      className="not-prose"
      defaultSelectedKeys={['success-on', 'destructive-on']}
      label="Checks"
      selectionMode="multiple"
    >
      <Tag id="success-off" intent="success">
        Passing
      </Tag>
      <Tag id="success-on" intent="success">
        Passing, selected
      </Tag>
      <Tag id="warning" intent="warning">
        Flaky
      </Tag>
      <Tag id="destructive-on" intent="destructive">
        Failing, selected
      </Tag>
      <Tag id="info" intent="info">
        Skipped
      </Tag>
    </TagGroup>
  );
}
