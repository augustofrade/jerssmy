import { MutableRef, useRef, useState } from 'preact/hooks';

/**
 * Type definition for a validation rule used in the useField hook.
 * Expectes an tuple of a code and a validator function.
 */
export type UseFieldValidation<TValue = string> = [string, validator: (value: TValue) => boolean];

/**
 * Options for configuring the behavior of the useField hook.
 */
export interface UseFieldOptions<TValue = string> {
  initialValue?: TValue;
  validations?: UseFieldValidation<TValue>[];
  required?: boolean;
}

/**
 * Represents the possible states of a form field.
 */
export enum FormState {
  /**
   * The field has not been interacted with by the user.
   */
  Untouched,
  /**
   * The field has been interacted with by the user.
   */
  Touched,
  /**
   * The field's value has been modified by the user.
   */
  Dirty
}

/**
 * Hook for managing form field state, including value, validation, and error handling.
 */
export interface UseField<TValue = string> {
  /**
   * The current value of the field.
   */
  value: TValue | undefined;
  /**
   * The current state of the field (Untouched, Touched, or Dirty).
   */
  state: FormState;
  /**
   * Indicates whether the field has been modified by the user.
   */
  dirty: boolean;
  /**
   * Indicates whether the field has been touched by the user.
   */
  touched: boolean;
  /**
   * A set of error codes representing the current validation errors of the field.
   */
  errors: Set<string>;
  /**
   * Indicates whether the field currently has any validation errors.
   */
  hasErrors: boolean;
  /**
   * Sets the value of the field and marks it as dirty.
   * @param value The new value to set for the field.
   */
  setValue: (value: TValue) => void;
  /**
   * Indicates whether the field is currently valid (i.e., has no validation errors).
   */
  valid: boolean;
  /**
   * Indicates whether the field is currently invalid (i.e., has validation errors).
   */
  invalid: boolean;
  /**
   * Runs validation synchronously against the current value, marks the field as dirty,
   * and returns whether the field is valid.
   */
  validate: () => boolean;
  /**
   * Resets the field to its initial value and marks it as untouched.
   */
  reset: () => void;
  /**
   * Clears the field's value and marks it as dirty.
   */
  clear: () => void;
  /**
   * Checks if the field has a specific validation error.
   * @param code The error code to check for.
   */
  hasError: (code: string) => boolean;
  /**
   * Helper function that indicates whether the field should display its validation errors.
   * Helps avoiding having to repeatedly check the same conditions in the UI.
   */
  shouldDisplayError: boolean;
  /**
   * A mutable reference to the underlying HTML input element associated with the field, if any.
   */
  ref: MutableRef<HTMLInputElement | null>;
  /**
   * Marks the field as touched (user interaction).
   */
  markAsTouched: () => void;
  /**
   * Marks the field as dirty (user modification/input).
   */
  markAsDirty: () => void;
  /**
   * Toggles the enabled/disabled state of the field. Only works if the field is associated with an HTML element through the `ref` property.
   */
  toggle: () => void;
  /**
   * Disables the field. Only works if the field is associated with an HTML element through the `ref` property.
   */
  disable: () => void;
  /**
   * Enables the field. Only works if the field is associated with an HTML element through the `ref` property.
   */
  enable: () => void;
  /**
   * Indicates whether the field is currently disabled.
   * If no HTML element is associated with the field through the `ref` property, this will always be `false`.
   */
  disabled: boolean;
}

/**
 * Hook for managing the state and validation of a form field.
 * @param options The configuration options for the field, including initial value, validations, and required flag.
 * @returns An object representing the state and behavior of the field, including its value, validation status, and helper methods.
 */
export function useField<TValue = string>(options: UseFieldOptions<TValue>): UseField<TValue> {
  const { initialValue, validations, required } = options;
  const [value, setValue] = useState(initialValue);
  const [fieldState, setFieldState] = useState(FormState.Untouched);

  const fieldRef = useRef<HTMLInputElement | null>(null);

  function collectErrors(nextValue: TValue | undefined): Set<string> {
    const nextErrors: Set<string> = new Set();

    const isEmptyString = typeof nextValue === 'string' && nextValue.trim().length === 0;
    const isMissingValue = nextValue == null;

    if (required && (isMissingValue || isEmptyString)) {
      nextErrors.add('required');
      return nextErrors;
    }

    if (validations) {
      validations.forEach(([code, validator]) => {
        const isValid = validator(nextValue as TValue);
        if (!isValid) {
          nextErrors.add(code);
        }
      });
    }

    return nextErrors;
  }

  function validateField() {
    setFieldState(FormState.Dirty);
    return collectErrors(value).size === 0;
  }

  function setFieldValue(value: TValue) {
    setValue(value);
    setFieldState(FormState.Dirty);
  }

  function resetField() {
    setValue(initialValue!);
    setFieldState(FormState.Untouched);
  }

  function clearField() {
    setValue(initialValue!);
    setFieldState(FormState.Dirty);
  }

  const errors = collectErrors(value);
  const valid = errors.size === 0;

  return {
    value,
    state: fieldState,
    ref: fieldRef,
    dirty: fieldState === FormState.Dirty,
    touched: fieldState === FormState.Touched,
    errors,
    setValue: setFieldValue,
    valid: valid,
    invalid: !valid,
    validate: validateField,
    hasErrors: errors.size > 0,
    shouldDisplayError: (fieldState === FormState.Dirty || fieldState === FormState.Touched) && errors.size > 0,
    reset: resetField,
    clear: clearField,
    hasError: (code: string) => errors.has(code),
    markAsTouched: () => setFieldState(FormState.Touched),
    markAsDirty: () => setFieldState(FormState.Dirty),
    toggle: () => {
      if (fieldRef.current) {
        fieldRef.current.disabled = !fieldRef.current.disabled;
      }
    },
    disable: () => {
      if (fieldRef.current) {
        fieldRef.current.disabled = true;
      }
    },
    enable: () => {
      if (fieldRef.current) {
        fieldRef.current.disabled = false;
      }
    },
    disabled: fieldRef.current ? fieldRef.current.disabled : false,
  };
}