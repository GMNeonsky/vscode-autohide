import * as vscode from 'vscode';
import { ContextState, IContextManager } from '../types';

/**
 * Manages context state for smart hiding decisions
 */
export class ContextManager implements IContextManager {
  private readonly _onContextChanged = new vscode.EventEmitter<ContextState>();
  public readonly onContextChanged = this._onContextChanged.event;

  private _disposables: vscode.Disposable[] = [];
  private _currentState: ContextState;

  constructor() {
    this._currentState = this.createInitialState();
    this.setupEventListeners();
  }

  /**
   * Get the current context state (implementing IContextManager interface)
   */
  public getContext(): ContextState {
    return { ...this._currentState };
  }

  /**
   * Get the current context state (alias for getContext)
   */
  public getState(): ContextState {
    return this.getContext();
  }

  /**
   * Check if hiding should be prevented based on current context
   */
  public shouldPreventHiding(): boolean {
    const state = this._currentState;
    
    // Prevent hiding during debug sessions
    if (state.isDebugging) {
      return true;
    }

    // Prevent hiding when text is selected
    if (state.isSelectingText) {
      return true;
    }

    // Prevent hiding for excluded URI schemes
    if (state.activeEditorScheme && this.isSchemeExcluded(state.activeEditorScheme)) {
      return true;
    }

    // Prevent hiding when Copilot Chat is active
    if (state.isCopilotChatActive) {
      return true;
    }

    return false;
  }

  /**
   * Check if a specific context condition is active
   */
  public isContextActive(condition: keyof ContextState): boolean {
    return Boolean(this._currentState[condition]);
  }

  /**
   * Get the current active editor's URI scheme
   */
  public getActiveEditorScheme(): string | null {
    return this._currentState.activeEditorScheme;
  }

  /**
   * Update user activity timestamp
   */
  public updateActivity(): void {
    this.updateState({ lastUserActivity: Date.now() });
  }

  /**
   * Dispose of resources
   */
  public dispose(): void {
    this._disposables.forEach(d => d.dispose());
    this._disposables = [];
    this._onContextChanged.dispose();
  }

  /**
   * Create the initial context state
   */
  private createInitialState(): ContextState {
    const activeEditor = vscode.window.activeTextEditor;
    
    return {
      isDebugging: vscode.debug.activeDebugSession !== undefined,
      isSelectingText: this.checkTextSelection(),
      isCopilotChatActive: this.checkCopilotChatActive(),
      activeEditorScheme: activeEditor?.document.uri.scheme || null,
      lastUserActivity: Date.now(),
      isInTextEditor: activeEditor !== undefined,
    };
  }

  /**
   * Set up event listeners for context changes
   */
  private setupEventListeners(): void {
    // Debug session changes
    this._disposables.push(
      vscode.debug.onDidStartDebugSession(() => {
        this.updateState({ isDebugging: true });
      }),
      vscode.debug.onDidTerminateDebugSession(() => {
        this.updateState({ isDebugging: vscode.debug.activeDebugSession !== undefined });
      })
    );

    // Text selection changes
    this._disposables.push(
      vscode.window.onDidChangeTextEditorSelection(() => {
        this.updateState({ 
          isSelectingText: this.checkTextSelection(),
          lastUserActivity: Date.now()
        });
      })
    );

    // Active editor changes
    this._disposables.push(
      vscode.window.onDidChangeActiveTextEditor((editor) => {
        this.updateState({ 
          activeEditorScheme: editor?.document.uri.scheme || null,
          isSelectingText: this.checkTextSelection(),
          isInTextEditor: editor !== undefined,
          lastUserActivity: Date.now()
        });
      })
    );

    // Document changes (activity tracking)
    this._disposables.push(
      vscode.workspace.onDidChangeTextDocument(() => {
        this.updateState({ lastUserActivity: Date.now() });
      })
    );

    // Window focus changes
    this._disposables.push(
      vscode.window.onDidChangeWindowState((state) => {
        if (state.focused) {
          this.updateState({ lastUserActivity: Date.now() });
        }
      })
    );

    // Terminal changes (activity tracking)
    this._disposables.push(
      vscode.window.onDidChangeActiveTerminal(() => {
        this.updateState({ lastUserActivity: Date.now() });
      })
    );

    // Monitor for Copilot Chat changes
    this.setupCopilotChatMonitoring();
  }

  /**
   * Set up monitoring for Copilot Chat activity
   */
  private setupCopilotChatMonitoring(): void {
    // Poll for Copilot Chat activity every 2 seconds
    const pollInterval = 2000;
    
    const copilotPoller = setInterval(() => {
      const isCopilotActive = this.checkCopilotChatActive();
      if (isCopilotActive !== this._currentState.isCopilotChatActive) {
        this.updateState({ isCopilotChatActive: isCopilotActive });
      }
    }, pollInterval);

    this._disposables.push({
      dispose: () => clearInterval(copilotPoller)
    });
  }

  /**
   * Check if there's currently selected text
   */
  private checkTextSelection(): boolean {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor) {
      return false;
    }

    return activeEditor.selections.some(selection => !selection.isEmpty);
  }

  /**
   * Check if Copilot Chat is currently active
   */
  private checkCopilotChatActive(): boolean {
    try {
      // Check if Copilot Chat extension is active and has focus
      // This is a heuristic approach since there's no direct API
      const copilotExtension = vscode.extensions.getExtension('GitHub.copilot-chat');
      return copilotExtension?.isActive || false;
    } catch {
      return false;
    }
  }

  /**
   * Check if a URI scheme should prevent hiding
   */
  private isSchemeExcluded(scheme: string): boolean {
    // Common schemes that should prevent hiding
    const excludedSchemes = [
      'output',
      'debug',
      'search-editor',
      'interactive',
      'notebook-cell',
      'vscode-terminal'
    ];

    return excludedSchemes.includes(scheme);
  }

  /**
   * Update the context state and notify listeners
   */
  private updateState(updates: Partial<ContextState>): void {
    const oldState = this._currentState;
    this._currentState = { ...oldState, ...updates };

    // Only fire event if state actually changed
    if (this.hasStateChanged(oldState, this._currentState)) {
      this._onContextChanged.fire(this._currentState);
    }
  }

  /**
   * Check if the context state has meaningfully changed
   */
  private hasStateChanged(oldState: ContextState, newState: ContextState): boolean {
    // Compare all properties except lastUserActivity for meaningful changes
    const significantKeys: (keyof ContextState)[] = [
      'isDebugging',
      'isSelectingText',
      'isCopilotChatActive',
      'activeEditorScheme',
      'isInTextEditor'
    ];

    return significantKeys.some(key => oldState[key] !== newState[key]);
  }

  /**
   * Get time since last activity in milliseconds
   */
  public getTimeSinceLastActivity(): number {
    return Date.now() - this._currentState.lastUserActivity;
  }

  /**
   * Check if the user has been inactive for a specified duration
   */
  public isInactive(thresholdMs: number): boolean {
    return this.getTimeSinceLastActivity() > thresholdMs;
  }

  /**
   * Get a human-readable description of the current context
   */
  public getContextDescription(): string {
    const state = this._currentState;
    const conditions: string[] = [];

    if (state.isDebugging) conditions.push('debugging');
    if (state.isSelectingText) conditions.push('text selected');
    if (state.isCopilotChatActive) conditions.push('Copilot Chat active');
    if (state.activeEditorScheme && this.isSchemeExcluded(state.activeEditorScheme)) {
      conditions.push(`excluded scheme (${state.activeEditorScheme})`);
    }
    if (!state.isInTextEditor) conditions.push('not in text editor');

    return conditions.length > 0 
      ? `Active conditions: ${conditions.join(', ')}`
      : 'No blocking conditions';
  }
}