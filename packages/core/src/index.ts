// Export type definitions
export * from "./types";

// Export theme system
export * from "./theme";
export * from "./themeManager";
export * from "./defaultTheme";

// Export plugin as the default export and named export
export { default as CapyKit } from "./plugin";
export { default } from "./plugin";

// Re-export plugin types
export type { LogType, CapyKitPluginOptions } from "./plugin";
