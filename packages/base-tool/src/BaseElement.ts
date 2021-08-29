import { property, LitElement } from 'lit-element';
import { BaseRoot } from './BaseRoot';
import { AssetService } from './services/AssetService';
import { AudioService } from './services/AudioService';
import { TranslationService } from './services/TranslationService';

export class BaseElement extends LitElement {
	@property({ type: String }) private assetPath: string | null = null;

	@property({ type: String }) private baseAssetPath: string | null = null;

	private assetService: AssetService | null = null;

	private rootAssetService: AssetService | null = null;

	protected baseRoot: BaseRoot | null = null;

	connectedCallback(): void {
		super.connectedCallback();

		this.rootAssetService = AssetService.getRootAssetService(this);

		this.baseRoot = BaseElement.getBaseRoot(this);

		// Initialize asset service (only used during tests)
		if (this.assetPath) {
			this.assetService = new AssetService(this.assetPath, this.baseAssetPath);
		}
	}

	protected getAssetPath(relativePath: string): string {
		return (this.assetService ?? this.rootAssetService)?.getAssetPath(relativePath) ?? '';
	}

	protected getBaseAssetPath(relativePath: string): string {
		return (this.assetService ?? this.rootAssetService)?.getBaseAssetPath(relativePath) ?? '';
	}

	private static getBaseRoot(element: LitElement): BaseRoot | null {
		let elt: Node = element;

		while (elt) {
			// Use toolName as a marker for cases where the instance
			// check does not work.
			if (elt instanceof BaseRoot || (elt as BaseRoot).toolName) {
				return elt as BaseRoot;
			}

			if (elt instanceof ShadowRoot) {
				elt = elt.host;
			} else {
				elt = elt.getRootNode();
			}

			// Top reached
			if (elt instanceof Document) {
				break;
			}
		}

		return null;
	}

	protected t(key: string, parameters: Record<string, string | number> = {}): string {
		return TranslationService.t(this.baseRoot, this.baseRoot?.toolName, key, parameters);
	}

	protected playAudioUrls(urls: string[], options?: { replay: boolean }): void {
		if (!this.baseRoot) {
			return;
		}

		AudioService.playAudioUrls(this.baseRoot, urls, options);
	}
}
