import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
} from '@oakoss/ui/components/ui/data/avatar';

export function AvatarGroupDemo() {
  return (
    <div className="not-prose flex flex-col items-start gap-4">
      <AvatarGroup aria-label="Editors">
        <Avatar>
          <AvatarFallback>AL</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>GH</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>KJ</AvatarFallback>
        </Avatar>
        <AvatarGroupCount>+4</AvatarGroupCount>
      </AvatarGroup>
      <div className="flex items-center gap-3 text-sm">
        <Avatar>
          <AvatarFallback>GH</AvatarFallback>
          <AvatarBadge aria-hidden />
        </Avatar>
        Grace Hopper · online
      </div>
    </div>
  );
}
