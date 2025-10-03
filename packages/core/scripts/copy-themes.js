import { copyFileSync, mkdirSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = resolve(__dirname, "../src");
const distDir = resolve(__dirname, "../dist");

// Ensure themes directory exists in dist
const themesDistDir = resolve(distDir, "themes");
if (!existsSync(themesDistDir)) {
  mkdirSync(themesDistDir, { recursive: true });
}

// Copy CSS theme files
const themeFiles = ["default.css", "ocean.css"];

themeFiles.forEach((file) => {
  const srcPath = resolve(srcDir, "themes", file);
  const distPath = resolve(themesDistDir, file);

  if (existsSync(srcPath)) {
    copyFileSync(srcPath, distPath);
    console.log(`Copied ${file} to dist/themes/`);
  } else {
    console.warn(`Theme file ${file} not found in src/themes/`);
  }
});

console.log("Theme files copied successfully!");
