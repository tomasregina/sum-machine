import { fixture, elementUpdated, oneEvent, expect } from '@open-wc/testing';
import '../../dist/index.js';

let el;
const testId = 'testId';
const testName = 'testName';
const testColor = 'purple-heart';

describe('gynzy-input-radio', () => {
	beforeEach(async () => {
		el = await fixture(`<gynzy-input-radio-color id=${testId} name=${testName}></gynzy-input-radio-color>`);
		await elementUpdated(el);
	});

	it('renders default', async () => {
		expect(el.shadowRoot.querySelector('input')).to.have.id(testId);
		expect(el.shadowRoot.querySelector('input')).to.have.property('checked', false);
	});

	it('renders checked', async () => {
		await el.setAttribute('checked', false);
		expect(el.shadowRoot.querySelector('input')).to.have.property('checked', true);
	});

	it('returns id, name & color when clicked', async () => {
		await el.setAttribute('color', testColor);
		setTimeout(() => el.shadowRoot.querySelector('input').click());
		const { detail } = await oneEvent(el, 'change');
		expect(detail).to.be.eql({
			id: testId,
			color: testColor,
			name: testName,
		});
	});
});
