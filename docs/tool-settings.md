# Tool settings

For some tools, users can change the settings based on their preferences. These settings are rendered in a seperate window so they need to be build as a seperate component as well.

A tool can define what settings component needs to be rendered using the `toolDefinition` object. The property `toolDefinition.settingsComponent` indicates the name of the component that needs to be rendered. For example:

```typescript
// src/example-tool.ts

// Always import the Settings component so its bundled when building the package
import './ExampleToolSetting.ts';

export class ExampleTool extends BaseTool {
	constructor() {
		super();
		// define settings component in toolDefinition
		this.toolDefinition = {
			...this.toolDefinition,
			settingsComponent: 'gynzy-example-tool-settings',
		};
	}

	// This function is called with the updated toolData when a user changes settings for this tool
	handleSettingsUpdate(detail: any): void {
		super.handleSettingsUpdate(detail);
		if (detail?.sortOrder) {
			this.updateSortOrder(detail.sortOrder);
		}
	}
}
```

In the above example, when the user opens the settings for this `ExampleTool`, the `example-tool-settings` will be rendered. Tool-settings components have access to the current `toolData`.

## Default state

When the settingsComponent is rendered for the first time, without toolData available, render the settingsComponent in it's default state.

```typescript
// src/example-tool-settings.ts
private sortOrder = 'asc';
```

## Render with toolData

_THIS SECTION IS NOT APPLICABLE FOR THIS DEMO PURPOSES_

When previously saved toolData is available, the host application renders the settingsComponent with the `toolData` attribute filled with this data. The settingsComponent has to reflect the last settings stored by user.

```typescript
// src/example-tool-settings.ts
private _toolData:any = {};

@property({ type: undefined })
get toolData(): any {
	return this._toolData;
}

set toolData(val: any) {
	const oldValue = this._toolData;
	// store toolData in settingsComponent
	this._toolData = val;
	// custom code for this settingsComponent
	// use to override default state
	this.sortOrder = this._toolData.sortOrder;
	// request component update
	this.requestUpdate('toolData', oldValue);
}
```

For more info on how to use your own property accessor with the `@property` decorator, see https://lit-element.polymer-project.org/guide/properties.

## Save changed settings

Every time the user changes a setting, the host application must recieve the changed settings. This can be done by calling the `updateSettings` method defined in [`BaseSettings`](../packages/base-tool/src/BaseSettings.ts) with an object containing all settings. This will dispatch an `'updateSettings'` event.

```typescript
// src/example-tool-settings.ts
_onChange(): void {
	// call every time the user changes a setting
	const value = {
		sortOrder: this.sortOrder,
	};
	this.updateSettings(value);
}
```

### Example

When `hundred-days` tool settings changes, for example when descending selected, this tooldata [is sent](../packages/hundred-days/src/HundredDaysSettings.ts#L93-L101).

```json
{
	"sortOrder": "desc"
}
```

### Exclude settings values from global storage

Every time you change settings, these settings are stored globally per tool. Globally stored settings are used as preference when opening a new tool instance.

If you want to exclude properties, add them to `noPreferenceProperties` property of the `toolDefinition`, so they will not be used when opening a new tool instance. See [`qr-code`](../packages/qr-code/src/QrCode.ts) for an implementation.

```typescript
// src/example-tool.ts
constructor() {
	super();
	this.toolDefinition = {
		...this.toolDefinition,
		...,
		noPreferenceProperties: ['excludedValue'],
	};
}
```

## Disable save settings button

When an invalid combination of settings is selected, the _Save settings_ button needs to be disabled. This can be done by calling the `enableSaveButton` method defined in [`BaseSettings`](../packages/base-tool/src/BaseSettings.ts). This wil dispatch an `'updateSaveButton'` event.

You can call `enableSaveButton` on every change to the settings. `BaseSettings` keeps track of `_saveEnabled` state. It only dispatches an `'updateSaveButton'` event when `saveEnabled` is changed.

```typescript
// src/example-tool-settings.ts
_onChange(): void {
	// disable save button when testvalue is empty
	const saveEnabled: boolean = ...; // add condition
	// call BaseSettings function
	this.enableSaveButton(saveEnabled);
}
```

## Automatically open settings

There are tools that need user input before the tool is useful. An example is the QR-code tool; without a text or an URL no QR-code can be rendered. In these cases it is desired that the settings menu is opened automatically. This can be done by defining the required properties using the `requiredProperties` property of the `toolDefinition` ([docs](../getting-started.md#tool-configuration) and [example](../packages/qr-code/src/QrCode.ts)).

If a tool is added to the board without the required data, the board automatically opens the corresponding settings component. When the user cancels the settings component the tool instance is removed from the board.

```typescript
// src/example-tool.ts
constructor() {
	super();
	this.toolDefinition = {
		...this.toolDefinition,
		...,
		requiredProperties: ['requiredValue'],
	};
}
```

## Apply settings to tool

When the user saves the settings within the host application, the host application will dispatch a `'settingsUpdated'` event. The baseTool will execute the `handleSettingsUpdate` function (see first code snippet).

### Example

When `hundred-days` tool settings updates, function [handleSettingsUpdate](../packages/hundred-days/src/HundredDays.ts#L94-L103) receives this data.

```json
{
	"sortOrder": "desc"
}
```

## Settings component styling

See `packages/test-tool/src/TestToolSettings.ts` for a styled settings example.

Predefined components from `base-tool` are used, like `<gynzy-input-checkbox>` and `<gynzy-input-radio>`.
