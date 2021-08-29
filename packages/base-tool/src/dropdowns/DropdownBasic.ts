import { html, css, property, TemplateResult, customElement, internalProperty, PropertyValues } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { StyleInfo, styleMap } from 'lit-html/directives/style-map';
import { PX_REM_RATIO } from '../../constants';
import { BaseElement } from '../BaseElement';
import { DropdownPositions, Environments } from '../enums';

@customElement('gynzy-dropdown-basic')
export class DropdownBasic extends BaseElement {
	private static OPTION_HEIGHT: number = 40;

	private static DROPDOWN_WINDOW_MARGIN: number = 16;

	static styles = css`
		:host {
			--dropdown-px-rem-ratio: var(--px-rem-ratio);
			--dropdown-option-border-height: 1px; /* not in rem */
		}

		.environment--tool {
			--dropdown-px-rem-ratio: 1px;
		}

		.custom-select-wrapper {
			position: relative;
			user-select: none;
			width: 100%;
			--dropdown-option-height: calc(var(--dropdown-px-rem-ratio) * 40);
		}
		.custom-select {
			position: relative;
			display: flex;
			flex-direction: column;
			border-radius: calc(var(--dropdown-px-rem-ratio) * 4);
		}

		.custom-select__trigger {
			position: relative;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 0 0 0 calc(var(--dropdown-px-rem-ratio) * 12);
			font-size: calc(var(--dropdown-px-rem-ratio) * 16);
			font-weight: 600;
			color: var(--color-shuttle-gray);
			height: var(--dropdown-option-height);
			line-height: var(--dropdown-option-height);
			background: var(--color-white);
			border-radius: calc(var(--dropdown-px-rem-ratio) * 4);
			border: 1px solid;
			border-color: var(--color-ghost);
			cursor: pointer;
			letter-spacing: calc(var(--dropdown-px-rem-ratio) * 0.5);
		}
		.custom-select__trigger.disabled {
			font-weight: 600;
			background: var(--color-aqua-haze);
			cursor: not-allowed;
		}
		.custom-select__trigger.disabled > span {
			opacity: 0.5;
		}
		.custom-select__trigger:not(.disabled):hover {
			color: var(--color-mariner);
		}
		.custom-select__trigger:not(.disabled):hover .icon--graphics {
			fill: var(--color-mariner);
		}
		.custom-options-wrapper {
			position: absolute;
			display: block;
			left: 0;
			right: 0;
			border: 1px solid var(--color-ghost);
			border-top: 0;
			opacity: 0;
			visibility: hidden;
			pointer-events: none;
			z-index: 2;
		}
		.custom-options {
			background: var(--color-aqua-haze);
			border-radius: inherit;
			overflow: hidden;
			white-space: nowrap;
			text-align: left;
		}
		.custom-options.has-overflow {
			overflow-y: scroll;
		}
		.custom-options-wrapper.arrow-up::before {
			pointer-events: none;
			content: ' ';
			width: 0;
			height: 0;
			border-style: solid;
			border-width: calc(var(--dropdown-px-rem-ratio) * 8);
			border-top-width: 0;
			border-color: transparent transparent var(--color-regent-gray) transparent;
			position: absolute;
			top: calc(var(--dropdown-px-rem-ratio) * 4);
			left: 50%;
			transform: translateX(-50%);
			z-index: 1;
		}

		.custom-options-wrapper.arrow-down::after {
			pointer-events: none;
			content: ' ';
			width: 0;
			height: 0;
			border-style: solid;
			border-width: calc(var(--dropdown-px-rem-ratio) * 8);
			border-bottom-width: 0;
			border-color: var(--color-regent-gray) transparent transparent transparent;
			position: absolute;
			top: calc(100% - var(--dropdown-px-rem-ratio) * 4);
			left: 50%;
			transform: translateX(-50%) translateY(-100%);
			z-index: 1;
		}

		.custom-select.open .custom-options-wrapper {
			opacity: 1;
			visibility: visible;
			pointer-events: all;
		}
		.custom-select.open,
		.custom-select.open .custom-select__trigger {
			background-color: var(--color-aqua-haze);
			color: var(--color-regent-gray);
			border-radius: calc(var(--dropdown-px-rem-ratio) * 4) calc(var(--dropdown-px-rem-ratio) * 4) 0 0;
			z-index: 3;
			font-weight: 400;
		}
		.custom-select.open .custom-select__trigger.top {
			border-radius: 0 0 calc(var(--dropdown-px-rem-ratio) * 4) calc(var(--dropdown-px-rem-ratio) * 4);
		}
		.custom-select.open .custom-options-wrapper.bottom {
			transform: translateY(calc(40 * var(--px-rem-ratio) + var(--dropdown-option-border-height)));
			border-radius: 0 0 calc(var(--dropdown-px-rem-ratio) * 4) calc(var(--dropdown-px-rem-ratio) * 4);
		}
		.custom-select.open .custom-options-wrapper.top {
			transform: translateY(calc(-100%));
			border-radius: calc(var(--dropdown-px-rem-ratio) * 4) calc(var(--dropdown-px-rem-ratio) * 4) 0 0;
			border-top: 1px solid var(--color-ghost);
			border-bottom: none;
		}
		.custom-option {
			position: relative;
			display: block;
			padding: 0 calc(var(--dropdown-px-rem-ratio) * 12);
			font-size: calc(var(--dropdown-px-rem-ratio) * 16);
			font-weight: 400;
			color: var(--color-midnight);
			line-height: var(--dropdown-option-height);
			height: var(--dropdown-option-height);
			cursor: pointer;
		}
		.custom-option:hover {
			cursor: pointer;
			background-color: var(--color-solitude);
		}
		.custom-option.selected {
			color: var(--color-mariner);
			font-weight: 600;
		}

		.arrow {
			height: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			width: calc(var(--dropdown-px-rem-ratio) * 40);
			border-left: 1px solid;
			border-color: var(--color-ghost);
		}

		.arrow svg {
			margin: 0 auto;
			width: calc(var(--dropdown-px-rem-ratio) * 14);
			height: calc(var(--dropdown-px-rem-ratio) * 14);
		}
		.open .arrow {
			display: none;
		}

		.icon--graphics {
			fill: var(--color-shuttle-gray);
		}
	`;

	@property({ type: Array }) options: string[] = []; // items

	@property({ type: Array }) labels: string[] | TemplateResult[] = []; // item labels

	@property({ type: String }) id = '';

	@property({ type: String }) name = '';

	@property({ type: String }) placeholderText = '';

	@property({ type: String }) placeholderIcon = '';

	@property({ type: String }) selectedOption = '';

	@property({ type: Boolean }) disabled = false;

	@property({ type: String }) position: DropdownPositions = DropdownPositions.AUTO;

	@internalProperty() private setPosition: Exclude<DropdownPositions, DropdownPositions.AUTO> =
		DropdownPositions.BOTTOM;

	@internalProperty() showDropdown = false;

	@property({ type: String }) environment: Environments = Environments.SETTINGS;

	@internalProperty() optionsStyle: StyleInfo = {};

	@internalProperty() optionsScroll: number = 0;

	@internalProperty() optionsMaxScroll: number = 0;

	@internalProperty() hasOverflow: boolean = false;

	private _getOffset(): { top: number; bottom: number } {
		// this select element
		const wrapper = this.shadowRoot?.querySelector('.custom-select-wrapper');
		if (!wrapper) {
			return { top: 0, bottom: 0 };
		}

		const rect = wrapper.getBoundingClientRect();
		return { top: rect.top, bottom: rect.bottom };
	}

	private boundWindowHandlers: Map<string, (event: CustomEventInit) => void> = new Map();

	connectedCallback(): void {
		super.connectedCallback();

		this.boundWindowHandlers.set('click', () => {
			this.showDropdown = false;
		});

		this.boundWindowHandlers.set('resize', () => {
			this.showDropdown = false;
		});

		this.boundWindowHandlers.set('dropdownOpen', (e: CustomEventInit) => {
			if (e.detail.this !== this) {
				this.showDropdown = false;
			}
		});

		for (const [eventName, handler] of this.boundWindowHandlers) {
			window.addEventListener(eventName, handler);
		}
	}

	disconnectedCallback(): void {
		for (const [eventName, handler] of this.boundWindowHandlers) {
			window.removeEventListener(eventName, handler);
		}

		super.disconnectedCallback();
	}

	updated(changedProperties: PropertyValues): void {
		super.updated(changedProperties);

		// Trigger updating scroll values once DOM is updated
		if (changedProperties.has('showDropdown') && this.showDropdown) {
			this.handleScroll(this.shadowRoot?.querySelector('.custom-options'));
		}
	}

	private positionDropDown(): void {
		const { top, bottom } = this.getMaxSpace();
		if (this.position === 'auto') {
			const position = this._decidePositionAuto(bottom, top);
			this.setPosition = position;
		} else {
			this.setPosition = this.position;
		}

		const maxOptionsHeight: number | null = this.getMaxOptionsHeight(this.setPosition, bottom, top);
		this.optionsStyle =
			maxOptionsHeight !== null
				? {
						'max-height': `${maxOptionsHeight}px`,
				  }
				: {};
		this.hasOverflow = maxOptionsHeight !== null;
	}

	private get customOptionsWrapperCssClasses(): string {
		const classes: string[] = [];

		switch (this.setPosition) {
			case DropdownPositions.TOP:
				classes.push('top');
				break;
			case DropdownPositions.BOTTOM:
				classes.push('bottom');
				break;
			default:
				break;
		}

		if (this.optionsScroll > 0) {
			classes.push('arrow-up');
		}

		if (this.optionsScroll < this.optionsMaxScroll) {
			classes.push('arrow-down');
		}

		return classes.join(' ');
	}

	render(): TemplateResult {
		return html`
			<div
				class="custom-select-wrapper environment--${this.environment}"
				@click=${(e: Event) => this._showDrop(e)}
				@keydown=${(e: Event) => this._showDrop(e)}
			>
				<div class="custom-select ${this.showDropdown ? 'open' : 'closed'}">
					<div
						class="custom-select__trigger ${this.setPosition === DropdownPositions.TOP ? 'top' : 'bottom'} ${this
							.disabled
							? 'disabled'
							: ''}"
					>
						<span
							>${this.selectedOption
								? this.labels[this.options.indexOf(this.selectedOption)] ??
								  this.options[this.options.indexOf(this.selectedOption)]
								: this.placeholderText}</span
						>
						<div class="arrow">
							<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 16 16">
								<g fill="none" fill-opacity="1" fill-rule="evenodd">
									<rect width="100%" height="100%" fill="none"></rect>
									<path
										fill="#000000"
										class="icon--graphics"
										d="M3.25574396,3.34506952 L8,8.08932556 L12.744256,3.34506952 C13.0280866,3.06123896 13.3974661,2.90063916 13.8012783,2.90063916 C14.2050905,2.90063916 14.57447,3.06123896 14.8583006,3.34506952 L15.5555696,4.04233855 C15.8394002,4.32616911 16,4.69554865 16,5.09936084 C16,5.50317303 15.8394002,5.87255256 15.5555696,6.15638312 L9.05702228,12.6549305 C8.77319172,12.938761 8.40381219,13.0993608 8,13.0993608 C7.59618781,13.0993608 7.22680828,12.938761 6.94297772,12.6549305 L0.444430359,6.15638312 C0.160599797,5.87255256 0,5.50317303 0,5.09936084 C0,4.69554865 0.160599797,4.32616911 0.444430359,4.04233855 L1.14169939,3.34506952 C1.42552995,3.06123896 1.79490948,2.90063916 2.19872167,2.90063916 C2.60253386,2.90063916 2.9719134,3.06123896 3.25574396,3.34506952 Z"
									></path>
								</g>
							</svg>
						</div>
					</div>
					<div class="custom-options-wrapper ${this.customOptionsWrapperCssClasses}">
						<div
							class="custom-options ${classMap({ 'has-overflow': this.hasOverflow })}"
							style=${styleMap(this.optionsStyle)}
							@scroll=${this.handleScrollEvent}
						>
							${this.options.map(
								(value, index) =>
									html`
										<span
											class="custom-option ${this.selectedOption === value ? 'selected' : ''}"
											@click=${() => this._onSelectChange(value)}
											@keydown=${() => this._onSelectChange(value)}
											>${this.labels[index] ?? value}</span
										>
									`
							)}
						</div>
					</div>
				</div>
			</div>
		`;
	}

	private handleScrollEvent(event: Event): void {
		if (event.target instanceof HTMLElement) {
			this.handleScroll(event.target);
		}
	}

	private handleScroll(optionsElement: HTMLElement | null | undefined): void {
		if (!optionsElement) {
			return;
		}

		const { scrollTop } = optionsElement;
		this.optionsScroll = scrollTop;
		this.optionsMaxScroll = optionsElement.scrollHeight - optionsElement.clientHeight;
	}

	private static getPixelSize(value: number): number {
		const remSize: number = Number.parseFloat(window.getComputedStyle(document.documentElement).fontSize);
		return value * PX_REM_RATIO * remSize;
	}

	private static get optionHeight(): number {
		return DropdownBasic.getPixelSize(DropdownBasic.OPTION_HEIGHT);
	}

	private static get triggerHeight(): number {
		// +2 for 1px border on top and bottom
		return DropdownBasic.optionHeight + 2;
	}

	/**
	 * Total height including trigger box.
	 */
	private get expandedSelectHeight(): number {
		// +1 for 1px border on top
		const menuHeightInPx: number = this.options.length * DropdownBasic.optionHeight + 1;
		return menuHeightInPx + DropdownBasic.triggerHeight;
	}

	private getMaxSpace(): { bottom: number; top: number } {
		// Offset from top / bottom of window
		const { top: topOffset, bottom: bottomOffset } = this._getOffset();
		const margin = DropdownBasic.getPixelSize(DropdownBasic.DROPDOWN_WINDOW_MARGIN);
		const availableHeight: number = window.innerHeight;
		const maxSpaceBottom: number = availableHeight - topOffset - margin;
		const maxSpaceTop: number = bottomOffset - margin;

		return {
			bottom: maxSpaceBottom,
			top: maxSpaceTop,
		};
	}

	private _decidePositionAuto(
		maxSpaceBottom: number,
		maxSpaceTop: number
	): Exclude<DropdownPositions, DropdownPositions.AUTO> {
		// Prefer bottom if its fits there
		if (maxSpaceBottom >= this.expandedSelectHeight) {
			return DropdownPositions.BOTTOM;
		}

		// Else return top if it fits there
		if (maxSpaceTop >= this.expandedSelectHeight) {
			return DropdownPositions.TOP;
		}

		// Otherwise, return the position which has the most space
		return maxSpaceBottom > maxSpaceTop ? DropdownPositions.BOTTOM : DropdownPositions.TOP;
	}

	private getMaxOptionsHeight(
		position: Exclude<DropdownPositions, DropdownPositions.AUTO>,
		maxSpaceBottom: number,
		maxSpaceTop: number
	): number | null {
		switch (position) {
			case DropdownPositions.BOTTOM:
				// Enough space.
				if (maxSpaceBottom >= this.expandedSelectHeight) {
					return null;
				}
				return Math.max(maxSpaceBottom - DropdownBasic.triggerHeight, DropdownBasic.optionHeight);
			case DropdownPositions.TOP:
				// Enough space
				if (maxSpaceTop >= this.expandedSelectHeight) {
					return null;
				}

				return Math.max(maxSpaceTop - DropdownBasic.triggerHeight, DropdownBasic.optionHeight);
			default:
				return null;
		}
	}

	private _onSelectChange(value: string) {
		this.selectedOption = value;
		this.dispatchEvent(
			new CustomEvent('change', {
				detail: {
					id: this.id,
					name: this.name,
					value,
				},
			})
		);
	}

	private _showDrop(e: Event) {
		if (this.disabled) return;
		e.stopPropagation();
		e.preventDefault();
		this.showDropdown = !this.showDropdown;

		if (this.showDropdown) {
			// Reset status variables
			this.optionsScroll = 0;
			this.optionsMaxScroll = 0;

			this.positionDropDown();
		}

		// emit event
		this.dispatchEvent(
			new CustomEvent('dropdownOpen', {
				detail: { this: this },
				bubbles: true,
				composed: true,
			})
		);
	}
}
