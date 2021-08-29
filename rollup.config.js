/* eslint-disable import/no-extraneous-dependencies */
import typescript from '@rollup/plugin-typescript';
import alias from '@rollup/plugin-alias';
import del from 'rollup-plugin-delete';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import watchAssets from 'rollup-plugin-watch-assets';
import path from 'path';
import dotenv from 'dotenv';
import addDecorate from './scripts/rollup-add-decorate.js';

// add development environment if available (not required)
dotenv.config({ path: path.join(__dirname, './config/.env') });

const name = process.env.npm_package_name;
const toolName = name.replace('@gynzy/', '');
const isStart = process.env.npm_lifecycle_event === 'start';
// build for test (PR) and production
const isBuild = process.env.npm_lifecycle_event === 'build';
// to handle production build exeptions, like removing sourcemaps
const isProductionBuild = process.env.BUILD === 'production';
const outputDir = isBuild ? `build` : 'dist';
const demoApplicationDir = '../../demo-application';
const translationsPath = `../../translations/*.json`;
const addSourceMap = !isProductionBuild;
const isBaseTool = toolName === 'base-tool';
// Launch in browser (default: false)
const isLaunch = process.env.LAUNCH_IN_BROWSER === 'true';
const isTest = ['test', 'test:watch'].includes(process.env.npm_lifecycle_event);

export default [
	{
		input: './index.ts',
		plugins: [
			del({
				targets: [`${outputDir}/*`].concat(!isBuild ? [`../base-tool/${outputDir}/*`] : []),
				runOnce: true,
				force: true, // Needed to remove files in the base-tool directory
			}),
			alias({
				entries: [
					{
						find: 'lit-html/lib/shady-render.js',
						replacement: '../../node_modules/lit-html/lit-html.js',
					},
				],
			}),
			resolve({
				browser: true,
			}),
			typescript({
				tsconfig: '../../tsconfig.json',
				include: ['../**/*'],
				sourceMap: addSourceMap,
				inlineSources: addSourceMap,
			}),
			babel({
				presets: ['@babel/preset-env'],
				babelHelpers: 'bundled',
				exclude: 'node_modules/**',
				include: ['../**/*'],
			}),
			commonjs(),
			...(isBaseTool ? [addDecorate()] : []),
			copy({
				targets: [
					{ src: 'assets', dest: outputDir },
					...(isBuild
						? []
						: [
								{ src: '../base-tool/assets/*', dest: `${outputDir}/assets/base` },
								{
									src: translationsPath,
									dest: `${outputDir}/assets/translations`,
									transform: contents => {
										if (isTest) {
											return JSON.stringify({});
										}

										// Only the include the JSON for the tool
										const json = JSON.parse(contents.toString()) || {};
										return JSON.stringify(json[toolName] || {});
									},
								},
								{
									src: `${demoApplicationDir}/index.html`,
									dest: outputDir,
									transform: contents => contents.toString().replace('__TOOL_NAME__', toolName),
								},
								{ src: `${demoApplicationDir}/demo.*`, dest: outputDir },
								{ src: `${demoApplicationDir}/fonts`, dest: outputDir },
						  ]),
				],
			}),
			...(isBuild
				? [
						// Using globs in copy() above did not work.
						del({
							targets: [`**/.DS_Store`],
						}),
				  ]
				: []),
			...(isStart
				? [
						watchAssets({
							assets: [translationsPath, `${demoApplicationDir}/demo.*`, `${demoApplicationDir}/index.html`],
						}),
						serve({
							// Launch in browser
							open: isLaunch,
							// Folder to serve files from
							contentBase: './',
							port: 8000,
							// Serve options
							openPage: `/${outputDir}/`,
							mimeTypes: { 'text/html; charset=utf-8': ['html'] },
						}),
						livereload({ watch: outputDir }),
				  ]
				: []),
		],
		output: [
			{
				dir: outputDir,
				format: 'esm',
				sourcemap: addSourceMap,
				minifyInternalExports: false, // Do not minify exports since that breaks re-use.
				chunkFileNames: '[name].js', // Do not include hash for easier replacing.
			},
		],
		manualChunks: id => {
			if (!isBaseTool && id.includes('/packages/base-tool/')) {
				return 'base-tool';
			}
		},
	},
];
