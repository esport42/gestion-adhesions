const uuid = require('uuid/v4');
const apiFt = require('./ft.js');

function getMe(api) {
	return function(req, res, next) {
		if (typeof req.query.ftAuthCode === 'undefined' || req.query.ftAuthCode == ''
			|| typeof req.query.ftRedirectUri === 'undefined' || req.query.ftRedirectUri == '')
			return next({status: 400, error: 'missing_parameter', requiredParameters: ['ftAuthCode', 'ftRedirectUri']});

		apiFt.getOAuthToken(req.query.ftAuthCode, req.query.ftRedirectUri, function(e, d) {
			if (e) return next(e);

			apiFt.getMe(d.token, function(e, d) {
				if (e) return next(e);

				d.signupKey = uuid();
				api.locals.ftUsers[d.xlogin] = d;
				res.json(d);
			});
		});
	};
}

module.exports = {
	getMe: getMe
};
