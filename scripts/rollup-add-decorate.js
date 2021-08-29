// This plugin adds the __decorate method to the export of a file. In regular
// cases this method is added during TypeScript compilation with tslib.
// When chunks are used, rollup decides to include this method only once and
// let other files include it from there.
// With the current base-tool solution a generic chunks is mimiced by exporting
// all necessary methods. Since __decorate is an 'internal' method it can not
// be (re-)exported.
export default function addDecorate() {
	return {
		name: 'add-decorate', // this name will show up in warnings and errors
		renderChunk(code) {
			const exportsIndex = code.lastIndexOf('export {');

			const transformedCode =
				exportsIndex >= 0
					? `${code.substring(0, exportsIndex)}export { __decorate, ${code.substring(exportsIndex + 'export {'.length)}`
					: code;

			return {
				code: transformedCode,
				map: null, // Do not transform source map
			};
		},
	};
}
