import { html, css, property, TemplateResult, customElement, PropertyValues } from 'lit-element';
import { ButtonSquare } from '../buttons/ButtonSquare';
import { ButtonSizes, Environments, Icons } from '../enums';

@customElement('gynzy-input-digit')
export class InputDigit extends ButtonSquare {
	static styles = [
		...ButtonSquare.styles,
		css`
			.input-container {
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.input-group {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
			}

			.number-display {
				background-color: white;
				display: flex;
				justify-content: center;
				align-items: center;
				color: var(--color-midnight);
				border: 1px solid;
				border-color: var(--color-heather);
				border-radius: 4px;
				font-weight: 600;
			}

			/* sizes */

			/* medium */
			.number-display.size--medium {
				font-size: 20px;
				width: 40px;
				height: 40px;
			}

			button.size--medium {
				width: 24px;
				height: 24px;
				min-height: 24px;
			}
			button.size--medium.environment--settings {
				width: calc(var(--px-rem-ratio) * 24);
				height: calc(var(--px-rem-ratio) * 24);
				min-height: calc(var(--px-rem-ratio) * 24);
			}

			button.size--medium img {
				width: 12px;
				height: 12px;
			}

			button.size--medium.environment--settings img {
				width: calc(var(--px-rem-ratio) * 12);
				height: calc(var(--px-rem-ratio) * 12);
			}

			/* large */
			.number-display.size--large {
				font-size: 32px;
				width: 56px;
				height: 64px;
			}

			button.size--large {
				width: 40px;
				height: 40px;
				min-height: 40px;
			}
			button.size--large.environment--settings {
				width: calc(var(--px-rem-ratio) * 40);
				height: calc(var(--px-rem-ratio) * 40);
				min-height: calc(var(--px-rem-ratio) * 40);
			}

			button.size--large img {
				width: 24px;
				height: 24px;
			}

			button.size--large.environment--settings img {
				width: calc(var(--px-rem-ratio) * 24);
				height: calc(var(--px-rem-ratio) * 24);
			}

			/* borders */
			.input-group > :first-child {
				border-bottom-left-radius: 0;
				border-bottom-right-radius: 0;
				box-shadow: none;
			}
			.input-group > :last-child {
				border-top-left-radius: 0;
				border-top-right-radius: 0;
			}
		`,
	];

	@property({ type: String }) id = '';

	@property({ type: String }) name = '';

	/**
	 * true: each digit is independent (0 - 9),
	 * false (default): with number 29, next click on + button for ones will change number to 30
	 */
	@property({ type: Boolean }) independent = false;

	@property({ type: Number }) value: number | undefined = undefined;

	@property({ type: Array }) valueArray: number[] = [];

	@property({ type: String }) size: ButtonSizes = ButtonSizes.MEDIUM;

	@property({ type: Number }) digitLength: number | undefined = undefined;

	@property({ type: Array }) inputs: TemplateResult[] = [];

	/**
	 * input environment style
	 * values:
	 * tool - input is styled in px
	 * settings (default) - input is styled in rem
	 */
	@property({ type: String }) environment: Environments = Environments.SETTINGS;

	@property({ type: Array }) inputElements: TemplateResult[] = [];

	updated(changedProperties: PropertyValues): void {
		changedProperties.forEach((_, propName) => {
			switch (propName) {
				case 'value':
					this._parseValueToArray();
					this._fillValueArrayWithBlanks();
					break;

				case 'digitLength':
					this._parseValueToArray();
					this._fillValueArrayWithBlanks();
					break;
				default:
					break;
			}
		});
	}

	private _parseValueToArray(): void {
		if (this.value !== undefined) {
			this.valueArray = Array.from(this.value.toString()).map(Number);
		} else {
			this.valueArray = [];
		}
	}

	private _fillValueArrayWithBlanks(): void {
		if (this.digitLength !== undefined) {
			const difference = this.digitLength - this.valueArray.length;
			if (this.valueArray.length < this.digitLength) {
				for (let i = 0; i < difference; i++) {
					this.valueArray.unshift(0);
				}
			}
		}
	}

	private _changeValue(action: string, index: number) {
		switch (action) {
			case 'plus':
				if (this.independent) {
					if (this.valueArray[index] === 9) return;
					this.valueArray[index] += 1;
				} else {
					if (index !== 0 && this.valueArray[index] === 9 && this.valueArray[index - 1] !== 9) {
						// cross tens
						this.valueArray[index] = 0;
						this.valueArray[index - 1] += 1;
						break;
					}
					// regular plus
					if (this.valueArray[index] === 9) return;
					this.valueArray[index] += 1;
				}
				break;
			case 'minus':
				if (this.independent) {
					if (this.valueArray[index] === 0) return;
					this.valueArray[index] -= 1;
				} else {
					if (index !== 0 && this.valueArray[index] === 0 && this.valueArray[index - 1] !== 0) {
						// cross tens
						this.valueArray[index] = 9;
						this.valueArray[index - 1] -= 1;
						break;
					}
					// regular minus
					if (this.valueArray[index] === 0) return;
					this.valueArray[index] -= 1;
				}
				break;
			default:
				break;
		}

		this.requestUpdate();
		this._onChange();
	}

	private _disableButtons(index: number, edge: number): boolean {
		if (this.independent) {
			return this.valueArray[index] === edge;
		}

		if (index === this.valueArray.length - 1) {
			// last
			if (this.valueArray[index] === edge && this.valueArray.every(n => n === edge)) return true;
		} else if (index > 0 && index < this.valueArray.length - 1) {
			// any middle
			if (this.valueArray[index] === edge && this.valueArray[index - 1] === edge) return true;
		} else if (index === 0) {
			// first
			if (this.valueArray[index] === edge) return true;
		}

		return false;
	}

	private _onChange(): void {
		this.dispatchEvent(
			new CustomEvent('change', {
				detail: {
					id: this.id,
					name: this.name,
					value: Number(this.valueArray.join('')),
				},
			})
		);
	}

	render(): TemplateResult {
		return html`
			<style>
				${this.valueArray.length > 1
					? css`
							.input-group:nth-child(n + 2) .number-display {
								border-left: 0;
							}
							.input-group:nth-child(n + 2):not(:last-child) .number-display {
								border-radius: 0;
							}
							.input-group:last-child .number-display {
								border-top-left-radius: 0;
								border-bottom-left-radius: 0;
							}
							.input-group:nth-child(1) .number-display {
								border-top-right-radius: 0;
								border-bottom-right-radius: 0;
							}
					  `
					: ''}
			</style>

			<div class="input-container">
				${this.valueArray.map(
					(val, index) => html`
						<div class="input-group">
							<button
								@click=${() => this._changeValue('plus', index)}
								class="color--${this.color} size--${this.size} environment--${this.environment} disable--board--drag"
								.disabled=${this._disableButtons(index, 9)}
							>
								<img src="${this.getBaseAssetPath(`icons/icon-${Icons.PLUS}.svg`)}" alt="icon" draggable="false" />
							</button>

							<div class="number-display size--${this.size}">${val}</div>

							<button
								@click=${() => this._changeValue('minus', index)}
								class="color--${this.color} size--${this.size} environment--${this.environment} disable--board--drag"
								.disabled=${this._disableButtons(index, 0)}
							>
								<img src="${this.getBaseAssetPath(`icons/icon-${Icons.MINUS}.svg`)}" alt="icon" draggable="false" />
							</button>
						</div>
					`
				)}
			</div>
		`;
	}
}
