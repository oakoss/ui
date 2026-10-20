import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@oakoss/ui/components/ui/navigation/pagination';

export function PaginationDisabled() {
  return (
    <Pagination className="not-prose" label="Pagination on the first page">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious isDisabled />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=1" isActive>
            1
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="?page=2">2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="?page=2" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
