import { BookOpen } from 'lucide-react';
import { createElement, type ReactNode } from 'react';

// The icons pages and folders name in their `icon` field. Fumadocs'
// lucideIconsPlugin would import Lucide's full icon map instead.
export const pageIcons = { BookOpen };

// Throws on an unknown name so the prerender fails rather than dropping the icon.
export function pageIcon(name: string | undefined): ReactNode {
  if (name === undefined) return undefined;
  if (!isPageIcon(name)) {
    throw new Error(`No page icon named ${name}; add it to pageIcons.`);
  }
  return createElement(pageIcons[name]);
}

function isPageIcon(name: string): name is keyof typeof pageIcons {
  return Object.hasOwn(pageIcons, name);
}
