# Styling

Define scoped styles in a static styles property. Define styles in a tagged template literal, using the css tag function:

```typescript
import { LitElement, css, html } from 'lit-element';
import { BaseElement } from '@gynzy/base-tool';

class MyElement extends BaseElement {
	static get styles() {
		return css`
			div {
				color: red;
			}
		`;
	}
}
```

https://lit-element.polymer-project.org/guide/styles

## Tool styling in pixels

Tools are scaled on the board. Therefore, we use pixel styling in tools.

```css
.tool-item {
	top: 130px;
	left: 399px;
	border-radius: 5px;
}
```

## Settings styling in rem

Settings components are rendered in a different layer. Use rem styling in settings.

```css
.settings-item {
	font-size: 1.56rem;
	padding-left: 1.25rem;
	line-height: 2.08rem;
}
```

## Background images

Due to the project structure using relative URLs in CSS is **not** possible, e.g.:

```css
.some-selector {
	background: url('../assets/images/background.jpg');
}
```

There are two recommended solutions to this problem:

1. Use a styleMap.
2. Use CSS variables.

### StyleMap

A [styleMap](https://lit-html.polymer-project.org/guide/styling-templates#stylemap) can be used to set CSS URLs on elements.

```typescript
import { StyleInfo, styleMap } from 'lit-html/directives/style-map';

private backgroundStyle: StyleInfo = {};

export class TestTool extends BaseTool {
	connectedCallback(): void {
		super.connectedCallback();

		// set background image with dynamic url
		this.backgroundStyle = { backgroundImage: `url('${this.getAssetPath('images/background.jpg')}` };
	}

	render(): TemplateResult {
		return html`
			<div class="container" style=${styleMap(this.backgroundStyle)}>
		`;
	}
}
```

### CSS variables

CSS variables can also be used to define URLs. This way, one can just write regular CSS (in the `styles` property of the component). For example:

```typescript
export class DiceElement extends BaseElement {
	static styles = css`
		.dice-img.black-bg {
			background-image: var(--dice-roll-dice-black);
			...
		}`;
}
```

The URL for the image can be defined by including a `style` element in the HTML template:

```typescript
render(): TemplateResult {
		return html`
			<style>
				:host {
					--dice-roll-dice-black: url('${this.getAssetPath(
						'dice/dice_black.png'
					)}');
				}
			</style>`;
}
```

In order to avoid name clashes with other CSS variables, the CSS variable is prefixed with the package name (here `dice-roll`).

This solution is preferred over adding a complete definition of `.dice-img.black-bg` in the `style` element for two reasons:

1. All styles are in one place (only the URLs are defined elsewhere).
2. Style elements do not perform as well as the `styles` property ([explanation](https://lit-element.polymer-project.org/guide/styles#in-a-style-element)).

## Fonts

The default tool font is [Open Sans](https://fonts.google.com/specimen/Open+Sans) and can be referenced using the CSS variable `--font-family-base`. For example:

```css
p {
	font-family: var(--font-family-base);
}
```

Other available fonts:

1. `--font-family-digi`: ds-digi font used for digital clock numbers.

It is not needed to load these fonts in the web component itself, the host handles CSS font loading.

## Colors

Gynzy has defined a number of colors in its style guide. These colors can be viewed in [Storybook](https://gynzy.github.io/gynzy-storybook/?path=/story/atoms--colors). The most important colors are defined as CSS variables and have to be used as such. E.g. the color _riverbed_ can be used as follows:

```css
p {
	color: var(--color-riverbed);
}
```

The list of variables that can be used can be found in [the style file](../demo-application/demo.css) of the demo.

### Color filters

In order to color a (black) SVG icon, the `--color-filter-*` variables can be used. For example:

```css
button.color--secondary img {
	filter: var(--color-filter-shuttle-gray);
}
```

The color filters are generated using [this codepen](https://codepen.io/sosuke/pen/Pjoqqp).

### Undefined colors

When a color is not (yet) available as a CSS variable there are two options:

1. The color is a 'one-off' color and there is no need to create a variable.
2. The color is likely to be re-used in other components. In that case the variable should be added to the style file of the demo **and** the host application. The latter can only be done by a Gynzy-developer.

When in doubt, please discuss with someone of the Gynzy team.
