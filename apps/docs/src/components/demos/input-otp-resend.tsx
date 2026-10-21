import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { InputOTP } from '@oakoss/ui/components/ui/inputs/input-otp';
import { useEffect, useRef, useState } from 'react';

const wait = 30;

export function InputOTPResend() {
  const [secondsLeft, setSecondsLeft] = useState(wait);
  const [sentAt, setSentAt] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer =
      secondsLeft > 0
        ? setTimeout(() => {
            setSecondsLeft((seconds) => seconds - 1);
          }, 1000)
        : undefined;
    return () => {
      clearTimeout(timer);
    };
  }, [secondsLeft]);

  return (
    <div className="not-prose flex flex-col items-start gap-3">
      <InputOTP
        description="Enter the 6-digit code we sent to your email."
        label="Verification code"
        ref={inputRef}
      />
      {/* The countdown isn't a live region, so it isn't read every second.
          The button disables as it's pressed, so focus goes to the field,
          and the time makes each confirmation new text, so each is read. */}
      <Button
        isDisabled={secondsLeft > 0}
        onPress={() => {
          inputRef.current?.focus();
          setSentAt(new Date().toLocaleTimeString());
          setSecondsLeft(wait);
        }}
        size="sm"
        variant="outline"
      >
        {secondsLeft > 0
          ? `Resend code in ${String(secondsLeft)}s`
          : 'Resend code'}
      </Button>
      <p className="text-sm" role="status">
        {sentAt === undefined ? null : `We sent a new code at ${sentAt}.`}
      </p>
    </div>
  );
}
