# Translations

All plain text in a tool- or settings-component needs to be defined in a translation file for easy translations.

## Structure

There is a single JSON file for each language that contains the translations for all tools. The translations for a specific tool should be namespaced by placing them under a property that has the name of the tool. For example, `en-US.json` contains the English translations for the `test-tool` as follows:

```json
{
	...,
	"test-tool": {
		"tool": {
			"title": "Test tool title",
			...
		},
		"settings": {
			...
		}
	},
	...
}
```

## Implementation

To translate a value the `t()` method of the base class can be called as follows:

```typescript
render(): TemplateResult {
	return html`
		<label>${this.t("settings.select-order")}</label>
	`;
}
```

### Variable interpolation

We use `intl-messageformat` to parse translations.
In some cases a text with variable content is required. Variable interpolation is supported by the translation service and can be used by enclosing the variable name in double curly braces. For example:

```json
{
	...,
	"test-tool": {
		"hello": "Hello {{name}}!",
		...
	},
	...
}
```

The parameter can be passed as follows to render a span with the text `Hello World!`:

```typescript
render(): TemplateResult {
	return html`
		<span>${this.t("hello", { name: 'World' })}</span>
	`;
}
```

Check out [intl-messageformat](https://formatjs.io/docs/intl-messageformat/) for more advanced usages, e.g. pluralizations.
