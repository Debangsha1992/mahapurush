export const WORKOS_ENV_KEYS = [
  "WORKOS_CLIENT_ID",
  "WORKOS_API_KEY",
  "WORKOS_COOKIE_PASSWORD",
  "NEXT_PUBLIC_WORKOS_REDIRECT_URI",
] as const;

export type WorkOSEnvKey = (typeof WORKOS_ENV_KEYS)[number];

export type WorkOSEnv = Partial<Record<WorkOSEnvKey, string | undefined>>;

export function isWorkOSConfigured(
  env: WorkOSEnv | NodeJS.ProcessEnv = process.env,
): boolean {
  return WORKOS_ENV_KEYS.every((key) => Boolean(env[key]?.trim()));
}
