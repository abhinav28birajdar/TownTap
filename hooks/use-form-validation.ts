import { useForm, UseFormProps, UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import React, { useState, useCallback } from 'react';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Enhanced form hook with automatic error handling and toast notifications
export function useFormWithValidation<TSchema extends z.ZodType<any, any>>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.infer<TSchema>>, 'resolver'> & {
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string;
    onSubmitSuccess?: (data: z.infer<TSchema>) => void | Promise<void>;
    onSubmitError?: (error: Error) => void;
  }
): UseFormReturn<z.infer<TSchema>> & {
  submitWithToast: (onSubmit: (data: z.infer<TSchema>) => void | Promise<void>) => Promise<void>;
  isSubmitting: boolean;
  hasErrors: boolean;
  getFieldError: (fieldName: Path<z.infer<TSchema>>) => string | undefined;
  isFieldInvalid: (fieldName: Path<z.infer<TSchema>>) => boolean;
  clearFieldError: (fieldName: Path<z.infer<TSchema>>) => void;
  clearAllErrors: () => void;
  setFieldValue: (fieldName: Path<z.infer<TSchema>>, value: any) => void;
  watchField: (fieldName: Path<z.infer<TSchema>>) => any;
} {
  const {
    showSuccessToast = true,
    showErrorToast = true,
    successMessage = 'Success!',
    onSubmitSuccess,
    onSubmitError,
    ...formOptions
  } = options || {};

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    ...formOptions,
  });
  
  const {
    handleSubmit,
    formState: { errors },
    clearErrors,
    setValue,
    watch,
  } = form;
  
  const hasErrors = Object.keys(errors).length > 0;
  
  const getFieldError = useCallback((fieldName: Path<z.infer<TSchema>>) => {
    const error = errors[fieldName];
    return error?.message as string | undefined;
  }, [errors]);
  
  const isFieldInvalid = useCallback((fieldName: Path<z.infer<TSchema>>) => {
    return !!errors[fieldName];
  }, [errors]);
  
  const clearFieldError = useCallback((fieldName: Path<z.infer<TSchema>>) => {
    clearErrors(fieldName);
  }, [clearErrors]);
  
  const clearAllErrors = useCallback(() => {
    clearErrors();
  }, [clearErrors]);
  
  const setFieldValue = useCallback((fieldName: Path<z.infer<TSchema>>, value: any) => {
    setValue(fieldName, value, { shouldValidate: true });
  }, [setValue]);
  
  const watchField = useCallback((fieldName: Path<z.infer<TSchema>>) => {
    return watch(fieldName);
  }, [watch]);
  
  const submitWithToast = useCallback(
    async (onSubmit: (data: z.infer<TSchema>) => void | Promise<void>) => {
      setIsSubmitting(true);
      
      try {
        await handleSubmit(async (data) => {
          try {
            await onSubmit(data);
            
            if (onSubmitSuccess) {
              await onSubmitSuccess(data);
            }
            
            if (showSuccessToast) {
              Toast.show({
                type: 'success',
                text1: successMessage,
                text2: 'Your request was processed successfully',
                position: 'top',
              });
            }
          } catch (submitError) {
            console.error('Form submission error:', submitError);
            
            if (onSubmitError) {
              onSubmitError(submitError as Error);
            }
            
            if (showErrorToast) {
              Toast.show({
                type: 'error',
                text1: 'Submission Failed',
                text2: (submitError as Error).message || 'An unexpected error occurred',
                position: 'top',
              });
            }
          }
        })();
      } catch (validationError) {
        console.error('Form validation error:', validationError);
        
        if (showErrorToast) {
          Toast.show({
            type: 'error',
            text1: 'Validation Error',
            text2: 'Please check the form for errors',
            position: 'top',
          });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [handleSubmit, onSubmitSuccess, onSubmitError, showSuccessToast, showErrorToast, successMessage]
  );
  
  return {
    ...form,
    submitWithToast,
    isSubmitting,
    hasErrors,
    getFieldError,
    isFieldInvalid,
    clearFieldError,
    clearAllErrors,
    setFieldValue,
    watchField,
  };
}

// Form field component wrapper for consistent styling and error handling
import React from 'react';
import { ViewStyle } from 'react-native';
import { Input, InputProps } from '../components/ui/input';
import { Text } from '../components/ui/Text';
import { Spacing } from '../constants/spacing';

interface FormFieldProps extends Omit<InputProps, 'value' | 'onChangeText' | 'error'> {
  name: string;
  control: any;
  rules?: any;
  style?: ViewStyle;
  showError?: boolean;
  errorStyle?: any;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  control,
  rules,
  style,
  showError = true,
  errorStyle,
  ...inputProps
}) => {
  const {
    field: { onChange, onBlur, value },
    fieldState: { error },
  } = control.useController({
    name,
    rules,
  });
  
  return (
    <>
      <Input
        {...inputProps}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        error={!!error}
        style={style}
      />
      {showError && error && (
        <Text
          variant="body-small"
          color="destructive"
          style={[{ marginTop: Spacing.xs }, errorStyle]}
        >
          {error.message}
        </Text>
      )}
    </>
  );
};

// Validation state management hook
export function useFormValidationState() {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [validationTouched, setValidationTouched] = useState<Record<string, boolean>>({});
  
  const setFieldError = useCallback((fieldName: string, error: string) => {
    setValidationErrors(prev => ({ ...prev, [fieldName]: error }));
  }, []);
  
  const clearFieldError = useCallback((fieldName: string) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);
  
  const setFieldTouched = useCallback((fieldName: string, touched = true) => {
    setValidationTouched(prev => ({ ...prev, [fieldName]: touched }));
  }, []);
  
  const getFieldError = useCallback((fieldName: string) => {
    return validationTouched[fieldName] ? validationErrors[fieldName] : undefined;
  }, [validationErrors, validationTouched]);
  
  const isFieldInvalid = useCallback((fieldName: string) => {
    return !!(validationTouched[fieldName] && validationErrors[fieldName]);
  }, [validationErrors, validationTouched]);
  
  const clearAllErrors = useCallback(() => {
    setValidationErrors({});
    setValidationTouched({});
  }, []);
  
  return {
    validationErrors,
    validationTouched,
    setFieldError,
    clearFieldError,
    setFieldTouched,
    getFieldError,
    isFieldInvalid,
    clearAllErrors,
  };
}

// Form submission state hook
export function useFormSubmission() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const submit = useCallback(async (submitFunction: () => Promise<void>) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      await submitFunction();
      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setSuccess(false);
  }, []);
  
  return {
    isLoading,
    error,
    success,
    submit,
    reset,
  };
}

// Multi-step form hook
export function useMultiStepForm<T extends FieldValues>(
  steps: Array<{
    id: string;
    title: string;
    schema: z.ZodType<any>;
    optional?: boolean;
  }>,
  options?: {
    initialStep?: number;
    onStepChange?: (step: number, data: Partial<T>) => void;
    onComplete?: (data: T) => void;
  }
) {
  const [currentStep, setCurrentStep] = useState(options?.initialStep || 0);
  const [formData, setFormData] = useState<Partial<T>>({});
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  
  const currentStepData = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const canGoNext = completedSteps.has(currentStep);
  const canGoPrevious = currentStep > 0;
  
  const form = useFormWithValidation(currentStepData.schema, {
    defaultValues: formData,
  });
  
  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < steps.length) {
      setCurrentStep(step);
      form.reset(formData);
      options?.onStepChange?.(step, formData);
    }
  }, [steps.length, formData, form, options]);
  
  const nextStep = useCallback(() => {
    if (!isLastStep) {
      const newFormData = { ...formData, ...form.getValues() };
      setFormData(newFormData);
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      goToStep(currentStep + 1);
    }
  }, [isLastStep, formData, form, currentStep, goToStep]);
  
  const previousStep = useCallback(() => {
    if (!isFirstStep) {
      const newFormData = { ...formData, ...form.getValues() };
      setFormData(newFormData);
      goToStep(currentStep - 1);
    }
  }, [isFirstStep, formData, form, currentStep, goToStep]);
  
  const submitStep = useCallback(async () => {
    const isValid = await form.trigger();
    if (isValid) {
      if (isLastStep) {
        const finalData = { ...formData, ...form.getValues() } as T;
        options?.onComplete?.(finalData);
      } else {
        nextStep();
      }
    }
  }, [form, isLastStep, formData, options, nextStep]);
  
  const progress = ((currentStep + 1) / steps.length) * 100;
  
  return {
    currentStep,
    currentStepData,
    form,
    formData,
    completedSteps,
    isFirstStep,
    isLastStep,
    canGoNext,
    canGoPrevious,
    progress,
    goToStep,
    nextStep,
    previousStep,
    submitStep,
  };
}

// Form persistence hook for saving draft data
export function useFormPersistence<T extends FieldValues>(
  key: string,
  form: UseFormReturn<T>,
  options?: {
    autoSave?: boolean;
    saveInterval?: number;
  }
) {
  const { autoSave = false, saveInterval = 5000 } = options || {};
  
  const saveData = useCallback(async () => {
    try {
      const data = form.getValues();
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(`form_draft_${key}`, jsonValue);
    } catch (error) {
      console.error('Failed to save form data:', error);
    }
  }, [key, form]);
  
  const loadData = useCallback(async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(`form_draft_${key}`);
      if (jsonValue) {
        const data = JSON.parse(jsonValue);
        form.reset(data);
        return data;
      }
    } catch (error) {
      console.error('Failed to load form data:', error);
    }
    return null;
  }, [key, form]);
  
  const clearData = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(`form_draft_${key}`);
    } catch (error) {
      console.error('Failed to clear form data:', error);
    }
  }, [key]);
  
  // Auto-save functionality
  React.useEffect(() => {
    if (!autoSave) return;
    
    const interval = setInterval(saveData, saveInterval);
    return () => clearInterval(interval);
  }, [autoSave, saveData, saveInterval]);
  
  return {
    saveData,
    loadData,
    clearData,
  };
}