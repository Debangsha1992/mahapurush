import fs from "fs";
import path from "path";
import { THINKER_GALLERY_SCENES } from "../src/lib/constants/gallery-scenes";

const sourceDir =
  "/Users/debangsha/.cursor/projects/Users-debangsha-Desktop-Mahapurush/assets";
const publicRoot = path.join(process.cwd(), "public", "assets", "thinkers");

for (const [slug, scenes] of Object.entries(THINKER_GALLERY_SCENES)) {
  const files = fs
    .readdirSync(sourceDir)
    .filter((file) => file.startsWith(`${slug}-`) && file.endsWith(".png"))
    .sort();

  if (files.length !== scenes.length) {
    throw new Error(
      `Expected ${scenes.length} images for ${slug}, found ${files.length}`,
    );
  }

  const targetDir = path.join(publicRoot, slug);
  fs.mkdirSync(targetDir, { recursive: true });

  scenes.forEach((scene, index) => {
    const source = path.join(sourceDir, files[index]);
    const target = path.join(targetDir, scene.filename);
    fs.copyFileSync(source, target);
    console.log(`Copied ${source} -> ${target}`);
  });
}

console.log("Gallery images installed in public/assets/thinkers/");
