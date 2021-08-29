import { html, css, property, TemplateResult, customElement } from 'lit-element';
import { ButtonOrientations, Icons } from '../enums';
import { ButtonSquare } from './ButtonSquare';

@customElement('gynzy-button-group')
export class ButtonGroup extends ButtonSquare {
	static styles = [
		...ButtonSquare.styles,

		css`
			/* icon size changes */
			button.size--medium img {
				width: 20px;
				height: 20px;
			}

			button.size--medium.environment--settings img {
				width: calc(var(--px-rem-ratio) * 20);
				height: calc(var(--px-rem-ratio) * 20);
			}

			/* group styling */
			.button-group {
				display: flex;
			}

			.button-group.orientation--vertical {
				flex-direction: column;
			}
			.button-group.orientation--vertical > :first-child {
				border-bottom-left-radius: 0;
				border-bottom-right-radius: 0;
				box-shadow: none;
				border-bottom: 1px solid;
				border-color: var(--color-mariner-dark);
			}
			.button-group.orientation--vertical > :last-child {
				border-top-left-radius: 0;
				border-top-right-radius: 0;
				/* box-shadow: none; */
			}

			.button-group.orientation--horizontal {
				flex-direction: row;
			}
			.button-group.orientation--horizontal > :first-child {
				border-top-right-radius: 0;
				border-bottom-right-radius: 0;
				box-shadow: none;
			}
		`,
	];

	@property({ type: String }) orientation: ButtonOrientations = ButtonOrientations.VERTICAL;

	@property({ type: Array }) icons: Icons[] = [];

	@property({ type: Array }) groupDisabled: boolean[] = [];

	private _onClick(button: string): void {
		this.dispatchEvent(
			new CustomEvent('onClick', {
				detail: {
					button,
				},
			})
		);
	}

	render(): TemplateResult {
		return html`
			<div class="button-group orientation--${this.orientation}">
				<button
					@click=${() => this._onClick('first')}
					class="color--${this.color} size--${this.size} environment--${this.environment} disable--board--drag"
					.disabled=${this.groupDisabled[0]}
				>
					${this.icons[0]
						? html`<img
								src="${this.getBaseAssetPath(`icons/icon-${this.icons[0]}.svg`)}"
								alt="icon"
								draggable="false"
						  />`
						: ''}
				</button>

				<button
					@click=${() => this._onClick('second')}
					class="color--${this.color} size--${this.size} environment--${this.environment} disable--board--drag"
					.disabled=${this.groupDisabled[1]}
				>
					${this.icons[1]
						? html`<img
								src="${this.getBaseAssetPath(`icons/icon-${this.icons[1]}.svg`)}"
								alt="icon"
								draggable="false"
						  />`
						: ''}
				</button>
			</div>
		`;
	}
}
