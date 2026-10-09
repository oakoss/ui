import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@oakoss/ui/components/ui/layout/accordion';

export function AccordionMultiple() {
  return (
    <Accordion
      allowsMultipleExpanded
      className="not-prose max-w-md"
      defaultExpandedKeys={['account', 'billing']}
    >
      <AccordionItem id="account">
        <AccordionTrigger>Account</AccordionTrigger>
        <AccordionContent>
          Change your name, email and password.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem id="billing">
        <AccordionTrigger>Billing</AccordionTrigger>
        <AccordionContent>
          Update your card and see past invoices.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem id="notifications">
        <AccordionTrigger>Notifications</AccordionTrigger>
        <AccordionContent>Choose what we email you about.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
