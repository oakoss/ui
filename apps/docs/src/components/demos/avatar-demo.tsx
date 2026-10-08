import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@oakoss/ui/components/ui/data/avatar';

export function AvatarDemo() {
  return (
    <div className="not-prose flex items-center gap-3 text-sm font-medium">
      <Avatar>
        <AvatarImage src="https://github.com/oakoss.png" />
        <AvatarFallback>OK</AvatarFallback>
      </Avatar>
      Oakoss
    </div>
  );
}
