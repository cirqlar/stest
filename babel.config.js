module.exports = {
	presets: ['module:@react-native/babel-preset'],
	plugins: [
		[
			'module-resolver',
			{
				root: ['.'],
				alias: {
					'@': './src',
				},
			},
		],
		[
			'babel-plugin-inline-import',
			{
				extensions: ['.ndjson'],
			},
		],
	],
};
