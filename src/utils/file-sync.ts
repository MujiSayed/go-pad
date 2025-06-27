import { App, TFile, MarkdownPostProcessorContext } from 'obsidian';
import { logger } from './logger';

export class FileSyncService {
	constructor(
		private app: App,
		private context: MarkdownPostProcessorContext
	) {}

	/**
	 * Update the source file with new code content
	 */
	async updateSourceContent(originalCode: string, newCode: string): Promise<boolean> {
		// Only update if content has actually changed
		if (newCode === originalCode) {
			logger.debug('No changes detected, skipping sync');
			return false;
		}

		logger.fileOperation('Starting file sync', undefined, {
			originalLength: originalCode.length,
			newLength: newCode.length
		});

		try {
			// Get the source file from context
			const sourcePath = this.context.sourcePath;
			logger.fileOperation('Accessing source file', sourcePath);
			
			if (!sourcePath) {
				throw new Error('No source file found');
			}

			// Get the file from vault
			const file = this.app.vault.getAbstractFileByPath(sourcePath);
			if (!file || !(file instanceof TFile)) {
				throw new Error('Source file not accessible');
			}

			logger.fileOperation('Reading file content', sourcePath);
			// Read current file content
			const currentContent = await this.app.vault.read(file);
			
			// Find and replace the Go code block
			logger.fileOperation('Replacing code block', sourcePath);
			const updatedContent = this.replaceGoCodeBlock(currentContent, originalCode, newCode);
			
			if (updatedContent !== currentContent) {
				logger.fileOperation('Writing updated content', sourcePath);
				// Write updated content back to file
				await this.app.vault.modify(file, updatedContent);
				logger.info('File sync completed successfully', { path: sourcePath });
				return true;
			} else {
				logger.warn('Code block not found in source file');
				throw new Error('Code block not found in source');
			}
		} catch (error) {
			logger.error('File sync failed', { error: error.message });
			throw error;
		}
	}

	/**
	 * Replace Go code block in markdown content
	 */
	private replaceGoCodeBlock(content: string, oldCode: string, newCode: string): string {
		logger.debug('Searching for Go code blocks in content');
		
		// More flexible regex pattern that handles various whitespace scenarios
		const goBlockRegex = /```go\s*\r?\n([\s\S]*?)\r?\n```/g;
		
		let matches = 0;
		let replacements = 0;
		
		const result = content.replace(goBlockRegex, (match, codeContent) => {
			matches++;
			logger.debug(`Found Go code block ${matches}`, {
				preview: codeContent.substring(0, 50) + '...'
			});
			
			// Compare the code content (normalized whitespace)
			const normalizedOld = oldCode.trim().replace(/\r\n/g, '\n');
			const normalizedFound = codeContent.trim().replace(/\r\n/g, '\n');
			
			if (normalizedFound === normalizedOld) {
				logger.debug('Code block match found, replacing content');
				replacements++;
				return `\`\`\`go\n${newCode}\n\`\`\``;
			}
			
			logger.debug('Code block does not match, keeping original');
			return match; // Return unchanged if not a match
		});
		
		logger.debug(`Code block replacement complete`, { 
			matches, 
			replacements 
		});
		
		if (matches === 0) {
			logger.warn('No Go code blocks found in content');
		} else if (replacements === 0) {
			logger.warn('Go code blocks found but none matched the original content');
		}
		
		return result;
	}
}