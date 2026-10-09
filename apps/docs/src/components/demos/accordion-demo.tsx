import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@oakoss/ui/components/ui/layout/accordion';

export function AccordionDemo() {
  return (
    <Accordion
      className="not-prose max-w-md"
      defaultExpandedKeys={['shipping']}
    >
      <AccordionItem id="shipping">
        <AccordionTrigger>How long does shipping take?</AccordionTrigger>
        <AccordionContent>
          Orders ship within two business days and arrive in three to five.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem id="returns">
        <AccordionTrigger>What is the return policy?</AccordionTrigger>
        <AccordionContent>
          Return anything unused within 30 days for a full refund.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem id="warranty">
        <AccordionTrigger>Is there a warranty?</AccordionTrigger>
        <AccordionContent>
          Every product carries a one-year warranty against defects.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
