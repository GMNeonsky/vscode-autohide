import * as vscode from 'vscode';
import { PanelType, ContextState, VSCODE_COMMANDS } from '../types';
import { BasePanelController } from './BasePanelController';

/**
 * Controller for the references panel (peek references, find all references)
 */
export class ReferencesController extends BasePanelController {
  constructor() {
    super(PanelType.REFERENCES);
    this.setupEventListeners();
  }

  /**
   * Check if the references panel can be hidden in the current context
   */
  public override canHide(context: ContextState): boolean {
    // Don't hide during debugging
    if (context.isDebugging) {
      return false;
    }

    // Don't hide when text is selected (user might be reviewing references)
    if (context.isSelectingText) {
      return false;
    }

    // Don't hide if we're in a search editor (references might be displayed there)
    if (context.activeEditorScheme === 'search-editor') {
      return false;
    }

    return true;
  }

  /**
   * Execute the VSCode command to hide the references panel
   */
  protected async executeHideCommand(): Promise<void> {
    await vscode.commands.executeCommand(VSCODE_COMMANDS.CLOSE_REFERENCE_SEARCH);
  }

  /**
   * Execute the VSCode command to show the references panel
   */
  protected async executeShowCommand(): Promise<void> {
    // References panel doesn't have a direct "show" command
    // It's typically shown when finding references
    // For now, we'll try to trigger a references search if there's an active editor
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      await vscode.commands.executeCommand('editor.action.goToReferences');
    }
  }

  /**
   * Set up event listeners for references panel state changes
   */
  private setupEventListeners(): void {
    // Listen for reference search events
    this._disposables.push(
      vscode.window.onDidChangeActiveTextEditor(() => {
        // Check if we switched to a references editor
        this.checkReferencesVisibility();
      })
    );

    // Poll for references visibility (less frequently since it's more transient)
    const pollInterval = 2000; // 2 seconds
    const visibilityPoller = setInterval(() => {
      this.checkReferencesVisibility();
    }, pollInterval);

    this._disposables.push({
      dispose: () => clearInterval(visibilityPoller)
    });
  }

  /**
   * Check current references panel visibility and update state
   */
  private async checkReferencesVisibility(): Promise<void> {
    try {
      const isReferencesVisible = await this.isReferencesVisible();
      this.updateHiddenState(!isReferencesVisible);
    } catch (error) {
      console.debug('Error checking references visibility:', error);
    }
  }

  /**
   * Heuristic to determine if references panel is visible
   */
  private async isReferencesVisible(): Promise<boolean> {
    try {
      const activeEditor = vscode.window.activeTextEditor;
      if (!activeEditor) {
        return false;
      }

      // Check if the active editor is a references editor
      const uri = activeEditor.document.uri;
      if (uri.scheme === 'references' || uri.path.includes('references')) {
        return true;
      }

      // Check if peek references is active by trying to close it
      // This is a bit hacky but works as a detection method
      const result = await vscode.commands.executeCommand('closeReferenceSearch');
      return result !== undefined;
    } catch {
      return false;
    }
  }
}