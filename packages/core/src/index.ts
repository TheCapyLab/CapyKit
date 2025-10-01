// Export type definitions
export * from "./index.d";

// Export plugin as the default export and named export
export { default as CapyKit } from "./plugin";
export { default } from "./plugin";

// Re-export plugin types
export type { LogType, CapyKitPluginOptions } from "./plugin";
