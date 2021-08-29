# Tool data

_THIS SECTION IS NOT APPLICABLE FOR THIS DEMO PURPOSES_

## Saving state data

While users interact with the tool, it might be important to save the state of a tool.
The tool needs to notify the host application it wants to save some state.

When extending the `BaseTool`, the `saveToolData` function will notify our host application that the tool's data has been changed.

You can create a helper method in your tool to save the tool data as follows:

```typescript
export class ExampleTool extends BaseTool {
	private _saveData(): void {
		// call BaseTool save function
		this.saveToolData({
			selectedDay: this.selectedDay,
		});
	}
}
```

The next time the tool is rendered, the host application renders the tool with the `toolData` attribute filled with this data. The `toolData` attribute will not be updated automatically after calling `saveToolData`. So you cannot depend on `toolData` to always be up-to-date.

## Receiving state data

When a tool is opened you can use the previously saved `toolData` (if any). The host application provides this functionality by setting the `toolData` property on the component with the previously stored data. This data can be used to restore the state of the tool.

```typescript
export class ExampleTool extends BaseTool {
	handleToolData(): void {
		super.handleToolData();
		// When the tool is rendered, the toolData contains the data-object last send by `saveToolData`
		if (this.toolData.selectedDay) {
			this.selectedDay = this.toolData.selectedDay;
		}
	}
}
```

## Data structure

Tool data is always a JSON like object containing all the data needed to rebuild the tool in it's current state. Any `undefined` values will be filtered out. Nested array's are **not** supported.

### JSON example

Example from [hundred-days tool](../packages/hundred-days/src/HundredDays.ts).

When tool state changes, for example when a day is selected, this tooldata is sent with [function \_saveData](../packages/hundred-days/src/HundredDays.ts#L160-L168).

```json
{
	"data": {
		"selectedDay": 12,
		"sortOrder": "asc"
	}
}
```

When the same tool is rendered next time, the [toolData attribute](../packages/hundred-days/src/HundredDays.ts#L81-L92) is filled with this saved data.

```json
{
	"selectedDay": 12,
	"sortOrder": "asc"
}
```
