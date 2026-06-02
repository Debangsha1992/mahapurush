import fs from "fs";
import path from "path";
import sharp from "sharp";
import { THINKER_GALLERY_SCENES } from "../src/lib/constants/gallery-scenes";

const publicRoot = path.join(process.cwd(), "public", "assets", "thinkers");

const DESKTOP_WIDTH = 1024;
const MOBILE_WIDTH = 540;
const MOBILE_HEIGHT = 960; // 9:16
const WEBP_QUALITY = 78;

function toWebpName(filename: string): string {
  return filename.replace(/\.(png|jpe?g|webp)$/i, ".webp");
}

async function optimizeDesktop(inputPath: string, outputPath: string) {
  await sharp(inputPath)
    .resize({
      width: DESKTOP_WIDTH,
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toFile(outputPath);
}

async function optimizeMobilePortrait(inputPath: string, outputPath: string) {
  const metadata = await sharp(inputPath).metadata();
  const width = metadata.width ?? 1536;
  const height = metadata.height ?? 1024;

  const cropWidth = Math.round(height * (9 / 16));
  const cropHeight = height;
  const left = Math.max(0, Math.round((width - cropWidth) / 2));

  await sharp(inputPath)
    .extract({
      left,
      top: 0,
      width: Math.min(cropWidth, width - left),
      height: cropHeight,
    })
    .resize(MOBILE_WIDTH, MOBILE_HEIGHT, { fit: "cover", position: "centre" })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toFile(outputPath);
}

async function main() {
  let processed = 0;

  for (const [slug, scenes] of Object.entries(THINKER_GALLERY_SCENES)) {
    const thinkerDir = path.join(publicRoot, slug);
    const desktopDir = path.join(thinkerDir, "desktop");
    const mobileDir = path.join(thinkerDir, "mobile");

    fs.mkdirSync(desktopDir, { recursive: true });
    fs.mkdirSync(mobileDir, { recursive: true });

    for (const scene of scenes) {
      const webpName = toWebpName(scene.filename);
      const sourceCandidates = [
        path.join(thinkerDir, scene.filename),
        path.join(thinkerDir, webpName),
        path.join(thinkerDir, "desktop", webpName),
      ];

      const sourcePath = sourceCandidates.find((candidate) =>
        fs.existsSync(candidate),
      );

      if (!sourcePath) {
        console.warn(`Skipping missing source for ${slug}/${scene.filename}`);
        continue;
      }

      const desktopOut = path.join(desktopDir, webpName);
      const mobileOut = path.join(mobileDir, webpName);

      const desktopSource =
        sourcePath === desktopOut
          ? path.join(thinkerDir, "mobile", webpName)
          : sourcePath;
      const mobileSource =
        fs.existsSync(path.join(thinkerDir, scene.filename)) &&
        scene.filename.endsWith(".png")
          ? path.join(thinkerDir, scene.filename)
          : sourcePath === mobileOut
            ? desktopSource
            : sourcePath;

      if (desktopSource === desktopOut) {
        console.warn(`Skipping desktop ${desktopOut} (no distinct source)`);
      } else {
        await optimizeDesktop(desktopSource, desktopOut);
      }

      if (mobileSource === mobileOut) {
        console.warn(`Skipping mobile ${mobileOut} (no distinct source)`);
      } else {
        await optimizeMobilePortrait(mobileSource, mobileOut);
      }

      if (fs.existsSync(desktopOut) && fs.existsSync(mobileOut)) {
        processed += 1;
        const desktopSize = fs.statSync(desktopOut).size;
        const mobileSize = fs.statSync(mobileOut).size;
        console.log(
          `${slug}/${webpName} -> desktop ${(desktopSize / 1024).toFixed(0)}KB, mobile ${(mobileSize / 1024).toFixed(0)}KB`,
        );
      }
    }
  }

  console.log(`Optimized ${processed} scene pairs into desktop/ and mobile/ WebP folders.`);

  const removeLegacy = process.argv.includes("--remove-png");
  if (removeLegacy) {
    for (const [slug, scenes] of Object.entries(THINKER_GALLERY_SCENES)) {
      const thinkerDir = path.join(publicRoot, slug);
      for (const scene of scenes) {
        const legacyPath = path.join(thinkerDir, scene.filename);
        if (fs.existsSync(legacyPath) && scene.filename.endsWith(".png")) {
          fs.unlinkSync(legacyPath);
          console.log(`Removed legacy ${legacyPath}`);
        }
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
