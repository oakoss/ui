import {
  createContext,
  type ReactNode,
  type SVGProps,
  use,
  useEffect,
} from 'react';

export type IconLibrary =
  | 'hugeicons'
  | 'lucide'
  | 'phosphor'
  | 'remixicon'
  | 'tabler';

export type IconNames = Readonly<Record<IconLibrary, string>>;

export type IconProps = { strokeWidth?: number } & Omit<
  SVGProps<SVGSVGElement>,
  'children' | 'strokeWidth'
>;

export type IconResolver = (names: IconNames, props: IconProps) => ReactNode;

export const IconResolverContext = createContext<IconResolver | undefined>(
  undefined,
);

const warning = { hasShown: false };

/**
 * `shadcn add` replaces each `<IconPlaceholder>` with the icon for the
 * project's `iconLibrary`, so this only renders when that didn't happen.
 */
export function IconPlaceholder({
  hugeicons,
  lucide,
  phosphor,
  remixicon,
  tabler,
  ...props
}: IconNames & IconProps) {
  const resolve = use(IconResolverContext);
  const icon = resolve?.(
    { hugeicons, lucide, phosphor, remixicon, tabler },
    props,
  );
  const isResolved = icon !== undefined && icon !== null;

  useEffect(() => {
    if (isResolved || warning.hasShown) return;
    warning.hasShown = true;
    // oxlint-disable-next-line no-console -- tells the consumer how to fix their setup
    console.warn(
      'IconPlaceholder rendered without an icon library. Set "iconLibrary" in components.json (or add oakoss/ui/base), then re-add the component so shadcn swaps in your icons.',
    );
  }, [isResolved]);

  if (isResolved) return icon;
  return (
    <svg aria-hidden height="1em" viewBox="0 0 24 24" width="1em" {...props}>
      <rect
        fill="none"
        height="16"
        stroke="currentColor"
        width="16"
        x="4"
        y="4"
      />
    </svg>
  );
}
