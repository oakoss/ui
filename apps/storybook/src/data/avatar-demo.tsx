import type { ComponentProps } from 'react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@oakoss/ui/components/ui/data/avatar';

// A 1×1 PNG, and a data URL that fails to decode.
export const photo =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
export const broken = 'data:image/png;base64,broken';

export type AvatarDemoProps = { src?: string } & ComponentProps<typeof Avatar>;

export function AvatarDemo({ children, src, ...props }: AvatarDemoProps) {
  return (
    <Avatar {...props}>
      {src === undefined ? null : <AvatarImage src={src} />}
      <AvatarFallback>AL</AvatarFallback>
      {children}
    </Avatar>
  );
}
