import { useScrollRegion } from '@oakoss/ui/hooks/use-scroll-region';
import { cn } from '@oakoss/ui/lib/cx';
import { focusRing } from '@oakoss/ui/lib/recipes';
import {
  type CodeBlockProps,
  CodeBlockTabs,
  Pre,
} from 'fumadocs-ui/components/codeblock';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { useCopyButton } from 'fumadocs-ui/utils/use-copy-button';
import { Check, Clipboard } from 'lucide-react';
import {
  type ComponentProps,
  createContext,
  type CSSProperties,
  type ReactNode,
  type RefObject,
  use,
  useId,
} from 'react';

const CodeTabsContext = createContext(false);

type LineNumbers = {
  'data-line-numbers'?: boolean | string;
  'data-line-numbers-start'?: number | string;
};

// Fumadocs' CodeBlock, except its scroll area follows useScrollRegion: an
// untitled block is never a landmark and one that fits isn't a tab stop.
// Focus is our outline, which keeps 3:1 and shows in forced colors. Each
// block keeps its Shiki theme's background, which the token colors meet WCAG
// AA against; Fumadocs' card gray drops some under 4.5:1.
export function CodePre({
  Actions: _actions,
  allowCopy = true,
  children,
  className,
  icon,
  keepBackground: _keepBackground,
  tabIndex: _tabIndex,
  title,
  viewportProps: _viewportProps,
  ...props
}: CodeBlockProps & LineNumbers) {
  const isInTabs = use(CodeTabsContext);
  const titleId = useId();
  const hasTitle = title !== undefined && title !== null && title !== '';
  const region = useScrollRegion<HTMLDivElement>({
    'aria-labelledby': hasTitle ? titleId : undefined,
  });
  const isCopyable = allowCopy !== false && allowCopy !== 'false';
  return (
    <figure
      dir="ltr"
      {...props}
      className={figureClass(isInTabs, className)}
      tabIndex={-1}
    >
      <BlockHeader
        icon={icon}
        id={hasTitle ? titleId : undefined}
        title={title}
      >
        {isCopyable ? <CopyButton area={region.props.ref} /> : null}
      </BlockHeader>
      <div
        {...region.props}
        className={cn(
          focusRing,
          'fd-scroll-container max-h-[600px] overflow-auto py-3.5 text-[0.8125rem] focus-visible:-outline-offset-3',
          !hasTitle && '[--padding-right:calc(var(--spacing)*8)]',
        )}
        style={lineCounter(props)}
      >
        <Pre>{children}</Pre>
      </div>
    </figure>
  );
}

export function CodeTabs(props: ComponentProps<typeof CodeBlockTabs>) {
  return (
    <CodeTabsContext value>
      <CodeBlockTabs {...props} />
    </CodeTabsContext>
  );
}

// A titled block's caption names its scroll area, by `id`; an untitled one
// floats the copy button over the code.
function BlockHeader({
  children,
  icon,
  id,
  title,
}: {
  children: ReactNode;
  icon: ReactNode;
  id: string | undefined;
  title: ReactNode;
}) {
  if (id === undefined) {
    return (
      <div className="text-fd-muted-foreground absolute inset-e-2 top-3 z-2 rounded-lg backdrop-blur-lg empty:hidden">
        {children}
      </div>
    );
  }
  return (
    <div className="text-fd-muted-foreground flex h-9.5 items-center gap-2 border-b px-4">
      <BlockIcon icon={icon} />
      <figcaption className="flex-1 truncate" id={id}>
        {title}
      </figcaption>
      <div className="-me-2">{children}</div>
    </div>
  );
}

// Rehype Code passes the language icon as SVG markup.
function BlockIcon({ icon }: { icon: ReactNode }) {
  if (typeof icon !== 'string') return icon;
  return (
    <div
      className="[&_svg]:size-3.5"
      dangerouslySetInnerHTML={{ __html: icon }}
    />
  );
}

function CopyButton({ area }: { area: RefObject<HTMLDivElement | null> }) {
  const [checked, onClick] = useCopyButton(async () => {
    const clone = area.current?.querySelector('pre')?.cloneNode(true);
    if (!(clone instanceof HTMLElement)) return;
    for (const node of clone.querySelectorAll('.nd-copy-ignore')) {
      node.replaceWith('\n');
    }
    await navigator.clipboard.writeText(clone.textContent);
  });
  return (
    <button
      aria-live="polite"
      className={cn(
        buttonVariants({ size: 'icon-xs' }),
        focusRing,
        'hover:text-fd-accent-foreground data-checked:text-fd-accent-foreground focus-visible:ring-0',
      )}
      data-checked={checked || undefined}
      onClick={onClick}
      type="button"
    >
      {checked ? <Check /> : <Clipboard />}
      <span className="sr-only">{checked ? 'Copied Text' : 'Copy Text'}</span>
    </button>
  );
}

function figureClass(isInTabs: boolean, className: string | undefined) {
  return cn(
    isInTabs ? '-mx-px -mb-px last:rounded-b-xl' : 'my-4 rounded-xl',
    'shiki not-prose relative overflow-hidden border bg-(--shiki-light-bg) text-sm dark:bg-(--shiki-dark-bg)',
    className,
  );
}

// Fumadocs' line-number CSS counts from the counter this sets, so
// `lineNumbers=5` starts at 5.
function lineCounter(props: LineNumbers): CSSProperties | undefined {
  if (props['data-line-numbers'] === undefined) return undefined;
  return {
    counterSet: `line ${Number(props['data-line-numbers-start'] ?? 1) - 1}`,
  };
}
