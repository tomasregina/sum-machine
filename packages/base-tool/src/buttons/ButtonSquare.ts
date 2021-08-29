import { html, css, property, TemplateResult, customElement } from 'lit-element';
import { ButtonColors, ButtonSizes, Environments } from '../enums';
import { BaseElement } from '../BaseElement';

@customElement('gynzy-button-square')
export class ButtonSquare extends BaseElement {
	static styles = [
		css`
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
				box-shadow: inset 0 -2px 0 0 rgba(0, 0, 0, 0.15);
			}

			button.color--primary img {
				filter: var(--color-filter-white);
			}

			button.color--primary:hover {
				background-color: var(--color-mariner-light);
			}

			button.color--primary:active {
				background-color: var(--color-mariner-dark);
				box-shadow: none;
			}

			button:active img,
			button:active span {
				opacity: 0.7;
			}

			button.color--secondary {
				color: var(--color-shuttle-gray);
				background-color: var(--color-solitude);
				box-shadow: inset 0 -2px 0 0 rgba(0, 0, 0, 0.15);
			}

			button.color--secondary img {
				filter: var(--color-filter-shuttle-gray);
			}

			button.color--secondary:hover {
				background-color: var(--color-aqua-haze);
			}

			button.color--secondary:active {
				background-color: var(--color-ghost);
				box-shadow: none;
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

			/* large */

			button.size--large {
				padding: 12px;
				font-size: 20px;
				min-height: 40px;
				border-radius: 6px;
			}

			button.size--large img {
				width: 20px;
				height: 20px;
			}

			button.size--large.environment--settings {
				padding: 0.89rem 2.04rem;
				font-size: calc(var(--px-rem-ratio) * 20);
				min-height: calc(var(--px-rem-ratio) * 40);
				border-radius: 6px;
			}

			button.size--large.environment--settings img {
				width: calc(var(--px-rem-ratio) * 20);
				height: calc(var(--px-rem-ratio) * 20);
			}

			/* medium */

			button.size--medium {
				padding: 12px;
				font-size: 16px;
				min-height: 40px;
				border-radius: 6px;
			}

			button.size--medium img {
				width: 16px;
				height: 16px;
			}

			button.size--medium.environment--settings {
				padding: 0.89rem 2.04rem;
				font-size: 1.66rem;
				min-height: 4.17rem;
				border-radius: 0.63rem;
			}

			button.size--medium.environment--settings img {
				width: 1.66rem;
				height: 1.66rem;
			}

			/* small */

			button.size--small {
				padding: 10px;
				font-size: 12px;
				min-height: 32px;
				border-radius: 4px;
			}

			button.size--small img {
				width: 12px;
				height: 12px;
			}

			button.size--small.environment--settings {
				padding: 0.63rem 1.56rem;
				font-size: 1.25rem;
				min-height: 3.13rem;
				border-radius: 0.52rem;
			}

			button.size--small.environment--settings img {
				width: 1.25rem;
				height: 1.25rem;
			}
		`,
	];

	@property({ type: String }) icon = '';

	/**
	 * button color style
	 * values: primary (default), secondary, light
	 */
	@property({ type: String }) color: ButtonColors = ButtonColors.PRIMARY;

	/**
	 * button size style
	 * values: medium (default), small
	 */
	@property({ type: String }) size: ButtonSizes = ButtonSizes.MEDIUM;

	/**
	 * button environment style
	 * values:
	 * tool (default) - button is styled in px
	 * settings - button is styled in rem
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
