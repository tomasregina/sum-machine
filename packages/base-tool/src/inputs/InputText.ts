import { html, css, property, TemplateResult, customElement } from 'lit-element';
import { nothing } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined';
import { BaseElement } from '../BaseElement';
import { Icons } from '../enums';

@customElement('gynzy-input-text')
export class InputText extends BaseElement {
	static styles = css`
		div.iwb-container {
			display: flex;
			flex-direction: row;

			border: 1px solid;
			border-color: var(--color-heather);
			border-radius: 4px;
		}

		div.iwb-container > input {
			flex-grow: 2;
			border: none;
			border-radius: 4px;

			font-family: var(--font-family-base);
			color: var(--color-midnight);
			font-weight: 400;
			padding: calc(var(--px-rem-ratio) * 8) calc(var(--px-rem-ratio) * 12);
			line-height: calc(var(--px-rem-ratio) * 24);
			font-size: calc(var(--px-rem-ratio) * 16);
			outline: 0;

			width: 100%;
		}

		div.iwb-container:focus-within {
			outline: none;
			border-color: var(--color-mariner);
		}

		div.iwb-container > button {
			font-size: calc(var(--px-rem-ratio) * 16);
			cursor: pointer;
			margin: 0;
			padding: 0 calc(var(--px-rem-ratio) * 12);
			background: none;
			border: none;
			line-height: 0;
			filter: var(--color-filter-shuttle-gray);
			outline: 0;
		}
		div.iwb-container > button > img {
			width: calc(var(--px-rem-ratio) * 12);
		}

		/* small size */
		div.iwb-container > input.small {
			padding: calc(var(--px-rem-ratio) * 7) calc(var(--px-rem-ratio) * 8);
			line-height: calc(var(--px-rem-ratio) * 18);
			font-size: calc(var(--px-rem-ratio) * 12);
			vertical-align: middle;
		}
		div.iwb-container > button {
			font-size: calc(var(--px-rem-ratio) * 12);
			padding: 0 1.5rem;
		}

		.label {
			display: block;
			margin-bottom: calc(var(--px-rem-ratio) * 8);
		}
	`;

	@property({ type: String }) id = '';

	@property({ type: String }) name = '';

	@property({ type: String }) value = '';

	@property({ type: String }) placeholder = '';

	@property({ type: String }) label = '';

	@property({ type: Boolean }) showPlaceholder = true;

	@property({ type: String }) size: 'small' | 'medium' | 'large' = 'medium'; // "large" (not yet styled)

	@property({ type: Boolean }) disabled = false;

	@property({ type: Number }) maxLength = 0;

	@property({ type: String }) maxWidth = '';

	@property({ type: Boolean }) hasLabel = true;

	@property({ type: Boolean }) isNullable = false;

	@property({ type: Boolean }) isPastable = false;

	constructor() {
		super();
		this.addEventListener('focus', this._handleFocus);
		this.addEventListener('blur', this._handleBlur);
	}

	render(): TemplateResult {
		return html`
			${!!this.maxWidth
				? html`
						<style>
							div.iwb-container {
								width: ${this.maxWidth};
							}
						</style>
				  `
				: nothing}
			${this.hasLabel && this.label !== ''
				? html`<gynzy-settings-label class="label">${this.label}</gynzy-settings-label>`
				: nothing}
			<div class="iwb-container">
				<input
					class="input-with-buttons ${this.size}"
					maxlength=${ifDefined(this.maxLength > 0 ? this.maxLength : undefined)}
					.id=${this.id}
					.name=${this.name}
					.value=${this.value}
					placeholder=${ifDefined(this.showPlaceholder ? this.placeholder : undefined)}
					.disabled=${this.disabled}
					@input=${this._onInputChange}
				/>
				${this.isNullable && this.value.length > 0
					? html`
							<button @click=${this._nullInput}>
								<img src="${this.getBaseAssetPath(`icons/icon-${Icons.CLEAR_INPUT}.svg`)}" alt="input-icon" />
							</button>
					  `
					: nothing}
				${this.isPastable && this.value.length === 0
					? html`
							<button @click=${this._pasteIntoInput}>
								<img src="${this.getBaseAssetPath(`icons/icon-${Icons.COPY_PASTE}.svg`)}" alt="input-icon" />
							</button>
					  `
					: nothing}
			</div>
		`;
	}

	_onInputChange(event: { target: { value: string } }): void {
		this.value = event.target.value;
		this._onChange();
	}

	private _handleFocus(): void {
		this.showPlaceholder = false;
	}

	private _handleBlur(): void {
		this.showPlaceholder = true;
	}

	private _nullInput(): void {
		this.value = '';
		this._onChange();
	}

	private _pasteIntoInput(): void {
		navigator.clipboard.readText().then(text => {
			if (text !== '') this.value = text.trim();
			this._onChange();
			return false;
		});
	}

	private _onChange() {
		this.dispatchEvent(
			new CustomEvent('inputChange', {
				detail: {
					id: this.id,
					name: this.name,
					value: this.value,
				},
			})
		);
	}
}
