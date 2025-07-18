import * as vscode from 'vscode';
import { AutoHideExtension } from '../../core/AutoHideExtension';
import { ConfigurationManager } from '../../config/ConfigurationManager';
import { ContextManager } from '../../core/ContextManager';
import { StatusBarManager } from '../../utils/StatusBarManager';
import { PanelType } from '../../types';

describe('Extension Test Suite', () => {
    let extension: AutoHideExtension;
    let configManager: ConfigurationManager;
    let contextManager: ContextManager;
    let statusBarManager: StatusBarManager;
    let mockContext: vscode.ExtensionContext;

    beforeEach(async () => {
        // Mock extension context
        mockContext = {
            subscriptions: [],
            workspaceState: {
                get: jest.fn(),
                update: jest.fn(),
                keys: jest.fn()
            },
            globalState: {
                get: jest.fn(),
                update: jest.fn(),
                keys: jest.fn(),
                setKeysForSync: jest.fn()
            },
            extensionUri: vscode.Uri.file('/test'),
            extensionPath: '/test',
            asAbsolutePath: jest.fn(),
            storageUri: vscode.Uri.file('/test/storage'),
            globalStorageUri: vscode.Uri.file('/test/global'),
            logUri: vscode.Uri.file('/test/log'),
            extensionMode: vscode.ExtensionMode.Test,
            secrets: {
                get: jest.fn(),
                store: jest.fn(),
                delete: jest.fn(),
                onDidChange: jest.fn()
            },
            environmentVariableCollection: {
                persistent: true,
                replace: jest.fn(),
                append: jest.fn(),
                prepend: jest.fn(),
                get: jest.fn(),
                forEach: jest.fn(),
                delete: jest.fn(),
                clear: jest.fn()
            }
        } as any;

        // Initialize test components
        configManager = new ConfigurationManager();
        contextManager = new ContextManager();
        statusBarManager = new StatusBarManager();
        extension = new AutoHideExtension();
    });

    afterEach(async () => {
        // Clean up after each test
        if (extension) {
            await extension.deactivate();
        }
    });

    test('Extension should activate successfully', async () => {
        await extension.activate(mockContext);
        expect(extension).toBeDefined();
    });

    test('Configuration manager should load default settings', () => {
        const config = configManager.getConfig();
        expect(config.enabled).toBe(true);
        expect(config.statusBar.enabled).toBe(true);
    });

    test('Context manager should detect debug sessions', () => {
        const contextState = contextManager.getContext();
        expect(typeof contextState.isDebugging).toBe('boolean');
    });

    test('Panel controllers should be initialized', async () => {
        await extension.activate(mockContext);
        const controllers = extension.panelControllers;
        expect(controllers.get(PanelType.SIDEBAR)).toBeDefined();
        expect(controllers.get(PanelType.PANEL)).toBeDefined();
        expect(controllers.get(PanelType.AUXILIARY_BAR)).toBeDefined();
        expect(controllers.get(PanelType.REFERENCES)).toBeDefined();
        expect(controllers.get(PanelType.COPILOT_CHAT)).toBeDefined();
    });

    test('Commands should be registered', async () => {
        await extension.activate(mockContext);
        
        // Check that subscriptions were added (commands registered)
        expect(mockContext.subscriptions.length).toBeGreaterThan(0);
    });

    test('Status bar should be initialized', async () => {
        await extension.activate(mockContext);
        const statusBar = statusBarManager.getStatusBarItem();
        expect(statusBar).toBeDefined();
    });
});