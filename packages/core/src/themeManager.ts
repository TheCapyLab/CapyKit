/**
 * Theme Manager - Handles loading, switching, and management of themes
 */

import type {
  ThemeDefinition,
  ThemeTokens,
  ColorScheme,
  ThemeOptions,
} from "./theme";
import { defaultTheme } from "./defaultTheme";

export class ThemeManager {
  private themes: Map<string, ThemeDefinition> = new Map();
  private currentThemeName: string = "default";
  private currentColorScheme: ColorScheme = "auto";
  private loadedCssFiles: Set<string> = new Set();
  private styleElement: HTMLStyleElement | null = null;

  constructor(options: ThemeOptions = {}) {
    // Register default theme
    this.registerTheme(defaultTheme);

    // Register additional themes from options
    if (options.themes) {
      options.themes.forEach((theme) => this.registerTheme(theme));
    }

    // Set default theme
    if (options.defaultTheme && this.themes.has(options.defaultTheme)) {
      this.currentThemeName = options.defaultTheme;
    }

    // Auto-detect color scheme if enabled
    if (options.autoDetectColorScheme !== false) {
      this.autoDetectColorScheme();
    }

    // Initialize theme
    this.applyTheme();
  }

  /**
   * Register a new theme
   */
  registerTheme(theme: ThemeDefinition): void {
    this.themes.set(theme.name, theme);
  }

  /**
   * Get all registered themes
   */
  getThemes(): ThemeDefinition[] {
    return Array.from(this.themes.values());
  }

  /**
   * Get current theme definition
   */
  getCurrentTheme(): ThemeDefinition | undefined {
    return this.themes.get(this.currentThemeName);
  }

  /**
   * Set the active theme
   */
  async setTheme(themeName: string): Promise<void> {
    if (!this.themes.has(themeName)) {
      console.warn(
        `Theme "${themeName}" not found. Available themes:`,
        Array.from(this.themes.keys())
      );
      return;
    }

    this.currentThemeName = themeName;
    await this.applyTheme();
  }

  /**
   * Set the color scheme (light/dark/auto)
   */
  setColorScheme(scheme: ColorScheme): void {
    this.currentColorScheme = scheme;
    this.applyTheme();
  }

  /**
   * Get current color scheme
   */
  getColorScheme(): ColorScheme {
    return this.currentColorScheme;
  }

  /**
   * Get the effective color scheme (resolves 'auto' to 'light' or 'dark')
   */
  getEffectiveColorScheme(): "light" | "dark" {
    if (this.currentColorScheme === "auto") {
      return this.detectSystemColorScheme();
    }
    return this.currentColorScheme;
  }

  /**
   * Apply the current theme
   */
  private async applyTheme(): Promise<void> {
    const theme = this.getCurrentTheme();
    if (!theme) return;

    const effectiveScheme = this.getEffectiveColorScheme();

    // If theme has CSS URL, load it
    if (theme.cssUrl) {
      await this.loadCssTheme(theme.cssUrl);
    } else {
      // Apply tokens-based theme
      let tokens: ThemeTokens | undefined;

      if (theme.tokens) {
        // Single-variant theme (no light/dark distinction)
        tokens = theme.tokens;
      } else {
        // Multi-variant theme (light/dark)
        tokens = effectiveScheme === "dark" ? theme.dark : theme.light;
      }

      if (tokens) {
        this.applyTokensToDOM(tokens);
      }
    }

    // Set data attribute for CSS targeting
    document.documentElement.setAttribute("data-theme", theme.name);
    document.documentElement.setAttribute("data-color-scheme", effectiveScheme);
  }

  /**
   * Load external CSS theme file
   */
  private async loadCssTheme(cssUrl: string): Promise<void> {
    if (this.loadedCssFiles.has(cssUrl)) return;

    return new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssUrl;
      link.onload = () => {
        this.loadedCssFiles.add(cssUrl);
        resolve();
      };
      link.onerror = () =>
        reject(new Error(`Failed to load theme CSS: ${cssUrl}`));
      document.head.appendChild(link);
    });
  }

  /**
   * Apply theme tokens to DOM as CSS custom properties
   */
  private applyTokensToDOM(tokens: ThemeTokens): void {
    if (!this.styleElement) {
      this.styleElement = document.createElement("style");
      this.styleElement.id = "capykit-theme-vars";
      document.head.appendChild(this.styleElement);
    }

    const cssVars = this.tokensToCssVariables(tokens);
    this.styleElement.textContent = `:root { ${cssVars} }`;
  }

  /**
   * Convert theme tokens to CSS custom properties
   */
  private tokensToCssVariables(tokens: ThemeTokens): string {
    const vars: string[] = [];

    // Colors
    Object.entries(tokens.colors).forEach(([key, value]) => {
      vars.push(`--ck-color-${key}: ${value};`);
    });

    // Spacing
    Object.entries(tokens.spacing).forEach(([key, value]) => {
      vars.push(`--ck-spacing-${key}: ${value};`);
    });

    // Typography
    vars.push(`--ck-font-family: ${tokens.typography.fontFamily};`);
    Object.entries(tokens.typography.fontSize).forEach(([key, value]) => {
      vars.push(`--ck-font-size-${key}: ${value};`);
    });
    Object.entries(tokens.typography.fontWeight).forEach(([key, value]) => {
      vars.push(`--ck-font-weight-${key}: ${value};`);
    });

    // Border Radius
    Object.entries(tokens.borderRadius).forEach(([key, value]) => {
      vars.push(`--ck-border-radius-${key}: ${value};`);
    });

    // Shadows
    Object.entries(tokens.shadows).forEach(([key, value]) => {
      vars.push(`--ck-shadow-${key}: ${value};`);
    });

    return vars.join(" ");
  }

  /**
   * Auto-detect system color scheme preference
   */
  private autoDetectColorScheme(): void {
    if (typeof window !== "undefined" && window.matchMedia) {
      const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");

      // Listen for changes
      darkModeQuery.addEventListener("change", () => {
        if (this.currentColorScheme === "auto") {
          this.applyTheme();
        }
      });
    }
  }

  /**
   * Detect current system color scheme
   */
  private detectSystemColorScheme(): "light" | "dark" {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  }

  /**
   * Remove all loaded CSS themes
   */
  cleanup(): void {
    // Remove style element
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = null;
    }

    // Remove loaded CSS files
    this.loadedCssFiles.forEach((url) => {
      const links = document.querySelectorAll(`link[href="${url}"]`);
      links.forEach((link) => link.remove());
    });
    this.loadedCssFiles.clear();

    // Remove data attributes
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-color-scheme");
  }
}
