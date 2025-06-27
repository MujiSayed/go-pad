import { GoPlaygroundResponse } from '../types';
import { GO_PLAYGROUND_API } from './constants';

export class GoPlaygroundService {
	/**
	 * Execute Go code using the Go Playground API
	 */
	static async executeCode(code: string): Promise<GoPlaygroundResponse> {
		const response = await fetch(GO_PLAYGROUND_API.COMPILE_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
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
	static async validateCode(code: string): Promise<{ isValid: boolean; errors?: string }> {
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
	static extractOutput(response: GoPlaygroundResponse): string {
		if (response.Events && response.Events.length > 0) {
			return response.Events
				.filter(event => event.Kind === 'stdout')
				.map(event => event.Message)
				.join('');
		}
		return '';
	}

	/**
	 * Check if response contains errors
	 */
	static hasErrors(response: GoPlaygroundResponse): boolean {
		return !!(response.Errors && response.Errors.trim());
	}

	/**
	 * Get error message from response
	 */
	static getErrors(response: GoPlaygroundResponse): string {
		return response.Errors || '';
	}
}