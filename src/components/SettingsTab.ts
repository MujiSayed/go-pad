import { App, PluginSettingTab, Setting } from 'obsidian';
import { GoPadSettings, LogLevel } from '../types';
import { logger } from '../utils/logger';
import GoPadPlugin from '../main';

export class GoPadSettingsTab extends PluginSettingTab {
	plugin: GoPadPlugin;

	constructor(app: App, plugin: GoPadPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// Header
		containerEl.createEl('h2', { text: 'Go Pad Settings' });

		// Logging Level Setting
		new Setting(containerEl)
			.setName('Logging Level')
			.setDesc('Control the verbosity of console logging')
			.addDropdown(dropdown => dropdown
				.addOption(LogLevel.NONE.toString(), 'None - No logging')
				.addOption(LogLevel.ERROR.toString(), 'Error - Only errors')
				.addOption(LogLevel.WARN.toString(), 'Warning - Errors and warnings')
				.addOption(LogLevel.INFO.toString(), 'Info - General information')
				.addOption(LogLevel.DEBUG.toString(), 'Debug - Detailed debugging')
				.setValue(this.plugin.settings.logLevel.toString())
				.onChange(async (value) => {
					const newLogLevel = parseInt(value) as LogLevel;
					this.plugin.settings.logLevel = newLogLevel;
					await this.plugin.saveSettings();
					
					// Update logger immediately
					logger.setLogLevel(newLogLevel);
					logger.info(`Log level changed to: ${LogLevel[newLogLevel]}`);
				}));

		// Auto-sync Setting
		new Setting(containerEl)
			.setName('Auto-sync to Source')
			.setDesc('Automatically sync code changes back to the original file')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableAutoSync)
				.onChange(async (value) => {
					this.plugin.settings.enableAutoSync = value;
					await this.plugin.saveSettings();
					logger.info(`Auto-sync ${value ? 'enabled' : 'disabled'}`);
				}));

		// Validation Setting  
		new Setting(containerEl)
			.setName('Enable Code Validation')
			.setDesc('Validate Go code syntax automatically while typing')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableValidation)
				.onChange(async (value) => {
					this.plugin.settings.enableValidation = value;
					await this.plugin.saveSettings();
					logger.info(`Code validation ${value ? 'enabled' : 'disabled'}`);
				}));

		// Smart Resize Setting
		new Setting(containerEl)
			.setName('Smart Resize')
			.setDesc('Allow unlimited height for large code blocks (>20 lines). When disabled, enforces maximum height limit.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.enableSmartResize)
				.onChange(async (value) => {
					this.plugin.settings.enableSmartResize = value;
					await this.plugin.saveSettings();
					logger.info(`Smart resize ${value ? 'enabled' : 'disabled'}`);
				}));

		// Max Widget Height Setting
		new Setting(containerEl)
			.setName('Maximum Widget Height')
			.setDesc('Maximum height for the code editor widget (in pixels). Only applies when Smart Resize is disabled or for very large content.')
			.addSlider(slider => slider
				.setLimits(200, 1200, 50)
				.setValue(this.plugin.settings.maxWidgetHeight)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.maxWidgetHeight = value;
					await this.plugin.saveSettings();
					logger.info(`Max widget height set to: ${value}px`);
				}));

		// Info Section
		containerEl.createEl('h3', { text: 'Logging Levels Explained' });
		
		const infoContainer = containerEl.createDiv('go-pad-settings-info');
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

		// Current Status
		containerEl.createEl('h3', { text: 'Current Status' });
		const statusContainer = containerEl.createDiv('go-pad-settings-status');
		
		const currentLogLevel = LogLevel[this.plugin.settings.logLevel];
		statusContainer.innerHTML = `
			<p><strong>Active Log Level:</strong> ${currentLogLevel}</p>
			<p><strong>Auto-sync:</strong> ${this.plugin.settings.enableAutoSync ? 'Enabled' : 'Disabled'}</p>
			<p><strong>Code Validation:</strong> ${this.plugin.settings.enableValidation ? 'Enabled' : 'Disabled'}</p>
			<p><strong>Smart Resize:</strong> ${this.plugin.settings.enableSmartResize ? 'Enabled' : 'Disabled'}</p>
			<p><strong>Max Widget Height:</strong> ${this.plugin.settings.maxWidgetHeight}px</p>
		`;

		// Add some basic styling
		this.addStyles();
	}

	private addStyles(): void {
		if (document.querySelector('#go-pad-settings-styles')) return;

		const style = document.createElement('style');
		style.id = 'go-pad-settings-styles';
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
}