import {
  TOC,
  TOCPopover,
  type TOCPopoverProps,
  TOCProvider,
} from 'fumadocs-ui/layouts/docs/page/slots/toc';

export const tocSlots = {
  main: TOC,
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
