import { useState, ChangeEvent, FormEvent } from 'react';

interface UseFormReturn<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleBlur: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => (e: FormEvent) => Promise<void>;
  setFieldValue: (field: keyof T, value: any) => void;
  setValues: (values: T) => void;
  reset: () => void;
  isValid: boolean;
}

interface ValidationRules {
  [key: string]: (value: any) => string | null;
}

/**
 * Hook personalizado para manejar formularios
 * @param initialValues - Valores iniciales del formulario
 * @param validationRules - Reglas de validación
 * @returns {UseFormReturn} - Estado y métodos del formulario
 */
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationRules: ValidationRules = {}
): UseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = (field: keyof T, value: any): string | null => {
    const rule = validationRules[field as string];
    if (rule) {
      return rule(value);
    }
    return null;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setValues(prev => ({ ...prev, [name]: newValue }));
    
    // Validar si el campo ya fue tocado
    if (touched[name]) {
      const error = validate(name as keyof T, newValue);
      setErrors(prev => ({ ...prev, [name]: error || '' }));
    }
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validate(name as keyof T, value);
    setErrors(prev => ({ ...prev, [name]: error || '' }));
  };

  const setFieldValue = (field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const setValuesFn = (newValues: T) => {
    setValues(newValues);
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const error = validate(field as keyof T, values[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (onSubmit: (values: T) => void | Promise<void>) => async (e: FormEvent) => {
    e.preventDefault();
    
    // Marcar todos los campos como tocados
    const allTouched: Record<string, boolean> = {};
    Object.keys(values).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (!validateAll()) {
      return;
    }

    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submit error:', error);
    }
  };

  const isValid = Object.keys(errors).length === 0 || Object.values(errors).every(e => !e);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setValues: setValuesFn,
    reset,
    isValid,
  };
}

export default useForm;
