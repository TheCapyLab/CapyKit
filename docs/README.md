# CapyKit Documentation

This documentation site uses VitePress with automatic version management and dynamic sidebar generation.

## 🚀 Features

- **Version Switching**: Dropdown selector to switch between documentation versions
- **Dynamic Sidebar**: Automatically generates sidebar navigation based on directory structure
- **Accordion Menus**: Directories become collapsible accordion sections
- **Auto-Detection**: Automatically detects version directories and components

## 📁 Directory Structure

```
docs/
├── .vitepress/
│   ├── config.ts                 # VitePress configuration
│   ├── theme/
│   │   ├── index.ts             # Theme configuration
│   │   ├── Layout.vue           # Custom layout with version switcher
│   │   └── components/
│   │       └── VersionSwitcher.vue  # Version dropdown component
│   └── utils/
│       └── sidebar.ts           # Sidebar configuration (auto-generated)
├── build-scripts/               # Documentation build utilities
│   ├── update-versions.cjs      # Update versions and run all scripts
│   ├── generate-sidebar.cjs     # Auto-generate sidebar script
│   ├── show-structure.cjs       # Visualize documentation structure
│   └── README.md               # Build scripts documentation
├── v0.1.0/                      # Version directory
│   ├── index.md
│   ├── getting-started.md
│   ├── components.md
│   └── components/              # Component documentation
│       ├── button.md           # Direct file = sidebar link
│       ├── forms/              # Directory = accordion menu
│       │   ├── input.md
│       │   └── textarea.md
│       └── layout/
│           ├── container.md
│           └── grid.md
├── v0.2.0/                      # Another version
│   └── ... (same structure)
```

## 🔧 How It Works

### Sidebar Generation Rules

1. **Version Directories**: Any folder matching `v*.*.* pattern (e.g., v0.1.0, v1.2.3) becomes a version
2. **Component Directories**: Subfolders in `/components/` become accordion menus
3. **Markdown Files**: `.md` files become sidebar links
4. **File Names**: Converted to Title Case (e.g., `input.md` → "Input")
5. **Directory Names**: Converted to Title Case (e.g., `forms/` → "Forms")

### Generated Sidebar Structure

For each version, the sidebar includes:
- Overview (links to version index)
- Getting Started (links to getting-started.md)
- Components (links to components.md)
- Component Library (auto-generated from /components/ directory)
  - Direct .md files become links
  - Subdirectories become accordion sections with their .md files

## 🛠️ Usage

### Adding a New Version

1. **Create Version Directory**:
   ```bash
   mkdir docs/v1.0.0
   ```

2. **Add Content**:
   ```bash
   # Copy structure from existing version or create new
   cp -r docs/v0.2.0/* docs/v1.0.0/
   ```

3. **Update Configuration** (Automatic):
   ```bash
   npm run docs:update-all
   ```

### Adding New Components

1. **Add Markdown File** (becomes sidebar link):
   ```bash
   # Create docs/v1.0.0/components/new-component.md
   ```

2. **Add Component Category** (becomes accordion):
   ```bash
   mkdir docs/v1.0.0/components/data-display
   # Add .md files inside the directory
   ```

3. **Regenerate Sidebar**:
   ```bash
   npm run docs:update-sidebar
   ```

### Manual Updates

If you prefer manual control, edit these files:

1. **Version List** (`docs/.vitepress/config.ts`):
   ```typescript
   const versions = [
     { text: "v1.0.0", link: "/v1.0.0/" },
     { text: "v0.2.0", link: "/v0.2.0/" },
     // ...
   ];
   ```

2. **Version Switcher** (`docs/.vitepress/theme/components/VersionSwitcher.vue`):
   ```typescript
   const versions: Version[] = [
     { label: "v1.0.0", value: "/v1.0.0/" },
     { label: "v0.2.0", value: "/v0.2.0/" },
     // ...
   ];
   ```

3. **Sidebar** (`docs/.vitepress/utils/sidebar.ts`):
   ```typescript
   export function getSidebarConfig(): SidebarConfig {
     return {
       '/v1.0.0/': [
         // ... sidebar items
       ]
     };
   }
   ```

## 🎯 NPM Scripts

All build scripts are now available as NPM commands from the project root:

### `npm run docs:update-all`
- Scans for version directories
- Updates VitePress config
- Updates VersionSwitcher component
- Runs sidebar generation
- **Use when**: Adding new versions or doing full updates

### `npm run docs:update-sidebar`
- Scans component directories
- Generates sidebar configuration
- **Use when**: Adding/changing components within existing versions

### `npm run docs:show-structure`
- Visualizes current documentation structure
- Shows what sidebar elements will be generated
- **Use when**: Inspecting structure before/after changes

### `npm run docs:update-versions`
- Same as `docs:update-all` (full update)
- **Use when**: Adding new version directories

## 📝 Development

### Running the Development Server

```bash
cd docs
npm install
npm run dev
```

### Building for Production

```bash
cd docs
npm run build
```

## 🎨 Customization

### Styling the Version Switcher

Edit `docs/.vitepress/theme/components/VersionSwitcher.vue`:

```vue
<style scoped>
.version-select {
  /* Your custom styles */
  background: var(--vp-c-bg-alt);
  border: 2px solid var(--vp-c-brand-1);
}
</style>
```

### Customizing Sidebar Behavior

Edit `docs/generate-sidebar.cjs` to change:
- How directories are named
- Which files are included
- Accordion collapse behavior
- Sorting order

### Layout Customization

Edit `docs/.vitepress/theme/Layout.vue` to change where the version switcher appears or add other global components.

## 🔍 Example Structure

Here's what gets generated from this structure:

```
v0.2.0/
└── components/
    ├── button.md          → "Button" (link)
    ├── forms/             → "Forms" (accordion)
    │   ├── input.md       →   "Input" (link)
    │   └── select.md      →   "Select" (link)
    └── navigation/        → "Navigation" (accordion)
        └── navbar.md      →   "Navbar" (link)
```

Becomes this sidebar:

```
📖 Overview
🚀 Getting Started  
📋 Components
📚 Component Library
  🔘 Button
  📁 Forms ▼
    📄 Input
    📄 Select
  📁 Navigation ▼
    📄 Navbar
```

## 🤝 Contributing

When adding new components or versions:

1. Follow the directory structure conventions
2. Run the appropriate scripts to update configuration
3. Test that navigation works correctly
4. Ensure version switching preserves current page context

Happy documenting! 🦫