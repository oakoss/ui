import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from '@oakoss/ui/components/ui/navigation/breadcrumb';
import { expect, fn, userEvent } from 'storybook/test';

import { part } from '../parts';

const meta = {
  component: Breadcrumb,
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#home">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="#components">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
  title: 'Navigation/Breadcrumb',
} satisfies Meta<typeof Breadcrumb>;

export default meta;

type Story = StoryObj<typeof meta>;

function separators() {
  return [
    ...document.querySelectorAll<HTMLElement>(
      '[data-slot=breadcrumb-separator]',
    ),
  ];
}

// The nav takes the list's name from React Aria, and the last item is the
// current page, out of the tab order, with a separator between items only.
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('navigation', { name: 'Breadcrumbs' }),
    ).toBeVisible();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(3);
    const current = canvas.getByRole('link', { name: 'Breadcrumb' });
    await expect(current).toHaveAttribute('aria-current', 'page');
    await expect(current).toHaveAttribute('aria-disabled', 'true');
    await expect(separators()).toHaveLength(2);
    for (const separator of separators()) {
      await expect(separator).toHaveAttribute('aria-hidden', 'true');
    }
    await userEvent.tab();
    await userEvent.tab();
    await expect(
      canvas.getByRole('link', { name: 'Components' }),
    ).toHaveFocus();
    await userEvent.tab();
    await expect(current).not.toHaveFocus();
  },
};

// React Aria translates the list's name, and the nav follows it; the
// separator points the reading direction.
export const RightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: async ({ canvas }) => {
    const name = canvas.getByRole('list').getAttribute('aria-label') ?? '';
    await expect(name).not.toBe('Breadcrumbs');
    await expect(canvas.getByRole('navigation')).toHaveAccessibleName(name);
    const [home, components] = canvas
      .getAllByRole('link')
      .map((link) => link.getBoundingClientRect());
    await expect(components?.right).toBeLessThan(home?.left ?? 0);
    const chevron = separators()[0]?.querySelector('svg');
    if (!chevron) throw new Error('No chevron');
    await expect(getComputedStyle(chevron).rotate).toBe('180deg');
  },
};

// A consumer's name on the nav replaces the borrowed one.
export const NamedNav: Story = {
  args: { 'aria-label': 'You are here' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('navigation', { name: 'You are here' }),
    ).toBeVisible();
  },
};

export const LabelledByNav: Story = {
  args: { 'aria-labelledby': 'trail-heading' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('navigation', { name: 'Trail' }),
    ).toBeVisible();
  },
  render: (args) => (
    <div>
      <h2 id="trail-heading">Trail</h2>
      {meta.render(args)}
    </div>
  ),
};

// A blank name is no name, so the nav keeps the borrowed one.
export const BlankLabelledBy: Story = {
  args: { 'aria-labelledby': '  ' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('navigation', { name: 'Breadcrumbs' }),
    ).toBeVisible();
  },
};

export const BlankLabel: Story = {
  args: { 'aria-label': '  ' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('navigation', { name: 'Breadcrumbs' }),
    ).toBeVisible();
  },
};

// The separator keeps a gap from the link before it.
export const SeparatorGap: Story = {
  play: async ({ canvas }) => {
    const home = canvas.getByRole('link', { name: 'Home' });
    const [separator] = separators();
    await expect(
      (separator?.getBoundingClientRect().left ?? 0) -
        home.getBoundingClientRect().right,
    ).toBeGreaterThanOrEqual(6);
  },
};

const onAction = fn();

// onAction gets the id of the item whose link was pressed. Without an href,
// pressing a link doesn't navigate the test page away.
export const Actions: Story = {
  play: async ({ canvas }) => {
    onAction.mockClear();
    await userEvent.click(canvas.getByRole('link', { name: 'Components' }));
    await expect(onAction).toHaveBeenCalledWith('components');
  },
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbList
        onAction={(key) => {
          onAction(key);
        }}
      >
        <BreadcrumbItem id="home">
          <BreadcrumbLink>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem id="components">
          <BreadcrumbLink>Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem id="breadcrumb">
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

// The ellipsis is decorative: its item holds nothing a screen reader reads.
export const Ellipsis: Story = {
  play: async ({ canvas }) => {
    await expect(part('breadcrumb-ellipsis')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    await expect(canvas.getAllByRole('link')).toHaveLength(3);
  },
  render: (args) => (
    <Breadcrumb {...args}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#home">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="#components">Components</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

// Every part takes a consumer's className.
export const ClassNames: Story = {
  play: async () => {
    await expect(part('breadcrumb')).toHaveClass('mb-2');
    await expect(part('breadcrumb-list')).toHaveClass('tracking-wide');
    await expect(part('breadcrumb-item')).toHaveClass('italic');
    await expect(part('breadcrumb-separator')).toHaveClass('opacity-60');
    await expect(part('breadcrumb-link')).toHaveClass('underline');
    await expect(part('breadcrumb-page')).toHaveClass('font-medium');
    await expect(part('breadcrumb-ellipsis')).toHaveClass('size-6');
  },
  render: (args) => (
    <Breadcrumb {...args} className="mb-2">
      <BreadcrumbList className="tracking-wide">
        <BreadcrumbItem className="italic" separatorClassName="opacity-60">
          <BreadcrumbLink className="underline" href="#home">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbEllipsis className="size-6" />
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbPage className="font-medium">Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};
