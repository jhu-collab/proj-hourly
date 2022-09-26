import path from "path";
import { fileURLToPath } from "url";
import Debug from "debug";

export function factory(fileURL) {
  const filePath = fileURLToPath(fileURL);
  const __filename = path.basename(filePath);
  const __dirname = path.dirname(filePath);
  return new Debug(`roster:${path.basename(__dirname)}:${__filename}`);
}
