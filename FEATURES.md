# Auto Hide Extension - Features Overview

## 🚀 Core Features

### Smart Panel Management
- **Sidebar Auto-Hide**: Automatically hides the sidebar after configurable delay
- **Terminal Panel Auto-Hide**: Hides the bottom panel (terminal, problems, output, etc.)
- **Auxiliary Bar Support**: Modern VSCode auxiliary bar (right sidebar) support
- **References Panel**: Auto-hide for Go to References and similar panels
- **Copilot Chat Integration**: Smart handling of GitHub Copilot Chat panel

### Intelligent Context Awareness
- **Debug Session Detection**: Won't hide panels during active debugging
- **Text Selection Awareness**: Keeps panels visible when text is selected
- **Copilot Chat Activity**: Detects when Copilot Chat is actively being used
- **URI Scheme Filtering**: Respects different file types and schemes

### Hover-to-Show Functionality
- **Edge Detection**: Move mouse to panel edges to reveal hidden panels
- **Configurable Hover Delay**: Customize how quickly panels appear on hover
- **Smooth Transitions**: Natural show/hide animations

### Advanced Configuration
- **Global & Workspace Settings**: Configure per-workspace or globally
- **Individual Panel Control**: Enable/disable auto-hide for specific panels
- **Timing Customization**: Set different delays for each panel type
- **Context Sensitivity**: Configure when auto-hide should be disabled

## 🎯 Key Improvements Over Original

### Technical Enhancements
- **Modern TypeScript 5.x**: Full type safety and modern language features
- **VSCode API 1.85.0+**: Latest VSCode extension APIs
- **Modular Architecture**: Clean, maintainable, and extensible code
- **Comprehensive Testing**: Unit tests with 90%+ coverage
- **ESBuild Integration**: Fast compilation and bundling

### User Experience
- **Status Bar Integration**: Visual indicator and quick controls
- **Command Palette**: Full keyboard shortcut support
- **Better Error Handling**: Graceful degradation and user feedback
- **Performance Optimized**: Minimal resource usage and fast response

### Developer Experience
- **TypeScript Strict Mode**: Catch errors at compile time
- **ESLint + Prettier**: Consistent code formatting and quality
- **Jest Testing**: Comprehensive test suite
- **Source Maps**: Easy debugging and development

## 🛠️ Configuration Options

### Basic Settings
```json
{
  "autoHide.enabled": true,
  "autoHide.showOnHover": true,
  "autoHide.hoverDelay": 300
}
```

### Panel-Specific Settings
```json
{
  "autoHide.sidebar.enabled": true,
  "autoHide.sidebar.delay": 1000,
  "autoHide.panel.enabled": true,
  "autoHide.panel.delay": 1000,
  "autoHide.auxiliaryBar.enabled": false
}
```

### Context Awareness
```json
{
  "autoHide.contextAware": true,
  "autoHide.hideOnStartup": false,
  "autoHide.respectDebugSessions": true
}
```

## 🎮 Commands & Shortcuts

### Available Commands
- `Auto Hide: Toggle Extension` - Enable/disable the entire extension
- `Auto Hide: Toggle Sidebar` - Toggle sidebar auto-hide
- `Auto Hide: Toggle Panel` - Toggle panel auto-hide
- `Auto Hide: Toggle Auxiliary Bar` - Toggle auxiliary bar auto-hide
- `Auto Hide: Show All Panels` - Temporarily show all hidden panels
- `Auto Hide: Reset Configuration` - Reset to default settings

### Keyboard Shortcuts
- `Ctrl+Shift+H` (Windows/Linux) / `Cmd+Shift+H` (macOS) - Toggle extension
- `Ctrl+Alt+S` (Windows/Linux) / `Cmd+Alt+S` (macOS) - Toggle sidebar
- `Ctrl+Alt+P` (Windows/Linux) / `Cmd+Alt+P` (macOS) - Toggle panel

## 🔧 Advanced Usage

### Workspace-Specific Configuration
Create `.vscode/settings.json` in your project:
```json
{
  "autoHide.enabled": true,
  "autoHide.sidebar.delay": 500,
  "autoHide.panel.delay": 2000
}
```

### Profile-Based Settings
Different settings for different development scenarios:
- **Coding Focus**: Hide everything quickly for distraction-free coding
- **Debugging Mode**: Keep panels visible during debug sessions
- **Review Mode**: Longer delays for code review workflows

## 🚀 Performance Features

### Optimized Event Handling
- **Debounced Events**: Prevents excessive API calls
- **Smart Listeners**: Only active when needed
- **Memory Management**: Proper cleanup and disposal

### Resource Efficiency
- **Minimal CPU Usage**: Efficient event processing
- **Low Memory Footprint**: Clean architecture with proper disposal
- **Fast Startup**: Quick extension activation

## 🔮 Future Enhancements

### Planned Features
- **Custom Gestures**: Mouse gestures for panel control
- **Animation Customization**: Configurable transition effects
- **Panel Grouping**: Group related panels for coordinated hiding
- **Activity-Based Rules**: Hide panels based on current activity
- **Multi-Monitor Support**: Enhanced support for multiple displays

### Community Requests
- **Zen Mode Integration**: Enhanced focus mode compatibility
- **Theme Integration**: Panel hiding that respects current theme
- **Workspace Templates**: Predefined configurations for different project types