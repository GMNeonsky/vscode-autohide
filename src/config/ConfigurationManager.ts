import * as vscode from 'vscode';
import {
  ExtensionConfig,
  IConfigurationManager,
  PanelType,
  CONFIG_SECTION,
  DEFAULT_CONFIG,
} from '../types';

/**
 * Manages extension configuration with support for global and workspace settings
 */
export class ConfigurationManager implements IConfigurationManager {
  private readonly _onConfigurationChanged = new vscode.EventEmitter<ExtensionConfig>();
  public readonly onConfigurationChanged = this._onConfigurationChanged.event;

  private _disposables: vscode.Disposable[] = [];
  private _currentConfig: ExtensionConfig;

  constructor() {
    this._currentConfig = this.loadConfiguration();
    
    // Listen for configuration changes
    this._disposables.push(
      vscode.workspace.onDidChangeConfiguration(this.handleConfigurationChange.bind(this))
    );
  }

  /**
   * Get the current merged configuration
   */
  public getConfig(): ExtensionConfig {
    return { ...this._currentConfig };
  }

  /**
   * Update a configuration value
   */
  public async updateConfig<K extends keyof ExtensionConfig>(
    key: K,
    value: ExtensionConfig[K],
    target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Workspace
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    
    try {
      await config.update(key, value, target);
      // Configuration will be reloaded via the change event
    } catch (error) {
      console.error(`Failed to update configuration ${String(key)}:`, error);
      throw error;
    }
  }

  /**
   * Update panel-specific configuration
   */
  public async updatePanelConfig(
    panelType: PanelType,
    property: 'enabled' | 'delay',
    value: boolean | number,
    target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Workspace
  ): Promise<void> {
    const configKey = `${panelType}.${property}`;
    await this.updateConfig(configKey as keyof ExtensionConfig, value as any, target);
  }

  /**
   * Toggle a panel's enabled state
   */
  public async togglePanelEnabled(
    panelType: PanelType,
    target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Workspace
  ): Promise<void> {
    const currentValue = this._currentConfig.panels[panelType].enabled;
    await this.updatePanelConfig(panelType, 'enabled', !currentValue, target);
  }

  /**
   * Reset configuration to defaults
   */
  public async resetToDefaults(
    target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Workspace
  ): Promise<void> {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    
    // Reset all configuration keys
    const keys = Object.keys(DEFAULT_CONFIG) as (keyof ExtensionConfig)[];
    for (const key of keys) {
      await config.update(key, undefined, target);
    }
  }

  /**
   * Get configuration for a specific panel type
   */
  public getPanelConfig(panelType: PanelType): { enabled: boolean; delay: number } {
    return { ...this._currentConfig.panels[panelType] };
  }

  /**
   * Check if the extension is globally enabled
   */
  public isEnabled(): boolean {
    return this._currentConfig.enabled;
  }

  /**
   * Check if a specific panel type is enabled
   */
  public isPanelEnabled(panelType: PanelType): boolean {
    return this._currentConfig.enabled && this._currentConfig.panels[panelType].enabled;
  }

  /**
   * Get the delay for a specific panel type
   */
  public getPanelDelay(panelType: PanelType): number {
    return this._currentConfig.panels[panelType].delay;
  }

  /**
   * Check if a URI scheme should be excluded from auto-hide
   */
  public isSchemeExcluded(scheme: string): boolean {
    return this._currentConfig.smart.excludedSchemes.includes(scheme);
  }

  /**
   * Dispose of resources
   */
  public dispose(): void {
    this._disposables.forEach(d => d.dispose());
    this._disposables = [];
    this._onConfigurationChanged.dispose();
  }

  /**
   * Load configuration from VSCode settings
   */
  private loadConfiguration(): ExtensionConfig {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    
    // Build the configuration object with proper defaults
    const loadedConfig: ExtensionConfig = {
      enabled: config.get('enabled', DEFAULT_CONFIG.enabled),
      panels: {
        [PanelType.SIDEBAR]: {
          enabled: config.get('sidebar.enabled', DEFAULT_CONFIG.panels[PanelType.SIDEBAR].enabled),
          delay: config.get('sidebar.delay', DEFAULT_CONFIG.panels[PanelType.SIDEBAR].delay),
        },
        [PanelType.AUXILIARY_BAR]: {
          enabled: config.get('auxiliaryBar.enabled', DEFAULT_CONFIG.panels[PanelType.AUXILIARY_BAR].enabled),
          delay: config.get('auxiliaryBar.delay', DEFAULT_CONFIG.panels[PanelType.AUXILIARY_BAR].delay),
        },
        [PanelType.PANEL]: {
          enabled: config.get('panel.enabled', DEFAULT_CONFIG.panels[PanelType.PANEL].enabled),
          delay: config.get('panel.delay', DEFAULT_CONFIG.panels[PanelType.PANEL].delay),
        },
        [PanelType.REFERENCES]: {
          enabled: config.get('references.enabled', DEFAULT_CONFIG.panels[PanelType.REFERENCES].enabled),
          delay: config.get('references.delay', DEFAULT_CONFIG.panels[PanelType.REFERENCES].delay),
        },
        [PanelType.COPILOT_CHAT]: {
          enabled: config.get('copilotChat.enabled', DEFAULT_CONFIG.panels[PanelType.COPILOT_CHAT].enabled),
          delay: config.get('copilotChat.delay', DEFAULT_CONFIG.panels[PanelType.COPILOT_CHAT].delay),
        },
      },
      smart: {
        respectDebugSessions: config.get('smart.respectDebugSessions', DEFAULT_CONFIG.smart.respectDebugSessions),
        respectTextSelection: config.get('smart.respectTextSelection', DEFAULT_CONFIG.smart.respectTextSelection),
        excludedSchemes: config.get('smart.excludedSchemes', DEFAULT_CONFIG.smart.excludedSchemes),
      },
      hideOnStartup: config.get('hideOnStartup', DEFAULT_CONFIG.hideOnStartup),
      statusBar: {
        enabled: config.get('statusBar.enabled', DEFAULT_CONFIG.statusBar.enabled),
        showCounts: config.get('statusBar.showCounts', DEFAULT_CONFIG.statusBar.showCounts),
      },
    };

    return loadedConfig;
  }

  /**
   * Handle configuration changes
   */
  private handleConfigurationChange(event: vscode.ConfigurationChangeEvent): void {
    if (event.affectsConfiguration(CONFIG_SECTION)) {
      const oldConfig = this._currentConfig;
      this._currentConfig = this.loadConfiguration();
      
      // Only fire event if configuration actually changed
      if (JSON.stringify(oldConfig) !== JSON.stringify(this._currentConfig)) {
        this._onConfigurationChanged.fire(this._currentConfig);
      }
    }
  }

  /**
   * Migrate old configuration format to new format
   */
  public async migrateOldConfiguration(): Promise<void> {
    const config = vscode.workspace.getConfiguration();
    const oldSection = 'autoHide';
    
    // Check if old configuration exists
    if (!config.has(oldSection)) {
      return;
    }

    const oldConfig = config.get(oldSection) as any;
    if (!oldConfig || typeof oldConfig !== 'object') {
      return;
    }

    try {
      // Migrate old settings to new format
      const migrations: Array<{ oldKey: string; newKey: string; transform?: (value: any) => any }> = [
        { oldKey: 'autoHideSideBar', newKey: 'sidebar.enabled' },
        { oldKey: 'autoHideAuxiliaryBar', newKey: 'auxiliaryBar.enabled' },
        { oldKey: 'autoHidePanel', newKey: 'panel.enabled' },
        { oldKey: 'autoHideReferences', newKey: 'references.enabled' },
        { oldKey: 'sideBarDelay', newKey: 'sidebar.delay' },
        { oldKey: 'panelDelay', newKey: 'panel.delay' },
        { oldKey: 'hideOnOpen', newKey: 'hideOnStartup' },
      ];

      for (const migration of migrations) {
        if (oldConfig[migration.oldKey] !== undefined) {
          const value = migration.transform 
            ? migration.transform(oldConfig[migration.oldKey])
            : oldConfig[migration.oldKey];
          
          await this.updateConfig(migration.newKey as keyof ExtensionConfig, value);
        }
      }

      // Show migration notice
      vscode.window.showInformationMessage(
        'Auto Hide Enhanced: Configuration has been migrated to the new format. Please review your settings.',
        'Open Settings'
      ).then(selection => {
        if (selection === 'Open Settings') {
          vscode.commands.executeCommand('workbench.action.openSettings', CONFIG_SECTION);
        }
      });

    } catch (error) {
      console.error('Failed to migrate old configuration:', error);
      vscode.window.showWarningMessage(
        'Auto Hide Enhanced: Failed to migrate old configuration. Please check your settings manually.'
      );
    }
  }
}