# Getting started

## Tool Configuration

Every tool needs some configuration to be able to be rendered by the host application. This is information about dimentions and settings. This is done by defining the toolDefinition.

The following settings can be set:
definition | optional | explanation
---------- | -------- | -----------
width | true | Needs to be set when developing non-fullpage tools. Default is 1280.
height | true | Needs to be set when developing non-fullpage tools. Default is 660.
settingsComponent | true | If the tool has settings, this is a reference to the settings-component name.
globalToolData | true | Determines whether tool data is stored globally instead of per instance. Defaults to `false`.
requiredProperties | true | Can be used to auto-open the settings menu for new tools by marking properties as 'required'.
noPreferenceProperties | true | These properties are not saved to global settings and will not be used when opening a new tool instance.

```typescript
// src/example-tool.ts
export class ExampleTool extends BaseTool {
	constructor() {
		super();
		// define settings component in toolDefinition
		this.toolDefinition = {
			...this.toolDefinition,
			width: 400,
			height: 300,
			settingsComponent: "gynzy-example-tool-settings"
			globalToolData: false
		}
	}
}
```

## Running a tool locally

Running a `yarn start` within a tool's directory will build the tool and serve it locally at: `http://localhost:8000/dist/`

Any changes to the code will automatically rebuild the tool and refresh the page. If it fails because of an error, restart dev server manually.

## Project stucture

`/src` - typescript code\
`/assets` - assets like images\
`/dist` - `src` and `assets` compile to dist for local development (git ignored)

### Assets

In order to use assets (for example images) the `getAssetPath` helper method can be used.

There are two types of assets: _tool assets_ and _base assets_.

#### Tool assets

Tool assets are tool-specific assets and should be placed in the `assets` folder of the tool. They can be used as follows:

```html
<img src="${this.getAssetPath('images/balloon.svg')}" />
```

#### Base assets

Base assets are assets that can be used in multiple tools. For example icons for a button. In order to use these assets the `getBaseAssetPath` method should be used:

```html
<img src="${this.getBaseAssetPath(`icons/icon-${Icons.TRASH}.svg`)}" />
```

### Custom elements

All custom elements should start with the prefix `gynzy-`. For the tool component and settings component this prefix is automatically added by the "create" script.

Please note that the `gynzy-`-prefix is _not_ used elsewhere (e.g. in directory names, in the manager or in the npm package name).

## Reusable components

In `packages/base-tool` there are some reusable components

### Buttons

ButtonRegular supports both pixel and rem styling. When the `environment` attribute is set to `tool`, pixel styling is used so that it can be used in the tool. When it is set to `settings`, rem styling is used so that it can be used in the settings component.

By default, the ButtonRegular width is proportional to the text. If you need fixed width buttons, define a `minWidth` value in px or rem.

```html
<gynzy-button-regular
	.text=${this.t("use.assets.translations")}
	.icon=${Icons.SOME_ICON}
	color='primary (default) || secondary || light'
	size='medium (default) || small'
	environment='tool (default) || settings'
	minWidth=${"200px || 5rem"}
	@click=${this._action}>
</gynzy-button-regular>
```

See [packages/test-tool/src/TestTool.ts](../packages/test-tool/src/TestTool.ts) and [packages/test-tool/src/TestToolSettings.ts](../packages/test-tool/src/TestToolSettings.ts) for a example usage.

### Settings

Some components have rem styling and can only be used in settings.

`<gynzy-input-checkbox>` and `<gynzy-input-radio>`

See [packages/test-tool/src/TestToolSettings.ts](../packages/test-tool/src/TestToolSettings.ts) for a example usage.
