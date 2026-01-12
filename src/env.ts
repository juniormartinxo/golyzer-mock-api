import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";

const envFiles = [".env.local", ".env"];

for (const envFile of envFiles) {
  const filePath = resolve(process.cwd(), envFile);
  if (existsSync(filePath)) {
    config({ path: filePath });
  }
}
