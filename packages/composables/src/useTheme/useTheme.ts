import { ref, computed, inject, type Ref } from "vue";

export type Theme = "light" | "dark";
export type ColorScheme = "light" | "dark" | "auto";

// Define types locally to avoid dependency issues
interface ThemeManager {
  getColorScheme(): ColorScheme;
  getCurrentTheme(): { name: string } | undefined;
  getThemes(): any[];
  getEffectiveColorScheme(): Theme;
  setTheme(themeName: string): Promise<void>;
  setColorScheme(scheme: ColorScheme): void;
}

// Global state - shared across all components
// Initialize with browser preference
const getInitialTheme = (): Theme => {
  if (typeof window !== "undefined" && window.matchMedia) {
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    return darkModeQuery.matches ? "dark" : "light";
  }
  return "light"; // fallback for SSR
};

const _currentTheme = ref<Theme>(getInitialTheme());

/**
 * useTheme composable
 *
 * Provides global theme management with reactive state shared across all components.
 * Now integrated with CapyKit's theme system for advanced theming capabilities.
 * Falls back to simple light/dark switching if theme manager is not available.
 *
 * @returns An object containing the current theme and theme management methods
 */
export function useTheme() {
  // Try to get theme manager from plugin
  const themeManager = inject<ThemeManager | null>("themeManager", null);

  // If theme manager is available, use it for advanced theming
  if (themeManager) {
    const currentColorScheme = ref<ColorScheme>(themeManager.getColorScheme());
    const currentThemeName = ref<string>(
      themeManager.getCurrentTheme()?.name || "default"
    );
    const availableThemes = ref(themeManager.getThemes());

    const effectiveTheme = computed<Theme>(() => {
      return themeManager.getEffectiveColorScheme();
    });

    const setTheme = async (themeName: string) => {
      await themeManager.setTheme(themeName);
      currentThemeName.value = themeName;
    };

    const setColorScheme = (scheme: ColorScheme) => {
      themeManager.setColorScheme(scheme);
      currentColorScheme.value = scheme;
    };

    const toggleColorScheme = () => {
      const current = themeManager.getEffectiveColorScheme();
      const newScheme: ColorScheme = current === "light" ? "dark" : "light";
      setColorScheme(newScheme);
    };

    return {
      // Legacy API compatibility
      currentTheme: effectiveTheme as Readonly<Ref<Theme>>,
      setTheme: (theme: Theme) => setColorScheme(theme),
      toggleTheme: toggleColorScheme,

      // Advanced theme API
      currentColorScheme: currentColorScheme as Readonly<Ref<ColorScheme>>,
      currentThemeName: currentThemeName as Readonly<Ref<string>>,
      availableThemes: availableThemes as Readonly<Ref<any[]>>,
      setColorScheme,
      setThemeName: setTheme,
      toggleColorScheme,
      themeManager,
    };
  }

  // Fallback to simple theme switching if no theme manager
  const setTheme = (theme: Theme) => {
    _currentTheme.value = theme;
  };

  const toggleTheme = () => {
    _currentTheme.value = _currentTheme.value === "light" ? "dark" : "light";
  };

  return {
    currentTheme: _currentTheme as Readonly<Ref<Theme>>,
    setTheme,
    toggleTheme,
  };
}

export type UseThemeReturn = ReturnType<typeof useTheme>;
