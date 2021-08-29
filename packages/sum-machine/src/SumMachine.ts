import { BaseTool, classMap, styleMap, ToolData } from '@gynzy/base-tool';
import { html, css, property, TemplateResult } from 'lit-element';
import './SumMachineSettings';
import './ProblemRow';
import { defaultState } from './defaultState';

interface Addition {
	term1: number;
	term2: number;
	result: number;
	sign: string;
}
interface Subtraction {
	term1: number;
	term2: number;
	result: number;
	sign: string;
}

interface Table {
	term1: number;
	term2: number;
	result: number;
	sign: string;
}

interface OperationConfig {
	operation: string;
	selectedRange: string;
}

interface TableConfig {
	id: number;
	multipChecked: boolean;
	divisChecked: boolean;
}

export class SumMachine extends BaseTool {
	static styles = [
		...BaseTool.styles,
		css`
			:host {
			}

			.main-container {
				display: grid;
				justify-content: center;
				justify-items: center;
				margin-top: 10px;
			}

			.problems-container {
				display: grid;
				grid-auto-flow: column;
				column-gap: 8px;
				row-gap: 4px;
			}
			.buttons-container {
				display: grid;
				grid-template-columns: 1fr 1fr;
				gap: 3px;
				justify-items: center;
				border-top: 1px solid lightgray;
				padding-top: 15px;
				margin-top: 5px;
			}
			.buttons-container > button {
				display: flex;
				width: 130px;
				height: 25px;
				border: none;
				background-color: none;
				box-shadow: 0px 2px gray;
				border-radius: 5px;
				padding: 4px 20px;
				justify-content: center;
				align-items: center;
				cursor: pointer;
			}
			.buttons-container > button:active {
				transform: translateY(2px);
				transition: 0.15s;
			}

			button > img {
				padding-right: 7px;
			}
			.buttons-container > .answers {
				background-color: #3385ff;
				color: white;
			}

			.buttons-container > .shuffle {
				background-color: #f2f2f2;
				color: #4d4d4d;
			}
			.answers > img {
				filter: var(--color-filter-white);
			}
			.shuffle > img {
				filter: var(--color-filter-slate-gray);
			}
		`,
	];

	private operationsConfig: (Addition | Subtraction)[] = [];

	private tablesConfig: Table[] = [];

	@property({ type: String }) title = 'Hey there';

	@property({ type: String }) icon = 'view';

	@property({ type: Number }) counter = 5;

	@property({ type: Object }) resultClasses = {};

	@property({ type: Object }) resultStyle = {};

	@property({ type: Array }) visibleResults: number[] = [];

	@property({ type: Array }) mashedArr: (Addition | Subtraction)[] = [];

	@property({ type: String }) problemsCount = defaultState.problemsCount;

	@property({ type: Array }) recievedOperationsConfig: OperationConfig[] = defaultState.recievedOperationsConfig;

	@property({ type: Array }) selectedExtraOptions: string[] = defaultState.selectedExtraOptions;

	@property({ type: Array }) recievedTablesConfig: TableConfig[] = defaultState.recievedTablesConfig;

	constructor() {
		super();
		this.toolDefinition = {
			...this.toolDefinition,
			settingsComponent: 'gynzy-sum-machine-settings',
		};
		this.resultStyle = { display: 'flex' };
	}

	/**
	 * Check if all results are visible, use suitable icon nad return path
	 * @returns path to view/hide icon
	 */
	get allVisible(): string {
		return this.getBaseAssetPath(
			`icons/icon-${this.visibleResults.length === +this.problemsCount ? 'hide' : 'view'}.svg`
		);
	}

	get columnCount(): string {
		if (+this.problemsCount < 10) {
			return `grid-template-rows: repeat(${this.problemsCount}, 1fr)`;
		}
		if (+this.problemsCount === 20) {
			return 'grid-template-rows: repeat(7, 1fr)';
		}
		return 'grid-template-rows: repeat(5, 1fr);';
		// return this.problemsCount === '20' ? 'grid-template-rows: repeat(7, 1fr)' : 'grid-template-rows: repeat(5, 1fr);';
	}

	get gameReady(): boolean {
		return this.recievedOperationsConfig.length > 0 || this.recievedTablesConfig.length > 0;
	}

	get remainderProblems(): number {
		return this.problemsCountExceeded ? 0 : +this.problemsCount % this.problemsTypesCount;
	}

	get decimal(): boolean {
		return this.selectedExtraOptions.indexOf('decimal') > -1;
	}

	private _problemsTypesCount = 0;

	@property({ type: Number })
	set problemsTypesCount(count: number) {
		const oldValue = this._problemsTypesCount;
		this._problemsTypesCount = count;
		this.requestUpdate('problemsTypesCount', oldValue);
	}

	get problemsTypesCount(): number {
		return this.recievedOperationsConfig.length + this.recievedTablesConfig.length;
	}

	private _singleTypeProblemsCount = 0;

	@property({ type: Number })
	set singleTypeProblemsCount(count: number) {
		const oldValue = this._singleTypeProblemsCount;
		this._singleTypeProblemsCount = count;
		this.requestUpdate('singleTypeProblemsCount', oldValue);
	}

	get singleTypeProblemsCount(): number {
		return Math.floor(+this.problemsCount / this.problemsTypesCount);
	}

	get problemsCountExceeded(): boolean {
		return +this.problemsCount < this.problemsTypesCount;
	}

	private _allConfigsArray: (OperationConfig | TableConfig)[] = [];

	@property({ type: Array })
	set allConfigsArray(array: (OperationConfig | TableConfig)[]) {
		const oldValue = this._allConfigsArray;
		this._allConfigsArray = array;
		this.requestUpdate('allConfigsArray', oldValue);
	}

	get allConfigsArray(): (OperationConfig | TableConfig)[] {
		return [...this.recievedOperationsConfig, ...this.recievedTablesConfig];
	}

	private _randomizedSelectionArray: (OperationConfig | TableConfig)[] = [];

	@property({ type: Array })
	set randomizedSelectionArray(array: (OperationConfig | TableConfig)[]) {
		const oldValue = this._randomizedSelectionArray;
		this._randomizedSelectionArray = array;
		this.requestUpdate('randomizedSelectionArray', oldValue);
	}

	get randomizedSelectionArray(): (OperationConfig | TableConfig)[] {
		return this.allConfigsArray.sort(() => 0.5 - Math.random()).slice(0, +this.problemsCount);
	}

	handleToolData(): void {
		super.handleToolData();
	}

	handleSettingsUpdate(detail: any): void {
		super.handleSettingsUpdate(detail);
		if (detail) {
			if (detail.operationsConfig) {
				this.recievedOperationsConfig = detail.operationsConfig;
			}
			if (detail.problemsCount) {
				this.problemsCount = detail.problemsCount;
			}
			if (detail.selectedExtraOptions) {
				this.selectedExtraOptions = detail.selectedExtraOptions;
			}
			if (detail.tablesConfig) {
				this.recievedTablesConfig = detail.tablesConfig;
			}
		}
		this._generateTasks();
	}

	__increment(): void {
		this.counter += 1;
	}

	/**
	 * Fn to generate array of problems according to the configuration
	 */
	_generateTasks(): void {
		this.operationsConfig = [];
		this.tablesConfig = [];
		this.mashedArr = [];

		if (this.recievedOperationsConfig.length && !this.problemsCountExceeded) {
			this._problemsGenerator(this.recievedOperationsConfig, this.singleTypeProblemsCount, this.decimal);
		}

		// this block returns given number of problems for multiplications tables (division table not in demo)
		if (this.recievedTablesConfig.length && !this.problemsCountExceeded) {
			this._problemsGenerator(this.recievedTablesConfig, this.singleTypeProblemsCount, this.decimal);
		}

		// remainderProblems - adding problems to free slots
		if (this.remainderProblems > 0 && !this.problemsCountExceeded) {
			this._problemsGenerator(this.randomizedSelectionArray.slice(0, this.remainderProblems), 1, this.decimal);
		}

		if (this.problemsCountExceeded) {
			this._problemsGenerator(this.randomizedSelectionArray, 1, this.decimal);
		}

		this.mashedArr = [...this.operationsConfig, ...this.tablesConfig];
	}

	/**
	 *
	 * @param inputArray problems config array - +/-/x...
	 * @param singleTypeProblemsCount how many sinle type problems should be generated
	 * @param decimal use/not use decimal numbers in problems/results
	 */
	_problemsGenerator(
		inputArray: (OperationConfig | TableConfig)[],
		singleTypeProblemsCount: number,
		decimal: boolean
	): void {
		inputArray.forEach(config => {
			if (Object.prototype.hasOwnProperty.call(config, 'operation')) {
				const typedConfig = <OperationConfig>config;
				const range = +typedConfig.selectedRange;
				switch (typedConfig.operation) {
					case 'addition':
						this.operationsConfig = [
							...this.operationsConfig,
							...this.createAdditions(singleTypeProblemsCount, range, decimal),
						];
						break;
					case 'subtraction':
						this.operationsConfig = [
							...this.operationsConfig,
							...this.createSubtractions(singleTypeProblemsCount, range, decimal),
						];
						break;
					default:
						console.warn('Unknown operation type');
				}
			} else {
				const typedConfig = <TableConfig>config;
				this.tablesConfig = [
					...this.tablesConfig,
					...this.createTablesProblems(
						typedConfig.id,
						singleTypeProblemsCount,
						typedConfig.multipChecked,
						typedConfig.divisChecked
					),
				];
			}
		});
	}

	/**
	 *
	 * @param count count of problems to generate
	 * @param range selected range from dropdown
	 * @param decimal boolean value from extra options
	 * @returns array of additions problems
	 */
	createAdditions(count: number, range: number, decimal: boolean): Addition[] {
		const additionsArr = [];
		for (let i = 1; i <= count; i++) {
			const additionObj: Addition = { term1: 0, term2: 0, result: 0, sign: '+' };
			const crossTens = this.selectedExtraOptions.indexOf('crossTens') > -1;
			const randomTerm1 =
				range === 10 || range === 20
					? this.getRandomNumber(1, range + 1, decimal)
					: this.getRandomNumber(10, range + 1, decimal);

			const nearestUpperTen = Math.ceil(randomTerm1 / 10) * 10;

			// constrain range if crossTens option is disabled
			let term2Range = crossTens ? range : nearestUpperTen - randomTerm1;

			// if crossTen disabled and first random term1 is 10/20/30..., fix upper range to 10
			if (nearestUpperTen === randomTerm1 && !crossTens) {
				term2Range = 10;
			}

			const randomTerm2 =
				range === 10 || range === 20
					? this.getRandomNumber(1, term2Range + 1, decimal)
					: this.getRandomNumber(crossTens ? 10 : 1, term2Range + 1, decimal);
			additionObj.term1 = randomTerm1;
			/* range === 10 || range === 20
					? this.getRandomNumber(1, range + 1, decimal)
					: this.getRandomNumber(10, range + 1, decimal); */
			additionObj.term2 = randomTerm2;
			/* range === 10 || range === 20
					? this.getRandomNumber(1, range + 1, decimal)
					: this.getRandomNumber(10, range + 1, decimal); */
			additionObj.result = decimal
				? +(additionObj.term1 + additionObj.term2).toFixed(1)
				: additionObj.term1 + additionObj.term2;
			additionsArr.push(additionObj);
		}
		return additionsArr;
	}

	/**
	 *
	 * @param count count of problems to generate
	 * @param range selected range from dropdown
	 * @param decimal boolean value from extra options
	 * @returns array of subtractions problem
	 */
	createSubtractions(count: number, range: number, decimal: boolean): Subtraction[] {
		const subtractionsArr = [];
		for (let i = 1; i <= count; i++) {
			const subtractionObj: Subtraction = { term1: 0, term2: 0, result: 0, sign: '-' };
			const crossTens = this.selectedExtraOptions.indexOf('crossTens') > -1;

			let randomTerm1 =
				range === 10 || range === 20
					? this.getRandomNumber(1, range + 1, decimal)
					: this.getRandomNumber(10, range + 1, decimal);

			// hacky workaround - if first random term1 is 10/20/30,  you cant substraction without crossing ten
			// in such a case, do randomly +/- 1 from randomTerm1
			if (randomTerm1 % 10 === 0 && !crossTens) {
				randomTerm1 -= Math.random() < 0.5 ? -1 : 1;
			}

			const nearestLowerTen = Math.floor(randomTerm1 / 10) * 10;
			// constrain range if crossTens option is disabled
			const term2Range = crossTens ? range : randomTerm1 - nearestLowerTen;

			const randomTerm2 =
				range === 10 || range === 20
					? this.getRandomNumber(1, term2Range + 1, decimal)
					: this.getRandomNumber(crossTens ? 10 : 1, term2Range + 1, decimal);
			subtractionObj.term1 = Math.max(randomTerm1, randomTerm2);

			subtractionObj.term2 = Math.min(randomTerm1, randomTerm2);
			subtractionObj.result = decimal
				? +(subtractionObj.term1 - subtractionObj.term2).toFixed(1)
				: subtractionObj.term1 - subtractionObj.term2;
			subtractionsArr.push(subtractionObj);
		}
		return subtractionsArr;
	}

	/**
	 *
	 * @param inputNumber number for which you want a problems
	 * @param count count of problems to generate
	 * @param multip boolean to differ multiplication/division tagble problems
	 * @param divis boolean to differ multiplication/division tagble problems
	 * @returns array of table problems for inputNumber
	 */
	createTablesProblems(inputNumber: number, count: number, multip: boolean, divis: boolean): Table[] {
		const tablesArr = [];
		for (let i = 1; i <= count; i++) {
			if (multip) {
				const tableObj: Table = { term1: 0, term2: 0, result: 0, sign: '' };
				tableObj.term1 = this.getRandomNumber(1, 13, false);
				tableObj.term2 = inputNumber;
				tableObj.result = tableObj.term1 * tableObj.term2;
				tableObj.sign = 'x';
				tablesArr.push(tableObj);
			}
			if (divis) {
				// not in demo
			}
		}
		return tablesArr;
	}

	/**
	 *
	 * @param min
	 * @param max
	 * @param decimal boolean to return int/decimal
	 * @returns random number
	 */
	getRandomNumber = (min: number, max: number, decimal: boolean): number => {
		const minN = Math.ceil(min);
		const maxN = Math.floor(max);
		if (decimal) {
			return +(Math.random() * (max - min) + min).toFixed(1);
		}
		return Math.floor(Math.random() * (maxN - minN) + minN); // The maximum is exclusive and the minimum is inclusive
	};

	/**
	 * Show all results
	 */
	_toggleAllResults(): void {
		if (this.visibleResults.length === +this.problemsCount) {
			this.visibleResults = [];
		} else {
			this.visibleResults = [...Array(+this.problemsCount).keys()];
		}
	}

	/**
	 * Fn to catch click on problemRow to track visibleResults array
	 * @param e custom event from child problemRow componemt
	 */
	_onProblemClick(e: CustomEvent): void {
		this.visibleResults = [...e.detail.visibleResults];
	}

	render(): TemplateResult {
		return html`
			${this.gameReady
				? html`<div style=${this.gameReady} class="main-container">
						<div style=${this.columnCount} class="problems-container">
							${this.mashedArr.map(
								(operation, idx) => html`
									<gynzy-problem-row
										.problemsCount=${this.problemsCount}
										.term1=${operation.term1}
										.term2=${operation.term2}
										.result=${operation.result}
										.sign=${operation.sign}
										.idx=${idx}
										.visibleResults=${this.visibleResults}
										@problemClick="${this._onProblemClick}"
									>
									</gynzy-problem-row>
								`
							)}
						</div>
						<div class="buttons-container">
							<button class="answers" @click=${this._toggleAllResults}>
								<img src="${this.allVisible}" alt="icon" draggable="false" />${this.t('answers')}
							</button>
							<button class="shuffle" @click=${this._generateTasks}>
								<img src="${this.getBaseAssetPath('icons/icon-randomize.svg')}" alt="icon" draggable="false" />${this.t(
									'shuffle'
								)}
							</button>
						</div>
				  </div>`
				: html`<h3>To play a game, you need to select at least one type of problem</h3>`}
		`;
	}
}
