import * as vscode from 'vscode';
import { IPanelController, PanelType, ContextState, PanelStateChangeEvent } from '../types';

/**
 * Base class for panel controllers with common functionality
 */
export abstract class BasePanelController implements IPanelController {
  private readonly _onStateChanged = new vscode.EventEmitter<PanelStateChangeEvent>();
  public readonly onStateChanged = this._onStateChanged.event;

  protected _disposables: vscode.Disposable[] = [];
  protected _isHidden = false;
  protected _hideTimeout: NodeJS.Timeout | undefined;

  constructor(public readonly panelType: PanelType) {
    this._disposables.push(this._onStateChanged);
  }

  /**
   * Whether the panel is currently hidden
   */
  public get isHidden(): boolean {
    return this._isHidden;
  }

  /**
   * Hide the panel
   */
  public async hide(): Promise<void> {
    if (this._isHidden) {
      return;
    }

    try {
      await this.executeHideCommand();
      this._isHidden = true;
      this.emitStateChange('user_action');
    } catch (error) {
      console.error(`Failed to hide ${this.panelType}:`, error);
      throw error;
    }
  }

  /**
   * Show the panel
   */
  public async show(): Promise<void> {
    if (!this._isHidden) {
      return;
    }

    try {
      await this.executeShowCommand();
      this._isHidden = false;
      this.emitStateChange('user_action');
    } catch (error) {
      console.error(`Failed to show ${this.panelType}:`, error);
      throw error;
    }
  }

  /**
   * Toggle the panel visibility
   */
  public async toggle(): Promise<void> {
    if (this._isHidden) {
      await this.show();
    } else {
      await this.hide();
    }
  }

  /**
   * Check if the panel can be hidden in the current context
   */
  public canHide(context: ContextState): boolean {
    // Default implementation - can be overridden by specific controllers
    return !context.isDebugging && !context.isSelectingText;
  }

  /**
   * Hide the panel with a delay
   */
  public async hideWithDelay(delayMs: number, context: ContextState): Promise<void> {
    // Clear any existing timeout
    this.clearHideTimeout();

    if (delayMs <= 0) {
      if (this.canHide(context)) {
        await this.hide();
      }
      return;
    }

    this._hideTimeout = setTimeout(async () => {
      try {
        // Re-check context before hiding (it might have changed)
        if (this.canHide(context)) {
          await this.hide();
          this.emitStateChange('auto_hide');
        }
      } catch (error) {
        console.error(`Failed to auto-hide ${this.panelType}:`, error);
      }
    }, delayMs);
  }

  /**
   * Cancel any pending hide operation
   */
  public cancelHide(): void {
    this.clearHideTimeout();
  }

  /**
   * Dispose of resources
   */
  public dispose(): void {
    this.clearHideTimeout();
    this._disposables.forEach(d => d.dispose());
    this._disposables = [];
  }

  /**
   * Execute the VSCode command to hide this panel type
   */
  protected abstract executeHideCommand(): Promise<void>;

  /**
   * Execute the VSCode command to show this panel type
   */
  protected abstract executeShowCommand(): Promise<void>;

  /**
   * Clear any pending hide timeout
   */
  private clearHideTimeout(): void {
    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
      this._hideTimeout = undefined;
    }
  }

  /**
   * Emit a state change event
   */
  private emitStateChange(reason: PanelStateChangeEvent['reason']): void {
    const event: PanelStateChangeEvent = {
      panelType: this.panelType,
      isHidden: this._isHidden,
      timestamp: Date.now(),
      reason,
    };

    this._onStateChanged.fire(event);
  }

  /**
   * Update the hidden state without triggering commands (for external state changes)
   */
  protected updateHiddenState(isHidden: boolean, reason: PanelStateChangeEvent['reason'] = 'user_action'): void {
    if (this._isHidden !== isHidden) {
      this._isHidden = isHidden;
      this.emitStateChange(reason);
    }
  }
}