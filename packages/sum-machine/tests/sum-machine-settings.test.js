import { fixture, expect } from '@open-wc/testing';
import '../dist/index.js';

let el;
let selectAllCheckbox;

describe('gynzy-sum-machine-settings', () => {
	beforeEach(async () => {
		el = await fixture(
			'<gynzy-sum-machine-settings assetPath="packages/sum-machine/dist/assets/" baseAssetPath="packages/sum-machine/dist/assets/base/"></gynzy-sum-machine-settings>'
		);
		selectAllCheckbox = el.shadowRoot.querySelector('#multip_all');
	});

	it('can be constructed', () => {
		expect(el.tagName.toLowerCase()).to.equal('gynzy-sum-machine-settings');
	});

	it('(de)selects all checkboxes in multiplication tables', async () => {
		await selectAllCheckbox.shadowRoot.querySelector('input').click();
		expect(el.shadowRoot.querySelector('.multip-checkbox').checked).to.be.true;
		await selectAllCheckbox.shadowRoot.querySelector('input').click();
		expect(el.shadowRoot.querySelector('.multip-checkbox').checked).not.to.be.true;
	});

	it('shows indeterminate correctly in select all checkbox when at least 1 selected', async () => {
		await el.shadowRoot.querySelector('#multip_1').shadowRoot.querySelector('input').click();
		expect(selectAllCheckbox.indeterminate).to.be.true;
	});

	it('shows dropdown initial disabled', async () => {
		expect(el.shadowRoot.querySelector('.dropdown').disabled).to.be.true;
	});

	it('enables dropdown when checkbox checked', async () => {
		await el.shadowRoot.querySelector('.operation-checkbox').shadowRoot.querySelector('input').click();
		expect(el.shadowRoot.querySelector('.dropdown').disabled).not.to.be.true;
	});
});
