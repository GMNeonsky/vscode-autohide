"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate,
  getExtensionInstance: () => getExtensionInstance
});
module.exports = __toCommonJS(extension_exports);
var vscode11 = __toESM(require("vscode"));

// src/core/AutoHideExtension.ts
var vscode10 = __toESM(require("vscode"));

// src/types/index.ts
var COMMANDS = {
  TOGGLE_SIDEBAR: "autoHideEnhanced.toggle.sidebar",
  TOGGLE_AUXILIARY_BAR: "autoHideEnhanced.toggle.auxiliaryBar",
  TOGGLE_PANEL: "autoHideEnhanced.toggle.panel",
  TOGGLE_REFERENCES: "autoHideEnhanced.toggle.references",
  TOGGLE_COPILOT_CHAT: "autoHideEnhanced.toggle.copilotChat",
  TOGGLE_ALL: "autoHideEnhanced.toggle.all",
  SHOW_ALL: "autoHideEnhanced.show.all",
  HIDE_ALL: "autoHideEnhanced.hide.all"
};
var VSCODE_COMMANDS = {
  CLOSE_SIDEBAR: "workbench.action.closeSidebar",
  CLOSE_AUXILIARY_BAR: "workbench.action.closeAuxiliaryBar",
  CLOSE_PANEL: "workbench.action.closePanel",
  CLOSE_REFERENCE_SEARCH: "closeReferenceSearch",
  TOGGLE_SIDEBAR: "workbench.action.toggleSidebarVisibility",
  TOGGLE_AUXILIARY_BAR: "workbench.action.toggleAuxiliaryBar",
  TOGGLE_PANEL: "workbench.action.togglePanel"
};
var CONFIG_SECTION = "autoHideEnhanced";
var DEFAULT_CONFIG = {
  enabled: true,
  panels: {
    ["sidebar" /* SIDEBAR */]: { enabled: true, delay: 450 },
    ["auxiliaryBar" /* AUXILIARY_BAR */]: { enabled: true, delay: 450 },
    ["panel" /* PANEL */]: { enabled: true, delay: 300 },
    ["references" /* REFERENCES */]: { enabled: true, delay: 0 },
    ["copilotChat" /* COPILOT_CHAT */]: { enabled: false, delay: 500 }
  },
  smart: {
    respectDebugSessions: true,
    respectTextSelection: true,
    excludedSchemes: ["output", "debug", "search-result"]
  },
  hideOnStartup: false,
  statusBar: {
    enabled: true,
    showCounts: true
  }
};

// src/config/ConfigurationManager.ts
var vscode = __toESM(require("vscode"));
var ConfigurationManager = class {
  _onConfigurationChanged = new vscode.EventEmitter();
  onConfigurationChanged = this._onConfigurationChanged.event;
  _disposables = [];
  _currentConfig;
  constructor() {
    this._currentConfig = this.loadConfiguration();
    this._disposables.push(
      vscode.workspace.onDidChangeConfiguration(this.handleConfigurationChange.bind(this))
    );
  }
  /**
   * Get the current merged configuration
   */
  getConfig() {
    return { ...this._currentConfig };
  }
  /**
   * Update a configuration value
   */
  async updateConfig(key, value, target = vscode.ConfigurationTarget.Workspace) {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    try {
      await config.update(key, value, target);
    } catch (error) {
      console.error(`Failed to update configuration ${String(key)}:`, error);
      throw error;
    }
  }
  /**
   * Update panel-specific configuration
   */
  async updatePanelConfig(panelType, property, value, target = vscode.ConfigurationTarget.Workspace) {
    const configKey = `${panelType}.${property}`;
    await this.updateConfig(configKey, value, target);
  }
  /**
   * Toggle a panel's enabled state
   */
  async togglePanelEnabled(panelType, target = vscode.ConfigurationTarget.Workspace) {
    const currentValue = this._currentConfig.panels[panelType].enabled;
    await this.updatePanelConfig(panelType, "enabled", !currentValue, target);
  }
  /**
   * Reset configuration to defaults
   */
  async resetToDefaults(target = vscode.ConfigurationTarget.Workspace) {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    const keys = Object.keys(DEFAULT_CONFIG);
    for (const key of keys) {
      await config.update(key, void 0, target);
    }
  }
  /**
   * Get configuration for a specific panel type
   */
  getPanelConfig(panelType) {
    return { ...this._currentConfig.panels[panelType] };
  }
  /**
   * Check if the extension is globally enabled
   */
  isEnabled() {
    return this._currentConfig.enabled;
  }
  /**
   * Check if a specific panel type is enabled
   */
  isPanelEnabled(panelType) {
    return this._currentConfig.enabled && this._currentConfig.panels[panelType].enabled;
  }
  /**
   * Get the delay for a specific panel type
   */
  getPanelDelay(panelType) {
    return this._currentConfig.panels[panelType].delay;
  }
  /**
   * Check if a URI scheme should be excluded from auto-hide
   */
  isSchemeExcluded(scheme) {
    return this._currentConfig.smart.excludedSchemes.includes(scheme);
  }
  /**
   * Dispose of resources
   */
  dispose() {
    this._disposables.forEach((d) => d.dispose());
    this._disposables = [];
    this._onConfigurationChanged.dispose();
  }
  /**
   * Load configuration from VSCode settings
   */
  loadConfiguration() {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION);
    const loadedConfig = {
      enabled: config.get("enabled", DEFAULT_CONFIG.enabled),
      panels: {
        ["sidebar" /* SIDEBAR */]: {
          enabled: config.get("sidebar.enabled", DEFAULT_CONFIG.panels["sidebar" /* SIDEBAR */].enabled),
          delay: config.get("sidebar.delay", DEFAULT_CONFIG.panels["sidebar" /* SIDEBAR */].delay)
        },
        ["auxiliaryBar" /* AUXILIARY_BAR */]: {
          enabled: config.get("auxiliaryBar.enabled", DEFAULT_CONFIG.panels["auxiliaryBar" /* AUXILIARY_BAR */].enabled),
          delay: config.get("auxiliaryBar.delay", DEFAULT_CONFIG.panels["auxiliaryBar" /* AUXILIARY_BAR */].delay)
        },
        ["panel" /* PANEL */]: {
          enabled: config.get("panel.enabled", DEFAULT_CONFIG.panels["panel" /* PANEL */].enabled),
          delay: config.get("panel.delay", DEFAULT_CONFIG.panels["panel" /* PANEL */].delay)
        },
        ["references" /* REFERENCES */]: {
          enabled: config.get("references.enabled", DEFAULT_CONFIG.panels["references" /* REFERENCES */].enabled),
          delay: config.get("references.delay", DEFAULT_CONFIG.panels["references" /* REFERENCES */].delay)
        },
        ["copilotChat" /* COPILOT_CHAT */]: {
          enabled: config.get("copilotChat.enabled", DEFAULT_CONFIG.panels["copilotChat" /* COPILOT_CHAT */].enabled),
          delay: config.get("copilotChat.delay", DEFAULT_CONFIG.panels["copilotChat" /* COPILOT_CHAT */].delay)
        }
      },
      smart: {
        respectDebugSessions: config.get("smart.respectDebugSessions", DEFAULT_CONFIG.smart.respectDebugSessions),
        respectTextSelection: config.get("smart.respectTextSelection", DEFAULT_CONFIG.smart.respectTextSelection),
        excludedSchemes: config.get("smart.excludedSchemes", DEFAULT_CONFIG.smart.excludedSchemes)
      },
      hideOnStartup: config.get("hideOnStartup", DEFAULT_CONFIG.hideOnStartup),
      statusBar: {
        enabled: config.get("statusBar.enabled", DEFAULT_CONFIG.statusBar.enabled),
        showCounts: config.get("statusBar.showCounts", DEFAULT_CONFIG.statusBar.showCounts)
      }
    };
    return loadedConfig;
  }
  /**
   * Handle configuration changes
   */
  handleConfigurationChange(event) {
    if (event.affectsConfiguration(CONFIG_SECTION)) {
      const oldConfig = this._currentConfig;
      this._currentConfig = this.loadConfiguration();
      if (JSON.stringify(oldConfig) !== JSON.stringify(this._currentConfig)) {
        this._onConfigurationChanged.fire(this._currentConfig);
      }
    }
  }
  /**
   * Migrate old configuration format to new format
   */
  async migrateOldConfiguration() {
    const config = vscode.workspace.getConfiguration();
    const oldSection = "autoHide";
    if (!config.has(oldSection)) {
      return;
    }
    const oldConfig = config.get(oldSection);
    if (!oldConfig || typeof oldConfig !== "object") {
      return;
    }
    try {
      const migrations = [
        { oldKey: "autoHideSideBar", newKey: "sidebar.enabled" },
        { oldKey: "autoHideAuxiliaryBar", newKey: "auxiliaryBar.enabled" },
        { oldKey: "autoHidePanel", newKey: "panel.enabled" },
        { oldKey: "autoHideReferences", newKey: "references.enabled" },
        { oldKey: "sideBarDelay", newKey: "sidebar.delay" },
        { oldKey: "panelDelay", newKey: "panel.delay" },
        { oldKey: "hideOnOpen", newKey: "hideOnStartup" }
      ];
      for (const migration of migrations) {
        if (oldConfig[migration.oldKey] !== void 0) {
          const value = migration.transform ? migration.transform(oldConfig[migration.oldKey]) : oldConfig[migration.oldKey];
          await this.updateConfig(migration.newKey, value);
        }
      }
      vscode.window.showInformationMessage(
        "Auto Hide Enhanced: Configuration has been migrated to the new format. Please review your settings.",
        "Open Settings"
      ).then((selection) => {
        if (selection === "Open Settings") {
          vscode.commands.executeCommand("workbench.action.openSettings", CONFIG_SECTION);
        }
      });
    } catch (error) {
      console.error("Failed to migrate old configuration:", error);
      vscode.window.showWarningMessage(
        "Auto Hide Enhanced: Failed to migrate old configuration. Please check your settings manually."
      );
    }
  }
};

// src/core/ContextManager.ts
var vscode2 = __toESM(require("vscode"));
var ContextManager = class {
  _onContextChanged = new vscode2.EventEmitter();
  onContextChanged = this._onContextChanged.event;
  _disposables = [];
  _currentState;
  constructor() {
    this._currentState = this.createInitialState();
    this.setupEventListeners();
  }
  /**
   * Get the current context state (implementing IContextManager interface)
   */
  getContext() {
    return { ...this._currentState };
  }
  /**
   * Get the current context state (alias for getContext)
   */
  getState() {
    return this.getContext();
  }
  /**
   * Check if hiding should be prevented based on current context
   */
  shouldPreventHiding() {
    const state = this._currentState;
    if (state.isDebugging) {
      return true;
    }
    if (state.isSelectingText) {
      return true;
    }
    if (state.activeEditorScheme && this.isSchemeExcluded(state.activeEditorScheme)) {
      return true;
    }
    if (state.isCopilotChatActive) {
      return true;
    }
    return false;
  }
  /**
   * Check if a specific context condition is active
   */
  isContextActive(condition) {
    return Boolean(this._currentState[condition]);
  }
  /**
   * Get the current active editor's URI scheme
   */
  getActiveEditorScheme() {
    return this._currentState.activeEditorScheme;
  }
  /**
   * Update user activity timestamp
   */
  updateActivity() {
    this.updateState({ lastUserActivity: Date.now() });
  }
  /**
   * Dispose of resources
   */
  dispose() {
    this._disposables.forEach((d) => d.dispose());
    this._disposables = [];
    this._onContextChanged.dispose();
  }
  /**
   * Create the initial context state
   */
  createInitialState() {
    const activeEditor = vscode2.window.activeTextEditor;
    return {
      isDebugging: vscode2.debug.activeDebugSession !== void 0,
      isSelectingText: this.checkTextSelection(),
      isCopilotChatActive: this.checkCopilotChatActive(),
      activeEditorScheme: (activeEditor == null ? void 0 : activeEditor.document.uri.scheme) || null,
      lastUserActivity: Date.now(),
      isInTextEditor: activeEditor !== void 0
    };
  }
  /**
   * Set up event listeners for context changes
   */
  setupEventListeners() {
    this._disposables.push(
      vscode2.debug.onDidStartDebugSession(() => {
        this.updateState({ isDebugging: true });
      }),
      vscode2.debug.onDidTerminateDebugSession(() => {
        this.updateState({ isDebugging: vscode2.debug.activeDebugSession !== void 0 });
      })
    );
    this._disposables.push(
      vscode2.window.onDidChangeTextEditorSelection(() => {
        this.updateState({
          isSelectingText: this.checkTextSelection(),
          lastUserActivity: Date.now()
        });
      })
    );
    this._disposables.push(
      vscode2.window.onDidChangeActiveTextEditor((editor) => {
        this.updateState({
          activeEditorScheme: (editor == null ? void 0 : editor.document.uri.scheme) || null,
          isSelectingText: this.checkTextSelection(),
          isInTextEditor: editor !== void 0,
          lastUserActivity: Date.now()
        });
      })
    );
    this._disposables.push(
      vscode2.workspace.onDidChangeTextDocument(() => {
        this.updateState({ lastUserActivity: Date.now() });
      })
    );
    this._disposables.push(
      vscode2.window.onDidChangeWindowState((state) => {
        if (state.focused) {
          this.updateState({ lastUserActivity: Date.now() });
        }
      })
    );
    this._disposables.push(
      vscode2.window.onDidChangeActiveTerminal(() => {
        this.updateState({ lastUserActivity: Date.now() });
      })
    );
    this.setupCopilotChatMonitoring();
  }
  /**
   * Set up monitoring for Copilot Chat activity
   */
  setupCopilotChatMonitoring() {
    const pollInterval = 2e3;
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
  checkTextSelection() {
    const activeEditor = vscode2.window.activeTextEditor;
    if (!activeEditor) {
      return false;
    }
    return activeEditor.selections.some((selection) => !selection.isEmpty);
  }
  /**
   * Check if Copilot Chat is currently active
   */
  checkCopilotChatActive() {
    try {
      const copilotExtension = vscode2.extensions.getExtension("GitHub.copilot-chat");
      return (copilotExtension == null ? void 0 : copilotExtension.isActive) || false;
    } catch {
      return false;
    }
  }
  /**
   * Check if a URI scheme should prevent hiding
   */
  isSchemeExcluded(scheme) {
    const excludedSchemes = [
      "output",
      "debug",
      "search-editor",
      "interactive",
      "notebook-cell",
      "vscode-terminal"
    ];
    return excludedSchemes.includes(scheme);
  }
  /**
   * Update the context state and notify listeners
   */
  updateState(updates) {
    const oldState = this._currentState;
    this._currentState = { ...oldState, ...updates };
    if (this.hasStateChanged(oldState, this._currentState)) {
      this._onContextChanged.fire(this._currentState);
    }
  }
  /**
   * Check if the context state has meaningfully changed
   */
  hasStateChanged(oldState, newState) {
    const significantKeys = [
      "isDebugging",
      "isSelectingText",
      "isCopilotChatActive",
      "activeEditorScheme",
      "isInTextEditor"
    ];
    return significantKeys.some((key) => oldState[key] !== newState[key]);
  }
  /**
   * Get time since last activity in milliseconds
   */
  getTimeSinceLastActivity() {
    return Date.now() - this._currentState.lastUserActivity;
  }
  /**
   * Check if the user has been inactive for a specified duration
   */
  isInactive(thresholdMs) {
    return this.getTimeSinceLastActivity() > thresholdMs;
  }
  /**
   * Get a human-readable description of the current context
   */
  getContextDescription() {
    const state = this._currentState;
    const conditions = [];
    if (state.isDebugging)
      conditions.push("debugging");
    if (state.isSelectingText)
      conditions.push("text selected");
    if (state.isCopilotChatActive)
      conditions.push("Copilot Chat active");
    if (state.activeEditorScheme && this.isSchemeExcluded(state.activeEditorScheme)) {
      conditions.push(`excluded scheme (${state.activeEditorScheme})`);
    }
    if (!state.isInTextEditor)
      conditions.push("not in text editor");
    return conditions.length > 0 ? `Active conditions: ${conditions.join(", ")}` : "No blocking conditions";
  }
};

// src/utils/StatusBarManager.ts
var vscode3 = __toESM(require("vscode"));
var StatusBarManager = class {
  _statusBarItem;
  _disposables = [];
  constructor() {
    this._statusBarItem = vscode3.window.createStatusBarItem(
      vscode3.StatusBarAlignment.Right,
      100
      // Priority
    );
    this._statusBarItem.command = "autoHideEnhanced.toggle.all";
    this._statusBarItem.tooltip = "Auto Hide Enhanced - Click to toggle all panels";
    this._disposables.push(this._statusBarItem);
  }
  /**
   * Update the status bar display
   */
  update(hiddenPanels, config) {
    if (!config.statusBar.enabled) {
      this.hide();
      return;
    }
    const hiddenCount = hiddenPanels.length;
    const enabledPanels = Object.values(config.panels).filter((panelConfig) => panelConfig.enabled).length;
    let statusText = "$(eye-closed)";
    if (config.statusBar.showCounts) {
      if (hiddenCount === 0) {
        statusText = "$(eye) All Visible";
      } else if (hiddenCount === enabledPanels) {
        statusText = "$(eye-closed) All Hidden";
      } else {
        statusText = `$(eye-closed) ${hiddenCount}/${enabledPanels} Hidden`;
      }
    } else {
      if (hiddenCount === 0) {
        statusText = "$(eye)";
      } else if (hiddenCount === enabledPanels) {
        statusText = "$(eye-closed)";
      } else {
        statusText = "$(eye-closed)";
      }
    }
    this._statusBarItem.text = statusText;
    const tooltip = this.createTooltip(hiddenPanels, config);
    this._statusBarItem.tooltip = tooltip;
    if (!config.enabled) {
      this._statusBarItem.color = new vscode3.ThemeColor("statusBarItem.warningForeground");
    } else if (hiddenCount > 0) {
      this._statusBarItem.color = new vscode3.ThemeColor("statusBarItem.prominentForeground");
    } else {
      this._statusBarItem.color = void 0;
    }
    this.show();
  }
  /**
   * Show the status bar item
   */
  show() {
    this._statusBarItem.show();
  }
  /**
   * Hide the status bar item
   */
  hide() {
    this._statusBarItem.hide();
  }
  /**
   * Dispose of resources
   */
  dispose() {
    this._disposables.forEach((d) => d.dispose());
    this._disposables = [];
  }
  /**
   * Create detailed tooltip text
   */
  createTooltip(hiddenPanels, config) {
    const lines = ["Auto Hide Enhanced"];
    if (!config.enabled) {
      lines.push("Status: Disabled");
      lines.push("Click to enable");
      return lines.join("\n");
    }
    lines.push("Status: Enabled");
    lines.push("");
    const panelStatus = [];
    for (const [panelType, panelConfig] of Object.entries(config.panels)) {
      if (!panelConfig.enabled) {
        continue;
      }
      const isHidden = hiddenPanels.includes(panelType);
      const status = isHidden ? "$(eye-closed)" : "$(eye)";
      const name = this.getPanelDisplayName(panelType);
      panelStatus.push(`${status} ${name}`);
    }
    if (panelStatus.length > 0) {
      lines.push("Panel Status:");
      lines.push(...panelStatus);
      lines.push("");
    }
    const smartFeatures = [];
    if (config.smart.respectDebugSessions) {
      smartFeatures.push("$(debug) Debug-aware");
    }
    if (config.smart.respectTextSelection) {
      smartFeatures.push("$(selection) Selection-aware");
    }
    if (config.smart.excludedSchemes.length > 0) {
      smartFeatures.push("$(filter) Scheme filtering");
    }
    if (smartFeatures.length > 0) {
      lines.push("Smart Features:");
      lines.push(...smartFeatures);
      lines.push("");
    }
    lines.push("Click to toggle all panels");
    lines.push("Right-click for more options");
    return lines.join("\n");
  }
  /**
   * Get display name for a panel type
   */
  getPanelDisplayName(panelType) {
    switch (panelType) {
      case "sidebar" /* SIDEBAR */:
        return "Sidebar";
      case "auxiliaryBar" /* AUXILIARY_BAR */:
        return "Auxiliary Bar";
      case "panel" /* PANEL */:
        return "Panel";
      case "references" /* REFERENCES */:
        return "References";
      case "copilotChat" /* COPILOT_CHAT */:
        return "Copilot Chat";
      default:
        return panelType;
    }
  }
  /**
   * Update the status bar command
   */
  setCommand(command) {
    this._statusBarItem.command = command;
  }
  /**
   * Set custom text for the status bar
   */
  setText(text) {
    this._statusBarItem.text = text;
  }
  /**
   * Set custom tooltip for the status bar
   */
  setTooltip(tooltip) {
    this._statusBarItem.tooltip = tooltip;
  }
  /**
   * Set the color of the status bar item
   */
  setColor(color) {
    this._statusBarItem.color = color;
  }
  /**
   * Get the current status bar item (for advanced customization)
   */
  getStatusBarItem() {
    return this._statusBarItem;
  }
};

// src/panels/BasePanelController.ts
var vscode4 = __toESM(require("vscode"));
var BasePanelController = class {
  constructor(panelType) {
    this.panelType = panelType;
    this._disposables.push(this._onStateChanged);
  }
  _onStateChanged = new vscode4.EventEmitter();
  onStateChanged = this._onStateChanged.event;
  _disposables = [];
  _isHidden = false;
  _hideTimeout;
  /**
   * Whether the panel is currently hidden
   */
  get isHidden() {
    return this._isHidden;
  }
  /**
   * Hide the panel
   */
  async hide() {
    if (this._isHidden) {
      return;
    }
    try {
      await this.executeHideCommand();
      this._isHidden = true;
      this.emitStateChange("user_action");
    } catch (error) {
      console.error(`Failed to hide ${this.panelType}:`, error);
      throw error;
    }
  }
  /**
   * Show the panel
   */
  async show() {
    if (!this._isHidden) {
      return;
    }
    try {
      await this.executeShowCommand();
      this._isHidden = false;
      this.emitStateChange("user_action");
    } catch (error) {
      console.error(`Failed to show ${this.panelType}:`, error);
      throw error;
    }
  }
  /**
   * Toggle the panel visibility
   */
  async toggle() {
    if (this._isHidden) {
      await this.show();
    } else {
      await this.hide();
    }
  }
  /**
   * Check if the panel can be hidden in the current context
   */
  canHide(context) {
    return !context.isDebugging && !context.isSelectingText;
  }
  /**
   * Hide the panel with a delay
   */
  async hideWithDelay(delayMs, context) {
    this.clearHideTimeout();
    if (delayMs <= 0) {
      if (this.canHide(context)) {
        await this.hide();
      }
      return;
    }
    this._hideTimeout = setTimeout(async () => {
      try {
        if (this.canHide(context)) {
          await this.hide();
          this.emitStateChange("auto_hide");
        }
      } catch (error) {
        console.error(`Failed to auto-hide ${this.panelType}:`, error);
      }
    }, delayMs);
  }
  /**
   * Cancel any pending hide operation
   */
  cancelHide() {
    this.clearHideTimeout();
  }
  /**
   * Dispose of resources
   */
  dispose() {
    this.clearHideTimeout();
    this._disposables.forEach((d) => d.dispose());
    this._disposables = [];
  }
  /**
   * Clear any pending hide timeout
   */
  clearHideTimeout() {
    if (this._hideTimeout) {
      clearTimeout(this._hideTimeout);
      this._hideTimeout = void 0;
    }
  }
  /**
   * Emit a state change event
   */
  emitStateChange(reason) {
    const event = {
      panelType: this.panelType,
      isHidden: this._isHidden,
      timestamp: Date.now(),
      reason
    };
    this._onStateChanged.fire(event);
  }
  /**
   * Update the hidden state without triggering commands (for external state changes)
   */
  updateHiddenState(isHidden, reason = "user_action") {
    if (this._isHidden !== isHidden) {
      this._isHidden = isHidden;
      this.emitStateChange(reason);
    }
  }
};

// src/panels/SidebarController.ts
var vscode5 = __toESM(require("vscode"));
var SidebarController = class extends BasePanelController {
  constructor() {
    super("sidebar" /* SIDEBAR */);
    this.setupEventListeners();
  }
  /**
   * Check if the sidebar can be hidden in the current context
   */
  canHide(context) {
    if (context.isDebugging || context.isSelectingText) {
      return false;
    }
    if (context.isCopilotChatActive) {
      return false;
    }
    return true;
  }
  /**
   * Execute the VSCode command to hide the sidebar
   */
  async executeHideCommand() {
    await vscode5.commands.executeCommand(VSCODE_COMMANDS.CLOSE_SIDEBAR);
  }
  /**
   * Execute the VSCode command to show the sidebar
   */
  async executeShowCommand() {
    await vscode5.commands.executeCommand(VSCODE_COMMANDS.TOGGLE_SIDEBAR);
  }
  /**
   * Set up event listeners for sidebar state changes
   */
  setupEventListeners() {
    const pollInterval = 1e3;
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
  async checkSidebarVisibility() {
    try {
      const isSidebarVisible = await this.isSidebarVisible();
      this.updateHiddenState(!isSidebarVisible);
    } catch (error) {
      console.debug("Error checking sidebar visibility:", error);
    }
  }
  /**
   * Heuristic to determine if sidebar is visible
   */
  async isSidebarVisible() {
    try {
      const result = await vscode5.commands.executeCommand("workbench.action.focusSideBar");
      return result !== void 0;
    } catch {
      return false;
    }
  }
};

// src/panels/PanelController.ts
var vscode6 = __toESM(require("vscode"));
var PanelController = class extends BasePanelController {
  constructor() {
    super("panel" /* PANEL */);
    this.setupEventListeners();
  }
  /**
   * Check if the panel can be hidden in the current context
   */
  canHide(context) {
    if (context.isDebugging) {
      return false;
    }
    if (context.isSelectingText) {
      return false;
    }
    return true;
  }
  /**
   * Execute the VSCode command to hide the panel
   */
  async executeHideCommand() {
    await vscode6.commands.executeCommand(VSCODE_COMMANDS.CLOSE_PANEL);
  }
  /**
   * Execute the VSCode command to show the panel
   */
  async executeShowCommand() {
    await vscode6.commands.executeCommand(VSCODE_COMMANDS.TOGGLE_PANEL);
  }
  /**
   * Set up event listeners for panel state changes
   */
  setupEventListeners() {
    this._disposables.push(
      vscode6.window.onDidChangeActiveTerminal(() => {
        this.updateHiddenState(false);
      })
    );
    const pollInterval = 1e3;
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
  async checkPanelVisibility() {
    try {
      const isPanelVisible = await this.isPanelVisible();
      this.updateHiddenState(!isPanelVisible);
    } catch (error) {
      console.debug("Error checking panel visibility:", error);
    }
  }
  /**
   * Heuristic to determine if panel is visible
   */
  async isPanelVisible() {
    try {
      const result = await vscode6.commands.executeCommand("workbench.action.focusPanel");
      return result !== void 0;
    } catch {
      return false;
    }
  }
};

// src/panels/AuxiliaryBarController.ts
var vscode7 = __toESM(require("vscode"));
var AuxiliaryBarController = class extends BasePanelController {
  constructor() {
    super("auxiliaryBar" /* AUXILIARY_BAR */);
    this.setupEventListeners();
  }
  /**
   * Check if the auxiliary bar can be hidden in the current context
   */
  canHide(context) {
    if (context.isDebugging || context.isSelectingText) {
      return false;
    }
    if (context.isCopilotChatActive) {
      return false;
    }
    return true;
  }
  /**
   * Execute the VSCode command to hide the auxiliary bar
   */
  async executeHideCommand() {
    await vscode7.commands.executeCommand(VSCODE_COMMANDS.CLOSE_AUXILIARY_BAR);
  }
  /**
   * Execute the VSCode command to show the auxiliary bar
   */
  async executeShowCommand() {
    await vscode7.commands.executeCommand(VSCODE_COMMANDS.TOGGLE_AUXILIARY_BAR);
  }
  /**
   * Set up event listeners for auxiliary bar state changes
   */
  setupEventListeners() {
    const pollInterval = 1e3;
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
  async checkAuxiliaryBarVisibility() {
    try {
      const isAuxiliaryBarVisible = await this.isAuxiliaryBarVisible();
      this.updateHiddenState(!isAuxiliaryBarVisible);
    } catch (error) {
      console.debug("Error checking auxiliary bar visibility:", error);
    }
  }
  /**
   * Heuristic to determine if auxiliary bar is visible
   */
  async isAuxiliaryBarVisible() {
    try {
      const result = await vscode7.commands.executeCommand("workbench.action.focusAuxiliaryBar");
      return result !== void 0;
    } catch {
      return false;
    }
  }
};

// src/panels/ReferencesController.ts
var vscode8 = __toESM(require("vscode"));
var ReferencesController = class extends BasePanelController {
  constructor() {
    super("references" /* REFERENCES */);
    this.setupEventListeners();
  }
  /**
   * Check if the references panel can be hidden in the current context
   */
  canHide(context) {
    if (context.isDebugging) {
      return false;
    }
    if (context.isSelectingText) {
      return false;
    }
    if (context.activeEditorScheme === "search-editor") {
      return false;
    }
    return true;
  }
  /**
   * Execute the VSCode command to hide the references panel
   */
  async executeHideCommand() {
    await vscode8.commands.executeCommand(VSCODE_COMMANDS.CLOSE_REFERENCE_SEARCH);
  }
  /**
   * Execute the VSCode command to show the references panel
   */
  async executeShowCommand() {
    const activeEditor = vscode8.window.activeTextEditor;
    if (activeEditor) {
      await vscode8.commands.executeCommand("editor.action.goToReferences");
    }
  }
  /**
   * Set up event listeners for references panel state changes
   */
  setupEventListeners() {
    this._disposables.push(
      vscode8.window.onDidChangeActiveTextEditor(() => {
        this.checkReferencesVisibility();
      })
    );
    const pollInterval = 2e3;
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
  async checkReferencesVisibility() {
    try {
      const isReferencesVisible = await this.isReferencesVisible();
      this.updateHiddenState(!isReferencesVisible);
    } catch (error) {
      console.debug("Error checking references visibility:", error);
    }
  }
  /**
   * Heuristic to determine if references panel is visible
   */
  async isReferencesVisible() {
    try {
      const activeEditor = vscode8.window.activeTextEditor;
      if (!activeEditor) {
        return false;
      }
      const uri = activeEditor.document.uri;
      if (uri.scheme === "references" || uri.path.includes("references")) {
        return true;
      }
      const result = await vscode8.commands.executeCommand("closeReferenceSearch");
      return result !== void 0;
    } catch {
      return false;
    }
  }
};

// src/panels/CopilotChatController.ts
var vscode9 = __toESM(require("vscode"));
var CopilotChatController = class extends BasePanelController {
  copilotExtension;
  constructor() {
    super("copilotChat" /* COPILOT_CHAT */);
    this.copilotExtension = vscode9.extensions.getExtension("GitHub.copilot-chat");
    this.setupEventListeners();
  }
  /**
   * Check if the Copilot Chat panel can be hidden in the current context
   */
  canHide(context) {
    if (context.isCopilotChatActive) {
      return false;
    }
    if (context.isDebugging) {
      return false;
    }
    if (context.isSelectingText) {
      return false;
    }
    return true;
  }
  /**
   * Execute the VSCode command to hide the Copilot Chat panel
   */
  async executeHideCommand() {
    try {
      await vscode9.commands.executeCommand("github.copilot.chat.close");
    } catch {
      try {
        await vscode9.commands.executeCommand("workbench.action.chat.close");
      } catch {
        await vscode9.commands.executeCommand("workbench.action.closePanel");
      }
    }
  }
  /**
   * Execute the VSCode command to show the Copilot Chat panel
   */
  async executeShowCommand() {
    try {
      await vscode9.commands.executeCommand("github.copilot.chat.open");
    } catch {
      try {
        await vscode9.commands.executeCommand("workbench.action.chat.open");
      } catch {
        vscode9.window.showWarningMessage(
          "Copilot Chat extension may not be installed or enabled. Please install GitHub Copilot Chat extension."
        );
      }
    }
  }
  /**
   * Check if Copilot Chat extension is available
   */
  isCopilotChatAvailable() {
    var _a;
    return ((_a = this.copilotExtension) == null ? void 0 : _a.isActive) || false;
  }
  /**
   * Set up event listeners for Copilot Chat state changes
   */
  setupEventListeners() {
    this._disposables.push(
      vscode9.extensions.onDidChange(() => {
        this.copilotExtension = vscode9.extensions.getExtension("GitHub.copilot-chat");
      })
    );
    const pollInterval = 2e3;
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
  async checkCopilotChatVisibility() {
    try {
      const isCopilotChatVisible = await this.isCopilotChatVisible();
      this.updateHiddenState(!isCopilotChatVisible);
    } catch (error) {
      console.debug("Error checking Copilot Chat visibility:", error);
    }
  }
  /**
   * Heuristic to determine if Copilot Chat is visible
   */
  async isCopilotChatVisible() {
    try {
      if (!this.isCopilotChatAvailable()) {
        return false;
      }
      const result = await vscode9.commands.executeCommand("github.copilot.chat.focus");
      return result !== void 0;
    } catch {
      try {
        const result = await vscode9.commands.executeCommand("workbench.action.chat.focus");
        return result !== void 0;
      } catch {
        return false;
      }
    }
  }
  /**
   * Get Copilot Chat extension information
   */
  getCopilotChatInfo() {
    var _a;
    if (!this.copilotExtension) {
      return { available: false };
    }
    return {
      available: this.copilotExtension.isActive,
      version: (_a = this.copilotExtension.packageJSON) == null ? void 0 : _a.version
    };
  }
};

// src/core/AutoHideExtension.ts
var AutoHideExtension = class {
  _configManager;
  _contextManager;
  _statusBarManager;
  _panelControllers;
  _disposables = [];
  _isActivated = false;
  constructor() {
    this._configManager = new ConfigurationManager();
    this._contextManager = new ContextManager();
    this._statusBarManager = new StatusBarManager();
    this._panelControllers = /* @__PURE__ */ new Map();
    this.initializePanelControllers();
    this.setupEventListeners();
  }
  /**
   * Configuration manager
   */
  get configManager() {
    return this._configManager;
  }
  /**
   * Context manager
   */
  get contextManager() {
    return this._contextManager;
  }
  /**
   * Panel controllers
   */
  get panelControllers() {
    return this._panelControllers;
  }
  /**
   * Status bar manager
   */
  get statusBarManager() {
    return this._statusBarManager;
  }
  /**
   * Activate the extension
   */
  async activate(context) {
    if (this._isActivated) {
      return;
    }
    try {
      context.subscriptions.push(
        this._configManager,
        this._contextManager,
        this._statusBarManager,
        ...Array.from(this._panelControllers.values()),
        ...this._disposables
      );
      this.registerCommands(context);
      await this._configManager.migrateOldConfiguration();
      this.updateStatusBar();
      const config = this._configManager.getConfig();
      if (config.hideOnStartup) {
        await this.hideAll();
      }
      this._isActivated = true;
      console.log("Auto Hide Enhanced extension activated successfully");
    } catch (error) {
      console.error("Failed to activate Auto Hide Enhanced extension:", error);
      vscode10.window.showErrorMessage(
        `Auto Hide Enhanced: Failed to activate extension. ${error}`
      );
      throw error;
    }
  }
  /**
   * Deactivate the extension
   */
  async deactivate() {
    if (!this._isActivated) {
      return;
    }
    try {
      await this.showAll();
      this._disposables.forEach((d) => d.dispose());
      this._disposables = [];
      this._isActivated = false;
      console.log("Auto Hide Enhanced extension deactivated");
    } catch (error) {
      console.error("Error during extension deactivation:", error);
    }
  }
  /**
   * Hide all configured panels
   */
  async hideAll() {
    const config = this._configManager.getConfig();
    const context = this._contextManager.getContext();
    if (!config.enabled) {
      return;
    }
    const hidePromises = [];
    for (const [panelType, controller] of this._panelControllers) {
      const panelConfig = config.panels[panelType];
      if (panelConfig.enabled && controller.canHide(context)) {
        hidePromises.push(
          controller.hideWithDelay(panelConfig.delay, context)
        );
      }
    }
    await Promise.allSettled(hidePromises);
    this.updateStatusBar();
  }
  /**
   * Show all panels
   */
  async showAll() {
    const showPromises = [];
    for (const controller of this._panelControllers.values()) {
      if (controller.isHidden) {
        showPromises.push(controller.show());
      }
    }
    await Promise.allSettled(showPromises);
    this.updateStatusBar();
  }
  /**
   * Toggle auto-hide for a specific panel type
   */
  async togglePanel(panelType) {
    const controller = this._panelControllers.get(panelType);
    if (!controller) {
      throw new Error(`No controller found for panel type: ${panelType}`);
    }
    await controller.toggle();
    this.updateStatusBar();
  }
  /**
   * Initialize panel controllers
   */
  initializePanelControllers() {
    this._panelControllers.set("sidebar" /* SIDEBAR */, new SidebarController());
    this._panelControllers.set("auxiliaryBar" /* AUXILIARY_BAR */, new AuxiliaryBarController());
    this._panelControllers.set("panel" /* PANEL */, new PanelController());
    this._panelControllers.set("references" /* REFERENCES */, new ReferencesController());
    this._panelControllers.set("copilotChat" /* COPILOT_CHAT */, new CopilotChatController());
  }
  /**
   * Set up event listeners
   */
  setupEventListeners() {
    this._disposables.push(
      this._configManager.onConfigurationChanged((config) => {
        this.handleConfigurationChange(config);
      })
    );
    this._disposables.push(
      this._contextManager.onContextChanged((context) => {
        this.handleContextChange(context);
      })
    );
    for (const controller of this._panelControllers.values()) {
      if ("onStateChanged" in controller) {
        this._disposables.push(
          controller.onStateChanged((event) => {
            this.handlePanelStateChange(event);
          })
        );
      }
    }
  }
  /**
   * Register extension commands
   */
  registerCommands(context) {
    const commands8 = [
      {
        command: COMMANDS.TOGGLE_SIDEBAR,
        handler: () => this.togglePanel("sidebar" /* SIDEBAR */)
      },
      {
        command: COMMANDS.TOGGLE_AUXILIARY_BAR,
        handler: () => this.togglePanel("auxiliaryBar" /* AUXILIARY_BAR */)
      },
      {
        command: COMMANDS.TOGGLE_PANEL,
        handler: () => this.togglePanel("panel" /* PANEL */)
      },
      {
        command: COMMANDS.TOGGLE_REFERENCES,
        handler: () => this.togglePanel("references" /* REFERENCES */)
      },
      {
        command: COMMANDS.TOGGLE_COPILOT_CHAT,
        handler: () => this.togglePanel("copilotChat" /* COPILOT_CHAT */)
      },
      {
        command: COMMANDS.TOGGLE_ALL,
        handler: () => this.toggleAllPanels()
      },
      {
        command: COMMANDS.SHOW_ALL,
        handler: () => this.showAll()
      },
      {
        command: COMMANDS.HIDE_ALL,
        handler: () => this.hideAll()
      }
    ];
    for (const { command, handler } of commands8) {
      const disposable = vscode10.commands.registerCommand(command, handler);
      context.subscriptions.push(disposable);
    }
  }
  /**
   * Toggle all panels (smart toggle based on current state)
   */
  async toggleAllPanels() {
    const hiddenCount = Array.from(this._panelControllers.values()).filter((controller) => controller.isHidden).length;
    const totalEnabled = Object.values(this._configManager.getConfig().panels).filter((config) => config.enabled).length;
    if (hiddenCount > totalEnabled / 2) {
      await this.showAll();
    } else {
      await this.hideAll();
    }
  }
  /**
   * Handle configuration changes
   */
  handleConfigurationChange(config) {
    this.updateStatusBar();
    if (!config.enabled) {
      this.showAll().catch((error) => {
        console.error("Failed to show all panels after disabling extension:", error);
      });
    }
  }
  /**
   * Handle context changes
   */
  handleContextChange(_context) {
    if (this._contextManager.shouldPreventHiding()) {
      for (const controller of this._panelControllers.values()) {
        if ("cancelHide" in controller) {
          controller.cancelHide();
        }
      }
    }
    this.updateStatusBar();
  }
  /**
   * Handle panel state changes
   */
  handlePanelStateChange(event) {
    this.updateStatusBar();
    console.debug(`Panel ${event.panelType} ${event.isHidden ? "hidden" : "shown"} (${event.reason})`);
  }
  /**
   * Update the status bar display
   */
  updateStatusBar() {
    const config = this._configManager.getConfig();
    const hiddenPanels = Array.from(this._panelControllers.entries()).filter(([, controller]) => controller.isHidden).map(([panelType]) => panelType);
    this._statusBarManager.update(hiddenPanels, config);
  }
  /**
   * Get extension statistics
   */
  getStatistics() {
    const config = this._configManager.getConfig();
    const totalPanels = this._panelControllers.size;
    const enabledPanels = Object.values(config.panels).filter((p) => p.enabled).length;
    const hiddenPanels = Array.from(this._panelControllers.values()).filter((controller) => controller.isHidden).length;
    return {
      totalPanels,
      enabledPanels,
      hiddenPanels,
      isExtensionEnabled: config.enabled
    };
  }
};

// src/extension.ts
var extension;
async function activate(context) {
  try {
    extension = new AutoHideExtension();
    await extension.activate(context);
    console.log("Auto Hide Enhanced extension is now active!");
  } catch (error) {
    console.error("Failed to activate Auto Hide Enhanced extension:", error);
    vscode11.window.showErrorMessage(
      `Auto Hide Enhanced: Failed to activate extension. ${error}`
    );
    throw error;
  }
}
async function deactivate() {
  try {
    if (extension) {
      await extension.deactivate();
      extension = void 0;
    }
    console.log("Auto Hide Enhanced extension has been deactivated");
  } catch (error) {
    console.error("Error during Auto Hide Enhanced extension deactivation:", error);
  }
}
function getExtensionInstance() {
  return extension;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate,
  getExtensionInstance
});
//# sourceMappingURL=extension.js.map
