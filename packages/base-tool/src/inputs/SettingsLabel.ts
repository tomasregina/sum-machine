import { html, css, TemplateResult, customElement } from 'lit-element';
import { BaseElement } from '../BaseElement';

@customElement('gynzy-settings-label')
export class SettingsLabel extends BaseElement {
	static styles = css`
		label {
			display: block;
			font-size: calc(var(--px-rem-ratio) * 16);
			color: var(--color-riverbed);
			word-break: break-word;
			line-height: calc(var(--px-rem-ratio) * 24);
			font-weight: 600;
		}
	`;

	render(): TemplateResult {
		return html` <label><slot></slot></label> `;
	}
}
