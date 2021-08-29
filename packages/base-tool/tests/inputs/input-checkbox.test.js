import { fixture, elementUpdated, oneEvent, expect } from '@open-wc/testing';
import '../../dist/index.js';

let el;
const testId = 'testId';
const testText = 'testText';
const testValue = 'testValue';
const testName = 'testName';

describe('gynzy-input-checkbox', () => {
	beforeEach(async () => {
		el = await fixture(`<gynzy-input-checkbox id=${testId}></gynzy-input-checkbox>`);
		await elementUpdated(el);
	});

	it('renders default', async () => {
		expect(el.shadowRoot.querySelector('input')).to.have.id(testId);
		expect(el.shadowRoot.querySelector('input')).to.have.property('checked', false);
		expect(el.shadowRoot.querySelector('label')).to.have.trimmed.text('');
		expect(el.shadowRoot.querySelector('label')).not.to.have.class('disabled');
	});

	it('renders checked', async () => {
		await el.setAttribute('checked', false);
		expect(el.shadowRoot.querySelector('input')).to.have.property('checked', true);
	});

	it('renders disabled', async () => {
		await el.setAttribute('disabled', true);
		expect(el.shadowRoot.querySelector('label')).to.have.class('disabled');
	});

	it('renders indeterminate', async () => {
		await el.setAttribute('indeterminate', true);
		expect(el.shadowRoot.querySelector('input')).to.have.class('indeterminate');
	});

	it('renders label', async () => {
		await el.setAttribute('label', testText);
		expect(el.shadowRoot.querySelector('label')).to.have.trimmed.text(testText);
	});

	it('returns id, label & value when clicked', async () => {
		await el.setAttribute('label', testText);
		await el.setAttribute('value', testValue);
		await el.setAttribute('name', testName);
		setTimeout(() => el.shadowRoot.querySelector('input').click());
		const { detail } = await oneEvent(el, 'change');
		expect(detail).to.be.eql({
			id: testId,
			label: testText,
			name: testName,
			value: testValue,
		});
	});
});
