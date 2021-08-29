import { LitElement } from 'lit-element';

export class AssetService {
	private assetPath: string | undefined;

	private baseAssetPath: string | undefined;

	constructor(assetPath: string, baseAssetPath: string | null = null) {
		const reTrimSlashes: RegExp = new RegExp('[\\/]+$', 'g');

		// Store asset path without trailing slash(es)
		this.assetPath = (assetPath || '').replace(reTrimSlashes, '');

		if (baseAssetPath) {
			reTrimSlashes.lastIndex = 0;

			this.baseAssetPath = (baseAssetPath ?? '').replace(reTrimSlashes, '');
		}
	}

	public getAssetPath(relativePath: string): string {
		return `${this.assetPath}/${relativePath}`;
	}

	public getBaseAssetPath(relativePath: string): string {
		return `${this.baseAssetPath}/${relativePath}`;
	}

	public static getRootAssetService(element: LitElement): AssetService | null {
		if (!element) {
			return null;
		}

		let elt: Node = element;

		while (elt) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			if ((elt as any).assetService) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				return (elt as any).assetService;
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
}
