import { App } from "vue";
import { ThemeManager } from "./themeManager";
import type { ThemeOptions } from "./theme";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $log?: LogFn;
    $theme?: ThemeManager;
  }
}

export type LogType = "info" | "warn" | "error";
interface LogFn {
  (message: string, type?: LogType): void;
}

export interface CapyKitPluginOptions {
  registerComponents?: boolean;
  log?: boolean;
  logger?: LogFn;
  theme?: ThemeOptions;
}

export default {
  install(app: App, options: CapyKitPluginOptions = {}) {
    if (!options) return; // exit early if no options provided

    const logger = options.log ? options.logger || basicLogger : () => {};
    logger("Installing CapyKit plugin...", "info");

    // Initialize theme manager
    const themeManager = new ThemeManager(options.theme);

    registerLoggerFunction(app, logger, options.log);
    registerThemeManager(app, themeManager, logger);

    if (options.registerComponents) registerAllComponents(app, logger);
  },
};

const registerAllComponents = (app: App, logger: LogFn) => {
  logger("Registering all components...", "info");
};

const registerThemeManager = (
  app: App,
  themeManager: ThemeManager,
  logger: LogFn
) => {
  logger("Registering theme manager...", "info");
  app.config.globalProperties.$theme = themeManager;

  // Provide theme manager for composition API
  app.provide("themeManager", themeManager);
};

const registerLoggerFunction = (
  app: App,
  logger: LogFn,
  isLogEnabled: boolean = false
) => {
  if (isLogEnabled) {
    logger("Registering logger function...", "info");
    app.config.globalProperties.$log = logger;
  } else {
    app.config.globalProperties.$log = () => {};
  }
};

const basicLogger = (message: string, type: LogType = "info") => {
  const logFn: Record<LogType, (...args: any[]) => void> = {
    info: console.log,
    warn: console.warn,
    error: console.error,
  };
  logFn[type](`[${new Date().toISOString()}] [${type}] ${message}`);
};
