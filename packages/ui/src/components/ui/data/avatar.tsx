import {
  type ComponentProps,
  type Ref,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { tv } from 'tailwind-variants/lite';

import { cn } from '#/lib/cx';

type ImageStatus = 'error' | 'loaded' | 'loading';

const styles = tv({
  // The border overlay outlines the avatar, in forced colors too, where the
  // fallback's fill becomes the page color.
  base: 'group/avatar relative inline-flex shrink-0 rounded-full align-middle select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border after:mix-blend-darken dark:after:mix-blend-lighten',
  variants: { size: { lg: 'size-10', md: 'size-8', sm: 'size-6' } },
});

export type AvatarProps = {
  size?: 'lg' | 'md' | 'sm';
} & ComponentProps<'span'>;

// Spans throughout, so an avatar can sit inside a link or a button.
export function Avatar({ className, size = 'md', ...props }: AvatarProps) {
  return (
    <span
      data-slot="avatar"
      {...props}
      className={cn(styles({ size }), className)}
      data-size={size}
    />
  );
}

export function AvatarBadge({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'absolute end-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background select-none',
        'group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden',
        'group-data-[size=md]/avatar:size-2.5 group-data-[size=md]/avatar:[&>svg]:size-2',
        'group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2',
        className,
      )}
      data-slot="avatar-badge"
      {...props}
    />
  );
}

// Shows until its avatar's own image has loaded, and again if it goes. Both
// sides of the selector are child-only, so a nested avatar's image doesn't
// hide this fallback, or the reverse.
export function AvatarFallback({
  className,
  ...props
}: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs [[data-slot=avatar]:has(>[data-slot=avatar-image][data-status=loaded])>&]:hidden',
        className,
      )}
      data-slot="avatar-fallback"
      {...props}
    />
  );
}

export function AvatarGroup({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'group/avatar-group inline-flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background',
        className,
      )}
      data-slot="avatar-group"
      role="group"
      {...props}
    />
  );
}

export function AvatarGroupCount({
  className,
  ...props
}: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        'relative inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-sm text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3',
        className,
      )}
      data-slot="avatar-group-count"
      {...props}
    />
  );
}

export function AvatarImage({
  alt = '',
  className,
  onError,
  onLoad,
  ref: forwardedRef,
  src,
  srcSet,
  ...props
}: ComponentProps<'img'>) {
  const [status, setStatus] = useState<ImageStatus>('loading');
  const ref = useImageStatus({ forwardedRef, setStatus, src, srcSet });
  const isLoading = status === 'loading';

  return (
    <img
      alt={alt}
      aria-hidden={isLoading || undefined}
      className={cn(
        'aspect-square size-full rounded-full object-cover',
        // A loading image stays laid out, invisible over the fallback and out
        // of its way: a lazy image with display: none never starts loading.
        isLoading && 'pointer-events-none absolute inset-0 opacity-0',
        status === 'error' && 'hidden',
        className,
      )}
      data-slot="avatar-image"
      data-status={status}
      onError={(event) => {
        setStatus('error');
        onError?.(event);
      }}
      onLoad={(event) => {
        setStatus('loaded');
        onLoad?.(event);
      }}
      ref={ref}
      src={src}
      srcSet={srcSet}
      {...props}
    />
  );
}

// Sets a callback or object ref, returning a callback ref's cleanup.
function attach<T>(ref: Ref<T> | undefined, value: null | T) {
  if (typeof ref === 'function') {
    const cleanup = ref(value);
    return typeof cleanup === 'function' ? cleanup : null;
  }
  if (ref) ref.current = value;
  return null;
}

// A cached or broken image can settle before React attaches its handlers, so
// this reads where it stands once mounted, and again for each new source.
function useImageStatus({
  forwardedRef,
  setStatus,
  src,
  srcSet,
}: {
  forwardedRef: Ref<HTMLImageElement> | undefined;
  setStatus: (status: ImageStatus) => void;
  src: string | undefined;
  srcSet: string | undefined;
}) {
  const imageRef = useRef<HTMLImageElement>(null);
  const hasSource = (src ?? '') !== '' || (srcSet ?? '') !== '';

  // Stable, and returning a cleanup, so the consumer's ref sees the image
  // once per mount and its own cleanup runs.
  const ref = useCallback(
    (node: HTMLImageElement) => {
      imageRef.current = node;
      const cleanup = attach(forwardedRef, node);
      return () => {
        imageRef.current = null;
        if (cleanup) cleanup();
        else attach(forwardedRef, null);
      };
    },
    [forwardedRef],
  );

  useLayoutEffect(() => {
    const image = imageRef.current;
    if (!image) return;
    if (!hasSource) setStatus('error');
    else if (image.complete)
      setStatus(image.naturalWidth > 0 ? 'loaded' : 'error');
    else setStatus('loading');
  }, [hasSource, setStatus, src, srcSet]);

  return ref;
}
