import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@oakoss/ui/components/ui/data/avatar';

export function AvatarFallbackDemo() {
  return (
    <div className="not-prose flex items-center gap-3">
      <Avatar size="sm">
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="data:image/png;base64,broken" />
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>AL</AvatarFallback>
      </Avatar>
    </div>
  );
}
