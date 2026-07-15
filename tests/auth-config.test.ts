import { describe, expect, it } from "vitest";
import { WORKOS_ENV_KEYS, isWorkOSConfigured } from "@/lib/auth/config";

describe("WorkOS auth config", () => {
  it("lists the required environment keys", () => {
    expect(WORKOS_ENV_KEYS).toEqual([
      "WORKOS_CLIENT_ID",
      "WORKOS_API_KEY",
      "WORKOS_COOKIE_PASSWORD",
      "NEXT_PUBLIC_WORKOS_REDIRECT_URI",
    ]);
  });

  it("reports configuration as incomplete when required values are missing", () => {
    expect(
      isWorkOSConfigured({
        WORKOS_CLIENT_ID: "",
        WORKOS_API_KEY: "sk_test",
        WORKOS_COOKIE_PASSWORD: "x".repeat(32),
        NEXT_PUBLIC_WORKOS_REDIRECT_URI: "http://localhost:3000/callback",
      }),
    ).toBe(false);
  });

  it("reports configuration as complete when all required values are present", () => {
    expect(
      isWorkOSConfigured({
        WORKOS_CLIENT_ID: "client_123",
        WORKOS_API_KEY: "sk_test_123",
        WORKOS_COOKIE_PASSWORD: "x".repeat(32),
        NEXT_PUBLIC_WORKOS_REDIRECT_URI: "http://localhost:3000/callback",
      }),
    ).toBe(true);
  });
});
