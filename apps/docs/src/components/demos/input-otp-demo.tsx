import { InputOTP } from '@oakoss/ui/components/ui/inputs/input-otp';

export function InputOTPDemo() {
  return (
    <InputOTP
      className="not-prose"
      description="Enter the 6-digit code we sent to your phone."
      label="Verification code"
    />
  );
}
