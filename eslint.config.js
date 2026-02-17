const expoConfig = require('eslint-config-expo/flat');

module.exports = [
	{
		ignores: ['.expo/**', 'node_modules/**'],
	},
	...expoConfig,
];
