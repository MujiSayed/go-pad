export interface GoPlaygroundResponse {
	Events?: Array<{
		Kind: string;
		Message: string;
		Delay?: number;
	}>;
	Errors?: string;
	IsTest?: boolean;
	TestsFailed?: number;
	VetErrors?: string;
}

export interface SyncStatus {
	isModified: boolean;
	isSyncing: boolean;
	lastSyncTime?: number;
	errorMessage?: string;
}

export interface ValidationResult {
	isValid: boolean;
	errors?: string;
	warnings?: string;
}

export interface CodeBlockInfo {
	id: string;
	originalCode: string;
	currentCode: string;
	lineNumber?: number;
}

export interface GoCodeWidgetConfig {
	debounceDelay: number;
	syncDelay: number;
	maxHeight: number;
	minHeight: number;
	lineHeight: number;
}

export interface GoPadSettings {
	logLevel: LogLevel;
	enableAutoSync: boolean;
	enableValidation: boolean;
	maxWidgetHeight: number;
	enableSmartResize: boolean;
}

export enum LogLevel {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3,
	NONE = 4,
}