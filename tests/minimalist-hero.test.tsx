import { BookOpen, Telescope } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MinimalistHero } from "@/components/ui/minimalist-hero";

describe("MinimalistHero", () => {
  it("renders the Galileo-led home hero content", () => {
    const markup = renderToStaticMarkup(
      <MinimalistHero
        logoText="MindSpark"
        navLinks={[
          { label: "Facts", href: "/facts" },
          { label: "People", href: "/people" },
          { label: "Paths", href: "/paths" },
        ]}
        mainText="Practice thinking with Galileo and other world-changing minds through short facts, reflection, and guided lessons."
        readMoreLink="/introspection"
        imageSrc="/assets/hero/galileo-black-white-cutout.png"
        imageAlt="Black and white figure of Galileo Galilei"
        overlayText={{
          part1: "think",
          part2: "deeper.",
        }}
        socialLinks={[
          { icon: Telescope, href: "/explore" },
          { icon: BookOpen, href: "/facts" },
        ]}
        locationText="Florence, 1633"
      />,
    );

    expect(markup).toContain("MindSpark");
    expect(markup).toContain("Facts");
    expect(markup).toContain("People");
    expect(markup).toContain("Paths");
    expect(markup).toContain("Black and white figure of Galileo Galilei");
    expect(markup).toContain("think");
    expect(markup).toContain("deeper.");
    expect(markup).toContain("/introspection");
    expect(markup).toContain("Florence, 1633");
  });

  it("keeps mobile hero content stacked below the Galileo composition", () => {
    const markup = renderToStaticMarkup(
      <MinimalistHero
        logoText="MindSpark"
        navLinks={[
          { label: "Facts", href: "/facts" },
          { label: "People", href: "/people" },
          { label: "Paths", href: "/paths" },
        ]}
        mainText="Practice thinking with Galileo and other world-changing minds through short facts, reflection, and guided lessons."
        readMoreLink="/introspection"
        imageSrc="/assets/hero/galileo-black-white-cutout.png"
        imageAlt="Black and white figure of Galileo Galilei"
        overlayText={{
          part1: "think",
          part2: "deeper.",
        }}
        socialLinks={[
          { icon: Telescope, href: "/explore" },
          { icon: BookOpen, href: "/facts" },
        ]}
        locationText="Florence, 1633"
      />,
    );

    expect(markup).toContain("h-[100svh]");
    expect(markup).toContain("grid-rows-[auto_auto_auto]");
    expect(markup).toContain("h-[min(116vw,520px)]");
    expect(markup).toContain("order-2 flex");
    expect(markup).toContain("md:order-3");
    expect(markup).toContain("order-3 text-center");
    expect(markup).toContain("md:order-1");
  });
});
