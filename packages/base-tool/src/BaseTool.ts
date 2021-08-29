import { css, html, property, TemplateResult } from 'lit-element';
import { ToolData, ToolSettings } from './interfaces';
import { BaseRoot } from './BaseRoot';

interface ToolDefinition {
	width: number;
	height: number;
	settingsComponent?: string;
	globalToolData: boolean;
	autoComponentReady: true;
	requiredProperties?: string[];
	noPreferenceProperties?: string[];
}

export class BaseTool extends BaseRoot {
	protected toolDefinition: ToolDefinition = {
		width: 1280,
		height: 660,
		settingsComponent: '',
		globalToolData: false,
		autoComponentReady: true,
	};

	@property({ type: Object }) displayScale: { x: number; y: number } = { x: 1, y: 1 }; // Combined scale of container element(s)

	private _toolData: ToolData = {};

	private _isInitiated: boolean = false;

	public static styles = [
		css`
			:host {
				display: block;
				font-weight: 400;
				font-family: var(--font-family-base);
				font-size: 16px;
				line-height: 24px;
				color: var(--color-shuttle-gray);
			}
		`,
	];

	@property({ type: undefined })
	get toolData(): ToolData {
		return this._toolData;
	}

	set toolData(val: ToolData) {
		const oldValue = this._toolData;
		this._toolData = val;
		this.handleToolDataUpdated();
		this.requestUpdate('toolData', oldValue);
	}

	getDefinition(): ToolDefinition {
		return this.toolDefinition;
	}

	constructor() {
		super();

		// listen for settings updates
		this.addEventListener('settingsUpdated', (e: Event) => {
			this.handleSettingsUpdate((e as CustomEvent).detail);
		});
	}

	connectedCallback(): void {
		super.connectedCallback();

		if (!this._isInitiated) {
			this._isInitiated = true;
			this.handleToolData();
		}

		this.deferredReady.promise.then(() => {
			if (this.toolDefinition.autoComponentReady) {
				this.componentReady();
			}
		});
	}

	/**
	 * @deprecated This function should not be used anymore, use handleToolData instead
	 */
	// function is executed when toolData attribute is updated
	// eslint-disable-next-line class-methods-use-this
	handleToolDataUpdated(): void {
		// overwrite in derived class
		// console.log('handleToolDataUpdated - tooData =', this.toolData);
	}

	// eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
	handleSettingsUpdate(detail: ToolSettings): void {
		// overwrite in derived class
		// console.log('handleSettingsUpdate - detail =', detail);
	}

	/**
	 * This function is called when the tool is ready to handle toolData
	 */
	// eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
	handleToolData(): void {
		// overwrite in derived class
	}

	/**
	 * dispatch event to save data in webcomponent tool element
	 */
	protected saveToolData(data: ToolData): void {
		const event = new CustomEvent('saveToolData', {
			detail: {
				data,
			},
		});
		this.dispatchEvent(event);
	}

	/**
	 * dispatch event to update tool size on board
	 */
	protected updateSize(width: number, height: number): void {
		const event = new CustomEvent('updateSize', {
			detail: {
				width,
				height,
			},
		});
		this.dispatchEvent(event);
	}

	/**
	 * dispatch event to open this tool's settings component.
	 * This renders the webcomponent defined in toolDefinition.settingsComponent
	 */
	protected openSettingsComponent(): void {
		const event = new CustomEvent('openSettings');
		this.dispatchEvent(event);
	}

	/**
	 * Informs the parent application that the tool is ready to use.
	 */
	protected componentReady(): void {
		const event = new CustomEvent('componentReady');
		this.dispatchEvent(event);
	}

	render(): TemplateResult {
		return html` <p>BaseTool</p> `;
	}
}
