import { css } from 'lit-element';
import { BaseRoot } from './BaseRoot';

export class BaseSettings extends BaseRoot {
	private _saveEnabled = true;

	public static styles = [
		css`
			:host {
				font-family: var(--font-family-base);
				font-weight: 400;
				color: var(--color-shuttle-grey);
				width: 100%;
			}

			.settings-component {
				display: flex;
				padding: calc(var(--px-rem-ratio) * 32) 0;
			}

			.settings-column {
				display: flex;
				flex-direction: column;
				flex: 1;
				padding: 0 calc(var(--px-rem-ratio) * 32);
			}

			.settings-column.narrow {
				flex: 0 1 auto;
			}

			.settings-column:not(:last-child) {
				border-right: 1px solid var(--color-ghost);
			}

			.settings-section {
				display: flex;
				flex-direction: column;
				flex-wrap: wrap;
			}

			.settings-section:not(:first-of-type) {
				margin-top: calc(var(--px-rem-ratio) * 24);
			}

			.settings-section > *:not(:last-child) {
				margin-bottom: calc(var(--px-rem-ratio) * 8);
			}

			.d-flex {
				display: flex;
				flex-direction: column;
			}

			.flex-row {
				flex-direction: row;
			}

			.flex-column {
				flex-direction: column;
			}

			.spacing-right-small > *:not(:last-child) {
				margin-right: calc(var(--px-rem-ratio) * 8);
			}

			.spacing-right-medium > *:not(:last-child) {
				margin-right: calc(var(--px-rem-ratio) * 12);
			}

			.spacing-right-large > *:not(:last-child) {
				margin-right: calc(var(--px-rem-ratio) * 24);
			}

			.spacing-bottom-small > *:not(:last-child) {
				margin-bottom: calc(var(--px-rem-ratio) * 8);
			}
		`,
	];

	/**
	 * dispatch 'updateSaveButton' event to enable or disable save settings button on board
	 */
	protected enableSaveButton(isEnabled: boolean): void {
		if (isEnabled !== this._saveEnabled) {
			this._saveEnabled = isEnabled;
			const event = new CustomEvent('updateSaveButton', {
				detail: {
					enabled: this._saveEnabled,
				},
			});
			this.dispatchEvent(event);
		}
	}

	/**
	 * dispatch 'updateSettings' event so the host application can track the changed settings
	 * @param toolData {Record<string, unknown>} - object with updated settings- or tooldata
	 * the default options suggest: avoid the object type, use Record<string, unknown>
	 * https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/ban-types.md#default-options
	 */
	protected updateSettings(toolData: Record<string, unknown>): void {
		const event = new CustomEvent('updateSettings', {
			detail: toolData,
		});
		this.dispatchEvent(event);
	}
}
