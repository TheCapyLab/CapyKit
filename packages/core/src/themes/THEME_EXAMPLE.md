# Example: Theme Switching Component

Here's a complete example of how to create a theme switcher component using the CapyKit theming system:

```vue
<template>
  <div class="theme-switcher">
    <div class="theme-switcher__header">
      <h3 class="theme-switcher__title">Theme Settings</h3>
    </div>
    
    <div class="theme-switcher__content">
      <!-- Color Scheme Selector -->
      <div class="theme-switcher__section">
        <label class="theme-switcher__label">Color Scheme:</label>
        <div class="theme-switcher__button-group">
          <button 
            v-for="scheme in colorSchemes" 
            :key="scheme"
            :class="['theme-switcher__button', { 
              'theme-switcher__button--active': currentColorScheme === scheme 
            }]"
            @click="setColorScheme(scheme)"
          >
            {{ capitalizeFirst(scheme) }}
          </button>
        </div>
      </div>

      <!-- Theme Selector -->
      <div class="theme-switcher__section" v-if="availableThemes.length > 1">
        <label class="theme-switcher__label">Theme:</label>
        <select 
          class="theme-switcher__select"
          :value="currentThemeName"
          @change="setThemeName($event.target.value)"
        >
          <option 
            v-for="theme in availableThemes" 
            :key="theme.name" 
            :value="theme.name"
          >
            {{ theme.displayName }}
          </option>
        </select>
      </div>

      <!-- Current Theme Info -->
      <div class="theme-switcher__info">
        <p class="theme-switcher__info-text">
          Current: <strong>{{ currentThemeName }}</strong> 
          (<strong>{{ currentColorScheme }}</strong> mode)
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from '@thecapylab/capykitcomposables'

const {
  currentColorScheme,
  currentThemeName,
  availableThemes,
  setColorScheme,
  setThemeName
} = useTheme()

const colorSchemes = ['light', 'dark', 'auto']

const capitalizeFirst = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
</script>

<style scoped>
.theme-switcher {
  background-color: var(--ck-color-surface);
  border: 1px solid var(--ck-color-border);
  border-radius: var(--ck-border-radius-md);
  padding: var(--ck-spacing-lg);
  max-width: 400px;
  box-shadow: var(--ck-shadow-sm);
}

.theme-switcher__header {
  margin-bottom: var(--ck-spacing-md);
}

.theme-switcher__title {
  color: var(--ck-color-text);
  font-family: var(--ck-font-family);
  font-size: var(--ck-font-size-lg);
  font-weight: var(--ck-font-weight-semibold);
  margin: 0;
}

.theme-switcher__content {
  display: flex;
  flex-direction: column;
  gap: var(--ck-spacing-md);
}

.theme-switcher__section {
  display: flex;
  flex-direction: column;
  gap: var(--ck-spacing-sm);
}

.theme-switcher__label {
  color: var(--ck-color-text);
  font-family: var(--ck-font-family);
  font-size: var(--ck-font-size-sm);
  font-weight: var(--ck-font-weight-medium);
}

.theme-switcher__button-group {
  display: flex;
  gap: var(--ck-spacing-xs);
}

.theme-switcher__button {
  background-color: var(--ck-color-background);
  border: 1px solid var(--ck-color-border);
  border-radius: var(--ck-border-radius-sm);
  color: var(--ck-color-text);
  cursor: pointer;
  font-family: var(--ck-font-family);
  font-size: var(--ck-font-size-sm);
  padding: var(--ck-spacing-xs) var(--ck-spacing-sm);
  transition: all 0.2s ease;
}

.theme-switcher__button:hover {
  background-color: var(--ck-color-surface);
  border-color: var(--ck-color-primary);
}

.theme-switcher__button--active {
  background-color: var(--ck-color-primary);
  border-color: var(--ck-color-primary);
  color: var(--ck-color-background);
}

.theme-switcher__select {
  background-color: var(--ck-color-background);
  border: 1px solid var(--ck-color-border);
  border-radius: var(--ck-border-radius-sm);
  color: var(--ck-color-text);
  font-family: var(--ck-font-family);
  font-size: var(--ck-font-size-sm);
  padding: var(--ck-spacing-xs) var(--ck-spacing-sm);
  width: 100%;
}

.theme-switcher__select:focus {
  border-color: var(--ck-color-primary);
  outline: none;
  box-shadow: 0 0 0 2px var(--ck-color-primary, #3b82f6)33;
}

.theme-switcher__info {
  background-color: var(--ck-color-background);
  border-radius: var(--ck-border-radius-sm);
  padding: var(--ck-spacing-sm);
}

.theme-switcher__info-text {
  color: var(--ck-color-text-secondary);
  font-family: var(--ck-font-family);
  font-size: var(--ck-font-size-xs);
  margin: 0;
}
</style>
```

## Usage in Your App

```vue
<!-- App.vue -->
<template>
  <div class="app">
    <header class="app-header">
      <h1>My CapyKit App</h1>
      <ThemeSwitcher />
    </header>
    
    <main class="app-main">
      <!-- Your app content -->
    </main>
  </div>
</template>

<script setup>
import ThemeSwitcher from './components/ThemeSwitcher.vue'
</script>

<style>
/* Global styles using theme tokens */
body {
  background-color: var(--ck-color-background);
  color: var(--ck-color-text);
  font-family: var(--ck-font-family);
  margin: 0;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.app {
  min-height: 100vh;
}

.app-header {
  background-color: var(--ck-color-surface);
  border-bottom: 1px solid var(--ck-color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--ck-spacing-md) var(--ck-spacing-lg);
}

.app-main {
  padding: var(--ck-spacing-lg);
}
</style>
```

## Plugin Setup with Multiple Themes

```typescript
// main.ts
import { createApp } from 'vue'
import CapyKit from '@thecapylab/capykitcore'
import App from './App.vue'

const app = createApp(App)

app.use(CapyKit, {
  theme: {
    defaultTheme: 'default',
    autoDetectColorScheme: true,
    themes: [
      // CSS-based theme
      {
        name: 'ocean',
        displayName: 'Ocean Blue',
        cssUrl: '/themes/ocean.css' // Path to your CSS file
      },
      // Token-based theme
      {
        name: 'forest',
        displayName: 'Forest Green',
        light: {
          colors: {
            primary: '#065f46',
            secondary: '#047857',
            background: '#f0fdf4',
            surface: '#ffffff',
            text: '#064e3b',
            textSecondary: '#047857',
            border: '#bbf7d0',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#ef4444',
            info: '#3b82f6'
          },
          // ... other tokens
        },
        dark: {
          colors: {
            primary: '#6ee7b7',
            secondary: '#34d399',
            background: '#064e3b',
            surface: '#065f46',
            text: '#f0fdf4',
            textSecondary: '#a7f3d0',
            border: '#047857',
            success: '#10b981',
            warning: '#f59e0b',
            error: '#f87171',
            info: '#60a5fa'
          },
          // ... other tokens
        }
      }
    ]
  }
})

app.mount('#app')
```

This theming system provides:

- **Automatic CSS variable injection** for token-based themes
- **Dynamic CSS loading** for file-based themes  
- **System color scheme detection** with auto mode
- **Smooth transitions** between themes
- **Type-safe theme definitions** with full TypeScript support
- **Backward compatibility** with existing simple light/dark switching