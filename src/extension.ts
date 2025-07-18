import * as vscode from 'vscode';
import { AutoHideExtension } from './core/AutoHideExtension';

let extension: AutoHideExtension | undefined;

/**
 * Extension activation function
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
  try {
    extension = new AutoHideExtension();
    await extension.activate(context);
    
    console.log('Auto Hide Enhanced extension is now active!');
  } catch (error) {
    console.error('Failed to activate Auto Hide Enhanced extension:', error);
    vscode.window.showErrorMessage(
      `Auto Hide Enhanced: Failed to activate extension. ${error}`
    );
    throw error;
  }
}

/**
 * Extension deactivation function
 */
export async function deactivate(): Promise<void> {
  try {
    if (extension) {
      await extension.deactivate();
      extension = undefined;
    }
    
    console.log('Auto Hide Enhanced extension has been deactivated');
  } catch (error) {
    console.error('Error during Auto Hide Enhanced extension deactivation:', error);
  }
}

/**
 * Get the extension instance (for testing purposes)
 */
export function getExtensionInstance(): AutoHideExtension | undefined {
  return extension;
}
