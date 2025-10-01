import { defineConfig, type UserConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import { resolve } from "node:path";
import fs from "node:fs";
import { glob } from "glob";

export interface PackageConfig {
  packageName: string;
  entry: string;
  outputDir: string;
}

export function createSharedConfig(config: PackageConfig): UserConfig {
  const { packageName, entry, outputDir } = config;

  return defineConfig({
    plugins: [
      vue(),
      dts({
        outputDir: outputDir,
        insertTypesEntry: true,
        include: ["src/**/*"],
        exclude: ["**/*.test.*", "**/*.spec.*"],
        entryRoot: "src",
      }),
    ],
    build: {
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
        mangle: true,
        format: {
          comments: false,
        },
      },
      lib: {
        entry: resolve(entry),
        name: packageName,
        formats: ["es", "cjs"],
      },
      rollupOptions: {
        external: ["vue", "@vue/runtime-core"],
        output: [
          {
            format: "es",
            dir: outputDir,
            entryFileNames: "[name].esm.js",
            chunkFileNames: "[name].esm.js",
            preserveModules: true,
            preserveModulesRoot: "src",
            exports: "named",
          },
          {
            format: "cjs",
            dir: outputDir,
            entryFileNames: "[name].cjs.js",
            chunkFileNames: "[name].cjs.js",
            preserveModules: true,
            preserveModulesRoot: "src",
            exports: "named",
          },
        ],
      },
      cssCodeSplit: false,
      outDir: outputDir,
    },
    resolve: {
      alias: {
        "@": resolve("src"),
      },
    },
  });
}

export function generateDistPackageJson(
  packageJsonPath: string,
  outputDir: string
) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  const packageDir = packageJsonPath
    .replace("/package.json", "")
    .replace("\\package.json", "");

  // Find all entry points in src
  const srcFiles = glob.sync("src/**/*.{ts,js,vue}", {
    cwd: packageDir,
    ignore: ["**/*.test.*", "**/*.spec.*", "**/test/**", "**/tests/**"],
  });

  const exports: Record<string, any> = {};

  // Always add main export
  exports["."] = {
    types: "./index.d.ts",
    import: "./index.esm.js",
    require: "./index.cjs.js",
    default: "./index.esm.js",
  };

  // Process each source file to create additional exports
  srcFiles.forEach((file: string) => {
    const relativePath = file.replace("src/", "");
    const nameWithoutExt = relativePath.replace(/\.(ts|js|vue)$/, "");

    // Skip index files as they're handled above
    if (nameWithoutExt === "index" || nameWithoutExt.endsWith("/index")) {
      return;
    }

    const exportKey = `./${nameWithoutExt}`;

    if (file.endsWith(".vue")) {
      // Vue files remain .vue
      exports[exportKey] = {
        types: `./${nameWithoutExt}.d.ts`,
        import: `./${nameWithoutExt}.vue`,
        default: `./${nameWithoutExt}.vue`,
      };
    } else {
      // JS/TS files get both formats
      exports[exportKey] = {
        types: `./${nameWithoutExt}.d.ts`,
        import: `./${nameWithoutExt}.esm.js`,
        require: `./${nameWithoutExt}.cjs.js`,
        default: `./${nameWithoutExt}.esm.js`,
      };
    }
  });

  const distPackageJson = {
    ...packageJson,
    main: "./index.cjs.js",
    module: "./index.esm.js",
    types: "./index.d.ts",
    exports,
    scripts: undefined, // Remove scripts from dist package
    devDependencies: undefined, // Remove devDependencies from dist package
  };

  const distPackageJsonPath = resolve(outputDir, "package.json");
  fs.writeFileSync(
    distPackageJsonPath,
    JSON.stringify(distPackageJson, null, 2)
  );

  console.log(`Generated ${distPackageJsonPath}`);
}
