import { PropertyValues, LitElement, property } from 'lit-element';

import Deferred from './models/Deferred';
import { AssetService } from './services/AssetService';
import { AudioService } from './services/AudioService';
import { TranslationService } from './services/TranslationService';
import { Translations } from './types/Translations';

// Base class for both BaseTool and BaseSettings
export class BaseRoot extends LitElement {
	@property({ type: String }) protected assetPath = '../assets/';

	@property({ type: String }) protected baseAssetPath = '../assets/';

	@property({ type: String }) protected translationsPath = 'translations/$language.json';

	@property({ type: String }) locale = 'en-US';

	protected _translationsLoaded: boolean = false;

	protected deferredReady: Deferred = new Deferred();

	public assetService: AssetService | null = null;

	public get toolName(): string {
		let elementNameLower: string = this.tagName.toLowerCase();

		if (elementNameLower.startsWith('gynzy-')) {
			elementNameLower = elementNameLower.substring('gynzy-'.length);
		}

		if (elementNameLower.endsWith('-settings')) {
			elementNameLower = elementNameLower.substring(0, elementNameLower.length - '-settings'.length);
		}

		return elementNameLower;
	}

	connectedCallback(): void {
		super.connectedCallback();

		// Initialize asset service
		if (this.assetPath) {
			this.assetService = new AssetService(this.assetPath, this.baseAssetPath);
		}

		// Get asset path for relative paths
		const translationsPath =
			(this.translationsPath ?? '').startsWith('http') || (this.translationsPath ?? '').startsWith('/')
				? this.translationsPath
				: this.getAssetPath(this.translationsPath);

		// Register translations service
		TranslationService.register(this, this.toolName, translationsPath.replace('$toolName', this.toolName));

		// Load initial language
		const promise: Promise<Translations> = TranslationService.updateLanguage(this, this.toolName, this.locale);

		promise.finally(() => {
			this._translationsLoaded = true;

			this.translationsLoaded();

			this.requestUpdate();

			this.deferredReady.resolve();
		});
	}

	disconnectedCallback(): void {
		TranslationService.unregister(this, this.toolName);
	}

	/**
	 * Await additional state before fulfilling the updateComplete promise.
	 * In tests, the fixture() method awaits this promise.
	 */
	async _getUpdateComplete(): Promise<void> {
		await super._getUpdateComplete();
		await this.deferredReady.promise;
	}

	// Defer the first update of the component until the strings have been
	// loaded to avoid empty strings being shown.
	public shouldUpdate(changedProperties: PropertyValues): boolean {
		return this._translationsLoaded && super.shouldUpdate(changedProperties);
	}

	// Function is executed when translations are loaded.
	// eslint-disable-next-line class-methods-use-this
	protected translationsLoaded(): void {
		// overwrite in derived class
	}

	public updated(changedProperties: PropertyValues): void {
		super.updated(changedProperties);

		changedProperties.forEach((_: unknown, propName: string | number | symbol) => {
			switch (propName) {
				case 'locale':
					TranslationService.updateLanguage(this, this.toolName, this.locale)
						.catch((error: string) => {
							console.error(`Error updating language to ${this.locale}. ${error}`);
						})
						.finally(() => {
							this.requestUpdate();
						});
					break;
				default:
					break;
			}
		});
	}

	protected t(key: string, parameters: Record<string, string | number> = {}): string {
		return TranslationService.t(this, this.toolName, key, parameters);
	}

	protected playAudioUrls(urls: string[], options?: { replay: boolean }): void {
		AudioService.playAudioUrls(this, urls, options);
	}

	protected getAssetPath(relativePath: string): string {
		return this.assetService?.getAssetPath(relativePath) ?? '';
	}

	protected getBaseAssetPath(relativePath: string): string {
		return this.assetService?.getBaseAssetPath(relativePath) ?? '';
	}
}
