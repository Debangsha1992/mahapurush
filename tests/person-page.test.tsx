import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import PersonPage from "@/app/people/[slug]/page";

describe("PersonPage", () => {
  it("does not render draft or placeholder facts on public profiles", async () => {
    const markup = renderToStaticMarkup(
      await PersonPage({ params: Promise.resolve({ slug: "puyi" }) }),
    );

    expect(markup).toContain("No approved facts yet");
    expect(markup).not.toContain("Facts Mode card reserved");
    expect(markup).not.toContain("recorded life dates");
    expect(markup).not.toContain("profile connects");
    expect(markup).not.toContain("is grouped with");
    expect(markup).not.toContain("is a notable politician connected with China");
    expect(markup).not.toContain("connected with China");
  });
});
