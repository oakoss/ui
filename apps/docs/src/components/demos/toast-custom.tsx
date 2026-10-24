import { toast } from '@oakoss/ui/components/ui/feedback/toast/toast';
import { Button } from '@oakoss/ui/components/ui/inputs/button';

export function ToastCustom() {
  return (
    <div className="not-prose flex flex-wrap gap-3">
      <Button
        onPress={() => {
          toast.custom(
            () => (
              <div className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted font-medium"
                >
                  AN
                </span>
                <div>
                  <p className="font-medium">Ana shared a file</p>
                  <p className="text-muted-foreground">Q3 roadmap.pdf</p>
                </div>
              </div>
            ),
            { title: 'Ana shared Q3 roadmap.pdf' },
          );
        }}
        variant="outline"
      >
        Share a file
      </Button>
    </div>
  );
}
