import {
  Badge,
  type BadgeStyleProps,
} from '@oakoss/ui/components/ui/data/badge';

const intents = [
  'neutral',
  'primary',
  'success',
  'warning',
  'destructive',
  'info',
] as const satisfies readonly BadgeStyleProps['intent'][];
const variants = [
  'solid',
  'soft',
  'outline',
] as const satisfies readonly BadgeStyleProps['variant'][];

export function BadgeLooks() {
  return (
    <div className="not-prose grid gap-2">
      {variants.map((variant) => (
        <div className="flex flex-wrap gap-2" key={variant}>
          {intents.map((intent) => (
            <Badge intent={intent} key={intent} variant={variant}>
              {intent}
            </Badge>
          ))}
        </div>
      ))}
    </div>
  );
}
