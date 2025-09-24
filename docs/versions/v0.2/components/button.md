# Button Component (v0.2.0)

The Button component in v0.2.0 comes with enhanced features.

## Basic Usage

```vue
<template>
  <CapyButton variant="primary">Primary Button</CapyButton>
  <CapyButton variant="secondary">Secondary Button</CapyButton>
  <CapyButton variant="outline">Outline Button</CapyButton>
</template>
```

## New Features in v0.2.0

- Added `outline` variant
- Improved focus states
- Better keyboard navigation
- Enhanced accessibility with ARIA labels

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | string | 'primary' | Button style variant |
| size | string | 'medium' | Button size |
| disabled | boolean | false | Disable the button |