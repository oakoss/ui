import {
  TOC,
  TOCPopover,
  type TOCPopoverProps,
  TOCProvider,
} from 'fumadocs-ui/layouts/docs/page/slots/toc';

// The desktop table of contents, named by its own heading, is a navigation
// landmark, so its links aren't content outside every landmark.
export const tocSlots = {
  main: (props: Parameters<typeof TOC>[0]) => (
    <TOC
      {...props}
      container={{
        ...props.container,
        'aria-labelledby': 'toc-title',
        role: 'navigation',
      }}
    />
  ),
  popover: TocPopover,
  provider: TOCProvider,
};

// Fumadocs wraps the narrow-screen table of contents in a <header>, a second
// banner landmark beside the site's. Inside a section it's a plain header;
// `contents` keeps the section out of the layout.
function TocPopover(props: TOCPopoverProps) {
  return (
    <section className="contents">
      <TOCPopover {...props} />
    </section>
  );
}
