// Jest setup file for VSCode extension testing

// Comprehensive VSCode API mock
const vscode = {
    ExtensionContext: jest.fn(),
    ExtensionMode: {
        Test: 3,
        Development: 2,
        Production: 1
    },
    Uri: {
        file: jest.fn((path: string) => ({ fsPath: path, path })),
        parse: jest.fn()
    },
    workspace: {
        getConfiguration: jest.fn(() => ({
            get: jest.fn((key: string, defaultValue?: any) => defaultValue),
            update: jest.fn(),
            has: jest.fn(() => true),
            inspect: jest.fn()
        })),
        onDidChangeConfiguration: jest.fn(() => ({ dispose: jest.fn() })),
        onDidChangeTextDocument: jest.fn(() => ({ dispose: jest.fn() })),
        workspaceFolders: []
    },
    window: {
        createStatusBarItem: jest.fn(() => ({
            text: '',
            tooltip: '',
            command: '',
            show: jest.fn(),
            hide: jest.fn(),
            dispose: jest.fn()
        })),
        showInformationMessage: jest.fn(),
        showErrorMessage: jest.fn(),
        showWarningMessage: jest.fn(),
        onDidChangeTextEditorSelection: jest.fn(() => ({ dispose: jest.fn() })),
        onDidChangeActiveTextEditor: jest.fn(() => ({ dispose: jest.fn() })),
        onDidChangeWindowState: jest.fn(() => ({ dispose: jest.fn() })),
        onDidChangeActiveTerminal: jest.fn(() => ({ dispose: jest.fn() })),
        activeTextEditor: undefined
    },
    commands: {
        registerCommand: jest.fn(() => ({ dispose: jest.fn() })),
        executeCommand: jest.fn(),
        getCommands: jest.fn(() => Promise.resolve([
            'autoHideEnhanced.toggle.sidebar',
            'autoHideEnhanced.toggle.panel',
            'autoHideEnhanced.toggle.auxiliaryBar',
            'autoHideEnhanced.toggle.references',
            'autoHideEnhanced.toggle.copilotChat',
            'autoHideEnhanced.toggle.all',
            'autoHideEnhanced.show.all',
            'autoHideEnhanced.hide.all'
        ]))
    },
    debug: {
        activeDebugSession: undefined,
        onDidStartDebugSession: jest.fn(() => ({ dispose: jest.fn() })),
        onDidTerminateDebugSession: jest.fn(() => ({ dispose: jest.fn() }))
    },
    StatusBarAlignment: {
        Left: 1,
        Right: 2
    },
    Disposable: {
        from: jest.fn(() => ({ dispose: jest.fn() }))
    },
    EventEmitter: jest.fn(() => ({
        event: jest.fn(),
        fire: jest.fn(),
        dispose: jest.fn()
    }))
};

// Mock the vscode module
jest.mock('vscode', () => vscode, { virtual: true });

// Global test setup
beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset workspace configuration mock
    vscode.workspace.getConfiguration.mockReturnValue({
        get: jest.fn((key: string, defaultValue?: any) => {
            // Return default configuration values for testing
            const config: any = {
                'autoHideEnhanced.enabled': true,
                'autoHideEnhanced.statusBar.enabled': true,
                'autoHideEnhanced.statusBar.showCounts': true,
                'autoHideEnhanced.panels.sidebar.enabled': true,
                'autoHideEnhanced.panels.sidebar.hideDelay': 2000,
                'autoHideEnhanced.panels.panel.enabled': true,
                'autoHideEnhanced.panels.panel.hideDelay': 3000,
                'autoHideEnhanced.panels.auxiliaryBar.enabled': true,
                'autoHideEnhanced.panels.auxiliaryBar.hideDelay': 2000,
                'autoHideEnhanced.panels.references.enabled': true,
                'autoHideEnhanced.panels.references.hideDelay': 2000,
                'autoHideEnhanced.panels.copilotChat.enabled': true,
                'autoHideEnhanced.panels.copilotChat.hideDelay': 2000,
                'autoHideEnhanced.context.preventHidingDuringDebug': true,
                'autoHideEnhanced.context.preventHidingWithSelection': true,
                'autoHideEnhanced.context.preventHidingWithCopilotChat': true
            };
            return config[key] !== undefined ? config[key] : defaultValue;
        }),
        update: jest.fn(),
        has: jest.fn(() => true),
        inspect: jest.fn()
    });
});