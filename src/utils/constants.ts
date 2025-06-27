export const GO_PLAYGROUND_API = {
	COMPILE_URL: 'https://play.golang.org/compile',
	VERSION: '2',
	WITH_VET: true,
} as const;

export const WIDGET_CONFIG = {
	DEBOUNCE_DELAY: 1500, // Increased for better typing experience
	SYNC_DELAY: 2000, // Increased to reduce file operations
	RESIZE_DEBOUNCE: 150, // Quick resize without validation/sync
	MAX_HEIGHT: 500,
	MIN_HEIGHT: 60,
	LINE_HEIGHT: 20,
	LARGE_CONTENT_THRESHOLD: 20, // Lines - when to enable unlimited height
	TEXTAREA_PADDING: 8, // Textarea internal padding
	CONTAINER_PADDING: 16, // Container padding  
	BORDER_WIDTH: 2, // Top and bottom borders (1px each)
	HEIGHT_BUFFER: 4, // Extra pixels to prevent scroll bars
} as const;

export const CSS_CLASSES = {
	WIDGET: 'go-pad-widget',
	WRAPPER: 'go-pad-wrapper',
	HEADER: 'go-pad-header',
	TITLE: 'go-pad-title',
	STATUS: 'go-pad-status',
	CHANGES: 'go-pad-changes',
	RUN_BUTTON: 'go-pad-run-btn',
	EDITOR: 'go-pad-editor',
	TEXTAREA: 'go-pad-textarea',
	ERRORS: 'go-pad-errors',
	ERRORS_LABEL: 'go-pad-errors-label',
	ERRORS_CONTENT: 'go-pad-errors-content',
	OUTPUT: 'go-pad-output',
	OUTPUT_LABEL: 'go-pad-output-label',
	OUTPUT_CONTENT: 'go-pad-output-content',
} as const;

export const STATUS_CLASSES = {
	OK: 'go-pad-status-ok',
	ERROR: 'go-pad-status-error',
	VALIDATING: 'go-pad-status-validating',
	LOADING: 'go-pad-loading',
} as const;

export const CHANGE_CLASSES = {
	MODIFIED: 'go-pad-changes-modified',
	SYNCED: 'go-pad-changes-synced',
	ERROR: 'go-pad-changes-error',
} as const;

export const SELECTORS = {
	GO_CODE_BLOCKS: [
		'pre > code.language-go',
		'pre > code[class*="language-go"]',
		'code.language-go',
		'code[class*="language-go"]',
		'pre > code[class*="go"]',
		'code[class*="go"]',
	],
} as const;

export const MESSAGES = {
	PLUGIN_LOADED: 'Go Pad plugin loaded!',
	NO_OUTPUT: 'No output',
	CLICK_RUN: 'Click "Run" to execute code',
	RUNNING: 'Running...',
	READY: '✓ Ready',
	VALIDATING: '⏳ Validating...',
	MODIFIED: '● Modified',
	SYNCED: '✓ Synced',
	NO_ERRORS: 'No errors detected',
	SYNTAX_ERRORS: 'Syntax Errors:',
	OUTPUT_LABEL: 'Output:',
} as const;

export const LOGGING = {
	// Set to true for development, false for production
	DEVELOPMENT_MODE: false,
	// Prefix for all log messages
	PREFIX: 'Go Pad',
} as const;