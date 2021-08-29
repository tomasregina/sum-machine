import { fixture, elementUpdated, expect } from '@open-wc/testing';
import * as baseTool from '../../dist/index.js';

let el;
const assetPath = 'packages/base-tool/dist/assets/';

describe('gynzy-button-square', () => {
	beforeEach(async () => {
		el = await fixture(
			`<gynzy-button-square assetPath=${assetPath} baseAssetPath=${assetPath}></gynzy-button-regular>`
		);
		await elementUpdated(el);
	});

	it('renders default', async () => {
		expect(el.shadowRoot.querySelector('.img')).not.to.exist;
		expect(el.shadowRoot.querySelector('button')).to.have.property('disabled').eq(false);
	});

	it('renders disabled', async () => {
		await el.setAttribute('disabled', true);
		expect(el.shadowRoot.querySelector('button')).to.have.property('disabled');
	});

	const colors = Object.values(baseTool.ButtonColors);
	colors.forEach(color => {
		it(`renders color ${color}`, async () => {
			await el.setAttribute('color', color);
			expect(el.shadowRoot.querySelector('button')).to.have.class(`color--${color}`);
		});
	});

	const sizes = Object.values(baseTool.ButtonSizes);
	sizes.forEach(size => {
		it(`renders size ${size}`, async () => {
			await el.setAttribute('size', size);
			expect(el.shadowRoot.querySelector('button')).to.have.class(`size--${size}`);
		});
	});

	const environments = Object.values(baseTool.Environments);
	environments.forEach(environment => {
		it(`renders environment ${environment}`, async () => {
			await el.setAttribute('environment', environment);
			expect(el.shadowRoot.querySelector('button')).to.have.class(`environment--${environment}`);
		});
	});

	const icons = Object.values(baseTool.Icons);
	icons.forEach(icon => {
		it(`renders icon ${icon}`, async () => {
			await el.setAttribute('icon', icon);
			expect(el.shadowRoot.querySelector('img')).to.have.attribute('src', `${assetPath}icons/icon-${icon}.svg`);
		});
	});
});
