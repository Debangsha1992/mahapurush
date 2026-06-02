import { RotatingThinkerImage } from "@/components/ui/rotating-thinker-image";
import { getThinkerGallery } from "@/lib/content/gallery";

type ThinkerMediaProps = {
  slug: string;
  name: string;
  size?: number;
  className?: string;
  imageClassName?: string;
  layout?: "avatar" | "portrait";
  showCaption?: boolean;
  rotate?: boolean;
  priority?: boolean;
};

export function ThinkerMedia({
  slug,
  name,
  size = 120,
  className = "",
  imageClassName = "rounded-full object-cover",
  layout = "avatar",
  showCaption = false,
  rotate = false,
  priority = false,
}: ThinkerMediaProps) {
  const { desktopImages, mobileImages, captions } = getThinkerGallery(slug);

  return (
    <RotatingThinkerImage
      slug={slug}
      name={name}
      desktopImages={desktopImages}
      mobileImages={mobileImages}
      captions={showCaption ? captions : []}
      className={className}
      imageClassName={imageClassName}
      size={size}
      layout={layout}
      rotate={rotate}
      priority={priority}
    />
  );
}
