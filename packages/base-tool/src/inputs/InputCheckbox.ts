import { html, css, property, TemplateResult, customElement } from 'lit-element';
import { BaseElement } from '../BaseElement';

@customElement('gynzy-input-checkbox')
export class InputCheckbox extends BaseElement {
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
		label.disabled {
			opacity: 0.5;
			cursor: auto;
		}
		svg {
			width: calc(var(--px-rem-ratio) * 20);
			height: calc(var(--px-rem-ratio) * 20);
			border: 1px solid;
			border-radius: 0.42rem;
			border-color: var(--color-heather);

			margin-right: calc(var(--px-rem-ratio) * 12);
			flex-shrink: 0;
		}

		svg #checkbox {
			width: 100%;
		}
		svg #checkbox_outside {
			fill: var(--color-white);
		}
		svg #checkbox_inside {
			fill: var(--color-alabaster);
		}
		svg #checkmark,
		#indeterminate {
			opacity: 0;
			fill: var(--color-white);
		}
		label input {
			display: none;
		}
		input:checked + svg,
		input.indeterminate + svg {
			border-color: var(--color-mariner);
			background-color: var(--color-mariner);
		}
		input:checked + svg #checkbox_inside,
		input.indeterminate + svg #checkbox_inside,
		input:checked + svg #checkbox_outside,
		input.indeterminate + svg #checkbox_outside {
			fill: var(--color-mariner);
		}
		input:checked + svg #checkmark {
			opacity: 1;
		}
		input:not(:checked).indeterminate + svg #indeterminate {
			opacity: 1;
		}
		input:not(:checked):not(.indeterminate):not(:disabled):hover + svg #checkbox_inside {
			fill: var(--color-mariner);
			opacity: 0.2;
		}
		input:checked:not(:disabled):hover + svg,
		input.indeterminate:not(:disabled):hover + svg {
			border-color: var(--color-mariner-light);
			background-color: var(--color-mariner-light);
		}
		input:checked:not(:disabled):hover + svg #checkbox_inside,
		input.indeterminate:not(:disabled):hover + svg #checkbox_inside,
		input:checked:not(:disabled):hover + svg #checkbox_outside,
		input.indeterminate:not(:disabled):hover + svg #checkbox_outside {
			fill: var(--color-mariner-light);
		}
	`;

	@property({ type: String }) id = '';

	@property({ type: String }) value = '';

	@property({ type: String }) name = '';

	@property({ type: String }) label = '';

	@property({ type: Boolean }) indeterminate = false;

	@property({ type: Boolean }) checked = false;

	@property({ type: Boolean }) disabled = false;

	render(): TemplateResult {
		return html`
			<label class="${this.disabled ? 'disabled' : ''}">
				<input
					class="${this.indeterminate ? 'indeterminate' : ''}"
					type="checkbox"
					.id="${this.id}"
					.value=${this.value}
					.name=${this.name}
					.checked=${this.checked}
					.disabled=${this.disabled}
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
						<g id="checkbox">
							<path
								d="M4,0 L16,0 C18.209139,-4.05812251e-16 20,1.790861 20,4 L20,16 C20,18.209139 18.209139,20 16,20 L4,20 C1.790861,20 2.705415e-16,18.209139 0,16 L0,4 C-2.705415e-16,1.790861 1.790861,4.05812251e-16 4,0 Z"
								id="checkbox_outside"
							></path>
							<path
								d="M4,3 L16,3 C16.5522847,3 17,3.44771525 17,4 L17,16 C17,16.5522847 16.5522847,17 16,17 L4,17 C3.44771525,17 3,16.5522847 3,16 L3,4 C3,3.44771525 3.44771525,3 4,3 Z"
								id="checkbox_inside"
							></path>
							<path
								d="M16.4871819,7.38057068 C16.4871819,7.58983432 16.4034764,7.79909796 16.2528066,7.94976779 L9.05413728,15.1484371 C8.90346745,15.2991069 8.69420381,15.3828124 8.48494017,15.3828124 C8.27567653,15.3828124 8.06641289,15.2991069 7.91574306,15.1484371 L3.74721131,10.9799053 C3.59654149,10.8292355 3.51283603,10.6199719 3.51283603,10.4107082 C3.51283603,10.2014446 3.59654149,9.99218093 3.74721131,9.84151111 L4.88560552,8.7031169 C5.03627534,8.55244708 5.24553899,8.46874162 5.45480263,8.46874162 C5.66406627,8.46874162 5.87332991,8.55244708 6.02399974,8.7031169 L8.48494017,11.1724279 L13.9760181,5.67297936 C14.126688,5.52230953 14.3359516,5.43860408 14.5452153,5.43860408 C14.7544789,5.43860408 14.9637425,5.52230953 15.1144124,5.67297936 L16.2528066,6.81137357 C16.4034764,6.96204339 16.4871819,7.17130704 16.4871819,7.38057068 Z"
								id="checkmark"
								fill="#FFFFFF"
							></path>
							<path
								id="indeterminate"
								fill="#FFFFFF"
								d="M 17.019 9.268 L 17.019 10.732 C 17.019 10.936 16.926 11.109 16.74 11.251 C 16.554 11.393 16.328 11.465 16.062 11.465 L 3.938 11.465 C 3.672 11.465 3.446 11.393 3.26 11.251 C 3.074 11.109 2.981 10.936 2.981 10.732 L 2.981 9.268 C 2.981 9.065 3.074 8.892 3.26 8.75 C 3.446 8.608 3.672 8.536 3.938 8.536 L 16.062 8.536 C 16.328 8.536 16.554 8.608 16.74 8.75 C 16.926 8.892 17.019 9.065 17.019 9.268 Z"
							></path>
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
					value: this.value,
					name: this.name,
					label: this.label,
				},
			})
		);
	}
}
