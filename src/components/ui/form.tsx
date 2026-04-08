'use client';

import * as React from 'react';
import {
  Controller,
  FormProvider,
  useFormContext,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

import { Field, FieldError, FieldLabel } from '@/components/ui/field';

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

const FormField = <TFieldValues extends FieldValues, TName extends FieldPath<TFieldValues>>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const { getFieldState, formState } = useFormContext();
  const fieldState = getFieldState(fieldContext.name, formState);

  return {
    name: fieldContext.name,
    error: fieldState.error,
  };
};

function FormItem({ ...props }: React.ComponentProps<typeof Field>) {
  return <Field {...props} data-invalid={props['aria-invalid']} />;
}

function FormLabel({ ...props }: React.ComponentProps<typeof FieldLabel>) {
  return <FieldLabel {...props} />;
}

function FormControl({ ...props }: React.ComponentProps<'div'>) {
  const { error } = useFormField();

  return <div aria-invalid={!!error} {...props} />;
}

function FormMessage({ ...props }: React.ComponentProps<typeof FieldError>) {
  const { error } = useFormField();

  return <FieldError errors={error ? [error] : undefined} {...props} />;
}

export { Form, FormControl, FormField, FormItem, FormLabel, FormMessage };
