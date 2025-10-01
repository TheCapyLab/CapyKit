import { App } from "vue";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $log?: LogFn;
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
}

export default {
  install(app: App, options: CapyKitPluginOptions = {}) {
    if (!options) return; // exit early if no options provided

    const logger = options.log ? options.logger || basicLogger : () => {};
    logger("Installing CapyKit plugin...", "info");

    registerLoggerFunction(app, logger, options.log);
    if (options.registerComponents) registerAllComponents(app, logger);
  },
};

const registerAllComponents = (app: App, logger: LogFn) => {
  logger("Registering all components...", "info");
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
