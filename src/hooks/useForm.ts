import { useCallback, useState } from 'react';

type Validator<TValues> = (values: TValues) => Partial<Record<keyof TValues, string>>;

interface UseFormResult<TValues> {
  values: TValues;
  errors: Partial<Record<keyof TValues, string>>;
  setFieldValue: <K extends keyof TValues>(field: K, value: TValues[K]) => void;
  handleSubmit: (callback: (values: TValues) => Promise<void> | void) => () => Promise<void>;
  reset: () => void;
}

/**
 * Hook simples para formulários com validação síncrona.
 * ```ts
 * const form = useForm({ email: '' }, values => ({ email: !values.email ? 'Obrigatório' : undefined }));
 * ```
 */
const useForm = <TValues extends Record<string, any>>(
  initialValues: TValues,
  validate: Validator<TValues>
): UseFormResult<TValues> => {
  const [values, setValues] = useState<TValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof TValues, string>>>({});

  const setFieldValue = useCallback(<K extends keyof TValues>(field: K, value: TValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  const handleSubmit = useCallback(
    (callback: (values: TValues) => Promise<void> | void) => {
      return async () => {
        const validationErrors = validate(values);
        setErrors(validationErrors);
        const hasErrors = Object.values(validationErrors).some(Boolean);
        if (!hasErrors) {
          await callback(values);
        }
      };
    },
    [validate, values]
  );

  return {
    values,
    errors,
    setFieldValue,
    handleSubmit,
    reset,
  };
};

export default useForm;
