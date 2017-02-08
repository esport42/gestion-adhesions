const express = require('express');
const bodyParser = require('body-parser');
const apiLimits = require('./api/limits.js');
const apiFtuser = require('./api/ftuser.js');
const apiMember = require('./api/member.js');
const apiError = require('./api/error.js');

function api() {
	const api = express();

	api.locals.ftUsers = {};

	api.use(bodyParser.json());

	if (process.env.npm_package_config_api_request_limit > 0
		&& process.env.npm_package_config_api_request_limit_period > 0)
		api.use(apiLimits(api));

	api.route('/ftuser/me')
		.get(apiFtuser.getMe(api))
		.all(apiError.methodNotSupported(['GET']));

	api.route('/member')
		.post(apiMember.createMember(api))
		.all(apiError.methodNotSupported(['POST']));

	api.all(apiError.noSuchEndpoint);

	api.use(apiError.errorHandler);

	return api;
}

module.exports = api;
