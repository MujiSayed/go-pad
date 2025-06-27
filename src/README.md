# Go Pad Plugin - Source Code Structure

This directory contains the organized source code for the Go Pad Obsidian plugin.

## Directory Structure

```
src/
├── main.ts                 # Plugin entry point and post-processor logic
├── components/             # UI components
│   └── GoCodeWidget.ts    # Main interactive Go code widget
├── utils/                 # Utility modules
│   ├── constants.ts       # Configuration constants and CSS classes
│   ├── go-playground.ts   # Go Playground API service
│   └── file-sync.ts       # File synchronization utilities
├── types/                 # TypeScript type definitions
│   └── index.ts          # Interface and type definitions
└── styles/               # CSS styles
    └── widget.ts         # Widget styling and injection utilities
```

## Key Components

### `main.ts`
- Main plugin class that extends Obsidian's Plugin
- Registers markdown post-processor to detect Go code blocks
- Creates and manages GoCodeWidget instances

### `components/GoCodeWidget.ts`
- Interactive widget that replaces static Go code blocks
- Handles code editing, validation, execution, and file sync
- Manages UI state and user interactions

### `utils/go-playground.ts`
- Service class for interacting with Go Playground API
- Handles code execution, validation, and response parsing
- Provides clean interface for Go-related operations

### `utils/file-sync.ts`
- Manages bidirectional synchronization between widget and source file
- Uses Obsidian's Vault API for reliable file operations
- Handles code block matching and replacement

### `utils/constants.ts`
- Centralized configuration and constants
- CSS class names, API endpoints, timing configurations
- UI messages and selectors

### `types/index.ts`
- TypeScript interfaces for type safety
- Defines shapes for API responses, sync status, and configuration

### `styles/widget.ts`
- CSS styles for the widget components
- Dynamic style injection utilities
- Theme-aware styling using Obsidian CSS variables

## Building

The project uses esbuild to bundle all source files into a single `main.js`. The entry point is configured to `src/main.ts` in `esbuild.config.mjs`.

```bash
npm run build    # Production build
npm run dev      # Development build with watch mode
```