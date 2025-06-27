import { Plugin, MarkdownPostProcessor, Notice } from 'obsidian';
import { GoCodeWidget } from './components/GoCodeWidget';
import { GoPadSettingsTab } from './components/SettingsTab';
import { SELECTORS, MESSAGES, LOGGING } from './utils/constants';
import { logger } from './utils/logger';
import { GoPadSettings, LogLevel } from './types';

const DEFAULT_SETTINGS: GoPadSettings = {
	logLevel: LogLevel.WARN,
	enableAutoSync: true,
	enableValidation: true,
	maxWidgetHeight: 800, // Increased from 400px
	enableSmartResize: true, // Enable unlimited height for large content
};

export default class GoPadPlugin extends Plugin {
	settings: GoPadSettings;
	private widgetCache = new Map<string, GoCodeWidget>();

	async onload() {
		// Load settings first
		await this.loadSettings();

		// Configure logging based on settings or development mode
		if (LOGGING.DEVELOPMENT_MODE) {
			logger.enableDevelopmentMode();
		} else {
			logger.setLogLevel(this.settings.logLevel);
		}

		logger.info('Plugin loading...');
		
		// Add settings tab
		this.addSettingTab(new GoPadSettingsTab(this.app, this));
		
		// Add a notice to confirm the plugin is loading
		new Notice(MESSAGES.PLUGIN_LOADED);

		this.registerMarkdownPostProcessor(this.goCodePostProcessor.bind(this));
		logger.info('Markdown post processor registered');
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	onunload() {
		logger.info('Plugin unloading');
		this.widgetCache.clear();
	}

	private generateWidgetId(code: string, sourcePath: string): string {
		const codeHash = btoa(code.substring(0, 100)).substring(0, 10);
		const pathHash = btoa(sourcePath || 'unknown').substring(0, 8);
		return `${pathHash}-${codeHash}`;
	}

	private goCodePostProcessor: MarkdownPostProcessor = (element, context) => {
		logger.debug('Processing markdown element', { 
			elementType: element.tagName,
			innerHTML: element.innerHTML.substring(0, 100) + '...'
		});
		
		// Log all code elements for debugging
		const allCodeElements = element.querySelectorAll('code');
		logger.debug(`Found ${allCodeElements.length} code elements total`);
		
		let codeBlocks: NodeListOf<HTMLElement> | null = null;
		
		// Try multiple selectors to catch different HTML structures
		for (const selector of SELECTORS.GO_CODE_BLOCKS) {
			codeBlocks = element.querySelectorAll(selector);
			if (codeBlocks.length > 0) {
				logger.debug(`Found ${codeBlocks.length} Go code blocks with selector: ${selector}`);
				break;
			}
		}
		
		if (!codeBlocks || codeBlocks.length === 0) {
			logger.debug('No Go code blocks found in element');
			return;
		}
		
		// Create widgets for each Go code block found
		for (let i = 0; i < codeBlocks.length; i++) {
			const codeBlock = codeBlocks[i] as HTMLElement;
			const preElement = codeBlock.closest('pre') || codeBlock.parentElement;
			
			if (preElement) {
				const codeContent = codeBlock.textContent || '';
				const widgetId = this.generateWidgetId(codeContent, context.sourcePath);
				
				// Check if widget already exists and content hasn't changed
				const existingWidget = this.widgetCache.get(widgetId);
				if (existingWidget && existingWidget.getOriginalCode() === codeContent) {
					// Don't recreate if widget is currently focused
					if (existingWidget.isFocused()) {
						logger.debug('Skipping widget recreation - user is actively typing', { widgetId });
						return; // Skip processing this element entirely
					}
					
					logger.debug('Reusing existing widget', { widgetId });
					// Update the container element but keep the widget
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