import type { ReactNode } from 'react';

import {
  type IconResolver,
  IconResolverContext,
} from '@oakoss/ui/components/icon-placeholder';
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronUpIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  CircleIcon,
  CircleQuestionMarkIcon,
  Columns3Icon,
  EllipsisIcon,
  InfoIcon,
  LoaderCircleIcon,
  MinusIcon,
  PanelLeftIcon,
  PlusIcon,
  SearchIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-react';

// Only the icons icons.tsx names, so the site doesn't ship all of Lucide.
export const lucideIcons = {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  ChevronUpIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  CircleIcon,
  CircleQuestionMarkIcon,
  Columns3Icon,
  EllipsisIcon,
  InfoIcon,
  LoaderCircleIcon,
  MinusIcon,
  PanelLeftIcon,
  PlusIcon,
  SearchIcon,
  TriangleAlertIcon,
  XIcon,
};

function isLucideName(name: string): name is keyof typeof lucideIcons {
  return Object.hasOwn(lucideIcons, name);
}

const resolveLucide: IconResolver = ({ lucide: name }, props) => {
  if (!isLucideName(name)) return null;
  const Icon = lucideIcons[name];
  return <Icon aria-hidden {...props} />;
};

// Installs swap icons at `shadcn add` time; the demos resolve them live.
export function IconProvider({ children }: { children: ReactNode }) {
  return (
    <IconResolverContext value={resolveLucide}>{children}</IconResolverContext>
  );
}
