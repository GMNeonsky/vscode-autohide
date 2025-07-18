import * as vscode from 'vscode';
import { PanelType, ContextState, VSCODE_COMMANDS } from '../types';
import { BasePanelController } from './BasePanelController';

/**
 * Controller for the sidebar panel
 */
export class SidebarController extends BasePanelController {
  constructor() {
    super(PanelType.SIDEBAR);
    this.setupEventListeners();
  }

  /**
   * Check if the sidebar can be hidden in the current context
   */
  public override canHide(context: ContextState): boolean {
    // Don't hide sidebar during debugging or text selection
    if (context.isDebugging || context.isSelectingText) {
      return false;
    }

    // Don't hide if Copilot Chat is active (might be in sidebar)
    if (context.isCopilotChatActive) {
      return false;
    }

    return true;
  }

  /**
   * Execute the VSCode command to hide the sidebar
   */
  protected async executeHideCommand(): Promise<void> {
    await vscode.commands.executeCommand(VSCODE_COMMANDS.CLOSE_SIDEBAR);
  }

  /**
   * Execute the VSCode command to show the sidebar
   */
  protected async executeShowCommand(): Promise<void> {
    await vscode.commands.executeCommand(VSCODE_COMMANDS.TOGGLE_SIDEBAR);
  }

  /**
   * Set up event listeners for sidebar state changes
   */
  private setupEventListeners(): void {
    // Listen for sidebar visibility changes
    // Note: VSCode doesn't provide direct events for sidebar visibility
    // We'll use a polling approach to detect changes
    const pollInterval = 1000; // 1 second

    const visibilityPoller = setInterval(() => {
      this.checkSidebarVisibility();
    }, pollInterval);

    this._disposables.push({
      dispose: () => clearInterval(visibilityPoller)
    });
  }

  /**
   * Check current sidebar visibility and update state
   */
  private async checkSidebarVisibility(): Promise<void> {
    try {
      // Use a heuristic to determine sidebar visibility
      // This is not perfect but works in most cases
      const isSidebarVisible = await this.isSidebarVisible();
      this.updateHiddenState(!isSidebarVisible);
    } catch (error) {
      // Silently handle errors in visibility checking
      console.debug('Error checking sidebar visibility:', error);
    }
  }

  /**
   * Heuristic to determine if sidebar is visible
   */
  private async isSidebarVisible(): Promise<boolean> {
    try {
      // Try to execute a sidebar-specific command that only works when visible
      // This is a workaround since VSCode doesn't expose sidebar visibility directly
      const result = await vscode.commands.executeCommand('workbench.action.focusSideBar');
      return result !== undefined;
    } catch {
      // If command fails, assume sidebar is not visible
      return false;
    }
  }
}