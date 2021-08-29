import { html, css, property, TemplateResult, customElement } from 'lit-element';
import { BaseElement } from '../BaseElement';

@customElement('gynzy-input-radio')
export class InputRadio extends BaseElement {
	static styles = css`
		label {
			font-size: calc(var(--px-rem-ratio) * 16);
			line-height: calc(var(--px-rem-ratio) * 24);
			font-family: var(--font-family-base);
			font-weight: 400;
			color: var(--color-shuttle-gray);
			display: flex;
			cursor: pointer;
			user-select: none;
			width: fit-content;
		}
		svg {
			width: calc(var(--px-rem-ratio) * 20);
			height: calc(var(--px-rem-ratio) * 20);

			border: 1px solid;
			border-radius: 50%;
			border-color: var(--color-heather);

			margin-right: calc(var(--px-rem-ratio) * 12);
			flex-shrink: 0;
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
		input:checked + svg #radiobtn_inside {
			fill: var(--color-mariner);
		}
		input:not(:checked):hover + svg #radiobtn_inside {
			fill: var(--color-mariner);
			opacity: 0.2;
		}
	`;

	@property({ type: String }) id = '';

	@property({ type: String }) value = '';

	@property({ type: String }) name = '';

	@property({ type: String }) label = '';

	@property({ type: Boolean }) checked = false;

	render(): TemplateResult {
		return html`
			<label>
				<input
					type="radio"
					.id="${this.id}"
					.value=${this.value}
					.name=${this.name}
					.checked=${this.checked}
					@change=${this.onChange}
				/>
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
							<circle id="radiobtn_inside" cx="10" cy="10" r="6"></circle>
						</g>
					</g>
				</svg>
				${this.label}
			</label>
		`;
	}

	onChange(): void {
		this.dispatchEvent(
			new CustomEvent('change', {
				detail: {
					id: this.id,
					name: this.name,
					value: this.value,
					label: this.label,
				},
			})
		);
	}
}
