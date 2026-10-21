import { Spinner } from '@oakoss/ui/components/ui/feedback/spinner';
import { InputOTP } from '@oakoss/ui/components/ui/inputs/input-otp';
import { useRef, useState } from 'react';

type Status = 'checking' | 'idle' | 'invalid' | 'verified';

export function InputOTPVerify() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  const verify = async (value: string) => {
    setStatus('checking');
    if (await isRightCode(value)) {
      setStatus('verified');
      return;
    }
    // Clearing lets the code be typed again; focusing the input reads its
    // error, which describes it, to screen readers.
    setCode('');
    setStatus('invalid');
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <div className="not-prose flex flex-col gap-3">
      <InputOTP
        description="Enter the 6-digit code we sent. Try 123456."
        errorMessage="That code didn't work. Check it and try again."
        isDisabled={status === 'checking' || status === 'verified'}
        isInvalid={status === 'invalid'}
        label="Verification code"
        onChange={setCode}
        onComplete={(value) => {
          void verify(value);
        }}
        ref={inputRef}
        value={code}
      />
      <p className="flex items-center gap-2 text-sm" role="status">
        {status === 'checking' ? <Spinner label="Checking the code" /> : null}
        {status === 'verified' ? 'Verified.' : null}
      </p>
    </div>
  );
}

// Stands in for a request to your server; 123456 is the right code.
async function isRightCode(code: string) {
  await new Promise((resolve) => {
    setTimeout(resolve, 800);
  });
  return code === '123456';
}
