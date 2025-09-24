# Input Component (v0.2.0)

Enhanced input component with validation support.

## Usage

```vue
<template>
  <CapyInput 
    v-model="value" 
    placeholder="Enter text"
    :rules="[required, minLength(3)]"
  />
</template>
```

## New Features in v0.2.0
- Built-in validation
- Error states
- Help text support

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| modelValue | string | '' | Input value |
| placeholder | string | '' | Placeholder text |
| disabled | boolean | false | Disable input |
| rules | array | [] | Validation rules |
| helpText | string | '' | Help text |