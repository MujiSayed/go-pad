export const WIDGET_STYLES = `
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

export function injectStyles(): void {
	if (document.querySelector('#go-pad-styles')) return;

	const style = document.createElement('style');
	style.id = 'go-pad-styles';
	style.textContent = WIDGET_STYLES;
	document.head.appendChild(style);
}