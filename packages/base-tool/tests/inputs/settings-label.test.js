import { fixture, elementUpdated, expect, html } from '@open-wc/testing';
import '../../dist/index.js';

let el;
const testLabel = 'testLabel';

describe('gynzy-settings-label', () => {
	beforeEach(async () => {
		el = await fixture(
			html`<gynzy-settings-label>${testLabel}</gynzy-settings-label>`
		);
		await elementUpdated(el);
	});

	it('renders', async () => {
		expect(el).to.have.trimmed.text(testLabel);
	});

})