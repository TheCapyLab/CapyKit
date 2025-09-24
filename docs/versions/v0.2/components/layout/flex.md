# Flex Component (v0.2.0)

New flexible layout component using CSS Flexbox.

## Usage

```vue
<template>
  <CapyFlex direction="row" justify="center" align="center" gap="4">
    <div>Item 1</div>
    <div>Item 2</div>
    <div>Item 3</div>
  </CapyFlex>
</template>
```

## Features
- Full flexbox control
- Responsive direction
- Gap support
- Alignment utilities

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| direction | string | 'row' | Flex direction |
| justify | string | 'start' | Justify content |
| align | string | 'start' | Align items |
| gap | number | 0 | Gap between items |
| wrap | boolean | false | Allow wrapping |