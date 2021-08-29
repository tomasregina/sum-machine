export default class Deferred {
	public promise: Promise<void>;

	public resolve!: (value: void | PromiseLike<void>) => void;

	public reject!: (reason?: string) => void;

	constructor() {
		this.promise = new Promise(
			(resolve: (value: void | PromiseLike<void>) => void, reject: (reason?: string) => void) => {
				this.resolve = resolve;
				this.reject = reject;
			}
		);
	}
}
