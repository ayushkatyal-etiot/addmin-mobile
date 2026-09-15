export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) {
    return { valid: false, error: 'Email is required' };
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return { valid: false, error: 'Enter a valid email address' };
  }
  return { valid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (!password.trim()) {
    return { valid: false, error: 'Password is required' };
  }
  return { valid: true };
}
