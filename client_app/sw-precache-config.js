module.exports = {
	cacheId: 'es42-guys',
	staticFileGlobs: [
		'/index.html',
		'/manifest.json',
		'/src/**/strings.json',
		'/src/**/*.png',
		'/images/**/*',
		'/bower_components/webcomponentsjs/webcomponents-lite.min.js'
	],
	navigateFallback: '/index.html',
	navigateFallbackWhitelist: [/^(?!\/api\/|.*\.(?:html|js|json|png)).*$/],
	ignoreUrlParametersMatching: [/.*/]
};
