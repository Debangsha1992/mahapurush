import { validateAllContent } from "../src/lib/content/loaders";

try {
  validateAllContent();
  console.log("Content validation passed.");
} catch (error) {
  console.error("Content validation failed.");
  console.error(error);
  process.exit(1);
}
