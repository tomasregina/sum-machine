import { fixture, html, oneEvent, expect } from '@open-wc/testing';
import '../../dist/index.js';

let el;

const testId = 'testId';
const testName = 'testName';
const selectedOption = 'One';
const testOptions = ['One', 'Two', 'Three'];
const testLabels = ['1', '2', '3'];
const testPlaceholder = 'testPlaceholder';
const selectIndex = 2;

describe('gynzy-dropdown-basic', () => {
	it('renders default', async () => {
		el = await fixture(html`<gynzy-dropdown-basic></gynzy-dropdown-basic>`);
		expect(el.shadowRoot.querySelector('.custom-select-wrapper')).to.exist;
		expect(el.shadowRoot.querySelector('.custom-options')).to.have.style('visibility', 'hidden');
	});

	it('shows placeholder text when nothing selected', async () => {
		el = await fixture(
			html`<gynzy-dropdown-basic
				id=${testId}
				.options=${testOptions}
				.placeholderText=${testPlaceholder}
			></gynzy-dropdown-basic>`
		);
		expect(el.shadowRoot.querySelector('.custom-select-wrapper span')).to.have.trimmed.text(testPlaceholder);
	});

	it('selects option', async () => {
		el = await fixture(
			html`<gynzy-dropdown-basic .options=${testOptions} .placeholderText=${testPlaceholder}></gynzy-dropdown-basic>`
		);
		expect(el.shadowRoot.querySelector('.custom-select-wrapper span')).to.have.trimmed.text(testPlaceholder);
		await el.shadowRoot.querySelector('.custom-select').click();
		expect(el.shadowRoot.querySelector('.custom-options')).to.have.style('visibility', 'visible');
		for (let i = 0; i < testOptions.length; ++i) {
			expect(el.shadowRoot.querySelector(`.custom-option:nth-child(${i + 1})`)).to.have.trimmed.text(testOptions[i]);
			expect(el.shadowRoot.querySelector(`.custom-option:nth-child(${selectIndex + 1})`)).not.to.have.class('selected');
		}
		await el.shadowRoot.querySelector(`.custom-option:nth-child(${selectIndex + 1})`).click();
		expect(el.shadowRoot.querySelector('.custom-options')).to.have.style('visibility', 'hidden');
		expect(el.shadowRoot.querySelector('.custom-select-wrapper span')).to.have.trimmed.text(testOptions[selectIndex]);
		expect(el.shadowRoot.querySelector(`.custom-option:nth-child(${selectIndex + 1})`)).to.have.class('selected');
	});

	it('shows selected option when defined in selectedOption', async () => {
		el = await fixture(
			html`<gynzy-dropdown-basic .selectedOption=${selectedOption} .options=${testOptions}></gynzy-dropdown-basic>`
		);
		expect(el.shadowRoot.querySelector('.custom-select-wrapper span')).to.have.trimmed.text(selectedOption);
		await el.shadowRoot.querySelector('.custom-select').click();
		expect(el.shadowRoot.querySelector('.custom-option:nth-child(1)')).to.have.class('selected');
	});

	it('shows labels', async () => {
		el = await fixture(
			html`<gynzy-dropdown-basic .options=${testOptions} .labels=${testLabels}></gynzy-dropdown-basic>`
		);
		await el.shadowRoot.querySelector('.custom-select').click();
		for (let i = 0; i < testOptions.length; ++i) {
			expect(el.shadowRoot.querySelector(`.custom-option:nth-child(${i + 1})`)).to.have.trimmed.text(testLabels[i]);
		}
		await el.shadowRoot.querySelector(`.custom-option:nth-child(${selectIndex + 1})`).click();
		expect(el.shadowRoot.querySelector('.custom-select-wrapper span')).to.have.trimmed.text(testLabels[selectIndex]);
	});

	it('renders disabled', async () => {
		el = await fixture(html`<gynzy-dropdown-basic .disabled=${true}></gynzy-dropdown-basic>`);
		expect(el.shadowRoot.querySelector('.custom-select__trigger')).to.have.class('disabled');
	});

	it('dispatches event dropDownOpen when opened', async () => {
		el = await fixture(
			html`<gynzy-dropdown-basic
				id=${testId}
				name=${testName}
				.options=${testOptions}
				.labels=${testLabels}
			></gynzy-dropdown-basic>`
		);
		setTimeout(() => el.shadowRoot.querySelector('.custom-select-wrapper').click());
		const { detail } = await oneEvent(el, 'dropdownOpen');
		expect(detail).to.be.eql({
			this: el,
		});
	});

	it('dispatches event change when selected', async () => {
		el = await fixture(
			html`<gynzy-dropdown-basic
				id=${testId}
				name=${testName}
				.options=${testOptions}
				.labels=${testLabels}
			></gynzy-dropdown-basic>`
		);
		await el.shadowRoot.querySelector('.custom-select').click();
		setTimeout(() => el.shadowRoot.querySelector(`.custom-option:nth-child(${selectIndex + 1})`).click());
		const { detail } = await oneEvent(el, 'change');
		expect(detail).to.be.eql({
			id: testId,
			name: testName,
			value: testOptions[selectIndex],
		});
	});
});
