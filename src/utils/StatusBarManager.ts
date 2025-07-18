import * as vscode from 'vscode';
import { IStatusBarManager, ExtensionConfig, PanelType } from '../types';

/**
 * Manages the status bar integration for the extension
 */
export class StatusBarManager implements IStatusBarManager {
  private _statusBarItem: vscode.StatusBarItem;
  private _disposables: vscode.Disposable[] = [];

  constructor() {
    this._statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100 // Priority
    );
    
    this._statusBarItem.command = 'autoHideEnhanced.toggle.all';
    this._statusBarItem.tooltip = 'Auto Hide Enhanced - Click to toggle all panels';
    
    this._disposables.push(this._statusBarItem);
  }

  /**
   * Update the status bar display
   */
  public update(hiddenPanels: PanelType[], config: ExtensionConfig): void {
    if (!config.statusBar.enabled) {
      this.hide();
      return;
    }

    const hiddenCount = hiddenPanels.length;
    const enabledPanels = Object.values(config.panels)
      .filter(panelConfig => panelConfig.enabled)
      .length;

    // Create status text
    let statusText = '$(eye-closed)';
    
    if (config.statusBar.showCounts) {
      if (hiddenCount === 0) {
        statusText = '$(eye) All Visible';
      } else if (hiddenCount === enabledPanels) {
        statusText = '$(eye-closed) All Hidden';
      } else {
        statusText = `$(eye-closed) ${hiddenCount}/${enabledPanels} Hidden`;
      }
    } else {
      if (hiddenCount === 0) {
        statusText = '$(eye)';
      } else if (hiddenCount === enabledPanels) {
        statusText = '$(eye-closed)';
      } else {
        statusText = '$(eye-closed)';
      }
    }

    this._statusBarItem.text = statusText;

    // Update tooltip with detailed information
    const tooltip = this.createTooltip(hiddenPanels, config);
    this._statusBarItem.tooltip = tooltip;

    // Update color based on state
    if (!config.enabled) {
      this._statusBarItem.color = new vscode.ThemeColor('statusBarItem.warningForeground');
    } else if (hiddenCount > 0) {
      this._statusBarItem.color = new vscode.ThemeColor('statusBarItem.prominentForeground');
    } else {
      this._statusBarItem.color = undefined; // Default color
    }

    this.show();
  }

  /**
   * Show the status bar item
   */
  public show(): void {
    this._statusBarItem.show();
  }

  /**
   * Hide the status bar item
   */
  public hide(): void {
    this._statusBarItem.hide();
  }

  /**
   * Dispose of resources
   */
  public dispose(): void {
    this._disposables.forEach(d => d.dispose());
    this._disposables = [];
  }

  /**
   * Create detailed tooltip text
   */
  private createTooltip(hiddenPanels: PanelType[], config: ExtensionConfig): string {
    const lines: string[] = ['Auto Hide Enhanced'];
    
    if (!config.enabled) {
      lines.push('Status: Disabled');
      lines.push('Click to enable');
      return lines.join('\n');
    }

    lines.push('Status: Enabled');
    lines.push('');

    // Panel status
    const panelStatus: string[] = [];
    for (const [panelType, panelConfig] of Object.entries(config.panels)) {
      if (!panelConfig.enabled) {
        continue;
      }

      const isHidden = hiddenPanels.includes(panelType as PanelType);
      const status = isHidden ? '$(eye-closed)' : '$(eye)';
      const name = this.getPanelDisplayName(panelType as PanelType);
      panelStatus.push(`${status} ${name}`);
    }

    if (panelStatus.length > 0) {
      lines.push('Panel Status:');
      lines.push(...panelStatus);
      lines.push('');
    }

    // Smart features status
    const smartFeatures: string[] = [];
    if (config.smart.respectDebugSessions) {
      smartFeatures.push('$(debug) Debug-aware');
    }
    if (config.smart.respectTextSelection) {
      smartFeatures.push('$(selection) Selection-aware');
    }
    if (config.smart.excludedSchemes.length > 0) {
      smartFeatures.push('$(filter) Scheme filtering');
    }

    if (smartFeatures.length > 0) {
      lines.push('Smart Features:');
      lines.push(...smartFeatures);
      lines.push('');
    }

    lines.push('Click to toggle all panels');
    lines.push('Right-click for more options');

    return lines.join('\n');
  }

  /**
   * Get display name for a panel type
   */
  private getPanelDisplayName(panelType: PanelType): string {
    switch (panelType) {
      case PanelType.SIDEBAR:
        return 'Sidebar';
      case PanelType.AUXILIARY_BAR:
        return 'Auxiliary Bar';
      case PanelType.PANEL:
        return 'Panel';
      case PanelType.REFERENCES:
        return 'References';
      case PanelType.COPILOT_CHAT:
        return 'Copilot Chat';
      default:
        return panelType;
    }
  }

  /**
   * Update the status bar command
   */
  public setCommand(command: string): void {
    this._statusBarItem.command = command;
  }

  /**
   * Set custom text for the status bar
   */
  public setText(text: string): void {
    this._statusBarItem.text = text;
  }

  /**
   * Set custom tooltip for the status bar
   */
  public setTooltip(tooltip: string): void {
    this._statusBarItem.tooltip = tooltip;
  }

  /**
   * Set the color of the status bar item
   */
  public setColor(color: string | vscode.ThemeColor | undefined): void {
    this._statusBarItem.color = color;
  }

  /**
   * Get the current status bar item (for advanced customization)
   */
  public getStatusBarItem(): vscode.StatusBarItem {
    return this._statusBarItem;
  }
}