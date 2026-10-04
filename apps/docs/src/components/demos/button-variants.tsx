import { Button } from '@oakoss/ui/components/ui/inputs/button';

const variants = ['solid', 'soft', 'outline', 'ghost', 'link'] as const;

export function ButtonVariants() {
  return (
    <div className="not-prose flex flex-col gap-3">
      {variants.map((variant) => (
        <div className="flex flex-wrap items-center gap-3" key={variant}>
          <Button intent="primary" variant={variant}>
            Primary
          </Button>
          <Button intent="neutral" variant={variant}>
            Neutral
          </Button>
          <Button intent="destructive" variant={variant}>
            Destructive
          </Button>
          <Button intent="success" variant={variant}>
            Success
          </Button>
        </div>
      ))}
    </div>
  );
}
