import { isAxiosError } from 'axios';

export interface LoginFormValues {
  email: string;
  password: string;
}

export interface LoginFieldErrors {
  email?: string;
  password?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmailField(email: string): string | undefined {
  if (!email.trim()) return 'Email address is required.';
  if (!EMAIL_PATTERN.test(email.trim())) return 'Please enter a valid email address.';
  return undefined;
}

function validatePasswordField(password: string): string | undefined {
  if (!password) return 'Password is required.';
  return undefined;
}

/**
 * Validates login form input before it ever reaches the network.
 * Only checks what the client can actually know (presence, shape) —
 * whether the credentials are correct is the server's job, not this
 * function's, since replicating a password policy here could reject
 * a legitimate password the server would still accept.
 */
export function validateLoginFields({ email, password }: LoginFormValues): LoginFieldErrors {
  const errors: LoginFieldErrors = {};

  const emailError = validateEmailField(email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePasswordField(password);
  if (passwordError) errors.password = passwordError;

  return errors;
}

export function hasLoginFieldErrors(errors: LoginFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

const NETWORK_ERROR_MESSAGE = 'Unable to reach the server. Please check your connection and try again.';
const SERVER_ERROR_MESSAGE = 'The server ran into a problem. Please try again in a moment.';

// Deliberately the same message for "wrong password" and "no account with
// this email" — the backend returns an identical 401 for both (Spring's
// default hideUserNotFoundExceptions behavior) so that a failed attempt
// never reveals whether an email is registered. Do not special-case an
// "account not found" message here; that would reintroduce the account
// enumeration hole the backend was written to avoid.
const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password.';

/**
 * Turns a failed /auth/login call into a single user-facing message.
 * Kept separate from the component so the mapping is unit-testable and
 * the component doesn't need to know about axios or HTTP status codes.
 */
export function getLoginErrorMessage(error: unknown): string {
  if (!isAxiosError(error) || !error.response) {
    return NETWORK_ERROR_MESSAGE;
  }

  const { status, data } = error.response;

  if (status >= 500) {
    return SERVER_ERROR_MESSAGE;
  }

  if (status === 401) {
    return INVALID_CREDENTIALS_MESSAGE;
  }

  // Covers e.g. 429 rate-limiting, where api.ts's response interceptor has
  // already injected a specific, safe-to-show message.
  return data?.message || INVALID_CREDENTIALS_MESSAGE;
}
