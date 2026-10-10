import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@oakoss/ui/components/ui/navigation/pagination';
import { expect, userEvent } from 'storybook/test';

import { part } from '../parts';
import { atViewportWidth } from '../viewport';

const meta = {
  component: Pagination,
  render: (args) => (
    <Pagination {...args}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#1" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#1">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#2" isActive>
            2
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#3">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#3" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  title: 'Navigation/Pagination',
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

// A named landmark of links: pages read as "Page N", the current one is
// marked, the ends link to their neighbors, and the ellipsis is announced.
export const Default: Story = {
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('navigation', { name: 'Pagination' }),
    ).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'Page 1' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'Page 2' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(
      canvas.getByRole('link', { name: 'Page 3' }),
    ).not.toHaveAttribute('aria-current');
    await expect(
      canvas.getByRole('link', { name: 'Previous' }),
    ).toHaveAttribute('rel', 'prev');
    await expect(canvas.getByRole('link', { name: 'Next' })).toHaveAttribute(
      'rel',
      'next',
    );
    await expect(canvas.getAllByRole('listitem')[4]).toHaveTextContent(
      'More pages',
    );
    const page = canvas.getByRole('link', { name: 'Page 1' });
    for (const name of ['Previous', 'Next']) {
      const link = canvas.getByRole('link', { name });
      await expect(link.getBoundingClientRect().width).toBeGreaterThan(
        page.getBoundingClientRect().width,
      );
      await expect(
        canvas.getByText(name).getBoundingClientRect().width,
      ).toBeGreaterThan(1);
    }
  },
};

// pageLabel words the page names, and a link's own name wins over it.
export const PageLabel: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Seite 1' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'First' })).toBeVisible();
  },
  render: (args) => (
    <Pagination {...args}>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink href="#1" pageLabel={(page) => `Seite ${page}`}>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink aria-label="First" href="#1">
            1
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

// The landmark's name is a prop; a blank one leaves it unnamed.
export const NavLabel: Story = {
  args: { label: 'Results pages' },
  play: async ({ canvas }) => {
    await expect(
      canvas.getByRole('navigation', { name: 'Results pages' }),
    ).toBeVisible();
  },
};

export const BlankNavLabel: Story = {
  args: { label: '  ' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('navigation')).not.toHaveAttribute(
      'aria-label',
    );
  },
};

// At the first page, Previous is disabled: out of the tab order and faded.
export const DisabledEnd: Story = {
  play: async ({ canvas }) => {
    const previous = canvas.getByRole('link', { name: 'Previous' });
    await expect(previous).toHaveAttribute('aria-disabled', 'true');
    await expect(getComputedStyle(previous).opacity).toBe('0.5');
    await userEvent.tab();
    await expect(canvas.getByRole('link', { name: 'Page 1' })).toHaveFocus();
  },
  render: (args) => (
    <Pagination {...args}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#0" isDisabled />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#1" isActive>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#2" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

// Right to left, the chevrons point the reading direction.
export const RightToLeft: Story = {
  globals: { locale: 'ar-EG' },
  play: async ({ canvas }) => {
    for (const name of ['Previous', 'Next']) {
      const chevron = canvas.getByRole('link', { name }).querySelector('svg');
      if (!chevron) throw new Error('No chevron');
      await expect(getComputedStyle(chevron).rotate).toBe('180deg');
    }
  },
};

function center(box: DOMRect) {
  return box.left + box.width / 2;
}

// On a phone, Previous and Next hide their text but keep it as their name,
// and shrink to a page link's size with the chevron centered.
export const SmallScreen: Story = {
  play: async ({ canvas }) => {
    await atViewportWidth(375, async () => {
      const page = canvas.getByRole('link', { name: 'Page 1' });
      for (const name of ['Previous', 'Next']) {
        const link = canvas.getByRole('link', { name });
        const box = link.getBoundingClientRect();
        await expect(box.width).toBe(page.getBoundingClientRect().width);
        await expect(canvas.getByText(name).getBoundingClientRect().width).toBe(
          1,
        );
        const chevron = link.querySelector('svg');
        if (!chevron) throw new Error('No chevron');
        const offset = center(chevron.getBoundingClientRect()) - center(box);
        await expect(Math.abs(offset)).toBeLessThan(1);
      }
    });
  },
};

// A page given as a number, as from a loop, is named like text; a blank name
// is no name, and the ellipsis takes its own wording.
export const Names: Story = {
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('link', { name: 'Page 4' })).toBeVisible();
    await expect(canvas.getByRole('link', { name: 'Page 5' })).toBeVisible();
    await expect(canvas.getByText('Weitere Seiten')).toBeInTheDocument();
  },
  render: (args) => (
    <Pagination {...args}>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink href="#4">{4}</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink aria-label="  " href="#5">
            5
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis label="Weitere Seiten" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};

// Every part takes a consumer's className.
export const ClassNames: Story = {
  play: async ({ canvas }) => {
    await expect(part('pagination')).toHaveClass('mt-2');
    await expect(part('pagination-content')).toHaveClass('tracking-wide');
    await expect(part('pagination-item')).toHaveClass('italic');
    await expect(part('pagination-link')).toHaveClass('opacity-90');
    await expect(canvas.getByRole('link', { name: 'Page 1' })).toHaveClass(
      'underline',
    );
    await expect(canvas.getByRole('link', { name: 'Next' })).toHaveClass(
      'opacity-80',
    );
    await expect(part('pagination-ellipsis')).toHaveClass('size-6');
  },
  render: (args) => (
    <Pagination {...args} className="mt-2">
      <PaginationContent className="tracking-wide">
        <PaginationItem className="italic">
          <PaginationPrevious className="opacity-90" href="#1" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink className="underline" href="#1">
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis className="size-6" />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext className="opacity-80" href="#2" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
};
