import * as vscode from 'vscode';
import { PanelType, ContextState } from '../types';
import { BasePanelController } from './BasePanelController';

/**
 * Controller for the Copilot Chat panel
 */
export class CopilotChatController extends BasePanelController {
  private copilotExtension: vscode.Extension<any> | undefined;

  constructor() {
    super(PanelType.COPILOT_CHAT);
    this.copilotExtension = vscode.extensions.getExtension('GitHub.copilot-chat');
    this.setupEventListeners();
  }

  /**
   * Check if the Copilot Chat panel can be hidden in the current context
   */
  public override canHide(context: ContextState): boolean {
    // Never hide if Copilot Chat is actively being used
    if (context.isCopilotChatActive) {
      return false;
    }

    // Don't hide during debugging (user might be asking for debugging help)
    if (context.isDebugging) {
      return false;
    }

    // Don't hide when text is selected (user might want to ask about selected code)
    if (context.isSelectingText) {
      return false;
    }

    return true;
  }

  /**
   * Execute the VSCode command to hide the Copilot Chat panel
   */
  protected async executeHideCommand(): Promise<void> {
    try {
      // Try different commands that might hide Copilot Chat
      await vscode.commands.executeCommand('github.copilot.chat.close');
    } catch {
      try {
        // Alternative command
        await vscode.commands.executeCommand('workbench.action.chat.close');
      } catch {
        // If specific commands don't work, try generic panel close
        await vscode.commands.executeCommand('workbench.action.closePanel');
      }
    }
  }

  /**
   * Execute the VSCode command to show the Copilot Chat panel
   */
  protected async executeShowCommand(): Promise<void> {
    try {
      // Try to open Copilot Chat
      await vscode.commands.executeCommand('github.copilot.chat.open');
    } catch {
      try {
        // Alternative command
        await vscode.commands.executeCommand('workbench.action.chat.open');
      } catch {
        // If Copilot Chat commands don't work, show a message
        vscode.window.showWarningMessage(
          'Copilot Chat extension may not be installed or enabled. Please install GitHub Copilot Chat extension.'
        );
      }
    }
  }

  /**
   * Check if Copilot Chat extension is available
   */
  public isCopilotChatAvailable(): boolean {
    return this.copilotExtension?.isActive || false;
  }

  /**
   * Set up event listeners for Copilot Chat state changes
   */
  private setupEventListeners(): void {
    // Listen for extension activation changes
    this._disposables.push(
      vscode.extensions.onDidChange(() => {
        this.copilotExtension = vscode.extensions.getExtension('GitHub.copilot-chat');
      })
    );

    // Poll for Copilot Chat visibility
    const pollInterval = 2000; // 2 seconds (less frequent since it's more specialized)
    const visibilityPoller = setInterval(() => {
      this.checkCopilotChatVisibility();
    }, pollInterval);

    this._disposables.push({
      dispose: () => clearInterval(visibilityPoller)
    });
  }

  /**
   * Check current Copilot Chat visibility and update state
   */
  private async checkCopilotChatVisibility(): Promise<void> {
    try {
      const isCopilotChatVisible = await this.isCopilotChatVisible();
      this.updateHiddenState(!isCopilotChatVisible);
    } catch (error) {
      console.debug('Error checking Copilot Chat visibility:', error);
    }
  }

  /**
   * Heuristic to determine if Copilot Chat is visible
   */
  private async isCopilotChatVisible(): Promise<boolean> {
    try {
      // If extension is not available, it can't be visible
      if (!this.isCopilotChatAvailable()) {
        return false;
      }

      // Try to focus Copilot Chat - if it works, it's visible
      const result = await vscode.commands.executeCommand('github.copilot.chat.focus');
      return result !== undefined;
    } catch {
      try {
        // Alternative method: check if chat view is active
        const result = await vscode.commands.executeCommand('workbench.action.chat.focus');
        return result !== undefined;
      } catch {
        return false;
      }
    }
  }

  /**
   * Get Copilot Chat extension information
   */
  public getCopilotChatInfo(): { available: boolean; version?: string } {
    if (!this.copilotExtension) {
      return { available: false };
    }

    return {
      available: this.copilotExtension.isActive,
      version: this.copilotExtension.packageJSON?.version,
    };
  }
}