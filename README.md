# Go Pad - Interactive Go Playground for Obsidian

Transform your Go code blocks into interactive mini-IDEs directly within your Obsidian notes!

## What is Go Pad?

Go Pad is an Obsidian plugin that automatically detects Go code blocks in your markdown notes and replaces them with interactive code editors. You can edit and execute Go code right within your notes using the Go Playground as the backend.

## How it Works

### Before (Static Code Block)
```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
```

### After (Interactive Widget)
The same code block becomes an interactive widget with:
- ✏️ **Editable code area** - Modify code directly in your note
- ▶️ **Run button** - Execute code with one click
- 📄 **Output display** - See results, errors, and compilation messages
- 🎨 **Theme integration** - Matches your Obsidian theme (dark/light mode)

  ![image](https://github.com/user-attachments/assets/9bb324c0-a96f-4f87-9c93-4f580649e3b3)


## Installation

1. Copy the `go-pad` folder to your Obsidian vault's `.obsidian/plugins/` directory
2. Open Obsidian Settings → Community Plugins
3. Enable "Go Pad" in your plugin list
4. Start using Go code blocks in your notes!

## Usage

Simply create a Go code block in any note:

````markdown
```go
package main

import "fmt"

func main() {
    fmt.Println("Hello from Go Pad!")
}
```
````

The plugin will automatically transform it into an interactive widget when you switch to reading mode.

### Features

- **Real-time editing**: Modify code directly in the widget
- **One-click execution**: Run button executes code via Go Playground API
- **Error handling**: Clear display of compilation errors and runtime issues
- **Output display**: Shows program output, including multiple lines
- **Network resilience**: Graceful handling of connection issues
- **Theme compatibility**: Adapts to Obsidian's light and dark themes

## Examples

### Basic Hello World
```
```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
```
```
## Requirements

- Obsidian v0.15.0 or higher
- Internet connection (for Go Playground API)

## Limitations

- Execution time is limited by Go Playground constraints (a few seconds)
- Cannot install external packages beyond Go's standard library
- Network operations are restricted by Go Playground sandbox
- File system access is not available

## Troubleshooting

**Code blocks not transforming?**
- Ensure you're using `go` as the language identifier
- Switch to reading mode to see the interactive widget(ctrl + e)
- Check that the plugin is enabled in settings
- View logs in developer console

**Run button not working?**
- Check your internet connection
- Verify the code compiles (syntax errors prevent execution)
- Try refreshing the note if the widget seems unresponsive

**Output not showing?**
- Ensure your Go code includes output statements (`fmt.Println`, etc.)
- Check for compilation errors in the output area
- Some programs may not produce visible output

## Contributing

This plugin uses:
- TypeScript for development
- Go Playground API for code execution
- Obsidian Plugin API for integration
- CSS custom properties for theming

Feel free to contribute improvements, bug fixes, or feature requests!

## License

MIT License - see the source code for details.
