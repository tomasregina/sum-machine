import { html, css, property, TemplateResult, customElement } from 'lit-element';
import { BaseElement } from '../BaseElement';
import { Environments } from '../enums';

@customElement('gynzy-input-radio-color')
export class InputRadioColor extends BaseElement {
	static styles = css`
		label {
			font-size: calc(var(--px-rem-ratio) * 16);
			word-break: break-word;
			line-height: calc(var(--px-rem-ratio) * 24);
			font-family: var(--font-family-base);
			font-weight: 400;
			color: var(--color-shuttle-gray);
			display: flex;
			cursor: pointer;
			user-select: none;
			width: fit-content;
			min-width: calc(var(--px-rem-ratio) * 32);
		}

		svg {
			width: calc(var(--px-rem-ratio) * 32);
			height: calc(var(--px-rem-ratio) * 32);

			border: 0.32rem solid transparent;
			border-radius: 50%;
		}

		/* PX units for tool env */
		label.environment--tool {
			font-size: 16px;
			line-height: 24px;
			min-width: 32px;
		}

		.environment--tool > svg {
			width: 32px;
			height: 32px;
			border: 2px solid transparent;
		}

		.color--white > svg #radiobtn_inside {
			stroke: var(--color-heather);
			stroke-width: 1px;
		}

		svg #radiobtn_outside {
			fill: var(--color-white);
		}
		svg #radiobtn_inside {
			fill: var(--color-alabaster);
		}
		label input {
			display: none;
		}
		input:checked + svg {
			border-color: var(--color-mariner);
		}

		#shadow {
			clip-path: polygon(0% 0%, 100% 100%, 0% 100%);
			fill: black;
			opacity: 0.05;
		}
	`;

	@property({ type: String }) id = '';

	@property({ type: String }) name = '';

	@property({ type: String }) value = '';

	@property({ type: String }) color = 'mariner'; // default blue

	@property({ type: Boolean }) checked = false;

	/**
	 * input environment style
	 * values:
	 * tool - input is styled in px
	 * settings (default) - input is styled in rem
	 */
	@property({ type: String }) environment: Environments = Environments.SETTINGS;

	render(): TemplateResult {
		return html`
			<style>
				input:checked + svg #radiobtn_inside {
					fill: var(--color-${this.color});
				}
				input:not(:checked) + svg #radiobtn_inside {
					fill: var(--color-${this.color});
					opacity: 1;
				}
			</style>

			<label class="environment--${this.environment} color--${this.color}">
				<input type="radio" .id="${this.id}" .value=${this.value} .checked=${this.checked} @change=${this.onChange} />
				<svg
					width="100%"
					height="100%"
					viewBox="0 0 20 20"
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
					xmlns:xlink="http://www.w3.org/1999/xlink"
				>
					<g id="Assets" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
						<g id="radiobtn">
							<circle id="radiobtn_outside" cx="10" cy="10" r="10"></circle>
							<circle id="radiobtn_inside" cx="10" cy="10" r="9"></circle>
							<circle id="shadow" cx="10" cy="10" r="9"></circle>
						</g>
					</g>
				</svg>
			</label>
		`;
	}

	onChange(): void {
		this.dispatchEvent(
			new CustomEvent('change', {
				detail: {
					id: this.id,
					name: this.name,
					color: this.color,
				},
			})
		);
	}
}
