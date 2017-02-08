const crypto = require('crypto');
const google = require('googleapis');
const credentials = require('../keys/google-credentials.json');

function GoogleDirectory() {
	var jwtClient = new google.auth.JWT(
		credentials.client_email,
		null, credentials.private_key,
		['https://www.googleapis.com/auth/admin.directory.user'],
		process.env.npm_package_config_google_user
	);

	this.service = google.admin({version: 'directory_v1', auth: jwtClient});
}

GoogleDirectory.prototype.insertUser = function(user, callback) {
	this.service.users.insert({resource: {
		primaryEmail: user.xlogin + '@' + process.env.npm_package_config_google_domain,
		name: {
			givenName: user.givenName,
			familyName: user.surname
		},
		password: crypto.createHash('sha1').update(user.password).digest('hex'),
		hashFunction: 'SHA-1',
		changePasswordAtNextLogin: true,
		emails: [{
			address: user.xlogin + '@' + process.env.npm_package_config_google_domain,
			primary: true
		}, {
			address: user.email
		}],
		phones: [{
			value: user.phone,
			primary: true,
		}],
		addresses: [{
			streetAddress: (user.postalAddressLine2) ? user.postalAddress : user.postalAddress + '\n' + user.postalAddressLine2,
			postalCode: user.postcode,
			locality: user.city,
			countryCode: user.country,
			primary: true
		}]
	}, fields: 'primaryEmail', prettyPrint: false}, function(e, d) {
		if (e) {
			if (e.code == 409)
				return callback({status: 403, error: 'user_already_exists'});
			return callback({status: 500, error: 'server_error',
				log: 'Error from Google API (while creating user) ' + e.code + ' ' + JSON.stringify(e.errors)});
		}

		callback(null, d.primaryEmail);
	});
}

module.exports = {
	GoogleDirectory: GoogleDirectory
};
