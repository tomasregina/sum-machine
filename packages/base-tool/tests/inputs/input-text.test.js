import { fixture, elementUpdated, oneEvent, expect } from '@open-wc/testing';
import * as baseTool from '../../dist/index.js';

let el;
const assetPath = 'packages/base-tool/dist/assets/';
const testId = 'testId';
const testLabel = 'testLabel';
const testName = 'testName';
const testPlaceholder = 'testPlaceholder';
const testValue = 'testValue';

describe('gynzy-input-text', () => {
	beforeEach(async () => {
		el = await fixture(
			`<gynzy-input-text id=${testId} assetPath=${assetPath} baseAssetPath=${assetPath}></gynzy-input-text>`
		);
		await elementUpdated(el);
	});

	it('renders default', async () => {
		// no label
		expect(el.shadowRoot.querySelector('gynzy-settings-label')).not.to.exist;
		// no nullable or pastable button
		expect(el.shadowRoot.querySelector('button')).not.to.exist;
		// enabled
		expect(el.shadowRoot.querySelector('input')).to.have.property('disabled', false);
	});

	it('renders label', async () => {
		await el.setAttribute('hasLabel', true);
		await el.setAttribute('label', testLabel);
		expect(el.shadowRoot.querySelector('gynzy-settings-label')).to.have.trimmed.text(testLabel);
	});

	it('renders value', async () => {
		await el.setAttribute('value', testValue);
		expect(el.shadowRoot.querySelector('input')).to.have.property('value', testValue);
	});

	it('renders disabled', async () => {
		await el.setAttribute('disabled', true);
		expect(el.shadowRoot.querySelector('input')).to.have.property('disabled', true);
	});

	const sizeTests = ['small', 'medium'];
	sizeTests.forEach(size => {
		it(`renders size ${size}`, async () => {
			await el.setAttribute('size', size);
			expect(el.shadowRoot.querySelector('input')).to.have.class(size);
		});
	});

	it('renders placeholder and removes placeholder on focus', async () => {
		await el.setAttribute('showPlaceholder', true);
		await el.setAttribute('placeholder', testPlaceholder);
		expect(el.shadowRoot.querySelector('input')).to.have.attribute('placeholder', testPlaceholder);
		await el.shadowRoot.querySelector('input').focus();
		expect(el.shadowRoot.querySelector('input')).not.to.have.attribute('placeholder', testPlaceholder);
		await el.shadowRoot.querySelector('input').blur();
		expect(el.shadowRoot.querySelector('input')).to.have.attribute('placeholder', testPlaceholder);
	});

	it('returns id, name & value when input changed', async () => {
		await el.setAttribute('name', testName);
		await el.setAttribute('value', testValue);

		setTimeout(() => el.shadowRoot.querySelector('input').dispatchEvent(new Event('input', { bubbles: true })));
		const { detail } = await oneEvent(el, 'inputChange');
		expect(detail).to.be.eql({
			id: testId,
			name: testName,
			value: testValue,
		});
	});

	it('renders clear input button which clears input', async () => {
		await el.setAttribute('isNullable', true);
		await el.setAttribute('value', testValue);
		expect(el.shadowRoot.querySelector('button img')).to.have.attribute(
			'src',
			`${assetPath}icons/icon-${baseTool.Icons.CLEAR_INPUT}.svg`
		);
		await el.shadowRoot.querySelector('button').click();
		expect(el.shadowRoot.querySelector('input')).to.have.property('value', '');
		expect(el.shadowRoot.querySelector('button')).not.to.exist;
	});

	it('renders paste button', async () => {
		await el.setAttribute('isPastable', true);
		expect(el.shadowRoot.querySelector('button img')).to.have.attribute(
			'src',
			`${assetPath}icons/icon-${baseTool.Icons.COPY_PASTE}.svg`
		);
		// if possible, test could be improved by mocking clipboard and pasting data into textInput
	});
});
