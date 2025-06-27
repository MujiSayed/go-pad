import { LogLevel } from '../types';

export class Logger {
	private static instance: Logger;
	private logLevel: LogLevel = LogLevel.WARN; // Default to WARN level for production
	private prefix = 'Go Pad';

	private constructor() {}

	static getInstance(): Logger {
		if (!Logger.instance) {
			Logger.instance = new Logger();
		}
		return Logger.instance;
	}

	setLogLevel(level: LogLevel): void {
		this.logLevel = level;
	}

	getLogLevel(): LogLevel {
		return this.logLevel;
	}

	debug(message: string, ...args: any[]): void {
		if (this.logLevel <= LogLevel.DEBUG) {
			console.debug(`[${this.prefix}:DEBUG]`, message, ...args);
		}
	}

	info(message: string, ...args: any[]): void {
		if (this.logLevel <= LogLevel.INFO) {
			console.info(`[${this.prefix}:INFO]`, message, ...args);
		}
	}

	warn(message: string, ...args: any[]): void {
		if (this.logLevel <= LogLevel.WARN) {
			console.warn(`[${this.prefix}:WARN]`, message, ...args);
		}
	}

	error(message: string, ...args: any[]): void {
		if (this.logLevel <= LogLevel.ERROR) {
			console.error(`[${this.prefix}:ERROR]`, message, ...args);
		}
	}

	// Convenience methods for common scenarios
	apiCall(operation: string, details?: any): void {
		this.debug(`API Call: ${operation}`, details);
	}

	fileOperation(operation: string, path?: string, details?: any): void {
		this.debug(`File Operation: ${operation}`, { path, ...details });
	}

	widgetEvent(event: string, details?: any): void {
		this.debug(`Widget Event: ${event}`, details);
	}

	syncOperation(operation: string, details?: any): void {
		this.info(`Sync: ${operation}`, details);
	}

	validation(result: string, details?: any): void {
		this.debug(`Validation: ${result}`, details);
	}

	// Development mode toggle
	enableDevelopmentMode(): void {
		this.setLogLevel(LogLevel.DEBUG);
		this.info('Development logging enabled');
	}

	enableProductionMode(): void {
		this.setLogLevel(LogLevel.WARN);
	}
}

// Export singleton instance
export const logger = Logger.getInstance();