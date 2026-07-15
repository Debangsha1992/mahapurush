import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const useAuthMock = vi.fn();

vi.mock("@workos-inc/authkit-nextjs/components", () => ({
  useAuth: () => useAuthMock(),
}));

import { AuthControls } from "@/components/auth/auth-controls";

describe("AuthControls", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
  });

  it("renders nothing while auth is loading", () => {
    useAuthMock.mockReturnValue({
      user: null,
      loading: true,
      signOut: vi.fn(),
    });

    const markup = renderToStaticMarkup(<AuthControls />);
    expect(markup).toBe("");
  });

  it("renders login and signup links when signed out", () => {
    useAuthMock.mockReturnValue({
      user: null,
      loading: false,
      signOut: vi.fn(),
    });

    const markup = renderToStaticMarkup(<AuthControls />);
    expect(markup).toContain("Log in");
    expect(markup).toContain("Sign up");
    expect(markup).toContain('href="/login"');
    expect(markup).toContain('href="/signup"');
  });

  it("renders the signed-in user email and sign out control", () => {
    useAuthMock.mockReturnValue({
      user: {
        id: "user_123",
        email: "learner@example.com",
        firstName: "Ada",
        lastName: "Lovelace",
      },
      loading: false,
      signOut: vi.fn(),
    });

    const markup = renderToStaticMarkup(<AuthControls />);
    expect(markup).toContain("learner@example.com");
    expect(markup).toContain("Sign out");
    expect(markup).not.toContain("Log in");
  });
});
