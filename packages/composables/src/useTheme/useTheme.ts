import { ref, type Ref } from "vue";

export type Theme = "light" | "dark";

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
 * Automatically initializes with the user's browser/system theme preference.
 *
 * @returns An object containing the current theme and theme management methods
 */
export function useTheme() {
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
