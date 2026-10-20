import { compile } from '@mdx-js/mdx';
import { rehypeCode } from 'fumadocs-core/mdx-plugins';

import { codeThemes } from './code-themes.ts';

// An MDX module rendering the code highlighted, as a docs page would.
export async function highlightedModule(code: string, title?: string) {
  const compiled = await compile(fence(code, title), {
    rehypePlugins: [[rehypeCode, { themes: codeThemes }]],
  });
  return String(compiled);
}

// A fenced block whose fence is longer than any backtick run in the code.
function fence(code: string, title: string | undefined): string {
  const longest = Math.max(
    2,
    ...(code.match(/`+/gu) ?? []).map((run) => run.length),
  );
  const ticks = '`'.repeat(longest + 1);
  const meta = title === undefined ? '' : ` title="${title}"`;
  return `${ticks}tsx${meta}\n${code}\n${ticks}\n`;
}
