export interface AuthFormState {
  error?: string;
  email?: string;
  displayName?: string;
}

export interface ResetRequestState {
  error?: string;
  sent?: boolean;
  email?: string;
}

export interface ResetPasswordState {
  error?: string;
}
