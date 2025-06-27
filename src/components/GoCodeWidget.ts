import { App, MarkdownRenderChild, MarkdownPostProcessorContext, Notice } from 'obsidian';
import { GoPlaygroundService } from '../utils/go-playground';
import { FileSyncService } from '../utils/file-sync';
import { injectStyles } from '../styles/widget';
import { logger } from '../utils/logger';
import { 
	WIDGET_CONFIG, 
	CSS_CLASSES, 
	STATUS_CLASSES, 
	CHANGE_CLASSES, 
	MESSAGES 
} from '../utils/constants';
import type { SyncStatus, GoPlaygroundResponse, GoPadSettings } from '../types';

interface FocusState {
	hasFocus: boolean;
	cursorPosition: number;
	selectionStart: number;
	selectionEnd: number;
}

export class GoCodeWidget extends MarkdownRenderChild {
	private code: string;
	private originalCode: string;
	private context: MarkdownPostProcessorContext;
	private app: App;
	private codeBlockId: string;
	private fileSyncService: FileSyncService;
	private settings: GoPadSettings;
	private textarea?: HTMLTextAreaElement;
	private focusState: FocusState = {
		hasFocus: false,
		cursorPosition: 0,
		selectionStart: 0,
		selectionEnd: 0
	};
	private syncStatus: SyncStatus = {
		isModified: false,
		isSyncing: false
	};

	constructor(containerEl: HTMLElement, code: string, context: MarkdownPostProcessorContext, app: App, settings: GoPadSettings) {
		super(containerEl);
		this.code = code;
		this.originalCode = code;
		this.context = context;
		this.app = app;
		this.settings = settings;
		this.codeBlockId = this.generateCodeBlockId(code);
		this.fileSyncService = new FileSyncService(app, context);
	}

	private generateCodeBlockId(code: string): string {
		const identifier = code.substring(0, 100);
		return btoa(identifier).substring(0, 10);
	}

	onload() {
		logger.debug(`Widget loading with code (${this.code.length} chars)`, {
			codeBlockId: this.codeBlockId,
			preview: this.code.substring(0, 50) + '...'
		});
		this.renderWidget();
	}

	getOriginalCode(): string {
		return this.originalCode;
	}

	isFocused(): boolean {
		return this.focusState.hasFocus && this.textarea === document.activeElement;
	}

	updateContainer(newContainer: HTMLElement): void {
		// Only update if different container
		if (this.containerEl !== newContainer) {
			// Preserve focus state
			this.saveFocusState();
			
			// Move existing widget content to new container
			const widgetElement = this.containerEl.querySelector('.go-pad-widget');
			if (widgetElement) {
				newContainer.empty();
				newContainer.appendChild(widgetElement);
				this.containerEl = newContainer;
				logger.debug('Widget container updated');
				
				// Restore focus after DOM manipulation
				setTimeout(() => this.restoreFocusState(), 10);
			}
		}
	}

	private saveFocusState(): void {
		if (this.textarea) {
			this.focusState = {
				hasFocus: document.activeElement === this.textarea,
				cursorPosition: this.textarea.selectionStart,
				selectionStart: this.textarea.selectionStart,
				selectionEnd: this.textarea.selectionEnd
			};
			logger.debug('Focus state saved', this.focusState);
		}
	}

	private restoreFocusState(): void {
		if (this.textarea && this.focusState.hasFocus) {
			try {
				this.textarea.focus();
				this.textarea.setSelectionRange(
					this.focusState.selectionStart, 
					this.focusState.selectionEnd
				);
				logger.debug('Focus state restored', this.focusState);
			} catch (error) {
				logger.warn('Failed to restore focus state', error);
			}
		}
	}

	private async preserveFocusDuring<T>(operation: () => Promise<T>): Promise<T> {
		this.saveFocusState();
		try {
			const result = await operation();
			// Small delay to ensure DOM is stable before restoring focus
			setTimeout(() => this.restoreFocusState(), 10);
			return result;
		} catch (error) {
			setTimeout(() => this.restoreFocusState(), 10);
			throw error;
		}
	}

	private renderWidget() {
		logger.widgetEvent('Rendering widget', { 
			containerId: this.containerEl.id || 'no-id',
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
		
		// Initial validation
		setTimeout(() => this.validateGoCode(), 100);
	}

	private createHeader(wrapper: HTMLElement) {
		const header = wrapper.createDiv(CSS_CLASSES.HEADER);
		header.createSpan(CSS_CLASSES.TITLE).setText('Go Playground');
		
		const statusIndicator = header.createSpan(CSS_CLASSES.STATUS);
		statusIndicator.setText(MESSAGES.READY);
		statusIndicator.addClass(STATUS_CLASSES.OK);
		
		const changeIndicator = header.createSpan(CSS_CLASSES.CHANGES);
		changeIndicator.setText('');
		changeIndicator.style.display = 'none';
		
		const runButton = header.createEl('button', CSS_CLASSES.RUN_BUTTON);
		runButton.setText('Run');
		runButton.addEventListener('click', () => this.runCode());
	}

	private createEditor(wrapper: HTMLElement) {
		const editorContainer = wrapper.createDiv(CSS_CLASSES.EDITOR);
		const textarea = editorContainer.createEl('textarea', CSS_CLASSES.TEXTAREA);
		textarea.value = this.code;
		this.textarea = textarea; // Store reference for focus management
		
		// Use requestAnimationFrame to ensure DOM is ready for measurements
		requestAnimationFrame(() => {
			this.resizeTextarea(textarea);
		});
		
		let resizeTimer: number;
		let validationTimer: number;
		let syncTimer: number;
		
		textarea.addEventListener('input', (e) => {
			const target = e.target as HTMLTextAreaElement;
			this.code = target.value;
			
			// Immediate resize for responsive feel
			clearTimeout(resizeTimer);
			resizeTimer = window.setTimeout(() => {
				requestAnimationFrame(() => {
					this.resizeTextarea(target);
				});
			}, WIDGET_CONFIG.RESIZE_DEBOUNCE);
			
			// Update visual indicator for changes
			this.updateChangeIndicator();
			
			// Debounced validation with longer delay
			if (this.settings.enableValidation) {
				clearTimeout(validationTimer);
				validationTimer = window.setTimeout(() => {
					this.validateGoCode();
				}, WIDGET_CONFIG.DEBOUNCE_DELAY);
			}
			
			// Auto-sync is now handled on blur event only
			// This prevents interruptions while typing
		});
		
		// Handle paste events for proper resizing
		textarea.addEventListener('paste', () => {
			// Wait for paste to complete
			setTimeout(() => {
				this.resizeTextarea(textarea);
			}, 10);
		});

		// Track focus state
		textarea.addEventListener('focus', () => {
			this.focusState.hasFocus = true;
			logger.debug('Textarea gained focus');
		});

		textarea.addEventListener('blur', (e) => {
			// Check if blur is due to clicking within the same widget
			const relatedTarget = e.relatedTarget as HTMLElement;
			const isInternalFocusShift = relatedTarget && this.containerEl.contains(relatedTarget);
			
			if (!isInternalFocusShift) {
				this.focusState.hasFocus = false;
				logger.debug('Textarea lost focus');
				
				// Save on blur instead of aggressive auto-sync
				if (this.settings.enableAutoSync && this.syncStatus.isModified) {
					logger.debug('Triggering save on blur');
					this.updateSourceContent();
				}
			}
		});

		// Auto-refocus mechanism for unexpected focus loss
		let lastActiveTime = Date.now();
		textarea.addEventListener('input', () => {
			lastActiveTime = Date.now();
		});

		// Check for unexpected focus loss every 500ms when user was recently active
		const focusChecker = setInterval(() => {
			const timeSinceActive = Date.now() - lastActiveTime;
			if (timeSinceActive < 3000 && this.focusState.hasFocus && document.activeElement !== textarea) {
				logger.warn('Unexpected focus loss detected, attempting to restore focus');
				this.restoreFocusState();
			}
		}, 500);

		// Clean up interval when widget is destroyed
		this.register(() => clearInterval(focusChecker));
		
		// Add keyboard shortcuts
		textarea.addEventListener('keydown', (e) => {
			if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
				e.preventDefault();
				this.runCode();
			}
			// Escape key to refocus if focus is lost
			if (e.key === 'Escape') {
				e.preventDefault();
				textarea.focus();
				logger.debug('Manual refocus triggered via Escape key');
			}
		});

		// Global click handler to refocus on widget click
		this.containerEl.addEventListener('click', (e) => {
			// If clicking on the widget but not the textarea, focus the textarea
			if (e.target !== textarea && !this.focusState.hasFocus) {
				textarea.focus();
				logger.debug('Refocused textarea via widget click');
			}
		});
	}

	private createErrorSection(wrapper: HTMLElement) {
		const errorContainer = wrapper.createDiv(CSS_CLASSES.ERRORS);
		errorContainer.createDiv(CSS_CLASSES.ERRORS_LABEL).setText(MESSAGES.SYNTAX_ERRORS);
		const errorContent = errorContainer.createDiv(CSS_CLASSES.ERRORS_CONTENT);
		errorContent.setText(MESSAGES.NO_ERRORS);
		errorContainer.style.display = 'none'; // Initially hidden
	}

	private createOutputSection(wrapper: HTMLElement) {
		const outputContainer = wrapper.createDiv(CSS_CLASSES.OUTPUT);
		outputContainer.createDiv(CSS_CLASSES.OUTPUT_LABEL).setText(MESSAGES.OUTPUT_LABEL);
		const outputContent = outputContainer.createDiv(CSS_CLASSES.OUTPUT_CONTENT);
		outputContent.setText(MESSAGES.CLICK_RUN);
	}

	private resizeTextarea(textarea: HTMLTextAreaElement) {
		// Reset height to allow shrinking
		textarea.style.height = 'auto';
		
		// Get the actual content height
		const scrollHeight = textarea.scrollHeight;
		
		// Calculate the minimum required height
		const minContentHeight = WIDGET_CONFIG.MIN_HEIGHT - 
			(WIDGET_CONFIG.TEXTAREA_PADDING * 2) - 
			WIDGET_CONFIG.BORDER_WIDTH;
		
		// Determine the optimal height
		let optimalHeight = Math.max(scrollHeight, minContentHeight);
		
		// Add buffer to prevent scroll bars
		optimalHeight += WIDGET_CONFIG.HEIGHT_BUFFER;
		
		// Smart resize logic
		const lineCount = this.code.split('\n').length;
		const isLargeContent = lineCount > WIDGET_CONFIG.LARGE_CONTENT_THRESHOLD;
		
		if (this.settings.enableSmartResize && isLargeContent) {
			// For large content with smart resize enabled, allow unlimited height
			textarea.style.overflow = 'hidden';
			logger.debug('Smart resize applied for large content', { lineCount, height: optimalHeight });
		} else {
			// Apply maximum height constraint
			const maxContentHeight = this.settings.maxWidgetHeight - 
				(WIDGET_CONFIG.TEXTAREA_PADDING * 2) - 
				WIDGET_CONFIG.BORDER_WIDTH;
			
			if (optimalHeight > maxContentHeight) {
				optimalHeight = maxContentHeight;
				// If we hit max height, we need scroll bars
				textarea.style.overflow = 'auto';
				logger.debug('Height limited by maxWidgetHeight', { maxContentHeight, lineCount });
			} else {
				// No scroll bars needed
				textarea.style.overflow = 'hidden';
			}
		}
		
		// Apply the calculated height
		textarea.style.height = `${optimalHeight}px`;
		
		// Double-check and adjust if scroll bars still appear
		this.ensureNoScrollBars(textarea);
		
		logger.debug('Textarea resized', {
			scrollHeight,
			optimalHeight,
			finalHeight: textarea.style.height,
			hasScrollBars: textarea.scrollHeight > textarea.clientHeight
		});
	}

	private ensureNoScrollBars(textarea: HTMLTextAreaElement) {
		// Check if scroll bars are present after initial sizing
		let attempts = 0;
		const maxAttempts = 5;
		
		const lineCount = this.code.split('\n').length;
		const isLargeContent = lineCount > WIDGET_CONFIG.LARGE_CONTENT_THRESHOLD;
		
		while (textarea.scrollHeight > textarea.clientHeight && attempts < maxAttempts) {
			const currentHeight = parseInt(textarea.style.height);
			const newHeight = currentHeight + WIDGET_CONFIG.HEIGHT_BUFFER;
			
			// Check if smart resize allows unlimited height
			if (this.settings.enableSmartResize && isLargeContent) {
				// Allow unlimited height expansion for large content
				textarea.style.height = `${newHeight}px`;
				attempts++;
				continue;
			}
			
			// Apply maximum height constraint for normal content
			const maxAllowedHeight = this.settings.maxWidgetHeight - 
				(WIDGET_CONFIG.TEXTAREA_PADDING * 2) - 
				WIDGET_CONFIG.BORDER_WIDTH;
			
			if (newHeight > maxAllowedHeight) {
				textarea.style.overflow = 'auto';
				break;
			}
			
			textarea.style.height = `${newHeight}px`;
			attempts++;
		}
		
		if (attempts > 0) {
			logger.debug('Adjusted textarea height to prevent scroll bars', {
				attempts,
				finalHeight: textarea.style.height
			});
		}
	}

	private async validateGoCode() {
		return this.preserveFocusDuring(async () => {
			return this.doValidateGoCode();
		});
	}

	private async doValidateGoCode() {
		const errorContainer = this.containerEl.querySelector(`.${CSS_CLASSES.ERRORS}`) as HTMLElement;
		const errorContent = this.containerEl.querySelector(`.${CSS_CLASSES.ERRORS_CONTENT}`) as HTMLElement;
		const statusIndicator = this.containerEl.querySelector(`.${CSS_CLASSES.STATUS}`) as HTMLElement;
		
		if (!errorContainer || !errorContent || !statusIndicator || !this.code.trim()) return;

		logger.apiCall('Validating Go code', { codeLength: this.code.length });

		// Update status to validating
		statusIndicator.setText(MESSAGES.VALIDATING);
		statusIndicator.className = `${CSS_CLASSES.STATUS} ${STATUS_CLASSES.VALIDATING}`;

		try {
			const validation = await GoPlaygroundService.validateCode(this.code);
			
			if (!validation.isValid && validation.errors) {
				logger.validation('Code validation failed', { 
					errorCount: validation.errors.split('\n').length 
				});
				
				// Show errors
				errorContainer.style.display = 'block';
				errorContent.setText(validation.errors);
				errorContent.className = `${CSS_CLASSES.ERRORS_CONTENT} go-pad-error`;
				
				// Update status to show errors
				const errorCount = validation.errors.split('\n').length;
				statusIndicator.setText(`⚠️ ${errorCount} error${errorCount > 1 ? 's' : ''}`);
				statusIndicator.className = `${CSS_CLASSES.STATUS} ${STATUS_CLASSES.ERROR}`;
			} else {
				logger.validation('Code validation passed');
				
				// No errors
				errorContainer.style.display = 'none';
				statusIndicator.setText(MESSAGES.READY);
				statusIndicator.className = `${CSS_CLASSES.STATUS} ${STATUS_CLASSES.OK}`;
			}
		} catch (error) {
			logger.error('Validation failed', { error: error.message });
			
			// Validation failed - hide error display to avoid spam
			errorContainer.style.display = 'none';
			statusIndicator.setText('⚠️ Validation failed');
			statusIndicator.className = `${CSS_CLASSES.STATUS} ${STATUS_CLASSES.ERROR}`;
		}
	}

	private updateChangeIndicator() {
		const changeIndicator = this.containerEl.querySelector(`.${CSS_CLASSES.CHANGES}`) as HTMLElement;
		if (!changeIndicator) return;

		const hasChanges = this.code !== this.originalCode;
		this.syncStatus.isModified = hasChanges;
		
		if (hasChanges) {
			changeIndicator.style.display = 'inline';
			changeIndicator.setText(MESSAGES.MODIFIED);
			changeIndicator.className = `${CSS_CLASSES.CHANGES} ${CHANGE_CLASSES.MODIFIED}`;
		} else {
			changeIndicator.style.display = 'none';
		}
	}

	private async updateSourceContent() {
		return this.preserveFocusDuring(async () => {
			return this.doUpdateSourceContent();
		});
	}

	private async doUpdateSourceContent() {
		if (!this.syncStatus.isModified || this.syncStatus.isSyncing) return;

		this.syncStatus.isSyncing = true;
		logger.syncOperation('Starting source content sync');

		try {
			const success = await this.fileSyncService.updateSourceContent(this.originalCode, this.code);
			
			if (success) {
				this.originalCode = this.code;
				this.syncStatus.isModified = false;
				this.syncStatus.lastSyncTime = Date.now();
				logger.syncOperation('Source content sync completed successfully');
				this.showSyncSuccess();
			}
		} catch (error) {
			this.syncStatus.errorMessage = error.message;
			logger.error('Source content sync failed', { error: error.message });
			this.showSyncError(error.message);
		} finally {
			this.syncStatus.isSyncing = false;
		}
	}

	private showSyncSuccess() {
		const changeIndicator = this.containerEl.querySelector(`.${CSS_CLASSES.CHANGES}`) as HTMLElement;
		if (changeIndicator) {
			changeIndicator.setText(MESSAGES.SYNCED);
			changeIndicator.className = `${CSS_CLASSES.CHANGES} ${CHANGE_CLASSES.SYNCED}`;
			setTimeout(() => {
				changeIndicator.style.display = 'none';
			}, 2000);
		}
	}

	private showSyncError(message: string) {
		const changeIndicator = this.containerEl.querySelector(`.${CSS_CLASSES.CHANGES}`) as HTMLElement;
		if (changeIndicator) {
			changeIndicator.setText(`⚠ ${message}`);
			changeIndicator.className = `${CSS_CLASSES.CHANGES} ${CHANGE_CLASSES.ERROR}`;
			setTimeout(() => {
				changeIndicator.style.display = 'none';
			}, 5000);
		}
		
		new Notice(`Go Pad sync error: ${message}`, 5000);
	}

	private async runCode() {
		const outputElement = this.containerEl.querySelector(`.${CSS_CLASSES.OUTPUT_CONTENT}`) as HTMLElement;
		
		if (!outputElement) return;

		logger.apiCall('Executing Go code', { codeLength: this.code.length });

		outputElement.setText(MESSAGES.RUNNING);
		outputElement.className = `${CSS_CLASSES.OUTPUT_CONTENT} ${STATUS_CLASSES.LOADING}`;

		try {
			const response = await GoPlaygroundService.executeCode(this.code);
			outputElement.className = CSS_CLASSES.OUTPUT_CONTENT;
			
			if (GoPlaygroundService.hasErrors(response)) {
				logger.warn('Code execution completed with errors');
				outputElement.className = `${CSS_CLASSES.OUTPUT_CONTENT} go-pad-error`;
				outputElement.setText(GoPlaygroundService.getErrors(response));
			} else {
				const output = GoPlaygroundService.extractOutput(response);
				logger.info('Code execution completed successfully', { 
					outputLength: output.length 
				});
				outputElement.setText(output || MESSAGES.NO_OUTPUT);
			}
		} catch (error) {
			logger.error('Code execution failed', { error: error.message });
			outputElement.className = `${CSS_CLASSES.OUTPUT_CONTENT} go-pad-error`;
			outputElement.setText(`Error: ${error.message}`);
		}
	}
}