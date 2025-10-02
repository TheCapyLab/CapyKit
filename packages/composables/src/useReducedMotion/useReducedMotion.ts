import { ref, type Ref } from "vue";

// Global state - shared across all components
const _prefersReducedMotion = ref<boolean>(false);
let _mediaQuery: MediaQueryList | null = null;
let _listenerAttached = false;

// Initialize the media query listener once globally
const initializeReducedMotionDetection = () => {
  if (
    _listenerAttached ||
    typeof window === "undefined" ||
    !window.matchMedia
  ) {
    return;
  }

  _mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const updatePreference = (event: MediaQueryListEvent | MediaQueryList) => {
    _prefersReducedMotion.value = event.matches;
  };

  // Set initial value
  _prefersReducedMotion.value = _mediaQuery.matches;

  // Listen for changes
  if (_mediaQuery.addEventListener) {
    _mediaQuery.addEventListener("change", updatePreference);
  } else {
    // Fallback for older browsers
    _mediaQuery.addListener(updatePreference);
  }

  _listenerAttached = true;
};

// Initialize immediately if in browser environment
if (typeof window !== "undefined") {
  initializeReducedMotionDetection();
}

/**
 * useReducedMotion composable
 *
 * Provides a reactive way to detect if the user prefers reduced motion
 * based on the 'prefers-reduced-motion' media query.
 *
 * State is shared globally across all components - when the user's motion
 * preference changes, all components using this composable will update.
 *
 * @returns An object containing the reactive reduced motion preference
 */
export function useReducedMotion() {
  // Ensure detection is initialized (important for SSR)
  initializeReducedMotionDetection();

  return {
    prefersReducedMotion: _prefersReducedMotion as Readonly<Ref<boolean>>,
  };
}

export type UseReducedMotionReturn = ReturnType<typeof useReducedMotion>;
