import { html, css, property, TemplateResult, customElement } from 'lit-element';
import { ButtonColors, ButtonSizes, Environments } from '../enums';
import { BaseElement } from '../BaseElement';

@customElement('gynzy-button-round')
export class ButtonRound extends BaseElement {
	static styles = css`
		button {
			position: relative;
			text-decoration: none;
			text-indent: 0;
			cursor: pointer;
			user-select: none;
			white-space: nowrap;
			font-family: var(--font-family-base);
			font-style: normal;
			font-weight: 600;
			display: flex;
			align-items: center;
			text-align: center;
			flex-direction: row;
			justify-content: center;
			outline: 0;
			border: none;
			border-radius: 50%;

			transition-property: background-color, box-shadow, color, opacity;
			transition-duration: var(--button-transition-duration);
		}

		button img {
			transition-property: filter, opacity;
			transition-duration: var(--button-transition-duration);
		}

		button.color--primary {
			color: var(--color-white);
			background-color: var(--color-mariner);
		}

		button.color--primary img {
			filter: var(--color-filter-white);
		}

		button.color--primary:hover {
			background-color: var(--color-mariner-light);
		}

		button.color--primary:active {
			background-color: var(--color-mariner-dark);
		}

		button:active img {
			opacity: 0.7;
		}

		button.color--secondary {
			color: var(--color-shuttle-gray);
			background-color: var(--color-solitude);
		}

		button.color--secondary img {
			filter: var(--color-filter-shuttle-gray);
		}

		button.color--secondary:hover {
			background-color: var(--color-aqua-haze);
		}

		button.color--secondary:active {
			background-color: var(--color-ghost);
		}

		button.color--light {
			color: var(--color-shuttle-gray);
			border: 1px solid var(--color-heather);
			background-color: var(--color-white);
		}

		button.color--light img {
			filter: var(--color-shuttle-gray);
		}

		button.color--light:hover {
			color: var(--color-mariner);
		}

		button.color--light:hover img {
			filter: var(--color-filter-mariner);
		}

		button.color--light:active {
			background-color: var(--color-aqua-haze);
		}

		button:disabled {
			cursor: default;
			opacity: 0.5;
			pointer-events: none;
		}

		button.color--light:disabled img {
			opacity: 0.5;
		}

		button.size--large {
			width: 32px;
			height: 32px;
		}

		button.size--large img {
			width: 16px;
			height: 16px;
		}

		button.size--medium {
			width: 24px;
			height: 24px;
		}

		button.size--medium img {
			width: 12px;
			height: 12px;
		}

		button.size--small {
			width: 16px;
			height: 16px;
		}

		button.size--small img {
			width: 8px;
			height: 8px;
		}
	`;

	@property({ type: String }) icon = '';

	/**
	 * button color style
	 * values: primary (default), secondary, light
	 */
	@property({ type: String }) color: ButtonColors = ButtonColors.PRIMARY;

	/**
	 * button size style
	 * values: large, medium (default), small
	 */
	@property({ type: String }) size: ButtonSizes = ButtonSizes.MEDIUM;

	/**
	 * button environment style
	 * values:
	 * tool (default) - button is styled in px
	 * settings - button is styled in rem (not yet supported)
	 */
	@property({ type: String }) environment: Environments = Environments.TOOL;

	@property({ type: Boolean }) disabled = false;

	render(): TemplateResult {
		return html`
			<button
				class="color--${this.color} size--${this.size} environment--${this.environment} disable--board--drag"
				.disabled=${this.disabled}
			>
				${this.icon
					? html`<img src="${this.getBaseAssetPath(`icons/icon-${this.icon}.svg`)}" alt="icon" draggable="false" />`
					: ''}
			</button>
		`;
	}
}
