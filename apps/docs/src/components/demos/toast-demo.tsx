import { toast } from '@oakoss/ui/components/ui/feedback/toast/toast';
import { Button } from '@oakoss/ui/components/ui/inputs/button';

export function ToastDemo() {
  return (
    <Button
      onPress={() => {
        toast.success('Changes saved', {
          description: 'All files are up to date.',
        });
      }}
      variant="outline"
    >
      Save
    </Button>
  );
}
