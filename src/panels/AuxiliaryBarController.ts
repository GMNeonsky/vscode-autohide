import * as vscode from 'vscode';
import { PanelType, ContextState, VSCODE_COMMANDS } from '../types';
import { BasePanelController } from './BasePanelController';

/**
 * Controller for the auxiliary bar (secondary sidebar)
 */
export class AuxiliaryBarController extends BasePanelController {
  constructor() {
    super(PanelType.AUXILIARY_BAR);
    this.setupEventListeners();
  }

  /**
   * Check if the auxiliary bar can be hidden in the current context
   */
  public override canHide(context: ContextState): boolean {
    // Don't hide during debugging or text selection
    if (context.isDebugging || context.isSelectingText) {
      return false;
    }

    // Don't hide if Copilot Chat is active (might be in auxiliary bar)
    if (context.isCopilotChatActive) {
      return false;
    }

    return true;
  }

  /**
   * Execute the VSCode command to hide the auxiliary bar
   */
  protected async executeHideCommand(): Promise<void> {
    await vscode.commands.executeCommand(VSCODE_COMMANDS.CLOSE_AUXILIARY_BAR);
  }

  /**
   * Execute the VSCode command to show the auxiliary bar
   */
  protected async executeShowCommand(): Promise<void> {
    await vscode.commands.executeCommand(VSCODE_COMMANDS.TOGGLE_AUXILIARY_BAR);
  }

  /**
   * Set up event listeners for auxiliary bar state changes
   */
  private setupEventListeners(): void {
    // Poll for auxiliary bar visibility
    const pollInterval = 1000; // 1 second
    const visibilityPoller = setInterval(() => {
      this.checkAuxiliaryBarVisibility();
    }, pollInterval);

    this._disposables.push({
      dispose: () => clearInterval(visibilityPoller)
    });
  }

  /**
   * Check current auxiliary bar visibility and update state
   */
  private async checkAuxiliaryBarVisibility(): Promise<void> {
    try {
      const isAuxiliaryBarVisible = await this.isAuxiliaryBarVisible();
      this.updateHiddenState(!isAuxiliaryBarVisible);
    } catch (error) {
      console.debug('Error checking auxiliary bar visibility:', error);
    }
  }

  /**
   * Heuristic to determine if auxiliary bar is visible
   */
  private async isAuxiliaryBarVisible(): Promise<boolean> {
    try {
      // Try to focus the auxiliary bar - if it works, it's visible
      const result = await vscode.commands.executeCommand('workbench.action.focusAuxiliaryBar');
      return result !== undefined;
    } catch {
      return false;
    }
  }
}