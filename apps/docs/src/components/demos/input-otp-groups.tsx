import { InputOTP } from '@oakoss/ui/components/ui/inputs/input-otp';

export function InputOTPGroups() {
  return (
    <InputOTP
      className="not-prose"
      description="Enter the 6-digit code from your authenticator app."
      groupSize={3}
      label="Authenticator code"
      placeholder="○○○○○○"
    />
  );
}
