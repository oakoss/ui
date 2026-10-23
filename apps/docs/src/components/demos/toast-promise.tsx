import { toast } from '@oakoss/ui/components/ui/feedback/toast/toast';
import { Button } from '@oakoss/ui/components/ui/inputs/button';

export function ToastPromise() {
  return (
    <div className="not-prose flex flex-wrap gap-3">
      <Button
        onPress={() => {
          send(false);
        }}
        variant="outline"
      >
        Upload
      </Button>
      <Button
        onPress={() => {
          send(true);
        }}
        variant="outline"
      >
        Upload, then fail
      </Button>
    </div>
  );
}

function send(shouldFail: boolean) {
  void toast.promise(upload('report.pdf', shouldFail), {
    error: (error) => ({
      description: error instanceof Error ? error.message : String(error),
      title: 'Upload failed',
    }),
    loading: 'Uploading report.pdf',
    success: (file) => `${file} uploaded`,
  });
}

function upload(file: string, shouldFail: boolean) {
  return new Promise<string>((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error('The connection dropped.'));
      else resolve(file);
    }, 2000);
  });
}
