# Select Component (v0.2.0)

New select dropdown component.

## Usage

```vue
<template>
  <CapySelect 
    v-model="selected"
    :options="options"
    placeholder="Choose option"
  />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| modelValue | any | null | Selected value |
| options | array | [] | Select options |
| placeholder | string | '' | Placeholder text |
| multiple | boolean | false | Multi-select |