import { LitElement } from 'lit-element';
import { LoadingStatus } from '../enums';
import TranslationInfo from '../models/TranslationInfo';
import { Translations } from '../types/Translations';

export class TranslationService {
	private static info: Map<string, TranslationInfo> = new Map<string, TranslationInfo>();

	// Time (in ms) after which a TranslationInfo object is cleaned up when it
	// has become unused. When it is cleaned up, the translations are re-downloaded
	// when a custom element needs the info again. This is not a big issue since
	// the files are cache in the browser.
	private static readonly GARBAGE_COLLECTION_TIMEOUT = 30 * 60 * 1000; // 30-minutes

	private static readonly FALLBACK_LOCALE = 'en-US';

	public static register(customElement: LitElement, customElementKey: string, translationsPath: string): void {
		if (!this.info.get(customElementKey)) {
			this.info.set(customElementKey, new TranslationInfo(translationsPath));
		}

		this.info.get(customElementKey)?.registerInstance(customElement);
	}

	public static unregister(customElement: LitElement, customElementKey: string): void {
		const info: TranslationInfo | undefined = this.info.get(customElementKey);
		if (!info) {
			return;
		}

		info.unregisterInstance(customElement);

		// Garbage collect
		if (!info.hasInstances()) {
			info.scheduleGarbageCollection(() => {
				this.info.delete(customElementKey);
			}, this.GARBAGE_COLLECTION_TIMEOUT);
		}
	}

	public static updateLanguage(
		customElement: LitElement,
		customElementKey: string,
		language: string
	): Promise<Translations> {
		const info: TranslationInfo | undefined = this.info.get(customElementKey);
		if (!info) {
			return Promise.reject(
				new Error(`Custom elment ${customElementKey} has not yet been registered with the translation service.`)
			);
		}

		return info.updateLanguage(customElement, language);
	}

	public static t(
		customElement: LitElement | null,
		customElementKey: string | undefined | null,
		key: string,
		parameters: Record<string, string | number> = {}
	): string {
		const defaultValue: string = `[${key}]`;
		if (!customElement || !customElementKey) {
			return defaultValue;
		}

		const info: TranslationInfo | undefined = this.info.get(customElementKey);
		if (!info) {
			return defaultValue;
		}

		// Translate value (looks at the current locale and, if loaded, the fallback locale)
		const value: string | null = info.translate(customElement, key, parameters);

		// If no value is returned, check if a fallback can be used
		if (value === null && info.getElementLanguage(customElement) !== this.FALLBACK_LOCALE) {
			switch (info.fallbackStatus) {
				case LoadingStatus.NONE:
					// Fallback is not loaded yet.
					info.loadFallbackLocale(this.FALLBACK_LOCALE).then(() => {
						// Update translations once fallback locale is loaded.
						info.updateAllInstances();
					});
					// Prevent flash of unstyled content (FOUC): return an empty
					// string. This leaves the translation empty until the fallback
					// locale is returned. Then either a fallback string is used,
					// or if not present, the default value.
					return '';
				case LoadingStatus.LOADING:
					// Prevent FOUC while the fallback is still loading.
					return '';
				case LoadingStatus.LOADED:
					// If the fallback has been loaded and if the value is not
					// present in both the locale and the fallback, return the
					// default value.
					return defaultValue;
				default:
					break;
			}
		}

		return value ?? defaultValue;
	}
}
