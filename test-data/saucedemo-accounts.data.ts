// Published directly on https://www.saucedemo.com/'s login page - safe to commit,
// unlike the private AUTH_EMAIL/AUTH_PASSWORD reserved for a real application's own credentials.
export const SAUCEDEMO_PASSWORD = 'secret_sauce';

export const SAUCEDEMO_ACCOUNTS = {
  standard: 'standard_user',
  lockedOut: 'locked_out_user',
} as const;
