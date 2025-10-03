# CapyKit Theming System

## Overview

CapyKit provides a powerful and extensible theming system that allows you to:

- Use built-in themes with light/dark mode support
- Create custom themes with CSS files
- Register themes programmatically with token objects
- Switch themes dynamically at runtime
- Auto-detect system color scheme preferences

## Basic Usage

### 1. Plugin Setup

```typescript
import { createApp } from 'vue'
import CapyKit from '@thecapylab/capykitcore'
import App from './App.vue'

const app = createApp(App)

// Basic setup with default theme
app.use(CapyKit, {
  theme: {
    defaultTheme: 'default',
    autoDetectColorScheme: true
  }
})

app.mount('#app')
```

### 2. Using the Theme Composable

```vue
<template>
  <div>
    <button @click="toggleColorScheme">
      Current: {{ currentColorScheme }}
    </button>
    
    <select @change="setThemeName($event.target.value)">
      <option v-for="theme in availableThemes" 
              :key="theme.name" 
              :value="theme.name">
        {{ theme.displayName }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { useTheme } from '@thecapylab/capykitcomposables'

const {
  currentColorScheme,
  currentThemeName,
  availableThemes,
  setColorScheme,
  setThemeName,
  toggleColorScheme
} = useTheme()
</script>
```

## Advanced Usage

### 1. Custom CSS Themes

Create a CSS file with your theme variables:

```css
/* my-custom-theme.css */
:root[data-theme="custom"] {
  --ck-color-primary: #your-color;
  --ck-color-background: #your-bg;
  /* ... other variables */
}

:root[data-theme="custom"][data-color-scheme="dark"] {
  --ck-color-primary: #your-dark-color;
  --ck-color-background: #your-dark-bg;
  /* ... dark mode overrides */
}
```

Register it with the plugin:

```typescript
app.use(CapyKit, {
  theme: {
    themes: [
      {
        name: 'custom',
        displayName: 'My Custom Theme',
        cssUrl: '/path/to/my-custom-theme.css'
      }
    ]
  }
})
```

### 2. Token-based Themes

Define themes using JavaScript objects:

```typescript
const myTheme = {
  name: 'corporate',
  displayName: 'Corporate Theme',
  light: {
    colors: {
      primary: '#1a365d',
      secondary: '#2d3748',
      background: '#ffffff',
      // ... other tokens
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      // ... other spacing
    },
    // ... other token categories
  },
  dark: {
    colors: {
      primary: '#63b3ed',
      secondary: '#a0aec0',
      background: '#1a202c',
      // ... other tokens
    },
    // ... other token categories
  }
}

app.use(CapyKit, {
  theme: {
    themes: [myTheme]
  }
})
```

### 3. Using Design Tokens in Components

Components can use the CSS custom properties directly:

```vue
<template>
  <div class="my-component">
    <h1>Themed Component</h1>
    <button class="primary-button">Action</button>
  </div>
</template>

<style scoped>
.my-component {
  background-color: var(--ck-color-surface);
  color: var(--ck-color-text);
  padding: var(--ck-spacing-md);
  border-radius: var(--ck-border-radius-md);
  box-shadow: var(--ck-shadow-md);
}

.primary-button {
  background-color: var(--ck-color-primary);
  color: var(--ck-color-background);
  padding: var(--ck-spacing-sm) var(--ck-spacing-md);
  border: none;
  border-radius: var(--ck-border-radius-sm);
  font-family: var(--ck-font-family);
  font-size: var(--ck-font-size-md);
  font-weight: var(--ck-font-weight-medium);
}
</style>
```

## Available Design Tokens

### Colors
- `--ck-color-primary`
- `--ck-color-secondary`
- `--ck-color-background`
- `--ck-color-surface`
- `--ck-color-text`
- `--ck-color-text-secondary`
- `--ck-color-border`
- `--ck-color-success`
- `--ck-color-warning`
- `--ck-color-error`
- `--ck-color-info`

### Spacing
- `--ck-spacing-xs` through `--ck-spacing-xxl`

### Typography
- `--ck-font-family`
- `--ck-font-size-xs` through `--ck-font-size-xxl`
- `--ck-font-weight-normal` through `--ck-font-weight-bold`

### Border Radius
- `--ck-border-radius-none` through `--ck-border-radius-full`

### Shadows
- `--ck-shadow-sm` through `--ck-shadow-xl`

## Theme System Features

- **Automatic Dark Mode**: Themes automatically respond to system color scheme preferences
- **CSS Custom Properties**: All design tokens are exposed as CSS variables
- **Dynamic Loading**: CSS theme files are loaded dynamically when needed
- **Fallback Support**: Graceful fallback if theme manager is not available
- **Type Safety**: Full TypeScript support for theme definitions
- **Performance**: Minimal runtime overhead with efficient theme switching

## Migration from Simple Themes

If you were using the basic light/dark theme switching, the new system is backward compatible:

```vue
<script setup>
// This still works exactly as before
const { currentTheme, setTheme, toggleTheme } = useTheme()
</script>
```

The enhanced API is available when you configure the plugin with theme options.