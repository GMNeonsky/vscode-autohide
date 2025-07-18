# Auto Hide Extension - Installation Guide

## Quick Setup for Sidebar and Terminal Auto-Hide

This extension will automatically hide your sidebar and terminal panel when you're not using them, and show them when you hover over their edges.

### Installation Steps

1. **Install the Extension**
   - Copy the `vscode-autohide-improved` folder to your VSCode extensions directory:
     - **Windows**: `%USERPROFILE%\.vscode\extensions\`
     - **macOS**: `~/.vscode/extensions/`
     - **Linux**: `~/.vscode/extensions/`

2. **Restart VSCode**
   - Close and reopen VSCode to load the extension

3. **Verify Installation**
   - Look for "Auto Hide" in the status bar (bottom of VSCode)
   - Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and search for "Auto Hide"

### How It Works

- **Sidebar**: Automatically hides after 1 second of inactivity
- **Terminal Panel**: Automatically hides after 1 second of inactivity
- **Hover to Show**: Move your mouse to the left edge (sidebar) or bottom edge (terminal) to show them
- **Smart Context**: Won't hide during debugging or when you have text selected

### Quick Commands

- `Ctrl+Shift+P` → "Auto Hide: Toggle Extension" - Enable/disable the extension
- `Ctrl+Shift+P` → "Auto Hide: Toggle Sidebar" - Toggle sidebar auto-hide
- `Ctrl+Shift+P` → "Auto Hide: Toggle Panel" - Toggle terminal panel auto-hide

### Configuration

The extension works out of the box, but you can customize it:

1. Open VSCode Settings (`Ctrl+,` / `Cmd+,`)
2. Search for "Auto Hide"
3. Adjust delays, enable/disable specific panels, etc.

### Troubleshooting

If the extension isn't working:
1. Check the status bar for the "Auto Hide" indicator
2. Open Developer Console (`Help` → `Toggle Developer Tools`) and look for errors
3. Try restarting VSCode
4. Ensure you have VSCode 1.85.0 or later

That's it! Your sidebar and terminal will now auto-hide and show on hover.