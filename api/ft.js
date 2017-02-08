const https = require('https');

function _getResponseData(callback) {
	return function(response) {
		if (response.statusCode / 100 == 5)
			return callback({status: 500, error: 'server_error',
				log: 'Error from FT API ' + response.statusCode});

		response.rawData = '';

		response.on('data', function(chunk) {
			response.rawData += chunk;
		});

		response.on('end', function() {
			try {
				response.data = JSON.parse(response.rawData);
			} catch (e) {
				console.error('Error while parsing JSON', response.rawData, e);
				return callback({status: 500, error: 'server_error',
					log: 'Bad JSON from FT API ' + response.rawData});
			}

			callback(null, response);
		});
	}
}

function _handleOAuthResponse(callback) {
	return function(e, response) {
		if (e) return callback(e);

		if (response.statusCode != 200 || typeof response.data.error !== 'undefined') {
			if (typeof response.data.error !== 'undefined' && response.data.error == 'invalid_grant')
				return callback({status: 403, error: 'invalid_authorization_code',});

			return callback({status: 500, error: 'server_error',
				log: 'Error from FT API ' + response.statusCode
					+ ' with data ' + response.rawData});
		}

		callback(null, {token: response.data.access_token});
	};
}

function _handleFtUserResponse(callback) {
	return function(e, response) {
		if (e) return callback(e);

		if (response.statusCode != 200 || typeof response.data.error !== 'undefined')
			return callback({status: 500, error: 'server_error',
				log: 'FT API replied error ' + response.statusCode
					+ ' with data ' + response.rawData});

		callback(null, {
			xlogin: response.data.login,
			givenName: response.data.first_name,
			surname: response.data.last_name,
			phone: response.data.phone,
			email: response.data.email
		});
	}
}

function getOAuthToken(authCode, redirectUri, callback) {
	var request = https.request({
		hostname: 'api.intra.42.fr',
		method: 'POST',
		path: '/oauth/token',
		headers: {'Content-Type': 'application/x-www-form-urlencoded'}
	});

	request.on('response', _getResponseData(_handleOAuthResponse(callback)));

	request.write('grant_type=authorization_code'
		+ '&client_id=' + encodeURIComponent(process.env.npm_package_config_ft_client_id)
		+ '&client_secret=' + encodeURIComponent(process.env.npm_package_config_ft_client_secret)
		+ '&redirect_uri=' + encodeURIComponent(redirectUri)
		+ '&code=' + encodeURIComponent(authCode));

	request.end();
}

function getMe(token, callback) {
	var request = https.request({
		hostname: 'api.intra.42.fr',
		path: '/v2/me',
		headers: {'Authorization': 'Bearer ' + token}
	});

	request.on('response', _getResponseData(_handleFtUserResponse(callback)));

	request.end();
}

module.exports = {
	getOAuthToken: getOAuthToken,
	getMe: getMe
};
