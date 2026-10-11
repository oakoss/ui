import { useStaticSearch } from 'fumadocs-core/search/client';
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search';

export function StaticSearchDialog(props: SharedProps) {
  const { data, isLoading, onSearchChange, search } = useStaticSearch();

  return (
    <SearchDialog
      isLoading={isLoading}
      onSearchChange={onSearchChange}
      search={search}
      {...props}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={data?.items ?? null} />
      </SearchDialogContent>
    </SearchDialog>
  );
}
