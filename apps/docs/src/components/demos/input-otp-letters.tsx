import { InputOTP } from '@oakoss/ui/components/ui/inputs/input-otp';

export function InputOTPLetters() {
  return (
    <InputOTP
      characters="alphanumeric"
      className="not-prose"
      description="Enter the 8-character code printed on your card."
      groupSize={4}
      label="Activation code"
      length={8}
    />
  );
}
