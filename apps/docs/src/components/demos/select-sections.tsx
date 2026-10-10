import {
  Select,
  SelectHeader,
  SelectItem,
  SelectSection,
} from '@oakoss/ui/components/ui/inputs/select';

export function SelectSections() {
  return (
    <div className="not-prose flex max-w-sm flex-col gap-4">
      <Select label="Plan">
        <SelectSection>
          <SelectHeader>Personal</SelectHeader>
          <SelectItem description="One seat" id="solo">
            Solo
          </SelectItem>
        </SelectSection>
        <SelectSection>
          <SelectHeader>Business</SelectHeader>
          <SelectItem description="Up to 5 seats" id="team">
            Team
          </SelectItem>
          <SelectItem description="Unlimited seats" id="org">
            Organization
          </SelectItem>
        </SelectSection>
      </Select>
    </div>
  );
}
