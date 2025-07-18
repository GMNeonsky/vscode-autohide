# Migration Guide - Auto Hide Extension v2.0

## 🔄 Upgrading from Original Extension

### What's Changed

#### Configuration Settings
The new extension uses a more organized configuration structure:

**Old Settings (v1.x)**:
```json
{
  "autoHide.autoHidePanel": true,
  "autoHide.autoHideSideBar": true,
  "autoHide.delay": 1000
}
```

**New Settings (v2.0)**:
```json
{
  "autoHide.enabled": true,
  "autoHide.sidebar.enabled": true,
  "autoHide.sidebar.delay": 1000,
  "autoHide.panel.enabled": true,
  "autoHide.panel.delay": 1000,
  "autoHide.showOnHover": true,
  "autoHide.hoverDelay": 300
}
```

#### Automatic Migration
The extension automatically migrates your old settings:
- `autoHide.autoHideSideBar` → `autoHide.sidebar.enabled`
- `autoHide.autoHidePanel` → `autoHide.panel.enabled`
- `autoHide.delay` → `autoHide.sidebar.delay` and `autoHide.panel.delay`

### New Features Available

#### Enhanced Panel Support
- **Auxiliary Bar**: Right sidebar support (new in VSCode)
- **References Panel**: Auto-hide for Go to References
- **Copilot Chat**: Smart GitHub Copilot Chat integration

#### Smart Context Awareness
- **Debug Sessions**: Won't hide during debugging
- **Text Selection**: Keeps panels visible when text is selected
- **Activity Detection**: Smarter hiding based on current activity

#### Improved User Experience
- **Status Bar Integration**: Visual indicator and quick controls
- **Hover to Show**: Mouse over edges to reveal panels
- **Better Performance**: Optimized event handling and resource usage

## 📦 Installation Process

### Step 1: Remove Old Extension
1. Open VSCode Extensions panel (`Ctrl+Shift+X`)
2. Search for "Auto Hide" or "vscode-autohide"
3. Click "Uninstall" on the old extension
4. Restart VSCode

### Step 2: Install New Extension
1. Copy the `vscode-autohide-improved` folder to your extensions directory:
   - **Windows**: `%USERPROFILE%\.vscode\extensions\`
   - **macOS**: `~/.vscode/extensions/`
   - **Linux**: `~/.vscode/extensions/`
2. Restart VSCode
3. Verify installation by looking for "Auto Hide" in the status bar

### Step 3: Configuration Migration
Your old settings will be automatically migrated, but you can customize:

1. Open Settings (`Ctrl+,` / `Cmd+,`)
2. Search for "Auto Hide"
3. Configure new features like hover delay, context awareness, etc.

## ⚙️ Configuration Comparison

### Basic Settings Migration

| Old Setting | New Setting | Notes |
|-------------|-------------|-------|
| `autoHide.autoHideSideBar` | `autoHide.sidebar.enabled` | Same functionality |
| `autoHide.autoHidePanel` | `autoHide.panel.enabled` | Same functionality |
| `autoHide.delay` | `autoHide.sidebar.delay` | Applied to sidebar |
| `autoHide.delay` | `autoHide.panel.delay` | Applied to panel |

### New Settings Available

| Setting | Default | Description |
|---------|---------|-------------|
| `autoHide.enabled` | `true` | Master enable/disable |
| `autoHide.showOnHover` | `true` | Show panels on mouse hover |
| `autoHide.hoverDelay` | `300` | Delay before showing on hover (ms) |
| `autoHide.contextAware` | `true` | Smart context detection |
| `autoHide.auxiliaryBar.enabled` | `false` | Auto-hide auxiliary bar |
| `autoHide.references.enabled` | `false` | Auto-hide references panel |
| `autoHide.copilotChat.enabled` | `false` | Auto-hide Copilot Chat |

## 🚀 New Commands Available

### Command Palette Commands
- `Auto Hide: Toggle Extension` - Master toggle
- `Auto Hide: Toggle Sidebar` - Toggle sidebar auto-hide
- `Auto Hide: Toggle Panel` - Toggle panel auto-hide
- `Auto Hide: Toggle Auxiliary Bar` - Toggle auxiliary bar
- `Auto Hide: Show All Panels` - Temporarily show all panels
- `Auto Hide: Reset Configuration` - Reset to defaults

### Keyboard Shortcuts
- `Ctrl+Shift+H` / `Cmd+Shift+H` - Toggle extension
- `Ctrl+Alt+S` / `Cmd+Alt+S` - Toggle sidebar
- `Ctrl+Alt+P` / `Cmd+Alt+P` - Toggle panel

## 🔧 Troubleshooting Migration Issues

### Settings Not Migrating
If your old settings aren't automatically migrated:

1. Check your old settings in VSCode Settings
2. Manually configure the new equivalent settings
3. Use "Auto Hide: Reset Configuration" to start fresh

### Extension Not Working
If the extension isn't functioning after installation:

1. Check VSCode version (requires 1.85.0+)
2. Look for "Auto Hide" in the status bar
3. Open Developer Console (`Help` → `Toggle Developer Tools`)
4. Check for error messages in the console
5. Try restarting VSCode

### Performance Issues
If you experience performance problems:

1. Disable context awareness: `"autoHide.contextAware": false`
2. Increase delays: Set higher values for `*.delay` settings
3. Disable unused panels: Set `*.enabled: false` for panels you don't need

## 📋 Feature Comparison

### What's the Same
- ✅ Sidebar auto-hide functionality
- ✅ Panel (terminal) auto-hide functionality
- ✅ Configurable delays
- ✅ Basic show/hide behavior

### What's Improved
- ✅ Better performance and reliability
- ✅ Modern TypeScript codebase
- ✅ Comprehensive error handling
- ✅ Status bar integration
- ✅ Hover-to-show functionality

### What's New
- 🆕 Auxiliary bar support
- 🆕 References panel support
- 🆕 Copilot Chat integration
- 🆕 Smart context awareness
- 🆕 Debug session detection
- 🆕 Text selection awareness
- 🆕 Keyboard shortcuts
- 🆕 Command palette integration

## 🆘 Getting Help

### Common Issues
1. **Extension not loading**: Check VSCode version compatibility
2. **Settings not working**: Verify JSON syntax in settings.json
3. **Panels not hiding**: Check if context awareness is preventing hiding
4. **Performance problems**: Adjust delays or disable unused features

### Support Resources
- Check the README.md for detailed configuration
- Review FEATURES.md for complete feature list
- Use VSCode Developer Console for debugging
- Reset configuration if issues persist

### Reporting Issues
If you encounter problems:
1. Note your VSCode version
2. Check Developer Console for errors
3. Try with default settings
4. Document steps to reproduce the issue

## 🎯 Recommended Configuration

### For New Users
```json
{
  "autoHide.enabled": true,
  "autoHide.sidebar.enabled": true,
  "autoHide.sidebar.delay": 1000,
  "autoHide.panel.enabled": true,
  "autoHide.panel.delay": 1000,
  "autoHide.showOnHover": true,
  "autoHide.hoverDelay": 300,
  "autoHide.contextAware": true
}
```

### For Power Users
```json
{
  "autoHide.enabled": true,
  "autoHide.sidebar.enabled": true,
  "autoHide.sidebar.delay": 500,
  "autoHide.panel.enabled": true,
  "autoHide.panel.delay": 800,
  "autoHide.auxiliaryBar.enabled": true,
  "autoHide.auxiliaryBar.delay": 1000,
  "autoHide.showOnHover": true,
  "autoHide.hoverDelay": 200,
  "autoHide.contextAware": true,
  "autoHide.hideOnStartup": false
}
```

Welcome to Auto Hide v2.0! 🎉