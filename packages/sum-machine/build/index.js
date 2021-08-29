import { BaseSettings, css, __decorate, property, customElement, html, BaseTool } from './base-tool.js';

const defaultState = {
    problemsCount: 10,
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
            {
                id: 'remainders',
                value: 'remainders',
                label: 'settings.extra-options.remainder',
                checked: false,
            },
        ];
        this.rangeConfig = ['Up to 10', 'Up to 20', 'Up to 50', 'Up to 100'];
        this.operationsConfig = [
            {
                id: 'addition',
                value: 'addition',
                label: 'settings.operations-config.addition',
                checked: false,
                range: this.rangeConfig,
                selectedRange: 'Up to 100',
            },
            {
                id: 'subtraction',
                value: 'subtraction',
                label: 'settings.operations-config.subtraction',
                checked: false,
                range: this.rangeConfig,
                selectedRange: 'Up to 100',
            },
            {
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
            },
        ];
        // this.tableConfig = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        this.tablesConfig = [
            { id: 1, value: 1, multip_checked: false, divis_checked: false },
            { id: 2, value: 2, multip_checked: false, divis_checked: false },
            { id: 3, value: 3, multip_checked: false, divis_checked: false },
            { id: 4, value: 4, multip_checked: false, divis_checked: false },
            { id: 5, value: 5, multip_checked: false, divis_checked: false },
            { id: 6, value: 6, multip_checked: false, divis_checked: false },
            { id: 7, value: 7, multip_checked: false, divis_checked: false },
            { id: 8, value: 8, multip_checked: false, divis_checked: false },
            { id: 9, value: 9, multip_checked: false, divis_checked: false },
            { id: 10, value: 10, multip_checked: false, divis_checked: false },
            { id: 11, value: 11, multip_checked: false, divis_checked: false },
            { id: 12, value: 12, multip_checked: false, divis_checked: false },
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
			<div class="settings-component">
				<div class="settings-column">
					<div class="settings-section">
						<gynzy-settings-label>${this.t('settings.problems-count')}</gynzy-settings-label>
						${this.problemsCountOptions.map(item => html `<gynzy-input-radio
									id="${item.id}"
									.value=${item.value}
									.label=${item.label}
									.checked=${item.value === this.problemsCount}
									@change=${this._onProblemsCountChange}
								></gynzy-input-radio>`)}
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
						${this.operationsConfig.map(item => html `<div class="operator-settings">
									<gynzy-input-checkbox
										id="${item.id}"
										.value=${item.value}
										.label=${this.t(item.label)}
										.checked=${item.checked}
										@change=${this._onOperatorChange}
									></gynzy-input-checkbox>
									<gynzy-dropdown-basic
										id=${item.id}
										.options=${item.range}
										selectedOption=${item.range[3]}
										.disabled=${!item.checked}
										@change=${this._onDropdownChange}
									></gynzy-dropdown-basic>
								</div> `)}
						<gynzy-settings-label>${this.t('settings.multip-table')}</gynzy-settings-label>
						<div class="d-flex flex-row">
							${this.tablesConfig.map(item => html `<div>
									<gynzy-input-checkbox
										id="multip_${item.id}"
										.value="multip_${item.value}"
										.label=${item.value}
										.checked=${item.multip_checked}
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
							@change=${(e) => this._onSelectAll(e, 'multip')}
						></gynzy-input-checkbox>

						<gynzy-settings-label>${this.t('settings.divis-table')}</gynzy-settings-label>
						<div class="d-flex flex-row">
							${this.tablesConfig.map(item => html `<div>
									<gynzy-input-checkbox
										id="divis_${item.id}"
										.value="divis_${item.value}"
										.label=${item.value}
										.checked=${item.divis_checked}
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
							@change=${(e) => this._onSelectAll(e, 'divis')}
						></gynzy-input-checkbox>
					</div>
				</div>
			</div>
		`;
    }
    // this.tablesConfig.some(tab => tab.multip_checked) &&	this.tablesConfig.some(tab => !tab.multip_checked)
    _onProblemsCountChange(e) {
        this.problemsCount = e.detail.value;
        this.requestUpdate();
        this._onChange();
    }
    _onExtraOptionChange(e) {
        this.extraOptions.map(opt => {
            if (opt.id === e.detail.id) {
                opt.checked = !opt.checked;
            }
        });
        this.requestUpdate();
        this._onChange();
    }
    _onOperatorChange(e) {
        this.operationsConfig.map(operation => {
            if (operation.id === e.detail.id) {
                operation.checked = !operation.checked;
            }
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
        const checkedKey = `${tableType}_checked`;
        this.tablesConfig = this.tablesConfig.map(tab => {
            if (tab.id === e.detail.label) {
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
    _onSelectAll(e, tableType) {
        const checkedKey = `${tableType}_checked`;
        this.tablesConfig = this.tablesConfig.map(tab => ({ ...tab, [checkedKey]: !this.allSelected[tableType.toString()] }));
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
                .filter(tab => tab.multip_checked || tab.divis_checked)
                .map(tab => ({ id: tab.id, multip_checked: tab.multip_checked, divis_checked: tab.divis_checked })),
        };
        this.updateSettings(value);
    }
};
SumMachineSettings.styles = [
    ...BaseSettings.styles,
    css `
			:host {
			}
			.operator-settings {
				display: grid;
				grid-template-columns: 150px 200px;
			}
			.d-flex {
				gap: 5px;
			}
		`,
];
__decorate([
    property({ attribute: false })
], SumMachineSettings.prototype, "toolData", null);
SumMachineSettings = __decorate([
    customElement('gynzy-sum-machine-settings')
], SumMachineSettings);

class SumMachine extends BaseTool {
    constructor() {
        super();
        this.title = 'Hey there';
        this.counter = 5;
        this.toolDefinition = {
            ...this.toolDefinition,
            settingsComponent: 'gynzy-sum-machine-settings',
        };
    }
    handleToolData() {
        super.handleToolData();
    }
    handleSettingsUpdate(detail) {
        super.handleSettingsUpdate(detail);
    }
    __increment() {
        this.counter += 1;
    }
    render() {
        return html `
			<h2>${this.title} Nr. ${this.counter}!</h2>
			<button @click=${this.__increment}>increment</button>
		`;
    }
}
SumMachine.styles = [
    ...BaseTool.styles,
    css `
			:host {
			}

		`,
];
__decorate([
    property({ type: String })
], SumMachine.prototype, "title", void 0);
__decorate([
    property({ type: Number })
], SumMachine.prototype, "counter", void 0);

window.customElements.define('gynzy-sum-machine', SumMachine);
//# sourceMappingURL=index.js.map
