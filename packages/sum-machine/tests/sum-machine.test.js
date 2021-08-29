import { fixture, expect, elementUpdated } from '@open-wc/testing';
import '../dist/index.js';

let el;

describe('gynzy-sum-machine', () => {
	// const problemsCount = i => el.shadowRoot.querySelectorAll('problems-row')[i].shadowRoot;
	beforeEach(async () => {
		el = await fixture(
			'<gynzy-sum-machine assetPath="packages/sum-machine/dist/assets/" baseAssetPath="packages/sum-machine/dist/assets/base/"></gynzy-sum-machine>'
		);
	});

	it('can be constructed', () => {
		expect(el.tagName.toLowerCase()).to.equal('gynzy-sum-machine');
	});

	it('shows right amount of problems - selected count === actual problems count', async () => {
		await el.handleSettingsUpdate({
			problemsCount: '10',
			selectedExtraOptions: ['crossTens', 'decimal'],
			operationsConfig: [
				{ operation: 'addition', selectedRange: 'Up to 100' },
				{ operation: 'subtraction', selectedRange: 'Up to 20' },
			],
			tablesConfig: [
				{ id: 1, multipChecked: true, divisChecked: false },
				{ id: 4, multipChecked: true, divisChecked: false },
			],
		});
		await elementUpdated(el);
		expect(el.shadowRoot.querySelectorAll('gynzy-problem-row')).to.have.length(10);
		await el.handleSettingsUpdate({
			problemsCount: '1',
			selectedExtraOptions: ['crossTens', 'decimal'],
			operationsConfig: [
				{ operation: 'addition', selectedRange: 'Up to 100' },
				{ operation: 'subtraction', selectedRange: 'Up to 20' },
			],
			tablesConfig: [
				{ id: 1, multipChecked: true, divisChecked: false },
				{ id: 4, multipChecked: true, divisChecked: false },
			],
		});
		await elementUpdated(el);
		expect(el.shadowRoot.querySelectorAll('gynzy-problem-row')).to.have.length(1);
	});
});
