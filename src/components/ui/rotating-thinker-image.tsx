"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useIsMobile } from "@/hooks/use-is-mobile";

type RotatingThinkerImageProps = {
  slug: string;
  name: string;
  desktopImages: string[];
  mobileImages: string[];
  captions?: string[];
  className?: string;
  imageClassName?: string;
  size?: number;
  layout?: "avatar" | "portrait";
  intervalMs?: number;
  rotate?: boolean;
  priority?: boolean;
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function RotatingThinkerImage({
  slug,
  name,
  desktopImages,
  mobileImages,
  captions = [],
  className = "",
  imageClassName = "rounded-full object-cover",
  size = 320,
  layout = "avatar",
  intervalMs = 6000,
  rotate = true,
  priority = false,
}: RotatingThinkerImageProps) {
  const isMobile = useIsMobile();
  const fallback = `/assets/thinkers/${slug}.svg`;
  const desktopGallery =
    desktopImages.length > 0 ? desktopImages : [fallback];
  const mobileGallery = mobileImages.length > 0 ? mobileImages : desktopGallery;
  const gallery = isMobile ? mobileGallery : desktopGallery;

  const startIndex = useMemo(
    () =>
      hashString(
        `${slug}-${typeof window !== "undefined" ? window.location.pathname : "server"}-${isMobile ? "m" : "d"}`,
      ) % gallery.length,
    [gallery.length, isMobile, slug],
  );
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    setIndex(startIndex);
  }, [startIndex, slug, isMobile]);

  useEffect(() => {
    if (!rotate || gallery.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % gallery.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [gallery.length, intervalMs, rotate]);

  const src = gallery[index] ?? fallback;
  const caption = captions[index];
  const isPortrait = isMobile && layout === "portrait";

  if (isPortrait) {
    const width = Math.min(size, 280);
    const height = Math.round(width * (16 / 9));

    return (
      <figure className={className}>
        <div
          className="relative overflow-hidden rounded-[1.25rem] bg-[var(--color-surface-raised)]"
          style={{ width, height }}
        >
          <Image
            key={src}
            src={src}
            alt={caption ? `${name}: ${caption}` : `${name} life scene`}
            fill
            sizes="(max-width: 768px) 280px, 160px"
            priority={priority}
            className="object-cover transition-opacity duration-700"
          />
        </div>
        {caption && rotate && (
          <figcaption className="mt-2 text-xs leading-5 text-[var(--color-muted)]">
            {caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return (
    <figure className={className}>
      <Image
        key={src}
        src={src}
        alt={caption ? `${name}: ${caption}` : `${name} life scene`}
        width={size}
        height={size}
        sizes={isMobile ? `${size}px` : `(max-width: 768px) ${size}px, ${size}px`}
        priority={priority}
        className={`${imageClassName} transition-opacity duration-700`}
      />
    </figure>
  );
}
