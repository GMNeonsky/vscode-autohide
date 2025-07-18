import * as vscode from 'vscode';
import {
  IAutoHideExtension,
  IConfigurationManager,
  IContextManager,
  IPanelController,
  IStatusBarManager,
  PanelType,
  ExtensionConfig,
  ContextState,
  PanelStateChangeEvent,
  COMMANDS,
} from '../types';
import { ConfigurationManager } from '../config/ConfigurationManager';
import { ContextManager } from './ContextManager';
import { StatusBarManager } from '../utils/StatusBarManager';
import {
  SidebarController,
  PanelController,
  AuxiliaryBarController,
  ReferencesController,
  CopilotChatController,
} from '../panels';

/**
 * Main extension class that coordinates all components
 */
export class AutoHideExtension implements IAutoHideExtension {
  private _configManager: IConfigurationManager;
  private _contextManager: IContextManager;
  private _statusBarManager: IStatusBarManager;
  private _panelControllers: Map<PanelType, IPanelController>;
  private _disposables: vscode.Disposable[] = [];
  private _isActivated = false;

  constructor() {
    this._configManager = new ConfigurationManager();
    this._contextManager = new ContextManager();
    this._statusBarManager = new StatusBarManager();
    this._panelControllers = new Map();

    this.initializePanelControllers();
    this.setupEventListeners();
  }

  /**
   * Configuration manager
   */
  public get configManager(): IConfigurationManager {
    return this._configManager;
  }

  /**
   * Context manager
   */
  public get contextManager(): IContextManager {
    return this._contextManager;
  }

  /**
   * Panel controllers
   */
  public get panelControllers(): Map<PanelType, IPanelController> {
    return this._panelControllers;
  }

  /**
   * Status bar manager
   */
  public get statusBarManager(): IStatusBarManager {
    return this._statusBarManager;
  }

  /**
   * Activate the extension
   */
  public async activate(context: vscode.ExtensionContext): Promise<void> {
    if (this._isActivated) {
      return;
    }

    try {
      // Register all disposables with the extension context
      context.subscriptions.push(
        this._configManager,
        this._contextManager,
        this._statusBarManager,
        ...Array.from(this._panelControllers.values()),
        ...this._disposables
      );

      // Register commands
      this.registerCommands(context);

      // Migrate old configuration if needed
      await this._configManager.migrateOldConfiguration();

      // Initialize status bar
      this.updateStatusBar();

      // Hide panels on startup if configured
      const config = this._configManager.getConfig();
      if (config.hideOnStartup) {
        await this.hideAll();
      }

      this._isActivated = true;
      console.log('Auto Hide Enhanced extension activated successfully');

    } catch (error) {
      console.error('Failed to activate Auto Hide Enhanced extension:', error);
      vscode.window.showErrorMessage(
        `Auto Hide Enhanced: Failed to activate extension. ${error}`
      );
      throw error;
    }
  }

  /**
   * Deactivate the extension
   */
  public async deactivate(): Promise<void> {
    if (!this._isActivated) {
      return;
    }

    try {
      // Show all panels before deactivating
      await this.showAll();

      // Dispose of all resources
      this._disposables.forEach(d => d.dispose());
      this._disposables = [];

      this._isActivated = false;
      console.log('Auto Hide Enhanced extension deactivated');

    } catch (error) {
      console.error('Error during extension deactivation:', error);
    }
  }

  /**
   * Hide all configured panels
   */
  public async hideAll(): Promise<void> {
    const config = this._configManager.getConfig();
    const context = this._contextManager.getContext();

    if (!config.enabled) {
      return;
    }

    const hidePromises: Promise<void>[] = [];

    for (const [panelType, controller] of this._panelControllers) {
      const panelConfig = config.panels[panelType];
      if (panelConfig.enabled && controller.canHide(context)) {
        hidePromises.push(
          controller.hideWithDelay(panelConfig.delay, context)
        );
      }
    }

    await Promise.allSettled(hidePromises);
    this.updateStatusBar();
  }

  /**
   * Show all panels
   */
  public async showAll(): Promise<void> {
    const showPromises: Promise<void>[] = [];

    for (const controller of this._panelControllers.values()) {
      if (controller.isHidden) {
        showPromises.push(controller.show());
      }
    }

    await Promise.allSettled(showPromises);
    this.updateStatusBar();
  }

  /**
   * Toggle auto-hide for a specific panel type
   */
  public async togglePanel(panelType: PanelType): Promise<void> {
    const controller = this._panelControllers.get(panelType);
    if (!controller) {
      throw new Error(`No controller found for panel type: ${panelType}`);
    }

    await controller.toggle();
    this.updateStatusBar();
  }

  /**
   * Initialize panel controllers
   */
  private initializePanelControllers(): void {
    this._panelControllers.set(PanelType.SIDEBAR, new SidebarController());
    this._panelControllers.set(PanelType.AUXILIARY_BAR, new AuxiliaryBarController());
    this._panelControllers.set(PanelType.PANEL, new PanelController());
    this._panelControllers.set(PanelType.REFERENCES, new ReferencesController());
    this._panelControllers.set(PanelType.COPILOT_CHAT, new CopilotChatController());
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Listen for configuration changes
    this._disposables.push(
      this._configManager.onConfigurationChanged((config) => {
        this.handleConfigurationChange(config);
      })
    );

    // Listen for context changes
    this._disposables.push(
      this._contextManager.onContextChanged((context) => {
        this.handleContextChange(context);
      })
    );

    // Listen for panel state changes
    for (const controller of this._panelControllers.values()) {
      if ('onStateChanged' in controller) {
        this._disposables.push(
          (controller as any).onStateChanged((event: PanelStateChangeEvent) => {
            this.handlePanelStateChange(event);
          })
        );
      }
    }
  }

  /**
   * Register extension commands
   */
  private registerCommands(context: vscode.ExtensionContext): void {
    const commands = [
      {
        command: COMMANDS.TOGGLE_SIDEBAR,
        handler: () => this.togglePanel(PanelType.SIDEBAR),
      },
      {
        command: COMMANDS.TOGGLE_AUXILIARY_BAR,
        handler: () => this.togglePanel(PanelType.AUXILIARY_BAR),
      },
      {
        command: COMMANDS.TOGGLE_PANEL,
        handler: () => this.togglePanel(PanelType.PANEL),
      },
      {
        command: COMMANDS.TOGGLE_REFERENCES,
        handler: () => this.togglePanel(PanelType.REFERENCES),
      },
      {
        command: COMMANDS.TOGGLE_COPILOT_CHAT,
        handler: () => this.togglePanel(PanelType.COPILOT_CHAT),
      },
      {
        command: COMMANDS.TOGGLE_ALL,
        handler: () => this.toggleAllPanels(),
      },
      {
        command: COMMANDS.SHOW_ALL,
        handler: () => this.showAll(),
      },
      {
        command: COMMANDS.HIDE_ALL,
        handler: () => this.hideAll(),
      },
    ];

    for (const { command, handler } of commands) {
      const disposable = vscode.commands.registerCommand(command, handler);
      context.subscriptions.push(disposable);
    }
  }

  /**
   * Toggle all panels (smart toggle based on current state)
   */
  private async toggleAllPanels(): Promise<void> {
    const hiddenCount = Array.from(this._panelControllers.values())
      .filter(controller => controller.isHidden).length;
    
    const totalEnabled = Object.values(this._configManager.getConfig().panels)
      .filter(config => config.enabled).length;

    // If more than half are hidden, show all; otherwise hide all
    if (hiddenCount > totalEnabled / 2) {
      await this.showAll();
    } else {
      await this.hideAll();
    }
  }

  /**
   * Handle configuration changes
   */
  private handleConfigurationChange(config: ExtensionConfig): void {
    this.updateStatusBar();
    
    // If extension was disabled, show all panels
    if (!config.enabled) {
      this.showAll().catch(error => {
        console.error('Failed to show all panels after disabling extension:', error);
      });
    }
  }

  /**
   * Handle context changes
   */
  private handleContextChange(_context: ContextState): void {
    // Cancel any pending hide operations if context prevents hiding
    if (this._contextManager.shouldPreventHiding()) {
      for (const controller of this._panelControllers.values()) {
        if ('cancelHide' in controller) {
          (controller as any).cancelHide();
        }
      }
    }

    this.updateStatusBar();
  }

  /**
   * Handle panel state changes
   */
  private handlePanelStateChange(event: PanelStateChangeEvent): void {
    this.updateStatusBar();
    
    // Log state change for debugging
    console.debug(`Panel ${event.panelType} ${event.isHidden ? 'hidden' : 'shown'} (${event.reason})`);
  }

  /**
   * Update the status bar display
   */
  private updateStatusBar(): void {
    const config = this._configManager.getConfig();
    const hiddenPanels = Array.from(this._panelControllers.entries())
      .filter(([, controller]) => controller.isHidden)
      .map(([panelType]) => panelType);

    this._statusBarManager.update(hiddenPanels, config);
  }

  /**
   * Get extension statistics
   */
  public getStatistics(): {
    totalPanels: number;
    enabledPanels: number;
    hiddenPanels: number;
    isExtensionEnabled: boolean;
  } {
    const config = this._configManager.getConfig();
    const totalPanels = this._panelControllers.size;
    const enabledPanels = Object.values(config.panels).filter(p => p.enabled).length;
    const hiddenPanels = Array.from(this._panelControllers.values())
      .filter(controller => controller.isHidden).length;

    return {
      totalPanels,
      enabledPanels,
      hiddenPanels,
      isExtensionEnabled: config.enabled,
    };
  }
}