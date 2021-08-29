import { LitElement } from 'lit-element';

interface PlayAudioOptions {
	/**
	 * If replay is false and there is a sound playing it will stop the current
	 * sound and stop playing, otherwise it will stop the current sound and
	 * start playing the new sound.
	 */
	replay: boolean;
}

export class AudioService {
	/**
	 * Play a list of audio URLs.
	 *
	 * @param customElement Root element.
	 * @param urls Absolute URLs of files to play.
	 * @param options Options object.
	 */
	public static playAudioUrls(
		customElement: LitElement,
		urls: string[],
		options: PlayAudioOptions = { replay: true }
	): void {
		const event = new CustomEvent('playAudio', {
			detail: {
				urls,
				options,
			},
		});

		customElement.dispatchEvent(event);
	}
}
