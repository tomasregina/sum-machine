
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
import { BaseSettings, css, __decorate, property, customElement, html, BaseElement, BaseTool } from './base-tool.js';

const defaultState = {
    problemsCount: '10',
    recievedOperationsConfig: [],
    selectedExtraOptions: ['crossTens'],
    recievedTablesConfig: [],
};

let SumMachineSettings = class SumMachineSettings extends BaseSettings {
    constructor() {
        super();
        this.problemsCount = defaultState.problemsCount;
        this._toolData = {};
        // this.multipIndeterminate = false;
        this.isIndeterminate = {
            multip: false,
            divis: false,
        };
        // this.multipAllSelected = false;
        this.allSelected = {
            multip: false,
            divis: false,
        };
        this.problemsCountOptions = [
            {
                id: '1',
                value: '1',
                label: '1',
            },
            {
                id: '2',
                value: '2',
                label: '2',
            },
            {
                id: '3',
                value: '3',
                label: '3',
            },
            {
                id: '5',
                value: '5',
                label: '5',
            },
            {
                id: '10',
                value: '10',
                label: '10',
            },
            {
                id: '15',
                value: '15',
                label: '15',
            },
            {
                id: '20',
                value: '20',
                label: '20',
            },
        ];
        this.extraOptions = [
            {
                id: 'crossTens',
                value: 'crossTens',
                label: 'settings.extra-options.cross-tens',
                checked: true,
            },
            {
                id: 'decimal',
                value: 'decimal',
                label: 'settings.extra-options.decimal',
                checked: false,
            },
            /* {
                id: 'remainders',
                value: 'remainders',
                label: 'settings.extra-options.remainder',
                checked: false,
            }, */
        ];
        this.rangeConfig = ['10', '20', '50', '100'];
        this.labelConfig = ['Up to 10', 'Up to 20', 'Up to 50', 'Up to 100'];
        this.operationsConfig = [
            {
                id: 'addition',
                value: 'addition',
                label: 'settings.operations-config.addition',
                checked: false,
                range: this.rangeConfig,
                labelDropdown: this.labelConfig,
                selectedRange: '100',
            },
            {
                id: 'subtraction',
                value: 'subtraction',
                label: 'settings.operations-config.subtraction',
                checked: false,
                range: this.rangeConfig,
                labelDropdown: this.labelConfig,
                selectedRange: '100',
            },
            /* {
                id: 'division',
                value: 'division',
                label: 'settings.operations-config.division',
                checked: false,
                range: this.rangeConfig,
                selectedRange: 'Up to 100',
            },
            {
                id: 'multiplication',
                value: 'multiplication',
                label: 'settings.operations-config.multiplication',
                checked: false,
                range: this.rangeConfig,
                selectedRange: 'Up to 100',
            }, */
        ];
        // this.tableConfig = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        this.tablesConfig = [
            { id: 1, value: 1, multipChecked: false, divisChecked: false },
            { id: 2, value: 2, multipChecked: false, divisChecked: false },
            { id: 3, value: 3, multipChecked: false, divisChecked: false },
            { id: 4, value: 4, multipChecked: false, divisChecked: false },
            { id: 5, value: 5, multipChecked: false, divisChecked: false },
            { id: 6, value: 6, multipChecked: false, divisChecked: false },
            { id: 7, value: 7, multipChecked: false, divisChecked: false },
            { id: 8, value: 8, multipChecked: false, divisChecked: false },
            { id: 9, value: 9, multipChecked: false, divisChecked: false },
            { id: 10, value: 10, multipChecked: false, divisChecked: false },
            { id: 11, value: 11, multipChecked: false, divisChecked: false },
            { id: 12, value: 12, multipChecked: false, divisChecked: false },
        ];
    }
    get toolData() {
        return this._toolData;
    }
    set toolData(val) {
        const oldValue = this._toolData;
        this._toolData = val;
        this.handleToolDataUpdated();
        this.requestUpdate('toolData', oldValue);
    }
    // function is executed when toolData attribute is updated
    handleToolDataUpdated() {
        this.problemsCount = this._toolData.problemsCount;
    }
    render() {
        return html `
			<div class="settings-component main-container">
				<div class="settings-column">
					<div class="settings-section">
						<gynzy-settings-label>${this.t('settings.problems-count')}</gynzy-settings-label>
						<div class="count-options">
							${this.problemsCountOptions.map(item => html `<gynzy-input-radio
										id="${item.id}"
										.value=${item.value}
										.label=${item.label}
										.checked=${item.value === this.problemsCount}
										@change=${this._onProblemsCountChange}
									></gynzy-input-radio>`)}
						</div>
					</div>
					<div class="settings-section">
						<gynzy-settings-label>${this.t('settings.extra-options.title')}</gynzy-settings-label>
						${this.extraOptions.map(item => html `<gynzy-input-checkbox
									id="${item.id}"
									.value=${item.value}
									.label=${this.t(item.label)}
									.checked=${item.checked}
									@change=${this._onExtraOptionChange}
								></gynzy-input-checkbox>`)}
					</div>
				</div>
				<div class="settings-column">
					<div class="settings-section">
						<gynzy-settings-label>${this.t('settings.operations-config.title')}</gynzy-settings-label>
						<div class="operator-container">
							${this.operationsConfig.map(item => html `<div class="operator-settings">
										<gynzy-input-checkbox
											class="operation-checkbox"
											id="${item.id}"
											.value=${item.value}
											.label=${this.t(item.label)}
											.checked=${item.checked}
											@change=${this._onOperatorChange}
										></gynzy-input-checkbox>
										<gynzy-dropdown-basic
											class="dropdown"
											id=${item.id}
											.options=${item.range}
											.labels=${item.labelDropdown}
											selectedOption=${item.range[3]}
											.disabled=${!item.checked}
											@change=${this._onDropdownChange}
										></gynzy-dropdown-basic>
									</div> `)}
						</div>

						<gynzy-settings-label>${this.t('settings.multip-table')}</gynzy-settings-label>
						<div class="d-flex flex-row">
							${this.tablesConfig.map(item => html `<div>
									<gynzy-input-checkbox
										id="multip_${item.id}"
										.value="multip_${item.value}"
										class="multip-checkbox"
										.label=${item.value.toString()}
										.checked=${Boolean(item.multipChecked)}
										@change=${(e) => this._onTableChange(e, 'multip')}
									></gynzy-input-checkbox>
								</div>`)}
						</div>
						<gynzy-input-checkbox
							id="multip_all"
							value="multip_all"
							label=${this.t('settings.select-all')}
							.indeterminate=${this.isIndeterminate.multip}
							.checked=${this.allSelected.multip}
							@change=${() => this._onSelectAll('multip')}
						></gynzy-input-checkbox>

						<div class="hidden">
							<gynzy-settings-label>${this.t('settings.divis-table')}</gynzy-settings-label>
							<div class="d-flex flex-row">
								${this.tablesConfig.map(item => html `<div>
										<gynzy-input-checkbox
											id="divis_${item.id}"
											.value="divis_${item.value}"
											.label=${item.value.toString()}
											.checked=${item.divisChecked}
											@change=${(e) => this._onTableChange(e, 'divis')}
										></gynzy-input-checkbox>
									</div>`)}
							</div>
							<gynzy-input-checkbox
								id="divis_all"
								value="divis_all"
								label=${this.t('settings.select-all')}
								.indeterminate=${this.isIndeterminate.divis}
								.checked=${this.allSelected.divis}
								@change=${() => this._onSelectAll('divis')}
							></gynzy-input-checkbox>
						</div>
					</div>
				</div>
			</div>
		`;
    }
    _onProblemsCountChange(e) {
        this.problemsCount = e.detail.value;
        this.requestUpdate();
        this._onChange();
    }
    _onExtraOptionChange(e) {
        this.extraOptions = this.extraOptions.map(opt => {
            if (opt.id === e.detail.id) {
                return { ...opt, checked: !opt.checked };
            }
            return { ...opt };
        });
        this.requestUpdate();
        this._onChange();
    }
    _onOperatorChange(e) {
        this.operationsConfig = this.operationsConfig.map(operation => {
            if (operation.id === e.detail.id) {
                return { ...operation, checked: !operation.checked };
            }
            return { ...operation };
        });
        this.requestUpdate();
        this._onChange();
    }
    _onDropdownChange(e) {
        this.operationsConfig = this.operationsConfig.map(operation => {
            if (operation.id === e.detail.id) {
                return { ...operation, selectedRange: e.detail.value };
            }
            return { ...operation };
        });
        this.requestUpdate();
        this._onChange();
    }
    _onTableChange(e, tableType) {
        const checkedKey = `${tableType}Checked`;
        this.tablesConfig = this.tablesConfig.map(tab => {
            if (tab.id.toString() === e.detail.label) {
                return { ...tab, [checkedKey]: !tab[checkedKey] };
            }
            return { ...tab };
        });
        this.isIndeterminate[tableType.toString()] =
            this.tablesConfig.some(tab => tab[checkedKey]) && this.tablesConfig.some(tab => !tab[checkedKey]);
        this.allSelected[tableType.toString()] = !this.tablesConfig.some(tab => tab[checkedKey] === false);
        this.requestUpdate();
        this._onChange();
    }
    /**
     *
     * @param e
     * @param tableType
     */
    _onSelectAll(tableType) {
        const checkedKey = `${tableType}Checked`;
        this.tablesConfig = this.tablesConfig.map(tab => ({
            ...tab,
            [checkedKey]: !this.allSelected[tableType.toString()],
        }));
        this.allSelected[tableType.toString()] = !this.allSelected[tableType.toString()];
        this.isIndeterminate[tableType.toString()] = false;
        this.requestUpdate();
        this._onChange();
    }
    _onChange() {
        const value = {
            problemsCount: this.problemsCount,
            selectedExtraOptions: this.extraOptions.filter(opt => opt.checked).map(opt => opt.id),
            operationsConfig: this.operationsConfig
                .filter(operation => operation.checked)
                .map(operation => ({ operation: operation.id, selectedRange: operation.selectedRange })),
            tablesConfig: this.tablesConfig
                .filter(tab => tab.multipChecked || tab.divisChecked)
                .map(tab => ({ id: tab.id, multipChecked: tab.multipChecked, divisChecked: tab.divisChecked })),
        };
        this.updateSettings(value);
    }
};
SumMachineSettings.styles = [
    ...BaseSettings.styles,
    css `
			.main-container {
				width: 75%;
				display: grid;
				grid-template-columns: 300px 900px;
			}
			.operator-container {
				padding-bottom: 23px;
				display: grid;
				row-gap: 4px;
			}
			.operator-settings {
				display: grid;
				grid-template-columns: 50px 140px;
				align-items: center;
			}
			.d-flex {
				gap: 9px;
			}
			.hidden {
				display: none;
			}
			.count-options {
				display: grid;
				grid-auto-flow: column;
				grid-template-rows: repeat(4, 1fr);
				row-gap: 4px;
			}
		`,
];
__decorate([
    property({ attribute: false })
], SumMachineSettings.prototype, "toolData", null);
SumMachineSettings = __decorate([
    customElement('gynzy-sum-machine-settings')
], SumMachineSettings);

let ProblemRow = class ProblemRow extends BaseElement {
    constructor() {
        super(...arguments);
        this.problemsCount = '0';
        this.term1 = 0;
        this.term2 = 0;
        this.result = 0;
        this.sign = '';
        this.idx = 0;
        this.visibleResults = [];
    }
    /**
     * Getter dynamic set problem row width base on selected problemsCount
     */
    get _problemRowTemplate() {
        return +this.problemsCount > 10
            ? 'width: 353px; grid-template-columns: 216px 104px; height: 30px'
            : 'width: 400px; grid-template-columns: 240px 128px; height: 35px';
    }
    /**
     *
     * @param idx index of clicked problem/row
     */
    _resultVisibility(idx) {
        if (this.visibleResults.indexOf(idx) > -1) {
            const currentIdx = this.visibleResults.indexOf(idx);
            this.visibleResults.splice(currentIdx, 1);
            this.visibleResults = [...this.visibleResults];
        }
        else {
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
    _eyeIcon(idx) {
        return this.getBaseAssetPath(`icons/icon-${this.visibleResults.indexOf(idx) > -1 ? 'hide' : 'view'}.svg`);
    }
    render() {
        return html `<div
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
};
ProblemRow.styles = css `
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
__decorate([
    property({ type: String })
], ProblemRow.prototype, "problemsCount", void 0);
__decorate([
    property({ type: Number })
], ProblemRow.prototype, "term1", void 0);
__decorate([
    property({ type: Number })
], ProblemRow.prototype, "term2", void 0);
__decorate([
    property({ type: Number })
], ProblemRow.prototype, "result", void 0);
__decorate([
    property({ type: String })
], ProblemRow.prototype, "sign", void 0);
__decorate([
    property({ type: Number })
], ProblemRow.prototype, "idx", void 0);
__decorate([
    property({ type: Array })
], ProblemRow.prototype, "visibleResults", void 0);
ProblemRow = __decorate([
    customElement('gynzy-problem-row')
], ProblemRow);

class SumMachine extends BaseTool {
    constructor() {
        super();
        this.operationsConfig = [];
        this.tablesConfig = [];
        this.title = 'Hey there';
        this.icon = 'view';
        this.counter = 5;
        this.resultClasses = {};
        this.resultStyle = {};
        this.visibleResults = [];
        this.mashedArr = [];
        this.problemsCount = defaultState.problemsCount;
        this.recievedOperationsConfig = defaultState.recievedOperationsConfig;
        this.selectedExtraOptions = defaultState.selectedExtraOptions;
        this.recievedTablesConfig = defaultState.recievedTablesConfig;
        this._problemsTypesCount = 0;
        this._singleTypeProblemsCount = 0;
        this._allConfigsArray = [];
        this._randomizedSelectionArray = [];
        /**
         *
         * @param min
         * @param max
         * @param decimal boolean to return int/decimal
         * @returns random number
         */
        this.getRandomNumber = (min, max, decimal) => {
            const minN = Math.ceil(min);
            const maxN = Math.floor(max);
            if (decimal) {
                return +(Math.random() * (max - min) + min).toFixed(1);
            }
            return Math.floor(Math.random() * (maxN - minN) + minN); // The maximum is exclusive and the minimum is inclusive
        };
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
    get allVisible() {
        return this.getBaseAssetPath(`icons/icon-${this.visibleResults.length === +this.problemsCount ? 'hide' : 'view'}.svg`);
    }
    get columnCount() {
        if (+this.problemsCount < 10) {
            return `grid-template-rows: repeat(${this.problemsCount}, 1fr)`;
        }
        if (+this.problemsCount === 20) {
            return 'grid-template-rows: repeat(7, 1fr)';
        }
        return 'grid-template-rows: repeat(5, 1fr);';
        // return this.problemsCount === '20' ? 'grid-template-rows: repeat(7, 1fr)' : 'grid-template-rows: repeat(5, 1fr);';
    }
    get gameReady() {
        return this.recievedOperationsConfig.length > 0 || this.recievedTablesConfig.length > 0;
    }
    get remainderProblems() {
        return this.problemsCountExceeded ? 0 : +this.problemsCount % this.problemsTypesCount;
    }
    get decimal() {
        return this.selectedExtraOptions.indexOf('decimal') > -1;
    }
    set problemsTypesCount(count) {
        const oldValue = this._problemsTypesCount;
        this._problemsTypesCount = count;
        this.requestUpdate('problemsTypesCount', oldValue);
    }
    get problemsTypesCount() {
        return this.recievedOperationsConfig.length + this.recievedTablesConfig.length;
    }
    set singleTypeProblemsCount(count) {
        const oldValue = this._singleTypeProblemsCount;
        this._singleTypeProblemsCount = count;
        this.requestUpdate('singleTypeProblemsCount', oldValue);
    }
    get singleTypeProblemsCount() {
        return Math.floor(+this.problemsCount / this.problemsTypesCount);
    }
    get problemsCountExceeded() {
        return +this.problemsCount < this.problemsTypesCount;
    }
    set allConfigsArray(array) {
        const oldValue = this._allConfigsArray;
        this._allConfigsArray = array;
        this.requestUpdate('allConfigsArray', oldValue);
    }
    get allConfigsArray() {
        return [...this.recievedOperationsConfig, ...this.recievedTablesConfig];
    }
    set randomizedSelectionArray(array) {
        const oldValue = this._randomizedSelectionArray;
        this._randomizedSelectionArray = array;
        this.requestUpdate('randomizedSelectionArray', oldValue);
    }
    get randomizedSelectionArray() {
        return this.allConfigsArray.sort(() => 0.5 - Math.random()).slice(0, +this.problemsCount);
    }
    handleToolData() {
        super.handleToolData();
    }
    handleSettingsUpdate(detail) {
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
    __increment() {
        this.counter += 1;
    }
    /**
     * Fn to generate array of problems according to the configuration
     */
    _generateTasks() {
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
    _problemsGenerator(inputArray, singleTypeProblemsCount, decimal) {
        inputArray.forEach(config => {
            if (Object.prototype.hasOwnProperty.call(config, 'operation')) {
                const typedConfig = config;
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
            }
            else {
                const typedConfig = config;
                this.tablesConfig = [
                    ...this.tablesConfig,
                    ...this.createTablesProblems(typedConfig.id, singleTypeProblemsCount, typedConfig.multipChecked, typedConfig.divisChecked),
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
    createAdditions(count, range, decimal) {
        const additionsArr = [];
        for (let i = 1; i <= count; i++) {
            const additionObj = { term1: 0, term2: 0, result: 0, sign: '+' };
            const crossTens = this.selectedExtraOptions.indexOf('crossTens') > -1;
            const randomTerm1 = range === 10 || range === 20
                ? this.getRandomNumber(1, range + 1, decimal)
                : this.getRandomNumber(10, range + 1, decimal);
            const nearestUpperTen = Math.ceil(randomTerm1 / 10) * 10;
            // constrain range if crossTens option is disabled
            let term2Range = crossTens ? range : nearestUpperTen - randomTerm1;
            // if crossTen disabled and first random term1 is 10/20/30..., fix upper range to 10
            if (nearestUpperTen === randomTerm1 && !crossTens) {
                term2Range = 10;
            }
            const randomTerm2 = range === 10 || range === 20
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
    createSubtractions(count, range, decimal) {
        const subtractionsArr = [];
        for (let i = 1; i <= count; i++) {
            const subtractionObj = { term1: 0, term2: 0, result: 0, sign: '-' };
            const crossTens = this.selectedExtraOptions.indexOf('crossTens') > -1;
            let randomTerm1 = range === 10 || range === 20
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
            const randomTerm2 = range === 10 || range === 20
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
    createTablesProblems(inputNumber, count, multip, divis) {
        const tablesArr = [];
        for (let i = 1; i <= count; i++) {
            if (multip) {
                const tableObj = { term1: 0, term2: 0, result: 0, sign: '' };
                tableObj.term1 = this.getRandomNumber(1, 13, false);
                tableObj.term2 = inputNumber;
                tableObj.result = tableObj.term1 * tableObj.term2;
                tableObj.sign = 'x';
                tablesArr.push(tableObj);
            }
        }
        return tablesArr;
    }
    /**
     * Show all results
     */
    _toggleAllResults() {
        if (this.visibleResults.length === +this.problemsCount) {
            this.visibleResults = [];
        }
        else {
            this.visibleResults = [...Array(+this.problemsCount).keys()];
        }
    }
    /**
     * Fn to catch click on problemRow to track visibleResults array
     * @param e custom event from child problemRow componemt
     */
    _onProblemClick(e) {
        this.visibleResults = [...e.detail.visibleResults];
    }
    render() {
        return html `
			${this.gameReady
            ? html `<div style=${this.gameReady} class="main-container">
						<div style=${this.columnCount} class="problems-container">
							${this.mashedArr.map((operation, idx) => html `
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
								`)}
						</div>
						<div class="buttons-container">
							<button class="answers" @click=${this._toggleAllResults}>
								<img src="${this.allVisible}" alt="icon" draggable="false" />${this.t('answers')}
							</button>
							<button class="shuffle" @click=${this._generateTasks}>
								<img src="${this.getBaseAssetPath('icons/icon-randomize.svg')}" alt="icon" draggable="false" />${this.t('shuffle')}
							</button>
						</div>
				  </div>`
            : html `<h3>To play a game, you need to select at least one type of problem</h3>`}
		`;
    }
}
SumMachine.styles = [
    ...BaseTool.styles,
    css `
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
__decorate([
    property({ type: String })
], SumMachine.prototype, "title", void 0);
__decorate([
    property({ type: String })
], SumMachine.prototype, "icon", void 0);
__decorate([
    property({ type: Number })
], SumMachine.prototype, "counter", void 0);
__decorate([
    property({ type: Object })
], SumMachine.prototype, "resultClasses", void 0);
__decorate([
    property({ type: Object })
], SumMachine.prototype, "resultStyle", void 0);
__decorate([
    property({ type: Array })
], SumMachine.prototype, "visibleResults", void 0);
__decorate([
    property({ type: Array })
], SumMachine.prototype, "mashedArr", void 0);
__decorate([
    property({ type: String })
], SumMachine.prototype, "problemsCount", void 0);
__decorate([
    property({ type: Array })
], SumMachine.prototype, "recievedOperationsConfig", void 0);
__decorate([
    property({ type: Array })
], SumMachine.prototype, "selectedExtraOptions", void 0);
__decorate([
    property({ type: Array })
], SumMachine.prototype, "recievedTablesConfig", void 0);
__decorate([
    property({ type: Number })
], SumMachine.prototype, "problemsTypesCount", null);
__decorate([
    property({ type: Number })
], SumMachine.prototype, "singleTypeProblemsCount", null);
__decorate([
    property({ type: Array })
], SumMachine.prototype, "allConfigsArray", null);
__decorate([
    property({ type: Array })
], SumMachine.prototype, "randomizedSelectionArray", null);

window.customElements.define('gynzy-sum-machine', SumMachine);
//# sourceMappingURL=index.js.map
