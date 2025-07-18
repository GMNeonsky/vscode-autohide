import * as vscode from 'vscode';
import { PanelType, ContextState, VSCODE_COMMANDS } from '../types';
import { BasePanelController } from './BasePanelController';

/**
 * Controller for the bottom panel (terminal, problems, output, etc.)
 */
export class PanelController extends BasePanelController {
  constructor() {
    super(PanelType.PANEL);
    this.setupEventListeners();
  }

  /**
   * Check if the panel can be hidden in the current context
   */
  public override canHide(context: ContextState): boolean {
    // Don't hide panel during debugging (might contain debug console)
    if (context.isDebugging) {
      return false;
    }

    // Don't hide if text is being selected (user might be copying from terminal/output)
    if (context.isSelectingText) {
      return false;
    }

    return true;
  }

  /**
   * Execute the VSCode command to hide the panel
   */
  protected async executeHideCommand(): Promise<void> {
    await vscode.commands.executeCommand(VSCODE_COMMANDS.CLOSE_PANEL);
  }

  /**
   * Execute the VSCode command to show the panel
   */
  protected async executeShowCommand(): Promise<void> {
    await vscode.commands.executeCommand(VSCODE_COMMANDS.TOGGLE_PANEL);
  }

  /**
   * Set up event listeners for panel state changes
   */
  private setupEventListeners(): void {
    // Listen for terminal changes (indicates panel activity)
    this._disposables.push(
      vscode.window.onDidChangeActiveTerminal(() => {
        // Panel is likely visible if terminal changed
        this.updateHiddenState(false);
      })
    );

    // Poll for panel visibility
    const pollInterval = 1000; // 1 second
    const visibilityPoller = setInterval(() => {
      this.checkPanelVisibility();
    }, pollInterval);

    this._disposables.push({
      dispose: () => clearInterval(visibilityPoller)
    });
  }

  /**
   * Check current panel visibility and update state
   */
  private async checkPanelVisibility(): Promise<void> {
    try {
      const isPanelVisible = await this.isPanelVisible();
      this.updateHiddenState(!isPanelVisible);
    } catch (error) {
      console.debug('Error checking panel visibility:', error);
    }
  }

  /**
   * Heuristic to determine if panel is visible
   */
  private async isPanelVisible(): Promise<boolean> {
    try {
      // Try to focus the panel - if it works, panel is visible
      const result = await vscode.commands.executeCommand('workbench.action.focusPanel');
      return result !== undefined;
    } catch {
      return false;
    }
  }
}