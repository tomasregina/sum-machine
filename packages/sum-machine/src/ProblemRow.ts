import { customElement, css, html, property, TemplateResult } from 'lit-element';
import { BaseElement } from '@gynzy/base-tool';

@customElement('gynzy-problem-row')
export class ProblemRow extends BaseElement {
	static styles = css`
		.problem-row {
			display: grid;

			gap: 5px;
			border: 1px solid gray;
			border-radius: 7px;
			padding: 0px 16px;
			margin-bottom: 4px;
			cursor: pointer;
			box-shadow: 0px 1px 2px grey;
			align-items: center;
		}
		.terms {
			display: flex;
			width: 100%;
			gap: 20px;
		}
		img {
			filter: var(--color-filter-regent-gray);
		}
		img:hover {
			filter: var(--color-filter-ghost);
		}

		.problem-row > div {
			text-align: center;
		}
		.icon-eye {
			margin-left: auto;
			border: none;
			background-color: transparent;
			cursor: pointer;
			display: flex;
			align-items: center;
			position: relative;
			left: 40px;
		}
		.result {
			display: flex;
			color: var(--color-positive-light);
			font-weight: 900;
			padding-left: 20px;
			position: relative;
			left: 35px;
			margin-left: auto;
		}
	`;

	@property({ type: String }) problemsCount = '0';

	@property({ type: Number }) term1 = 0;

	@property({ type: Number }) term2 = 0;

	@property({ type: Number }) result = 0;

	@property({ type: String }) sign = '';

	@property({ type: Number }) idx = 0;

	@property({ type: Array }) visibleResults: number[] = [];

	/**
	 * Getter dynamic set problem row width base on selected problemsCount
	 */

	get _problemRowTemplate(): string {
		return +this.problemsCount > 10
			? 'width: 353px; grid-template-columns: 216px 104px; height: 30px'
			: 'width: 400px; grid-template-columns: 240px 128px; height: 35px';
	}

	/**
	 *
	 * @param idx index of clicked problem/row
	 */
	_resultVisibility(idx: number): void {
		if (this.visibleResults.indexOf(idx) > -1) {
			const currentIdx = this.visibleResults.indexOf(idx);
			this.visibleResults.splice(currentIdx, 1);
			this.visibleResults = [...this.visibleResults];
		} else {
			this.visibleResults = [...this.visibleResults, idx];
		}
		const problemClick = new CustomEvent('problemClick', {
			detail: {
				visibleResults: this.visibleResults,
			},
		});
		this.dispatchEvent(problemClick);
	}

	/**
	 * Helper fn to dynamically switch eye-icon
	 * @param idx index of row/problem
	 * @returns path to hide/view icon
	 */
	_eyeIcon(idx: number): string {
		return this.getBaseAssetPath(`icons/icon-${this.visibleResults.indexOf(idx) > -1 ? 'hide' : 'view'}.svg`);
	}

	protected render(): TemplateResult {
		return html`<div
			@click=${() => this._resultVisibility(this.idx)}
			@keydown=${() => this._resultVisibility(this.idx)}
			style=${this._problemRowTemplate}
			class="problem-row"
		>
			<div class="terms">
				<div>${this.term1}</div>
				<div>${this.sign}</div>
				<div>${this.term2}</div>
				<div>=</div>
			</div>

			<div class="result" style=${this.visibleResults.indexOf(this.idx) > -1 ? 'display: block' : 'display: none'}>
				${this.result}
			</div>

			<button class="icon-eye" style=${this.visibleResults.indexOf(this.idx) > -1 ? 'display: none' : 'display: block'}>
				<img src="${this._eyeIcon(this.idx)}" alt="icon" draggable="false" />
			</button>
		</div> `;
	}
}
