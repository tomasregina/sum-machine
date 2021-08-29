import IntlMessageFormat from 'intl-messageformat';
import { LitElement } from 'lit-element';
import { LoadingStatus } from '../enums';
import { Translations } from '../types/Translations';

export default class TranslationInfo {
	private translationsPath: string;

	// Map from language to loading promise
	private loadingPromises: Map<string, Promise<Translations>> = new Map<string, Promise<Translations>>();

	// Fallback locale: null if no fallback is used. A locale string if the
	// fallback is being loaded or has completed loading.
	private fallbackLocale: string | null = null;

	public fallbackStatus: LoadingStatus = LoadingStatus.NONE;

	// Map from language to strings
	private strings: Map<string, Translations> = new Map<string, Translations>();

	// Map to keep track of the current language of a custom element.
	// Also used for garbage collection.
	private elementLanguages: Map<LitElement, string | null> = new Map<LitElement, string | null>();

	private garbageCollectTimeout: number | undefined;

	constructor(translationsPath: string) {
		this.translationsPath = translationsPath;
	}

	public async updateLanguage(customElement: LitElement | null, lang: string): Promise<Translations> {
		// Get existing promise or trigger a new load
		const promise: Promise<Translations> = this.loadingPromises.get(lang) ?? this.loadLanguage(lang);

		// Register loading promise
		if (this.loadingPromises.get(lang) !== promise) {
			this.loadingPromises.set(lang, promise);
		}

		// Cache strings
		const strings: Translations = await promise;
		if (this.strings.get(lang) !== strings) {
			this.strings.set(lang, strings);
		}

		if (customElement && this.elementLanguages.get(customElement) !== lang) {
			this.elementLanguages.set(customElement, lang);
		}

		return strings;
	}

	public async loadFallbackLocale(fallbackLocale: string): Promise<Translations> {
		this.fallbackLocale = fallbackLocale;
		this.fallbackStatus = LoadingStatus.LOADING;

		// Load language, but do not set is as current locale on the custom element.
		return this.updateLanguage(null, fallbackLocale).finally(() => {
			this.fallbackStatus = LoadingStatus.LOADED;
		});
	}

	private getTranslationsPath(lang: string): string {
		return this.translationsPath.replace('$language', lang);
	}

	private async loadLanguage(lang: string): Promise<Translations> {
		const path: string = this.getTranslationsPath(lang);
		return fetch(path)
			.then(res => res.json())
			.catch((error: string) => {
				console.error(`Error loading translations from ${path}. Error: ${error}.`);
				return {};
			});
	}

	public getElementLanguage(customElement: LitElement): string | undefined | null {
		return this.elementLanguages.get(customElement);
	}

	public translate(
		customElement: LitElement,
		key: string,
		parameters: Record<string, string | number> = {}
	): string | null {
		const currentLanguage = this.getElementLanguage(customElement);
		const languages: Array<string> = [...new Set([currentLanguage, this.fallbackLocale])].filter(
			Boolean
		) as Array<string>;
		let text: string | null = null;

		for (const language of languages) {
			const strings: Translations | undefined = this.strings.get(language);
			if (!strings) {
				// eslint-disable-next-line no-continue
				continue;
			}

			text = TranslationInfo.lookup(key, strings);

			// Text found: stop looking any further
			if (text !== null) {
				// Parse the found translation using intl-messageformat
				text = new IntlMessageFormat(text).format(parameters) as string;
				break;
			}
		}

		return text;
	}

	public registerInstance(customElement: LitElement): void {
		if (this.garbageCollectTimeout) {
			clearTimeout(this.garbageCollectTimeout);
		}

		this.elementLanguages.set(customElement, null);
	}

	public unregisterInstance(customElement: LitElement): void {
		this.elementLanguages.delete(customElement);
	}

	public hasInstances(): boolean {
		return this.elementLanguages.size > 0;
	}

	public updateAllInstances(): void {
		for (const customElement of this.elementLanguages.keys()) {
			if (customElement.isConnected) {
				customElement.requestUpdate();
			}
		}
	}

	public scheduleGarbageCollection(handler: () => void, time: number): void {
		// Clear possible previous timeout
		if (this.garbageCollectTimeout) {
			clearTimeout(this.garbageCollectTimeout);
		}

		this.garbageCollectTimeout = setTimeout(
			(() => {
				if (this.hasInstances()) {
					return;
				}

				handler();
			}) as TimerHandler,
			time
		);
	}

	/**
	 * Returns a string based on a chain of keys using the dot notation.
	 */
	// Based on https://github.com/andreasbm/lit-translate/blob/b5fe3c3ef9d7f8db9e5f33d3b8b147ce2f53d7cd/src/lib/helpers.ts#L19-L35
	private static lookup(key: string, strings: Translations): string | null {
		// Split the key in parts (example: hello.world)
		const parts = key.split('.');

		// Find the string by traversing through the strings matching the chain of keys
		let string: Translations | string | undefined = strings;

		// Shift through all of the parts of the key while matching with the strings.
		// Do not continue if the string is not defined or if we have traversed all of the key parts
		while (string !== null && string !== undefined && parts.length > 0) {
			string = (string as Translations)[parts.shift() as string];
		}

		// Make sure the string is in fact a string!
		return string != null ? string.toString() : null;
	}
}
