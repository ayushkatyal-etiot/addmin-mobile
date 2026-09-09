import { useState } from 'react';
import { validateEmail, validatePassword } from '../utils/validation';

export interface LoginFormState {
  email: string;
  password: string;
  emailTouched: boolean;
  passwordTouched: boolean;
  emailError?: string;
  passwordError?: string;
  formError?: string;
}

export interface LoginFormActions {
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setEmailTouched: (touched: boolean) => void;
  setPasswordTouched: (touched: boolean) => void;
  setFormError: (error?: string) => void;
  clearErrors: () => void;
  canSubmit: () => boolean;
}

export function useLoginForm(): LoginFormState & LoginFormActions {
  const [email, setEmailState] = useState('');
  const [password, setPasswordState] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();

  const setEmail = (value: string) => {
    setEmailState(value);
    // Clear formError when user starts typing
    if (formError) {
      setFormError(undefined);
    }
    // Clear emailError when user starts typing
    if (emailError) {
      setEmailError(undefined);
    }
  };

  const setPassword = (value: string) => {
    setPasswordState(value);
    // Clear formError when user starts typing
    if (formError) {
      setFormError(undefined);
    }
    // Clear passwordError when user starts typing
    if (passwordError) {
      setPasswordError(undefined);
    }
  };

  const validateAndSetEmailTouched = (touched: boolean) => {
    setEmailTouched(touched);
    if (touched) {
      const validation = validateEmail(email);
      setEmailError(validation.error);
    }
  };

  const validateAndSetPasswordTouched = (touched: boolean) => {
    setPasswordTouched(touched);
    if (touched) {
      const validation = validatePassword(password);
      setPasswordError(validation.error);
    }
  };

  const canSubmit = (): boolean => {
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);
    return emailValidation.valid && passwordValidation.valid && !formError;
  };

  const clearErrors = () => {
    setEmailError(undefined);
    setPasswordError(undefined);
    setFormError(undefined);
    setEmailTouched(false);
    setPasswordTouched(false);
  };

  return {
    email,
    password,
    emailTouched,
    passwordTouched,
    emailError,
    passwordError,
    formError,
    setEmail,
    setPassword,
    setEmailTouched: validateAndSetEmailTouched,
    setPasswordTouched: validateAndSetPasswordTouched,
    setFormError,
    clearErrors,
    canSubmit,
  };
}
