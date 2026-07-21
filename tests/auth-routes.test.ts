import { describe, expect, it } from "vitest";
import {
  AUTH_CALLBACK_PATH,
  AUTH_LOGIN_PATH,
  AUTH_LOGOUT_PATH,
  AUTH_RETURN_HOME,
} from "@/lib/auth/routes";

describe("auth routes", () => {
  it("matches the WorkOS AuthKit redirect and login endpoints", () => {
    expect(AUTH_CALLBACK_PATH).toBe("/callback");
    expect(AUTH_LOGIN_PATH).toBe("/login");
    expect(AUTH_LOGOUT_PATH).toBe("/logout");
    expect(AUTH_RETURN_HOME).toBe("/");
  });
});
