import { ReactNode, useEffect } from 'react';
import { useForm, FormProvider, DefaultValues, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ZodSchema } from 'zod';

interface SmartFormProviderProps<T extends FieldValues> {
  schema: ZodSchema<T>;
  defaultValues: DefaultValues<T>;
  onSubmit: (data: T) => void | Promise<void>;
  children: ReactNode;
  className?: string;
}

export function SmartFormProvider<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
}: SmartFormProviderProps<T>) {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onTouched',
    reValidateMode: 'onBlur',
  });

  // Keep form in sync with defaultValues only when they change externally
  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues]);

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
        {children}
      </form>
    </FormProvider>
  );
}

export { useFormContext } from 'react-hook-form';
