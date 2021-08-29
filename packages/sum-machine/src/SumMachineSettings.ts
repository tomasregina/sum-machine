import { css, customElement, html, property, TemplateResult } from 'lit-element';
import { BaseSettings, ToolData } from '@gynzy/base-tool';
import { defaultState } from './defaultState';

interface Count {
	id: string;
	value: string;
	label: string;
}

interface ExtraOption {
	id: string;
	value: string;
	label: string;
	checked: boolean;
}

export interface Operation {
	id: string;
	value: string;
	label: string;
	checked: boolean;
	range: string[];
	labelDropdown: string[];
	selectedRange: string;
}

interface Table {
	id: number;
	value: number;
	[multipChecked: string]: boolean | number;
	divisChecked: boolean;
}

interface IndeterminateConfig {
	[multip: string]: boolean;
	divis: boolean;
}

interface SelectAllConfig {
	[multip: string]: boolean;
	divis: boolean;
}

@customElement('gynzy-sum-machine-settings')
export class SumMachineSettings extends BaseSettings {
	static styles = [
		...BaseSettings.styles,
		css`
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

	private problemsCount = defaultState.problemsCount;

	private problemsCountOptions: Count[];

	private extraOptions: ExtraOption[];

	private operationsConfig: Operation[];

	private rangeConfig: string[];

	private labelConfig: string[];

	private tablesConfig: Table[];

	// private multipIndeterminate: boolean;

	private isIndeterminate: IndeterminateConfig;

	// private multipAllSelected: boolean;

	private allSelected: SelectAllConfig;

	private _toolData: ToolData = {};

	@property({ attribute: false })
	get toolData(): ToolData {
		return this._toolData;
	}

	set toolData(val: ToolData) {
		const oldValue = this._toolData;
		this._toolData = val;
		this.handleToolDataUpdated();
		this.requestUpdate('toolData', oldValue);
	}

	constructor() {
		super();
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

	// function is executed when toolData attribute is updated
	handleToolDataUpdated(): void {
		this.problemsCount = this._toolData.problemsCount;
	}

	render(): TemplateResult {
		return html`
			<div class="settings-component main-container">
				<div class="settings-column">
					<div class="settings-section">
						<gynzy-settings-label>${this.t('settings.problems-count')}</gynzy-settings-label>
						<div class="count-options">
							${this.problemsCountOptions.map(
								item =>
									html`<gynzy-input-radio
										id="${item.id}"
										.value=${item.value}
										.label=${item.label}
										.checked=${item.value === this.problemsCount}
										@change=${this._onProblemsCountChange}
									></gynzy-input-radio>`
							)}
						</div>
					</div>
					<div class="settings-section">
						<gynzy-settings-label>${this.t('settings.extra-options.title')}</gynzy-settings-label>
						${this.extraOptions.map(
							item =>
								html`<gynzy-input-checkbox
									id="${item.id}"
									.value=${item.value}
									.label=${this.t(item.label)}
									.checked=${item.checked}
									@change=${this._onExtraOptionChange}
								></gynzy-input-checkbox>`
						)}
					</div>
				</div>
				<div class="settings-column">
					<div class="settings-section">
						<gynzy-settings-label>${this.t('settings.operations-config.title')}</gynzy-settings-label>
						<div class="operator-container">
							${this.operationsConfig.map(
								item =>
									html`<div class="operator-settings">
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
									</div> `
							)}
						</div>

						<gynzy-settings-label>${this.t('settings.multip-table')}</gynzy-settings-label>
						<div class="d-flex flex-row">
							${this.tablesConfig.map(
								item => html`<div>
									<gynzy-input-checkbox
										id="multip_${item.id}"
										.value="multip_${item.value}"
										class="multip-checkbox"
										.label=${item.value.toString()}
										.checked=${Boolean(item.multipChecked)}
										@change=${(e: CustomEvent) => this._onTableChange(e, 'multip')}
									></gynzy-input-checkbox>
								</div>`
							)}
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
								${this.tablesConfig.map(
									item => html`<div>
										<gynzy-input-checkbox
											id="divis_${item.id}"
											.value="divis_${item.value}"
											.label=${item.value.toString()}
											.checked=${item.divisChecked}
											@change=${(e: CustomEvent) => this._onTableChange(e, 'divis')}
										></gynzy-input-checkbox>
									</div>`
								)}
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

	private _onProblemsCountChange(e: CustomEvent): void {
		this.problemsCount = e.detail.value;
		this.requestUpdate();
		this._onChange();
	}

	private _onExtraOptionChange(e: CustomEvent): void {
		this.extraOptions = this.extraOptions.map(opt => {
			if (opt.id === e.detail.id) {
				return { ...opt, checked: !opt.checked };
			}
			return { ...opt };
		});
		this.requestUpdate();
		this._onChange();
	}

	private _onOperatorChange(e: CustomEvent): void {
		this.operationsConfig = this.operationsConfig.map(operation => {
			if (operation.id === e.detail.id) {
				return { ...operation, checked: !operation.checked };
			}
			return { ...operation };
		});
		this.requestUpdate();
		this._onChange();
	}

	private _onDropdownChange(e: CustomEvent): void {
		this.operationsConfig = this.operationsConfig.map(operation => {
			if (operation.id === e.detail.id) {
				return { ...operation, selectedRange: e.detail.value };
			}
			return { ...operation };
		});
		this.requestUpdate();
		this._onChange();
	}

	private _onTableChange(e: CustomEvent, tableType: string): void {
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

	private _onSelectAll(tableType: string): void {
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

	_onChange(): void {
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
}
