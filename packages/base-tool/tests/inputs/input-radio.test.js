import { fixture, elementUpdated, oneEvent, expect } from '@open-wc/testing';
import '../../dist/index.js';

let el;
const testId = 'testId';
const testText = 'testText';
const testValue = 'testValue';
const testName = 'testName';

describe('gynzy-input-radio', () => {
	beforeEach(async () => {
		el = await fixture(`<gynzy-input-radio id=${testId}></gynzy-input-radio>`);
		await elementUpdated(el);
	});

	it('renders default', async () => {
		expect(el.shadowRoot.querySelector('input')).to.have.id(testId);
		expect(el.shadowRoot.querySelector('input')).to.have.property('checked', false);
		expect(el.shadowRoot.querySelector('label')).to.have.trimmed.text('');
	});

	it('renders checked', async () => {
		await el.setAttribute('checked', false);
		expect(el.shadowRoot.querySelector('input')).to.have.property('checked', true);
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
