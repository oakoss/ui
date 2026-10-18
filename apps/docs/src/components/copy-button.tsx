import {
  Button,
  type ButtonProps,
} from '@oakoss/ui/components/ui/inputs/button';
import { useEffect, useRef, useState } from 'react';

type CopyResult = 'Copied' | 'Copy failed';

export function CopyButton({
  'aria-label': ariaLabel,
  children,
  className,
  text,
  variant = 'outline',
}: {
  'aria-label'?: string;
  children: string;
  className?: string;
  text: () => string;
  variant?: ButtonProps['variant'];
}) {
  const [result, setResult] = useState<CopyResult>();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const stop = () => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
  };
  useEffect(() => stop, []);
  // A new press restarts the timer, so an earlier one can't clear its label.
  const copy = async () => {
    setResult(await copied(text));
    stop();
    timerRef.current = setTimeout(() => setResult(undefined), 2000);
  };
  return (
    <Button
      aria-label={result === undefined ? ariaLabel : undefined}
      className={className}
      onPress={() => {
        void copy();
      }}
      size="sm"
      variant={variant}
    >
      {result ?? children}
    </Button>
  );
}

// The clipboard is missing outside secure contexts, and a write can be
// refused.
async function copied(text: () => string): Promise<CopyResult> {
  try {
    await navigator.clipboard.writeText(text());
    return 'Copied';
  } catch (error) {
    // oxlint-disable-next-line no-console -- the label can't say why it failed
    console.error('Copying to the clipboard failed', error);
    return 'Copy failed';
  }
}
