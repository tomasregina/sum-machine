/* eslint-disable */
const toolData = {};
const settings = {};
let logData = {};
let toolContainer;
let mainComponent;
let settingsComponent;
let applySettingsButton;

// Enums
const TRANSLATION_MODES = Object.freeze({
	LOCAL: 'local',
	CLOUD: 'cloud',
	CLOUD_TEST: 'cloud-test',
});

function openSettings() {
	console.log('openSettings event is registered');
	log('openSettings');
}
function saveToolData(e) {
	console.log('saveToolData event is registered', e.detail);
	Object.assign(toolData, e.detail);
	log('saveToolData: toolData = ' + JSON.stringify(toolData));
	storeLogData(toolData?.data);
}
function updateSettings(e) {
	console.log('updateSettings event is registered', e.detail);
	Object.assign(settings, e.detail);
	log('updateSetting: settings = ' + JSON.stringify(settings));
	storeLogData(settings);
}
function updateSaveButton(e) {
	applySettingsButton.disabled = !e.detail.enabled;
}
function updateSize(e) {
	console.log('updateSize event is registered', e.detail);
	const { width, height } = e.detail;
	log(`updateSize: width = ${width} and height = ${height}`);
	applySize(width, height);
}
function applySize(width, height) {
	if (!toolContainer) {
		return;
	}

	if (Number.isFinite(width)) {
		toolContainer.style.width = width + 'px';
		toolContainer.dataset.width = width;
	}

	if (Number.isFinite(height)) {
		toolContainer.style.height = height + 'px';
		toolContainer.dataset.height = height;
	}
}
function applyScale(scale = 1) {
	if (typeof toolContainer.dataset.marginBottom === 'undefined') {
		toolContainer.dataset.marginBottom = Number.parseFloat(window.getComputedStyle(toolContainer).marginBottom ?? 0);
	}

	const defaultMarginBottom = Number.parseFloat(toolContainer.dataset.marginBottom);

	toolContainer.style.transform = scale !== 1 && Number.isFinite(scale) ? `scale(${scale})` : '';
	toolContainer.style.marginBottom =
		scale !== 1 && Number.isFinite(scale)
			? `${(scale - 1) * Number.parseFloat(toolContainer.dataset.height) + defaultMarginBottom}px`
			: `${defaultMarginBottom}px`;
	mainComponent.displayScale = scale !== 1 && Number.isFinite(scale) ? { x: scale, y: scale } : { x: 1, y: 1 };
}
function updateScale(event) {
	const scale = Number.parseFloat(event.target.value);
	applyScale(scale);
}
function applySettings() {
	mainComponent.dispatchEvent(
		new CustomEvent('settingsUpdated', {
			detail: settings,
		})
	);
}
function log(value) {
	document.getElementById('logging').innerHTML = value;
}
function storeLogData(data) {
	logData = Object.assign({}, data);
}
function applyDataTool() {
	try {
		const data = getJsonData();
		mainComponent.toolData = data;
	} catch (error) {
		alert(error);
	}
}

function getTranslationsMode() {
	return new URL(window.location).searchParams.get('translations') ?? TRANSLATION_MODES.LOCAL;
}
function getTranslationsPath() {
	const mode = getTranslationsMode();
	switch (mode) {
		case TRANSLATION_MODES.CLOUD:
			return 'https://files.gynzy.com/translations/external-board-tools/$toolName/$language.json';
		case TRANSLATION_MODES.CLOUD_TEST:
			return 'https://files.gynzy.com/translations-test/external-board-tools/$toolName/$language.json';
		default:
			return;
	}
}
function setTranslationsMode(mode) {
	const url = new URL(window.location);
	if (mode !== TRANSLATION_MODES.LOCAL) {
		url.searchParams.set('translations', mode);
	} else {
		url.searchParams.delete('translations');
	}

	if (url.href === window.location.href) {
		return;
	}

	window.location.href = url.href;
}

function init() {
	log('Loading tool...');

	const assetPath = `http://localhost:${window.location.port}/dist/assets/`;
	const baseAssetPath = `http://localhost:${window.location.port}/dist/assets/base/`;
	const toolName = document.body.getAttribute('data-tool-name');
	const translationsPath = getTranslationsPath();
	const namespace = 'gynzy-';
	toolContainer = document.querySelector('#toolContainer');
	applySettingsButton = document.querySelector('#applySettingsButton');

	// Create tool component
	mainComponent = document.createElement(`${namespace}${toolName}`);
	mainComponent.setAttribute('assetPath', assetPath);
	mainComponent.setAttribute('baseAssetPath', baseAssetPath);

	if (translationsPath) {
		mainComponent.setAttribute('translationsPath', translationsPath);
	}

	// Add event listeners
	mainComponent.addEventListener('openSettings', openSettings, false);
	mainComponent.addEventListener('saveToolData', saveToolData, false);
	mainComponent.addEventListener('updateSize', updateSize, false);
	mainComponent.addEventListener(
		'componentReady',
		() => {
			const { width, height } = mainComponent.toolDefinition;
			applySize(width, height);

			log('Tool ready.');
		},
		{
			once: true,
		}
	);
	toolContainer.querySelector('progress').remove();
	toolContainer.appendChild(mainComponent);

	// Setup settings component (if any)
	const settingsContainer = document.querySelector('#settingsContainer');
	const settingsElementName = `${namespace}${toolName}-settings`;
	if (customElements.get(settingsElementName)) {
		settingsComponent = document.createElement(settingsElementName);
		settingsComponent.setAttribute('assetPath', assetPath);
		settingsComponent.setAttribute('baseAssetPath', baseAssetPath);
		settingsComponent.addEventListener('updateSettings', updateSettings, false);
		settingsComponent.addEventListener('updateSaveButton', updateSaveButton, false);
		settingsContainer.querySelector('progress').remove();
		settingsContainer.appendChild(settingsComponent);
	} else {
		settingsContainer.querySelector('progress').remove();
	}
}

document.addEventListener('DOMContentLoaded', () => {
	init();
});
