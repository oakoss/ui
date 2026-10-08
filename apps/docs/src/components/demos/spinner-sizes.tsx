import { Spinner } from '@oakoss/ui/components/ui/feedback/spinner';

export function SpinnerSizes() {
  return (
    <div className="not-prose flex items-center gap-6">
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" />
    </div>
  );
}
