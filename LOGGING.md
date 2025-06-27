# Go Pad Plugin - Logging System

## Overview

The Go Pad plugin now uses a proper logging system with configurable log levels, replacing the previous debug console.log statements.

## Log Levels

- **DEBUG (0)**: Detailed debugging information for development
- **INFO (1)**: General information about plugin operations
- **WARN (2)**: Warning messages for potential issues
- **ERROR (3)**: Error messages for failures
- **NONE (4)**: Disable all logging

## Configuration

### Development vs Production

In `src/utils/constants.ts`:
```typescript
export const LOGGING = {
    DEVELOPMENT_MODE: false,  // Set to true for development
    PREFIX: 'Go Pad',
} as const;
```

- **Development Mode**: `LogLevel.DEBUG` - Shows all messages
- **Production Mode**: `LogLevel.WARN` - Shows only warnings and errors

### Usage Examples

```typescript
import { logger } from '../utils/logger';

// General logging
logger.debug('Detailed debug information');
logger.info('General information');
logger.warn('Warning message'); 
logger.error('Error occurred');

// Specialized logging methods
logger.apiCall('Executing Go code', { codeLength: 100 });
logger.fileOperation('Reading file', '/path/to/file');
logger.widgetEvent('Widget rendered', { containerId: 'widget-1' });
logger.syncOperation('File sync started');
logger.validation('Code validation passed');
```

## Current Logging Output

### Production Mode (Default)
Only shows warnings and errors:
```
[Go Pad:WARN] Code block not found in source file
[Go Pad:ERROR] File sync failed { error: "Permission denied" }
```

### Development Mode
Shows all operations:
```
[Go Pad:INFO] Plugin loading...
[Go Pad:INFO] Creating Go widget for code block (150 characters)
[Go Pad:DEBUG] API Call: Validating Go code { codeLength: 150 }
[Go Pad:DEBUG] Validation: Code validation passed
[Go Pad:INFO] Sync: Starting source content sync
[Go Pad:DEBUG] File Operation: Reading file content { path: "note.md" }
[Go Pad:INFO] Code execution completed successfully { outputLength: 13 }
```

## Benefits

1. **Clean Console**: No more spam in production
2. **Configurable**: Easy to switch between debug and production modes
3. **Structured**: Consistent message formatting with context
4. **Categorized**: Different log types for different operations
5. **Maintainable**: Centralized logging configuration

## Enabling Debug Mode

To enable detailed logging for troubleshooting:

1. **Temporary**: Open browser console and run:
   ```javascript
   // Access the logger instance and enable debug mode
   window.logger?.enableDevelopmentMode();
   ```

2. **Permanent**: Edit `src/utils/constants.ts`:
   ```typescript
   export const LOGGING = {
       DEVELOPMENT_MODE: true,  // Change to true
       PREFIX: 'Go Pad',
   } as const;
   ```
   Then rebuild the plugin with `npm run build`.

## Log Message Categories

| Method | Level | Purpose | Example |
|--------|-------|---------|---------|
| `apiCall()` | DEBUG | Go Playground API calls | "Validating Go code" |
| `fileOperation()` | DEBUG | File system operations | "Reading file content" |
| `widgetEvent()` | DEBUG | UI widget events | "Widget rendered" |
| `syncOperation()` | INFO | File synchronization | "File sync completed" |
| `validation()` | DEBUG | Code validation results | "Code validation passed" |
| `info()` | INFO | General information | "Plugin loading..." |
| `warn()` | WARN | Potential issues | "Code block not found" |
| `error()` | ERROR | Actual errors | "Validation failed" |

This logging system provides clean output for users while maintaining detailed debugging capabilities for developers.