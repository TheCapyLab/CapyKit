/**
 * Theme system types and interfaces
 */

export interface ThemeTokens {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    xxl: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      xxl: string;
    };
    fontWeight: {
      normal: string;
      medium: string;
      semibold: string;
      bold: string;
    };
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface ThemeDefinition {
  name: string;
  displayName: string;
  light?: ThemeTokens;
  dark?: ThemeTokens;
  tokens?: ThemeTokens; // For single-variant themes (no light/dark distinction)
  cssUrl?: string; // For external CSS themes
}

export interface ThemeOptions {
  defaultTheme?: string;
  themes?: ThemeDefinition[];
  autoDetectColorScheme?: boolean;
}

export type ColorScheme = "light" | "dark" | "auto";
