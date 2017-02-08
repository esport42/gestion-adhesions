function apiLimits(api) {
	api.locals.rlBans = {};
	api.locals.rlRequestLogs = {};
	api.locals.rlLimit = Number(process.env.npm_package_config_api_request_limit);
	api.locals.rlPeriod = Number(process.env.npm_package_config_api_request_limit_period);
	api.locals.rlBanThreshold = Number(process.env.npm_package_config_api_request_limit_ban_threshold);
	api.locals.rlBanDuration = Number(process.env.npm_package_config_api_request_limit_ban_duration);

	return function(req, res, next) {
		const reqTime = Math.floor(Date.now() / 1000);

		if (typeof api.locals.rlBans[req.ip] !== 'undefined') {
			if (api.locals.rlBans[req.ip] >= reqTime)
				return req.destroy();
			else
				delete api.locals.rlBans[req.ip];
		}

		if (typeof api.locals.rlRequestLogs[req.ip] === 'undefined')
			api.locals.rlRequestLogs[req.ip] = [];

		while (api.locals.rlRequestLogs[req.ip].length > 0
			&& reqTime > api.locals.rlRequestLogs[req.ip][0] + api.locals.rlPeriod)
			api.locals.rlRequestLogs[req.ip].shift();

		api.locals.rlRequestLogs[req.ip].push(reqTime);

		if (api.locals.rlRequestLogs[req.ip].length > api.locals.rlLimit) {
			if (api.locals.rlBanThreshold > 0 && api.locals.rlBanDuration > 0
				&& api.locals.rlRequestLogs[req.ip].length >= api.locals.rlBanThreshold) {
				api.locals.rlBans[req.ip] = reqTime + api.locals.rlBanDuration;

				if (api.locals.rlBanDuration >= api.locals.rlPeriod)
					delete api.locals.rlRequestLogs[req.ip];

				return next({status: 429, error: 'you_are_banned_motherfucker',
					retryAfter: api.locals.rlBanDuration});
			}

			return next({status: 429, error: 'calm_down', retryAfter: api.locals.rlPeriod});
		}

		next();
	};
}

module.exports = apiLimits;
