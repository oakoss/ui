// How long a message stays in its live region before it's cleared, so browse
// mode doesn't find a stale copy; long enough for a screen reader to read it.
export const announcementLifetime = 7000;

// A screen reader can miss text added to a live region in the same moment
// the region appears, as on a Toaster's first render, so each message waits.
export const announcementDelay = 100;

// Adds the message as a new node, which screen readers announce even when the
// same text was announced moments before; replacing the text wouldn't be.
export function announce(region: HTMLElement | null, message: string) {
  const text = message.trim();
  if (!region || text === '') return;
  setTimeout(() => {
    const node = region.ownerDocument.createElement('div');
    node.textContent = text;
    region.append(node);
    setTimeout(() => {
      node.remove();
    }, announcementLifetime);
  }, announcementDelay);
}

// The title, then the description, as one sentence-separated message.
export function announcement(...parts: (null | string | undefined)[]) {
  return parts
    .map((part) => part?.trim() ?? '')
    .filter((part) => part !== '')
    .map((part) => (/[.!?…]$/u.test(part) ? part : `${part}.`))
    .join(' ');
}
