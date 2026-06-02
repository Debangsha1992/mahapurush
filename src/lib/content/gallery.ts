import fs from "fs";
import path from "path";
import { THINKER_GALLERY_SCENES } from "@/lib/constants/gallery-scenes";

function toWebpName(filename: string): string {
  return filename.replace(/\.(png|jpe?g|webp)$/i, ".webp");
}

export type ThinkerGallery = {
  desktopImages: string[];
  mobileImages: string[];
  captions: string[];
};

export function getThinkerGallery(slug: string): ThinkerGallery {
  const scenes = THINKER_GALLERY_SCENES[slug] ?? [];
  const publicRoot = path.join(process.cwd(), "public");
  const thinkerRoot = path.join(publicRoot, "assets", "thinkers", slug);

  const desktopDir = path.join(thinkerRoot, "desktop");
  const mobileDir = path.join(thinkerRoot, "mobile");

  const available = scenes.filter((scene) => {
    const webpName = toWebpName(scene.filename);
    return (
      fs.existsSync(path.join(mobileDir, webpName)) ||
      fs.existsSync(path.join(desktopDir, webpName)) ||
      fs.existsSync(path.join(thinkerRoot, scene.filename))
    );
  });

  if (available.length === 0) {
    const fallback = `/assets/thinkers/${slug}.svg`;
    return {
      desktopImages: [fallback],
      mobileImages: [fallback],
      captions: [],
    };
  }

  return {
    desktopImages: available.map((scene) => {
      const webpName = toWebpName(scene.filename);
      if (fs.existsSync(path.join(desktopDir, webpName))) {
        return `/assets/thinkers/${slug}/desktop/${webpName}`;
      }
      if (fs.existsSync(path.join(thinkerRoot, scene.filename))) {
        return `/assets/thinkers/${slug}/${scene.filename}`;
      }
      return `/assets/thinkers/${slug}/desktop/${webpName}`;
    }),
    mobileImages: available.map((scene) => {
      const webpName = toWebpName(scene.filename);
      if (fs.existsSync(path.join(mobileDir, webpName))) {
        return `/assets/thinkers/${slug}/mobile/${webpName}`;
      }
      if (fs.existsSync(path.join(desktopDir, webpName))) {
        return `/assets/thinkers/${slug}/desktop/${webpName}`;
      }
      if (fs.existsSync(path.join(thinkerRoot, scene.filename))) {
        return `/assets/thinkers/${slug}/${scene.filename}`;
      }
      return `/assets/thinkers/${slug}/mobile/${webpName}`;
    }),
    captions: available.map((scene) => scene.caption),
  };
}
