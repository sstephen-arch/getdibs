import { ContentError } from "../src/content/validate";
import { loadContent } from "../src/content/load";

try {
  const { entries, projects } = loadContent();
  console.log(`ok — ${entries.length} entries, ${projects.length} projects`);
} catch (error) {
  if (error instanceof ContentError) {
    console.error(error.message);
    process.exit(1);
  }
  throw error;
}
