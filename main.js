/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => GoPadPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian4 = require("obsidian");

// src/components/GoCodeWidget.ts
var import_obsidian2 = require("obsidian");

// src/utils/constants.ts
var GO_PLAYGROUND_API = {
  COMPILE_URL: "https://play.golang.org/compile",
  VERSION: "2",
  WITH_VET: true
};
var WIDGET_CONFIG = {
  DEBOUNCE_DELAY: 1500,
  // Increased for better typing experience
  SYNC_DELAY: 2e3,
  // Increased to reduce file operations
  RESIZE_DEBOUNCE: 150,
  // Quick resize without validation/sync
  MAX_HEIGHT: 500,
  MIN_HEIGHT: 60,
  LINE_HEIGHT: 20,
  LARGE_CONTENT_THRESHOLD: 20,
  // Lines - when to enable unlimited height
  TEXTAREA_PADDING: 8,
  // Textarea internal padding
  CONTAINER_PADDING: 16,
  // Container padding  
  BORDER_WIDTH: 2,
  // Top and bottom borders (1px each)
  HEIGHT_BUFFER: 4
  // Extra pixels to prevent scroll bars
};
var CSS_CLASSES = {
  WIDGET: "go-pad-widget",
  WRAPPER: "go-pad-wrapper",
  HEADER: "go-pad-header",
  TITLE: "go-pad-title",
  STATUS: "go-pad-status",
  CHANGES: "go-pad-changes",
  RUN_BUTTON: "go-pad-run-btn",
  EDITOR: "go-pad-editor",
  TEXTAREA: "go-pad-textarea",
  ERRORS: "go-pad-errors",
  ERRORS_LABEL: "go-pad-errors-label",
  ERRORS_CONTENT: "go-pad-errors-content",
  OUTPUT: "go-pad-output",
  OUTPUT_LABEL: "go-pad-output-label",
  OUTPUT_CONTENT: "go-pad-output-content"
};
var STATUS_CLASSES = {
  OK: "go-pad-status-ok",
  ERROR: "go-pad-status-error",
  VALIDATING: "go-pad-status-validating",
  LOADING: "go-pad-loading"
};
var CHANGE_CLASSES = {
  MODIFIED: "go-pad-changes-modified",
  SYNCED: "go-pad-changes-synced",
  ERROR: "go-pad-changes-error"
};
var SELECTORS = {
  GO_CODE_BLOCKS: [
    "pre > code.language-go",
    'pre > code[class*="language-go"]',
    "code.language-go",
    'code[class*="language-go"]',
    'pre > code[class*="go"]',
    'code[class*="go"]'
  ]
};
var MESSAGES = {
  PLUGIN_LOADED: "Go Pad plugin loaded!",
  NO_OUTPUT: "No output",
  CLICK_RUN: 'Click "Run" to execute code',
  RUNNING: "Running...",
  READY: "\u2713 Ready",
  VALIDATING: "\u23F3 Validating...",
  MODIFIED: "\u25CF Modified",
  SYNCED: "\u2713 Synced",
  NO_ERRORS: "No errors detected",
  SYNTAX_ERRORS: "Syntax Errors:",
  OUTPUT_LABEL: "Output:"
};
var LOGGING = {
  // Set to true for development, false for production
  DEVELOPMENT_MODE: false,
  // Prefix for all log messages
  PREFIX: "Go Pad"
};

// src/utils/go-playground.ts
var GoPlaygroundService = class {
  /**
   * Execute Go code using the Go Playground API
   */
  static async executeCode(code) {
    const response = await fetch(GO_PLAYGROUND_API.COMPILE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: `version=${GO_PLAYGROUND_API.VERSION}&body=${encodeURIComponent(code)}&withVet=${GO_PLAYGROUND_API.WITH_VET}`
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  }
  /**
   * Validate Go code syntax without running it
   */
  static async validateCode(code) {
    try {
      const result = await this.executeCode(code);
      if (result.Errors && result.Errors.trim()) {
        return {
          isValid: false,
          errors: result.Errors
        };
      }
      return { isValid: true };
    } catch (error) {
      return {
        isValid: false,
        errors: `Validation failed: ${error.message}`
      };
    }
  }
  /**
   * Extract output from Go Playground response
   */
  static extractOutput(response) {
    if (response.Events && response.Events.length > 0) {
      return response.Events.filter((event) => event.Kind === "stdout").map((event) => event.Message).join("");
    }
    return "";
  }
  /**
   * Check if response contains errors
   */
  static hasErrors(response) {
    return !!(response.Errors && response.Errors.trim());
  }
  /**
   * Get error message from response
   */
  static getErrors(response) {
    return response.Errors || "";
  }
};

// src/utils/file-sync.ts
var import_obsidian = require("obsidian");

// src/types/index.ts
var LogLevel = /* @__PURE__ */ ((LogLevel2) => {
  LogLevel2[LogLevel2["DEBUG"] = 0] = "DEBUG";
  LogLevel2[LogLevel2["INFO"] = 1] = "INFO";
  LogLevel2[LogLevel2["WARN"] = 2] = "WARN";
  LogLevel2[LogLevel2["ERROR"] = 3] = "ERROR";
  LogLevel2[LogLevel2["NONE"] = 4] = "NONE";
  return LogLevel2;
})(LogLevel || {});

// src/utils/logger.ts
var Logger = class {
  constructor() {
    this.logLevel = 2 /* WARN */;
    // Default to WARN level for production
    this.prefix = "Go Pad";
  }
  static getInstance() {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
  setLogLevel(level) {
    this.logLevel = level;
  }
  getLogLevel() {
    return this.logLevel;
  }
  debug(message, ...args) {
    if (this.logLevel <= 0 /* DEBUG */) {
      console.debug(`[${this.prefix}:DEBUG]`, message, ...args);
    }
  }
  info(message, ...args) {
    if (this.logLevel <= 1 /* INFO */) {
      console.info(`[${this.prefix}:INFO]`, message, ...args);
    }
  }
  warn(message, ...args) {
    if (this.logLevel <= 2 /* WARN */) {
      console.warn(`[${this.prefix}:WARN]`, message, ...args);
    }
  }
  error(message, ...args) {
    if (this.logLevel <= 3 /* ERROR */) {
      console.error(`[${this.prefix}:ERROR]`, message, ...args);
    }
  }
  // Convenience methods for common scenarios
  apiCall(operation, details) {
    this.debug(`API Call: ${operation}`, details);
  }
  fileOperation(operation, path, details) {
    this.debug(`File Operation: ${operation}`, { path, ...details });
  }
  widgetEvent(event, details) {
    this.debug(`Widget Event: ${event}`, details);
  }
  syncOperation(operation, details) {
    this.info(`Sync: ${operation}`, details);
  }
  validation(result, details) {
    this.debug(`Validation: ${result}`, details);
  }
  // Development mode toggle
  enableDevelopmentMode() {
    this.setLogLevel(0 /* DEBUG */);
    this.info("Development logging enabled");
  }
  enableProductionMode() {
    this.setLogLevel(2 /* WARN */);
  }
};
var logger = Logger.getInstance();

// src/utils/file-sync.ts
var FileSyncService = class {
  constructor(app, context) {
    this.app = app;
    this.context = context;
  }
  /**
   * Update the source file with new code content
   */
  async updateSourceContent(originalCode, newCode) {
    if (newCode === originalCode) {
      logger.debug("No changes detected, skipping sync");
      return false;
    }
    logger.fileOperation("Starting file sync", void 0, {
      originalLength: originalCode.length,
      newLength: newCode.length
    });
    try {
      const sourcePath = this.context.sourcePath;
      logger.fileOperation("Accessing source file", sourcePath);
      if (!sourcePath) {
        throw new Error("No source file found");
      }
      const file = this.app.vault.getAbstractFileByPath(sourcePath);
      if (!file || !(file instanceof import_obsidian.TFile)) {
        throw new Error("Source file not accessible");
      }
      logger.fileOperation("Reading file content", sourcePath);
      const currentContent = await this.app.vault.read(file);
      logger.fileOperation("Replacing code block", sourcePath);
      const updatedContent = this.replaceGoCodeBlock(currentContent, originalCode, newCode);
      if (updatedContent !== currentContent) {
        logger.fileOperation("Writing updated content", sourcePath);
        await this.app.vault.modify(file, updatedContent);
        logger.info("File sync completed successfully", { path: sourcePath });
        return true;
      } else {
        logger.warn("Code block not found in source file");
        throw new Error("Code block not found in source");
      }
    } catch (error) {
      logger.error("File sync failed", { error: error.message });
      throw error;
    }
  }
  /**
   * Replace Go code block in markdown content
   */
  replaceGoCodeBlock(content, oldCode, newCode) {
    logger.debug("Searching for Go code blocks in content");
    const goBlockRegex = /```go\s*\r?\n([\s\S]*?)\r?\n```/g;
    let matches = 0;
    let replacements = 0;
    const result = content.replace(goBlockRegex, (match, codeContent) => {
      matches++;
      logger.debug(`Found Go code block ${matches}`, {
        preview: codeContent.substring(0, 50) + "..."
      });
      const normalizedOld = oldCode.trim().replace(/\r\n/g, "\n");
      const normalizedFound = codeContent.trim().replace(/\r\n/g, "\n");
      if (normalizedFound === normalizedOld) {
        logger.debug("Code block match found, replacing content");
        replacements++;
        return `\`\`\`go
${newCode}
\`\`\``;
      }
      logger.debug("Code block does not match, keeping original");
      return match;
    });
    logger.debug(`Code block replacement complete`, {
      matches,
      replacements
    });
    if (matches === 0) {
      logger.warn("No Go code blocks found in content");
    } else if (replacements === 0) {
      logger.warn("Go code blocks found but none matched the original content");
    }
    return result;
  }
};

// src/styles/widget.ts
var WIDGET_STYLES = `
	.go-pad-widget {
		margin: 1em 0;
		border: 1px solid var(--background-modifier-border);
		border-radius: 6px;
		overflow: hidden;
	}

	.go-pad-wrapper {
		background: var(--background-primary);
	}

	.go-pad-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 12px;
		background: var(--background-secondary);
		border-bottom: 1px solid var(--background-modifier-border);
	}

	.go-pad-title {
		font-weight: 600;
		color: var(--text-normal);
	}

	.go-pad-status {
		font-size: 12px;
		margin-right: 8px;
	}

	.go-pad-status-ok {
		color: var(--text-success);
	}

	.go-pad-status-error {
		color: var(--text-error);
	}

	.go-pad-status-validating {
		color: var(--text-muted);
	}

	.go-pad-changes {
		font-size: 11px;
		margin-right: 8px;
		padding: 2px 6px;
		border-radius: 3px;
	}

	.go-pad-changes-modified {
		background: var(--background-modifier-warning);
		color: var(--text-warning);
	}

	.go-pad-changes-synced {
		background: var(--background-modifier-success);
		color: var(--text-success);
	}

	.go-pad-changes-error {
		background: var(--background-modifier-error);
		color: var(--text-error);
	}

	.go-pad-run-btn {
		background: var(--interactive-accent);
		color: var(--text-on-accent);
		border: none;
		padding: 4px 12px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 12px;
	}

	.go-pad-run-btn:hover {
		background: var(--interactive-accent-hover);
	}

	.go-pad-editor {
		padding: 12px;
	}

	.go-pad-editor textarea {
		width: 100%;
		min-height: 60px;
		background: var(--background-primary);
		color: var(--text-normal);
		border: 1px solid var(--background-modifier-border);
		border-radius: 4px;
		padding: 8px;
		font-family: var(--font-monospace);
		font-size: 13px;
		line-height: 20px;
		resize: none;
		overflow: hidden;
		box-sizing: border-box;
		field-sizing: content;
	}

	.go-pad-errors {
		border-top: 1px solid var(--background-modifier-border);
		background: var(--background-modifier-error);
	}

	.go-pad-errors-label {
		padding: 8px 12px 4px 12px;
		font-size: 12px;
		font-weight: 600;
		color: var(--text-error);
	}

	.go-pad-errors-content {
		padding: 0 12px 12px 12px;
		font-family: var(--font-monospace);
		font-size: 12px;
		white-space: pre-wrap;
		color: var(--text-error);
		min-height: 20px;
		max-height: 150px;
		overflow-y: auto;
	}

	.go-pad-output {
		border-top: 1px solid var(--background-modifier-border);
		background: var(--background-secondary);
	}

	.go-pad-output-label {
		padding: 8px 12px 4px 12px;
		font-size: 12px;
		font-weight: 600;
		color: var(--text-muted);
	}

	.go-pad-output-content {
		padding: 0 12px 12px 12px;
		font-family: var(--font-monospace);
		font-size: 12px;
		white-space: pre-wrap;
		color: var(--text-normal);
		min-height: 20px;
	}

	.go-pad-loading {
		color: var(--text-muted);
		font-style: italic;
	}

	.go-pad-error {
		color: var(--text-error);
	}
`;
function injectStyles() {
  if (document.querySelector("#go-pad-styles"))
    return;
  const style = document.createElement("style");
  style.id = "go-pad-styles";
  style.textContent = WIDGET_STYLES;
  document.head.appendChild(style);
}

// src/components/GoCodeWidget.ts
var GoCodeWidget = class extends import_obsidian2.MarkdownRenderChild {
  constructor(containerEl, code, context, app, settings) {
    super(containerEl);
    this.focusState = {
      hasFocus: false,
      cursorPosition: 0,
      selectionStart: 0,
      selectionEnd: 0
    };
    this.syncStatus = {
      isModified: false,
      isSyncing: false
    };
    this.code = code;
    this.originalCode = code;
    this.context = context;
    this.app = app;
    this.settings = settings;
    this.codeBlockId = this.generateCodeBlockId(code);
    this.fileSyncService = new FileSyncService(app, context);
  }
  generateCodeBlockId(code) {
    const identifier = code.substring(0, 100);
    return btoa(identifier).substring(0, 10);
  }
  onload() {
    logger.debug(`Widget loading with code (${this.code.length} chars)`, {
      codeBlockId: this.codeBlockId,
      preview: this.code.substring(0, 50) + "..."
    });
    this.renderWidget();
  }
  getOriginalCode() {
    return this.originalCode;
  }
  isFocused() {
    return this.focusState.hasFocus && this.textarea === document.activeElement;
  }
  updateContainer(newContainer) {
    if (this.containerEl !== newContainer) {
      this.saveFocusState();
      const widgetElement = this.containerEl.querySelector(".go-pad-widget");
      if (widgetElement) {
        newContainer.empty();
        newContainer.appendChild(widgetElement);
        this.containerEl = newContainer;
        logger.debug("Widget container updated");
        setTimeout(() => this.restoreFocusState(), 10);
      }
    }
  }
  saveFocusState() {
    if (this.textarea) {
      this.focusState = {
        hasFocus: document.activeElement === this.textarea,
        cursorPosition: this.textarea.selectionStart,
        selectionStart: this.textarea.selectionStart,
        selectionEnd: this.textarea.selectionEnd
      };
      logger.debug("Focus state saved", this.focusState);
    }
  }
  restoreFocusState() {
    if (this.textarea && this.focusState.hasFocus) {
      try {
        this.textarea.focus();
        this.textarea.setSelectionRange(
          this.focusState.selectionStart,
          this.focusState.selectionEnd
        );
        logger.debug("Focus state restored", this.focusState);
      } catch (error) {
        logger.warn("Failed to restore focus state", error);
      }
    }
  }
  async preserveFocusDuring(operation) {
    this.saveFocusState();
    try {
      const result = await operation();
      setTimeout(() => this.restoreFocusState(), 10);
      return result;
    } catch (error) {
      setTimeout(() => this.restoreFocusState(), 10);
      throw error;
    }
  }
  renderWidget() {
    logger.widgetEvent("Rendering widget", {
      containerId: this.containerEl.id || "no-id",
      codeLength: this.code.length
    });
    this.containerEl.empty();
    this.containerEl.addClass(CSS_CLASSES.WIDGET);
    const wrapper = this.containerEl.createDiv(CSS_CLASSES.WRAPPER);
    this.createHeader(wrapper);
    this.createEditor(wrapper);
    this.createErrorSection(wrapper);
    this.createOutputSection(wrapper);
    injectStyles();
    setTimeout(() => this.validateGoCode(), 100);
  }
  createHeader(wrapper) {
    const header = wrapper.createDiv(CSS_CLASSES.HEADER);
    header.createSpan(CSS_CLASSES.TITLE).setText("Go Playground");
    const statusIndicator = header.createSpan(CSS_CLASSES.STATUS);
    statusIndicator.setText(MESSAGES.READY);
    statusIndicator.addClass(STATUS_CLASSES.OK);
    const changeIndicator = header.createSpan(CSS_CLASSES.CHANGES);
    changeIndicator.setText("");
    changeIndicator.style.display = "none";
    const runButton = header.createEl("button", CSS_CLASSES.RUN_BUTTON);
    runButton.setText("Run");
    runButton.addEventListener("click", () => this.runCode());
  }
  createEditor(wrapper) {
    const editorContainer = wrapper.createDiv(CSS_CLASSES.EDITOR);
    const textarea = editorContainer.createEl("textarea", CSS_CLASSES.TEXTAREA);
    textarea.value = this.code;
    this.textarea = textarea;
    requestAnimationFrame(() => {
      this.resizeTextarea(textarea);
    });
    let resizeTimer;
    let validationTimer;
    let syncTimer;
    textarea.addEventListener("input", (e) => {
      const target = e.target;
      this.code = target.value;
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        requestAnimationFrame(() => {
          this.resizeTextarea(target);
        });
      }, WIDGET_CONFIG.RESIZE_DEBOUNCE);
      this.updateChangeIndicator();
      if (this.settings.enableValidation) {
        clearTimeout(validationTimer);
        validationTimer = window.setTimeout(() => {
          this.validateGoCode();
        }, WIDGET_CONFIG.DEBOUNCE_DELAY);
      }
    });
    textarea.addEventListener("paste", () => {
      setTimeout(() => {
        this.resizeTextarea(textarea);
      }, 10);
    });
    textarea.addEventListener("focus", () => {
      this.focusState.hasFocus = true;
      logger.debug("Textarea gained focus");
    });
    textarea.addEventListener("blur", (e) => {
      const relatedTarget = e.relatedTarget;
      const isInternalFocusShift = relatedTarget && this.containerEl.contains(relatedTarget);
      if (!isInternalFocusShift) {
        this.focusState.hasFocus = false;
        logger.debug("Textarea lost focus");
        if (this.settings.enableAutoSync && this.syncStatus.isModified) {
          logger.debug("Triggering save on blur");
          this.updateSourceContent();
        }
      }
    });
    let lastActiveTime = Date.now();
    textarea.addEventListener("input", () => {
      lastActiveTime = Date.now();
    });
    const focusChecker = setInterval(() => {
      const timeSinceActive = Date.now() - lastActiveTime;
      if (timeSinceActive < 3e3 && this.focusState.hasFocus && document.activeElement !== textarea) {
        logger.warn("Unexpected focus loss detected, attempting to restore focus");
        this.restoreFocusState();
      }
    }, 500);
    this.register(() => clearInterval(focusChecker));
    textarea.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        this.runCode();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        textarea.focus();
        logger.debug("Manual refocus triggered via Escape key");
      }
    });
    this.containerEl.addEventListener("click", (e) => {
      if (e.target !== textarea && !this.focusState.hasFocus) {
        textarea.focus();
        logger.debug("Refocused textarea via widget click");
      }
    });
  }
  createErrorSection(wrapper) {
    const errorContainer = wrapper.createDiv(CSS_CLASSES.ERRORS);
    errorContainer.createDiv(CSS_CLASSES.ERRORS_LABEL).setText(MESSAGES.SYNTAX_ERRORS);
    const errorContent = errorContainer.createDiv(CSS_CLASSES.ERRORS_CONTENT);
    errorContent.setText(MESSAGES.NO_ERRORS);
    errorContainer.style.display = "none";
  }
  createOutputSection(wrapper) {
    const outputContainer = wrapper.createDiv(CSS_CLASSES.OUTPUT);
    outputContainer.createDiv(CSS_CLASSES.OUTPUT_LABEL).setText(MESSAGES.OUTPUT_LABEL);
    const outputContent = outputContainer.createDiv(CSS_CLASSES.OUTPUT_CONTENT);
    outputContent.setText(MESSAGES.CLICK_RUN);
  }
  resizeTextarea(textarea) {
    textarea.style.height = "auto";
    const scrollHeight = textarea.scrollHeight;
    const minContentHeight = WIDGET_CONFIG.MIN_HEIGHT - WIDGET_CONFIG.TEXTAREA_PADDING * 2 - WIDGET_CONFIG.BORDER_WIDTH;
    let optimalHeight = Math.max(scrollHeight, minContentHeight);
    optimalHeight += WIDGET_CONFIG.HEIGHT_BUFFER;
    const lineCount = this.code.split("\n").length;
    const isLargeContent = lineCount > WIDGET_CONFIG.LARGE_CONTENT_THRESHOLD;
    if (this.settings.enableSmartResize && isLargeContent) {
      textarea.style.overflow = "hidden";
      logger.debug("Smart resize applied for large content", { lineCount, height: optimalHeight });
    } else {
      const maxContentHeight = this.settings.maxWidgetHeight - WIDGET_CONFIG.TEXTAREA_PADDING * 2 - WIDGET_CONFIG.BORDER_WIDTH;
      if (optimalHeight > maxContentHeight) {
        optimalHeight = maxContentHeight;
        textarea.style.overflow = "auto";
        logger.debug("Height limited by maxWidgetHeight", { maxContentHeight, lineCount });
      } else {
        textarea.style.overflow = "hidden";
      }
    }
    textarea.style.height = `${optimalHeight}px`;
    this.ensureNoScrollBars(textarea);
    logger.debug("Textarea resized", {
      scrollHeight,
      optimalHeight,
      finalHeight: textarea.style.height,
      hasScrollBars: textarea.scrollHeight > textarea.clientHeight
    });
  }
  ensureNoScrollBars(textarea) {
    let attempts = 0;
    const maxAttempts = 5;
    const lineCount = this.code.split("\n").length;
    const isLargeContent = lineCount > WIDGET_CONFIG.LARGE_CONTENT_THRESHOLD;
    while (textarea.scrollHeight > textarea.clientHeight && attempts < maxAttempts) {
      const currentHeight = parseInt(textarea.style.height);
      const newHeight = currentHeight + WIDGET_CONFIG.HEIGHT_BUFFER;
      if (this.settings.enableSmartResize && isLargeContent) {
        textarea.style.height = `${newHeight}px`;
        attempts++;
        continue;
      }
      const maxAllowedHeight = this.settings.maxWidgetHeight - WIDGET_CONFIG.TEXTAREA_PADDING * 2 - WIDGET_CONFIG.BORDER_WIDTH;
      if (newHeight > maxAllowedHeight) {
        textarea.style.overflow = "auto";
        break;
      }
      textarea.style.height = `${newHeight}px`;
      attempts++;
    }
    if (attempts > 0) {
      logger.debug("Adjusted textarea height to prevent scroll bars", {
        attempts,
        finalHeight: textarea.style.height
      });
    }
  }
  async validateGoCode() {
    return this.preserveFocusDuring(async () => {
      return this.doValidateGoCode();
    });
  }
  async doValidateGoCode() {
    const errorContainer = this.containerEl.querySelector(`.${CSS_CLASSES.ERRORS}`);
    const errorContent = this.containerEl.querySelector(`.${CSS_CLASSES.ERRORS_CONTENT}`);
    const statusIndicator = this.containerEl.querySelector(`.${CSS_CLASSES.STATUS}`);
    if (!errorContainer || !errorContent || !statusIndicator || !this.code.trim())
      return;
    logger.apiCall("Validating Go code", { codeLength: this.code.length });
    statusIndicator.setText(MESSAGES.VALIDATING);
    statusIndicator.className = `${CSS_CLASSES.STATUS} ${STATUS_CLASSES.VALIDATING}`;
    try {
      const validation = await GoPlaygroundService.validateCode(this.code);
      if (!validation.isValid && validation.errors) {
        logger.validation("Code validation failed", {
          errorCount: validation.errors.split("\n").length
        });
        errorContainer.style.display = "block";
        errorContent.setText(validation.errors);
        errorContent.className = `${CSS_CLASSES.ERRORS_CONTENT} go-pad-error`;
        const errorCount = validation.errors.split("\n").length;
        statusIndicator.setText(`\u26A0\uFE0F ${errorCount} error${errorCount > 1 ? "s" : ""}`);
        statusIndicator.className = `${CSS_CLASSES.STATUS} ${STATUS_CLASSES.ERROR}`;
      } else {
        logger.validation("Code validation passed");
        errorContainer.style.display = "none";
        statusIndicator.setText(MESSAGES.READY);
        statusIndicator.className = `${CSS_CLASSES.STATUS} ${STATUS_CLASSES.OK}`;
      }
    } catch (error) {
      logger.error("Validation failed", { error: error.message });
      errorContainer.style.display = "none";
      statusIndicator.setText("\u26A0\uFE0F Validation failed");
      statusIndicator.className = `${CSS_CLASSES.STATUS} ${STATUS_CLASSES.ERROR}`;
    }
  }
  updateChangeIndicator() {
    const changeIndicator = this.containerEl.querySelector(`.${CSS_CLASSES.CHANGES}`);
    if (!changeIndicator)
      return;
    const hasChanges = this.code !== this.originalCode;
    this.syncStatus.isModified = hasChanges;
    if (hasChanges) {
      changeIndicator.style.display = "inline";
      changeIndicator.setText(MESSAGES.MODIFIED);
      changeIndicator.className = `${CSS_CLASSES.CHANGES} ${CHANGE_CLASSES.MODIFIED}`;
    } else {
      changeIndicator.style.display = "none";
    }
  }
  async updateSourceContent() {
    return this.preserveFocusDuring(async () => {
      return this.doUpdateSourceContent();
    });
  }
  async doUpdateSourceContent() {
    if (!this.syncStatus.isModified || this.syncStatus.isSyncing)
      return;
    this.syncStatus.isSyncing = true;
    logger.syncOperation("Starting source content sync");
    try {
      const success = await this.fileSyncService.updateSourceContent(this.originalCode, this.code);
      if (success) {
        this.originalCode = this.code;
        this.syncStatus.isModified = false;
        this.syncStatus.lastSyncTime = Date.now();
        logger.syncOperation("Source content sync completed successfully");
        this.showSyncSuccess();
      }
    } catch (error) {
      this.syncStatus.errorMessage = error.message;
      logger.error("Source content sync failed", { error: error.message });
      this.showSyncError(error.message);
    } finally {
      this.syncStatus.isSyncing = false;
    }
  }
  showSyncSuccess() {
    const changeIndicator = this.containerEl.querySelector(`.${CSS_CLASSES.CHANGES}`);
    if (changeIndicator) {
      changeIndicator.setText(MESSAGES.SYNCED);
      changeIndicator.className = `${CSS_CLASSES.CHANGES} ${CHANGE_CLASSES.SYNCED}`;
      setTimeout(() => {
        changeIndicator.style.display = "none";
      }, 2e3);
    }
  }
  showSyncError(message) {
    const changeIndicator = this.containerEl.querySelector(`.${CSS_CLASSES.CHANGES}`);
    if (changeIndicator) {
      changeIndicator.setText(`\u26A0 ${message}`);
      changeIndicator.className = `${CSS_CLASSES.CHANGES} ${CHANGE_CLASSES.ERROR}`;
      setTimeout(() => {
        changeIndicator.style.display = "none";
      }, 5e3);
    }
    new import_obsidian2.Notice(`Go Pad sync error: ${message}`, 5e3);
  }
  async runCode() {
    const outputElement = this.containerEl.querySelector(`.${CSS_CLASSES.OUTPUT_CONTENT}`);
    if (!outputElement)
      return;
    logger.apiCall("Executing Go code", { codeLength: this.code.length });
    outputElement.setText(MESSAGES.RUNNING);
    outputElement.className = `${CSS_CLASSES.OUTPUT_CONTENT} ${STATUS_CLASSES.LOADING}`;
    try {
      const response = await GoPlaygroundService.executeCode(this.code);
      outputElement.className = CSS_CLASSES.OUTPUT_CONTENT;
      if (GoPlaygroundService.hasErrors(response)) {
        logger.warn("Code execution completed with errors");
        outputElement.className = `${CSS_CLASSES.OUTPUT_CONTENT} go-pad-error`;
        outputElement.setText(GoPlaygroundService.getErrors(response));
      } else {
        const output = GoPlaygroundService.extractOutput(response);
        logger.info("Code execution completed successfully", {
          outputLength: output.length
        });
        outputElement.setText(output || MESSAGES.NO_OUTPUT);
      }
    } catch (error) {
      logger.error("Code execution failed", { error: error.message });
      outputElement.className = `${CSS_CLASSES.OUTPUT_CONTENT} go-pad-error`;
      outputElement.setText(`Error: ${error.message}`);
    }
  }
};

// src/components/SettingsTab.ts
var import_obsidian3 = require("obsidian");
var GoPadSettingsTab = class extends import_obsidian3.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Go Pad Settings" });
    new import_obsidian3.Setting(containerEl).setName("Logging Level").setDesc("Control the verbosity of console logging").addDropdown((dropdown) => dropdown.addOption(4 /* NONE */.toString(), "None - No logging").addOption(3 /* ERROR */.toString(), "Error - Only errors").addOption(2 /* WARN */.toString(), "Warning - Errors and warnings").addOption(1 /* INFO */.toString(), "Info - General information").addOption(0 /* DEBUG */.toString(), "Debug - Detailed debugging").setValue(this.plugin.settings.logLevel.toString()).onChange(async (value) => {
      const newLogLevel = parseInt(value);
      this.plugin.settings.logLevel = newLogLevel;
      await this.plugin.saveSettings();
      logger.setLogLevel(newLogLevel);
      logger.info(`Log level changed to: ${LogLevel[newLogLevel]}`);
    }));
    new import_obsidian3.Setting(containerEl).setName("Auto-sync to Source").setDesc("Automatically sync code changes back to the original file").addToggle((toggle) => toggle.setValue(this.plugin.settings.enableAutoSync).onChange(async (value) => {
      this.plugin.settings.enableAutoSync = value;
      await this.plugin.saveSettings();
      logger.info(`Auto-sync ${value ? "enabled" : "disabled"}`);
    }));
    new import_obsidian3.Setting(containerEl).setName("Enable Code Validation").setDesc("Validate Go code syntax automatically while typing").addToggle((toggle) => toggle.setValue(this.plugin.settings.enableValidation).onChange(async (value) => {
      this.plugin.settings.enableValidation = value;
      await this.plugin.saveSettings();
      logger.info(`Code validation ${value ? "enabled" : "disabled"}`);
    }));
    new import_obsidian3.Setting(containerEl).setName("Smart Resize").setDesc("Allow unlimited height for large code blocks (>20 lines). When disabled, enforces maximum height limit.").addToggle((toggle) => toggle.setValue(this.plugin.settings.enableSmartResize).onChange(async (value) => {
      this.plugin.settings.enableSmartResize = value;
      await this.plugin.saveSettings();
      logger.info(`Smart resize ${value ? "enabled" : "disabled"}`);
    }));
    new import_obsidian3.Setting(containerEl).setName("Maximum Widget Height").setDesc("Maximum height for the code editor widget (in pixels). Only applies when Smart Resize is disabled or for very large content.").addSlider((slider) => slider.setLimits(200, 1200, 50).setValue(this.plugin.settings.maxWidgetHeight).setDynamicTooltip().onChange(async (value) => {
      this.plugin.settings.maxWidgetHeight = value;
      await this.plugin.saveSettings();
      logger.info(`Max widget height set to: ${value}px`);
    }));
    containerEl.createEl("h3", { text: "Logging Levels Explained" });
    const infoContainer = containerEl.createDiv("go-pad-settings-info");
    infoContainer.innerHTML = `
			<ul>
				<li><strong>None:</strong> Complete silence - no console output</li>
				<li><strong>Error:</strong> Only show critical errors</li>
				<li><strong>Warning:</strong> Show errors and warnings (recommended for normal use)</li>
				<li><strong>Info:</strong> Show general plugin operations</li>
				<li><strong>Debug:</strong> Show detailed debugging information (for troubleshooting)</li>
			</ul>
			<p><em>Note: Debug level may produce verbose console output. Use only when troubleshooting issues.</em></p>
		`;
    containerEl.createEl("h3", { text: "Current Status" });
    const statusContainer = containerEl.createDiv("go-pad-settings-status");
    const currentLogLevel = LogLevel[this.plugin.settings.logLevel];
    statusContainer.innerHTML = `
			<p><strong>Active Log Level:</strong> ${currentLogLevel}</p>
			<p><strong>Auto-sync:</strong> ${this.plugin.settings.enableAutoSync ? "Enabled" : "Disabled"}</p>
			<p><strong>Code Validation:</strong> ${this.plugin.settings.enableValidation ? "Enabled" : "Disabled"}</p>
			<p><strong>Smart Resize:</strong> ${this.plugin.settings.enableSmartResize ? "Enabled" : "Disabled"}</p>
			<p><strong>Max Widget Height:</strong> ${this.plugin.settings.maxWidgetHeight}px</p>
		`;
    this.addStyles();
  }
  addStyles() {
    if (document.querySelector("#go-pad-settings-styles"))
      return;
    const style = document.createElement("style");
    style.id = "go-pad-settings-styles";
    style.textContent = `
			.go-pad-settings-info {
				background: var(--background-secondary);
				padding: 12px;
				border-radius: 6px;
				margin: 12px 0;
			}

			.go-pad-settings-info ul {
				margin: 0;
				padding-left: 20px;
			}

			.go-pad-settings-info li {
				margin: 6px 0;
			}

			.go-pad-settings-status {
				background: var(--background-modifier-success);
				padding: 12px;
				border-radius: 6px;
				margin: 12px 0;
			}

			.go-pad-settings-status p {
				margin: 6px 0;
			}
		`;
    document.head.appendChild(style);
  }
};

// src/main.ts
var DEFAULT_SETTINGS = {
  logLevel: 2 /* WARN */,
  enableAutoSync: true,
  enableValidation: true,
  maxWidgetHeight: 800,
  // Increased from 400px
  enableSmartResize: true
  // Enable unlimited height for large content
};
var GoPadPlugin = class extends import_obsidian4.Plugin {
  constructor() {
    super(...arguments);
    this.widgetCache = /* @__PURE__ */ new Map();
    this.goCodePostProcessor = (element, context) => {
      logger.debug("Processing markdown element", {
        elementType: element.tagName,
        innerHTML: element.innerHTML.substring(0, 100) + "..."
      });
      const allCodeElements = element.querySelectorAll("code");
      logger.debug(`Found ${allCodeElements.length} code elements total`);
      let codeBlocks = null;
      for (const selector of SELECTORS.GO_CODE_BLOCKS) {
        codeBlocks = element.querySelectorAll(selector);
        if (codeBlocks.length > 0) {
          logger.debug(`Found ${codeBlocks.length} Go code blocks with selector: ${selector}`);
          break;
        }
      }
      if (!codeBlocks || codeBlocks.length === 0) {
        logger.debug("No Go code blocks found in element");
        return;
      }
      for (let i = 0; i < codeBlocks.length; i++) {
        const codeBlock = codeBlocks[i];
        const preElement = codeBlock.closest("pre") || codeBlock.parentElement;
        if (preElement) {
          const codeContent = codeBlock.textContent || "";
          const widgetId = this.generateWidgetId(codeContent, context.sourcePath);
          const existingWidget = this.widgetCache.get(widgetId);
          if (existingWidget && existingWidget.getOriginalCode() === codeContent) {
            if (existingWidget.isFocused()) {
              logger.debug("Skipping widget recreation - user is actively typing", { widgetId });
              return;
            }
            logger.debug("Reusing existing widget", { widgetId });
            existingWidget.updateContainer(preElement);
            context.addChild(existingWidget);
            continue;
          }
          logger.info(`Creating Go widget for code block (${codeContent.length} characters)`);
          const widget = new GoCodeWidget(preElement, codeContent, context, this.app, this.settings);
          this.widgetCache.set(widgetId, widget);
          context.addChild(widget);
        }
      }
    };
  }
  async onload() {
    await this.loadSettings();
    if (LOGGING.DEVELOPMENT_MODE) {
      logger.enableDevelopmentMode();
    } else {
      logger.setLogLevel(this.settings.logLevel);
    }
    logger.info("Plugin loading...");
    this.addSettingTab(new GoPadSettingsTab(this.app, this));
    new import_obsidian4.Notice(MESSAGES.PLUGIN_LOADED);
    this.registerMarkdownPostProcessor(this.goCodePostProcessor.bind(this));
    logger.info("Markdown post processor registered");
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  onunload() {
    logger.info("Plugin unloading");
    this.widgetCache.clear();
  }
  generateWidgetId(code, sourcePath) {
    const codeHash = btoa(code.substring(0, 100)).substring(0, 10);
    const pathHash = btoa(sourcePath || "unknown").substring(0, 8);
    return `${pathHash}-${codeHash}`;
  }
};
