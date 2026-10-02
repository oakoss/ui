import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

import { appName, githubUrl } from '#/lib/site';

export function baseOptions(): BaseLayoutProps {
  return { githubUrl, nav: { title: appName } };
}
