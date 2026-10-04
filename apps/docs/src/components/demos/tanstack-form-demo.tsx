import { Button } from '@oakoss/ui/components/ui/inputs/button';
import {
  TextField,
  type TextFieldProps,
} from '@oakoss/ui/components/ui/inputs/text-field';
import {
  createFormHook,
  createFormHookContexts,
  revalidateLogic,
} from '@tanstack/react-form';
import { useState } from 'react';
import { Form } from 'react-aria-components';
import * as z from 'zod';

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts();

type FormTextFieldProps = {
  description?: string;
  label: string;
  type?: TextFieldProps['type'];
};

function FormTextField({ description, label, type }: FormTextFieldProps) {
  const field = useFieldContext<string>();
  return (
    <TextField
      description={description}
      errors={field.state.meta.errors}
      isInvalid={!field.state.meta.isValid}
      label={label}
      name={field.name}
      onBlur={field.handleBlur}
      onChange={field.handleChange}
      type={type}
      value={field.state.value}
    />
  );
}

function SubmitButton({ label }: { label: string }) {
  const form = useFormContext();
  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button isPending={isSubmitting} type="submit">
          {label}
        </Button>
      )}
    </form.Subscribe>
  );
}

const { useAppForm } = createFormHook({
  fieldComponents: { TextField: FormTextField },
  fieldContext,
  formComponents: { SubmitButton },
  formContext,
});

const schema = z.object({
  email: z.email('Enter a valid email.'),
  name: z.string().min(2, 'Enter at least 2 characters.'),
});

export function TanStackFormDemo() {
  const [submitted, setSubmitted] = useState<string>();
  const form = useAppForm({
    defaultValues: { email: '', name: '' },
    onSubmit: ({ value }) => {
      setSubmitted(value.name);
    },
    validationLogic: revalidateLogic(),
    validators: { onDynamic: schema },
  });

  return (
    <Form
      className="not-prose flex max-w-sm flex-col gap-4 rounded-lg border p-6"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
      validationBehavior="aria"
    >
      <form.AppField name="name">
        {(field) => <field.TextField label="Name" />}
      </form.AppField>
      <form.AppField
        name="email"
        validators={{
          onDynamicAsync: async ({ value }) =>
            (await isRegistered(value))
              ? 'This email is already registered.'
              : undefined,
          onDynamicAsyncDebounceMs: 300,
        }}
      >
        {(field) => (
          <field.TextField
            description="We never share your address."
            label="Email"
            type="email"
          />
        )}
      </form.AppField>
      <form.AppForm>
        <form.SubmitButton label="Sign up" />
      </form.AppForm>
      <p aria-live="polite" className="text-sm">
        {submitted === undefined ? null : `Signed up as ${submitted}.`}
      </p>
    </Form>
  );
}

// Stands in for an API call; the docs site has no server.
async function isRegistered(email: string): Promise<boolean> {
  await new Promise((resolve) => {
    setTimeout(resolve, 300);
  });
  return email === 'taken@example.com';
}
