function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const WEB_PUSH_VAPID_PUBLIC_KEY = requireEnv(
  "WEB_PUSH_VAPID_PUBLIC_KEY"
);

export const WEB_PUSH_VAPID_PRIVATE_KEY = requireEnv(
  "WEB_PUSH_VAPID_PRIVATE_KEY"
);

export const WEB_PUSH_CONTACT_EMAIL = requireEnv(
  "WEB_PUSH_CONTACT_EMAIL"
);