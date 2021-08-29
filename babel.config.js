module.exports = {
	presets: [
		[
			"@babel/preset-env",
			{
				targets: {
					"esmodules": true,
					"chrome": 58,
					"safari": 10,
					"edge": 18
				},
			}
		]
	],
};