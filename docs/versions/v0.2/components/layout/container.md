# Container Component (v0.2.0)

Enhanced flexible container for layout with new responsive features.

## Usage

```vue
<template>
  <CapyContainer size="xl" responsive>
    <p>Content goes here</p>
  </CapyContainer>
</template>
```

## New Features in v0.2.0
- Responsive breakpoints
- Enhanced sizing options
- Better mobile support
- CSS Grid integration

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| fluid | boolean | false | Full width container |
| maxWidth | string | 'lg' | Maximum width |
| size | string | 'md' | Container size variant |
| responsive | boolean | true | Enable responsive behavior |