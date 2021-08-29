module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['import', 'html'],
	extends: [
		'eslint:recommended',
		'@open-wc/eslint-config',
		'prettier',
		'plugin:import/errors',
		'plugin:import/warnings',
		'plugin:import/typescript',
	],
	rules: {
		// disable the rule for all files
		'@typescript-eslint/no-non-null-assertion': 'off',
		'import/named': 'off',
		'import/no-unresolved': 'off',
		'import/extensions': ['error', 'ignorePackages', { ts: 'never' }],
		'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/*.test.js', '**/*.spec.js', 'scripts/*'] }],
		'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
		'lit/no-useless-template-literals': 'off',
		'no-shadow': 'off',
		'@typescript-eslint/no-shadow': 'error',
		'no-extra-boolean-cast': 'off',
		'no-console': ['error', { allow: ['warn', 'error'] }],
	},
	overrides: [
		{
			files: '**/*.ts',
			plugins: ['@typescript-eslint'],
			extends: ['plugin:@typescript-eslint/eslint-recommended', 'plugin:@typescript-eslint/recommended'],
			rules: {
				'@typescript-eslint/no-inferrable-types': 'off',
			}
		},
		{
			files: '*.test.js',
			rules: {
				'no-unused-expressions': 'off',
			},
		},
		{
			files: '*.ts',
			rules: {
				'wc/guard-super-call': 'off',
			},
		},
		{
			files: 'scripts/*',
			rules: {
				'no-console': 'off',
			},
		},
	],
};
