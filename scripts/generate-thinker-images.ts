import fs from "fs";
import path from "path";
import OpenAI from "openai";
import {
  getMobilePrompt,
  getSceneWebpFilename,
  THINKER_GALLERY_SCENES,
} from "../src/lib/constants/gallery-scenes";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Variant = "desktop" | "mobile";

async function generateImage(
  prompt: string,
  outputPath: string,
  variant: Variant,
) {
  const response = await openai.images.generate({
    model: "gpt-image-2",
    prompt,
    size: variant === "mobile" ? "1024x1536" : "1536x1024",
  });

  const imageBase64 = response.data?.[0]?.b64_json;
  if (!imageBase64) {
    throw new Error(`No image returned for ${outputPath}`);
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, Buffer.from(imageBase64, "base64"));
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required to generate thinker images.");
  }

  const variant = (process.argv[2] as Variant | undefined) ?? "desktop";
  if (variant !== "desktop" && variant !== "mobile") {
    throw new Error('Usage: npm run content:generate-images -- desktop|mobile');
  }

  for (const [slug, scenes] of Object.entries(THINKER_GALLERY_SCENES)) {
    for (const scene of scenes) {
      const webpName = getSceneWebpFilename(scene.filename);
      const outputPath = path.join(
        process.cwd(),
        "public",
        "assets",
        "thinkers",
        slug,
        variant,
        webpName,
      );

      if (fs.existsSync(outputPath)) {
        console.log(`Skipping existing ${outputPath}`);
        continue;
      }

      const prompt =
        variant === "mobile" ? getMobilePrompt(scene.prompt) : scene.prompt;

      console.log(`Generating ${variant} ${slug}/${webpName}`);
      await generateImage(prompt, outputPath, variant);
    }
  }

  console.log(`All ${variant} thinker gallery images generated.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
