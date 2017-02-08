const uuid = require('uuid/v4');

function noSuchEndpoint(req, res, next) {
	next({status: 404, error: 'no_such_endpoint'});
}

function methodNotSupported(allowedMethods) {
	return function(req, res, next) {
		next({status: 405, error: 'method_not_supported', allowedMethods: allowedMethods});
	};
}

function errorHandler(err, req, res, next) {
	if (typeof err.log !== 'undefined') {
		err.id = uuid();
		console.error('ERROR ' + err.id + ' ' + err.log);
		delete err.log;
	}

	if (err.status == 405)
		res.setHeader('Allow', err.allowedMethods.join(','));

	if (err.status == 429)
		res.setHeader('Retry-After', err.retryAfter);

	res.status(err.status).json(err);
}

module.exports = {
	noSuchEndpoint: noSuchEndpoint,
	methodNotSupported: methodNotSupported,
	errorHandler: errorHandler
};
