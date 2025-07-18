# Auto Hide Enhanced

A comprehensive VSCode extension that intelligently manages panel visibility with modern architecture and enhanced features.

## 🚀 Features

### Core Functionality
- **Smart Panel Management**: Automatically hide/show sidebar, panel, auxiliary bar, references, and Copilot Chat
- **Context Awareness**: Prevents hiding during debug sessions, text selection, and active Copilot Chat
- **Configurable Delays**: Customizable hide delays for each panel type
- **Status Bar Integration**: Visual indicators and quick toggle controls

### Enhanced Panels Support
- **Sidebar**: Primary sidebar with explorer, search, etc.
- **Panel**: Bottom panel with terminal, problems, output
- **Auxiliary Bar**: Secondary sidebar (right side)
- **References**: References panel for code navigation
- **Copilot Chat**: GitHub Copilot Chat integration

### Smart Context Detection
- **Debug Session Awareness**: Prevents hiding during active debugging
- **Text Selection Detection**: Keeps panels visible when text is selected
- **Copilot Chat Activity**: Detects and respects active Copilot Chat sessions
- **URI Scheme Filtering**: Handles different file types appropriately

### Configuration Options
- **Global & Workspace Settings**: Configure per workspace or globally
- **Per-Panel Configuration**: Individual settings for each panel type
- **Migration Support**: Automatic migration from older extension versions
- **Real-time Updates**: Configuration changes apply immediately

## 📦 Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Auto Hide Enhanced"
4. Click Install

### From VSIX Package
1. Download the latest `.vsix` file from releases
2. Open VS Code
3. Run `Extensions: Install from VSIX...` command
4. Select the downloaded file

## ⚙️ Configuration

### Basic Settings

```json
{
  "autoHideEnhanced.enabled": true,
  "autoHideEnhanced.statusBar.enabled": true,
  "autoHideEnhanced.statusBar.showCounts": true
}
```

### Panel-Specific Configuration

```json
{
  "autoHideEnhanced.panels.sidebar": {
    "enabled": true,
    "hideDelay": 2000,
    "showOnHover": true
  },
  "autoHideEnhanced.panels.panel": {
    "enabled": true,
    "hideDelay": 3000,
    "showOnHover": false
  },
  "autoHideEnhanced.panels.auxiliaryBar": {
    "enabled": true,
    "hideDelay": 2000,
    "showOnHover": true
  }
}
```

### Context Settings

```json
{
  "autoHideEnhanced.context.preventHidingDuringDebug": true,
  "autoHideEnhanced.context.preventHidingWithSelection": true,
  "autoHideEnhanced.context.preventHidingWithCopilotChat": true
}
```

## 🎮 Commands

| Command | Description | Keybinding |
|---------|-------------|------------|
| `autoHideEnhanced.toggle.sidebar` | Toggle sidebar visibility | `Ctrl+Shift+E` |
| `autoHideEnhanced.toggle.panel` | Toggle panel visibility | `Ctrl+Shift+U` |
| `autoHideEnhanced.toggle.auxiliaryBar` | Toggle auxiliary bar | `Ctrl+Shift+B` |
| `autoHideEnhanced.toggle.references` | Toggle references panel | `Ctrl+Shift+R` |
| `autoHideEnhanced.toggle.copilotChat` | Toggle Copilot Chat | `Ctrl+Shift+I` |
| `autoHideEnhanced.toggle.all` | Smart toggle all panels | `Ctrl+Shift+H` |
| `autoHideEnhanced.show.all` | Show all panels | - |
| `autoHideEnhanced.hide.all` | Hide all panels | - |

## 🔧 Advanced Features

### Migration from Original Extension
The extension automatically detects and migrates settings from the original "Auto Hide" extension, ensuring a seamless upgrade experience.

### TypeScript 5.x Architecture
Built with modern TypeScript 5.x features including:
- Strict type checking
- Advanced generics
- Comprehensive interfaces
- Dependency injection patterns

### Event-Driven Architecture
- Reactive configuration updates
- Panel state change events
- Context change notifications
- Proper resource disposal

### Testing & Quality
- Comprehensive unit tests with Jest
- ESLint + Prettier code quality
- TypeScript strict mode
- Modern build system with ESBuild

## 🐛 Troubleshooting

### Extension Not Working
1. Check if the extension is enabled in settings
2. Verify VSCode version compatibility (1.85.0+)
3. Restart VSCode after configuration changes

### Panels Not Hiding
1. Check context settings (debug, selection, Copilot Chat)
2. Verify panel-specific configuration
3. Check status bar for current state

### Performance Issues
1. Adjust hide delays in configuration
2. Disable unused panel types
3. Check for conflicting extensions

## 📝 Changelog

### Version 2.0.0
- Complete rewrite with TypeScript 5.x
- Added Copilot Chat support
- Enhanced context awareness
- Improved configuration system
- Modern VSCode API integration
- Comprehensive testing suite

### Migration from 1.x
- Automatic settings migration
- Backward compatibility
- Enhanced feature set
- Improved performance

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run `npm run lint` and `npm test`
6. Submit a pull request

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-username/vscode-autohide-enhanced.git

# Install dependencies
npm install

# Build the extension
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original Auto Hide extension by sirmspencer
- VSCode Extension API documentation
- TypeScript and ESBuild communities

## 📞 Support

- [GitHub Issues](https://github.com/your-username/vscode-autohide-enhanced/issues)
- [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=your-publisher.vscode-autohide-enhanced)
- [Documentation](https://github.com/your-username/vscode-autohide-enhanced/wiki)
