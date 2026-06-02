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
  /** When set, shows this gallery index and disables timed rotation. */
  imageIndex?: number;
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
  imageIndex,
  intervalMs = 6000,
  rotate = false,
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
  const [rotationTick, setRotationTick] = useState(0);
  const isControlled = imageIndex !== undefined;
  const activeIndex = isControlled
    ? imageIndex % gallery.length
    : (startIndex + rotationTick) % gallery.length;

  useEffect(() => {
    if (isControlled || !rotate || gallery.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setRotationTick((current) => current + 1);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [gallery.length, intervalMs, isControlled, rotate]);

  const src = gallery[activeIndex] ?? fallback;
  const caption = captions[activeIndex];

  if (layout === "portrait") {
    const width = isMobile ? Math.min(size, 280) : size;
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
            sizes={`(max-width: 768px) ${Math.min(size, 280)}px, ${size}px`}
            priority={priority}
            className="object-cover transition-opacity duration-700"
          />
        </div>
        {caption && (
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
