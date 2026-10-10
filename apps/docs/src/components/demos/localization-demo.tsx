import * as Icon from '@oakoss/ui/components/icons';
import { Button } from '@oakoss/ui/components/ui/inputs/button';
import { FieldLabel } from '@oakoss/ui/components/ui/inputs/field';
import { Input } from '@oakoss/ui/components/ui/inputs/input';
import { TextField } from '@oakoss/ui/components/ui/inputs/text-field';
import { type ReactNode, useState } from 'react';
import {
  Button as AriaButton,
  I18nProvider,
  SearchField,
  useLocale,
} from 'react-aria-components';

// The app's own strings; React Aria translates its built-in ones (the clear
// button's label) itself.
const strings = {
  'ar-EG': {
    email: 'البريد الإلكتروني',
    pending: 'جارٍ الحفظ',
    save: 'حفظ',
    search: 'بحث',
  },
  'en-US': {
    email: 'Email',
    pending: 'Saving',
    save: 'Save',
    search: 'Search',
  },
} as const;

type Locale = keyof typeof strings;

export function LocalizationDemo() {
  const [locale, setLocale] = useState<Locale>('en-US');
  const t = strings[locale];
  return (
    <div className="not-prose flex max-w-sm flex-col gap-4 rounded-lg border p-6">
      <div className="flex gap-2">
        <Button
          intent="neutral"
          onPress={() => {
            setLocale('en-US');
          }}
          size="sm"
          variant={locale === 'en-US' ? 'solid' : 'outline'}
        >
          English
        </Button>
        <Button
          intent="neutral"
          onPress={() => {
            setLocale('ar-EG');
          }}
          size="sm"
          variant={locale === 'ar-EG' ? 'solid' : 'outline'}
        >
          العربية
        </Button>
      </div>
      <I18nProvider locale={locale}>
        <Directional>
          <TextField label={t.email} type="email" />
          <SearchField className="flex flex-col gap-2">
            <FieldLabel>{t.search}</FieldLabel>
            <div className="relative">
              <Input className="pe-9" />
              <AriaButton className="absolute inset-y-0 end-2 my-auto size-6 rounded-sm text-muted-foreground">
                <Icon.X aria-hidden className="mx-auto size-4" />
              </AriaButton>
            </div>
          </SearchField>
          <Button pendingLabel={t.pending}>{t.save}</Button>
        </Directional>
      </I18nProvider>
    </div>
  );
}

// The page itself stays English, so the demo sets its own direction.
function Directional({ children }: { children: ReactNode }) {
  const { direction, locale } = useLocale();
  return (
    <div
      className="flex flex-col gap-4"
      data-testid="localized"
      dir={direction}
      lang={locale}
    >
      {children}
    </div>
  );
}
