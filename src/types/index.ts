import * as vscode from 'vscode';

/**
 * Supported panel types that can be auto-hidden
 */
export enum PanelType {
  SIDEBAR = 'sidebar',
  AUXILIARY_BAR = 'auxiliaryBar',
  PANEL = 'panel',
  REFERENCES = 'references',
  COPILOT_CHAT = 'copilotChat',
}

/**
 * Context information about the current state
 */
export interface ContextState {
  /** Whether a debug session is currently active */
  isDebugging: boolean;
  /** Whether the user is actively selecting text */
  isSelectingText: boolean;
  /** Whether Copilot Chat is currently active */
  isCopilotChatActive: boolean;
  /** The URI scheme of the active editor */
  activeEditorScheme: string | null;
  /** Timestamp of the last user activity */
  lastUserActivity: number;
  /** Whether the user is currently in a text editor */
  isInTextEditor: boolean;
}

/**
 * Configuration for a specific panel type
 */
export interface PanelConfig {
  /** Whether auto-hide is enabled for this panel */
  enabled: boolean;
  /** Delay in milliseconds before hiding the panel */
  delay: number;
}

/**
 * Complete extension configuration
 */
export interface ExtensionConfig {
  /** Global extension enabled state */
  enabled: boolean;
  /** Panel-specific configurations */
  panels: Record<PanelType, PanelConfig>;
  /** Smart behavior settings */
  smart: {
    /** Don't auto-hide during debug sessions */
    respectDebugSessions: boolean;
    /** Don't auto-hide when selecting text */
    respectTextSelection: boolean;
    /** URI schemes where auto-hide should be disabled */
    excludedSchemes: string[];
  };
  /** Hide panels on VSCode startup */
  hideOnStartup: boolean;
  /** Status bar configuration */
  statusBar: {
    /** Show status bar indicator */
    enabled: boolean;
    /** Show count of hidden panels */
    showCounts: boolean;
  };
}

/**
 * Event data for panel state changes
 */
export interface PanelStateChangeEvent {
  /** The panel that changed state */
  panelType: PanelType;
  /** Whether the panel is now hidden */
  isHidden: boolean;
  /** Timestamp of the change */
  timestamp: number;
  /** Reason for the change */
  reason: 'user_action' | 'auto_hide' | 'startup' | 'command';
}

/**
 * Interface for panel controllers
 */
export interface IPanelController {
  /** The type of panel this controller manages */
  readonly panelType: PanelType;
  /** Whether the panel is currently hidden */
  readonly isHidden: boolean;
  /** Hide the panel */
  hide(): Promise<void>;
  /** Show the panel */
  show(): Promise<void>;
  /** Toggle the panel visibility */
  toggle(): Promise<void>;
  /** Hide the panel with a delay */
  hideWithDelay(delayMs: number, context: ContextState): Promise<void>;
  /** Cancel any pending hide operation */
  cancelHide(): void;
  /** Check if the panel can be hidden in the current context */
  canHide(context: ContextState): boolean;
  /** Dispose of resources */
  dispose(): void;
}

/**
 * Interface for the configuration manager
 */
export interface IConfigurationManager {
  /** Get the current configuration */
  getConfig(): ExtensionConfig;
  /** Update a configuration value */
  updateConfig<K extends keyof ExtensionConfig>(
    key: K,
    value: ExtensionConfig[K],
    target?: vscode.ConfigurationTarget
  ): Promise<void>;
  /** Migrate old configuration format to new format */
  migrateOldConfiguration(): Promise<void>;
  /** Listen for configuration changes */
  onConfigurationChanged: vscode.Event<ExtensionConfig>;
  /** Dispose of resources */
  dispose(): void;
}

/**
 * Interface for the context manager
 */
export interface IContextManager {
  /** Get the current context state */
  getContext(): ContextState;
  /** Check if hiding should be prevented based on current context */
  shouldPreventHiding(): boolean;
  /** Listen for context changes */
  onContextChanged: vscode.Event<ContextState>;
  /** Update user activity timestamp */
  updateActivity(): void;
  /** Dispose of resources */
  dispose(): void;
}

/**
 * Interface for the status bar manager
 */
export interface IStatusBarManager {
  /** Update the status bar display */
  update(hiddenPanels: PanelType[], config: ExtensionConfig): void;
  /** Show the status bar item */
  show(): void;
  /** Hide the status bar item */
  hide(): void;
  /** Dispose of resources */
  dispose(): void;
}

/**
 * Main extension interface
 */
export interface IAutoHideExtension {
  /** Configuration manager */
  readonly configManager: IConfigurationManager;
  /** Context manager */
  readonly contextManager: IContextManager;
  /** Panel controllers */
  readonly panelControllers: Map<PanelType, IPanelController>;
  /** Status bar manager */
  readonly statusBarManager: IStatusBarManager;
  /** Hide all configured panels */
  hideAll(): Promise<void>;
  /** Show all panels */
  showAll(): Promise<void>;
  /** Toggle auto-hide for a specific panel type */
  togglePanel(panelType: PanelType): Promise<void>;
  /** Activate the extension */
  activate(context: vscode.ExtensionContext): Promise<void>;
  /** Deactivate the extension */
  deactivate(): Promise<void>;
}

/**
 * Utility type for configuration keys
 */
export type ConfigurationKey = keyof ExtensionConfig | `panels.${PanelType}.enabled` | `panels.${PanelType}.delay`;

/**
 * Command identifiers used by the extension
 */
export const COMMANDS = {
  TOGGLE_SIDEBAR: 'autoHideEnhanced.toggle.sidebar',
  TOGGLE_AUXILIARY_BAR: 'autoHideEnhanced.toggle.auxiliaryBar',
  TOGGLE_PANEL: 'autoHideEnhanced.toggle.panel',
  TOGGLE_REFERENCES: 'autoHideEnhanced.toggle.references',
  TOGGLE_COPILOT_CHAT: 'autoHideEnhanced.toggle.copilotChat',
  TOGGLE_ALL: 'autoHideEnhanced.toggle.all',
  SHOW_ALL: 'autoHideEnhanced.show.all',
  HIDE_ALL: 'autoHideEnhanced.hide.all',
} as const;

/**
 * VSCode commands used for panel management
 */
export const VSCODE_COMMANDS = {
  CLOSE_SIDEBAR: 'workbench.action.closeSidebar',
  CLOSE_AUXILIARY_BAR: 'workbench.action.closeAuxiliaryBar',
  CLOSE_PANEL: 'workbench.action.closePanel',
  CLOSE_REFERENCE_SEARCH: 'closeReferenceSearch',
  TOGGLE_SIDEBAR: 'workbench.action.toggleSidebarVisibility',
  TOGGLE_AUXILIARY_BAR: 'workbench.action.toggleAuxiliaryBar',
  TOGGLE_PANEL: 'workbench.action.togglePanel',
} as const;

/**
 * Configuration section name
 */
export const CONFIG_SECTION = 'autoHideEnhanced';

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: ExtensionConfig = {
  enabled: true,
  panels: {
    [PanelType.SIDEBAR]: { enabled: true, delay: 450 },
    [PanelType.AUXILIARY_BAR]: { enabled: true, delay: 450 },
    [PanelType.PANEL]: { enabled: true, delay: 300 },
    [PanelType.REFERENCES]: { enabled: true, delay: 0 },
    [PanelType.COPILOT_CHAT]: { enabled: false, delay: 500 },
  },
  smart: {
    respectDebugSessions: true,
    respectTextSelection: true,
    excludedSchemes: ['output', 'debug', 'search-result'],
  },
  hideOnStartup: false,
  statusBar: {
    enabled: true,
    showCounts: true,
  },
};