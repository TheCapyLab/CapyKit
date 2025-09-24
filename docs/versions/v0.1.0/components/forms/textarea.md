# Textarea Component

A multi-line text input component.

## Usage

```vue
<template>
  <CapyTextarea v-model="content" rows="4" />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| modelValue | string | '' | Textarea value |
| rows | number | 3 | Number of rows |
| disabled | boolean | false | Disable textarea |