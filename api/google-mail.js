const google = require('googleapis');
const credentials = require('../keys/google-credentials.json');

function GoogleMail() {
	var jwtClient = new google.auth.JWT(
		credentials.client_email,
		null, credentials.private_key,
		['https://www.googleapis.com/auth/gmail.send'],
		process.env.npm_package_config_google_user
	);

	this.service = google.gmail({version: 'v1', auth: jwtClient});
}

GoogleMail.prototype.sendMail = function(mail, callback) {
	this.service.users.messages.send({userId: 'me', resource: {
		raw: new Buffer(mail.replace(/\r(?!\n)/g, '\r\n').replace(/(^|[^\r])\n/g, '$1\r\n'))
			.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
	}, fields: '', prettyPrint: false}, function(e, d) {
		if (e) return callback({status: 500, error: 'server_error',
			log: 'Error from Google API (while sending mail) ' + e.code + ' ' + JSON.stringify(e.errors)});

		callback(null);
	});
}

module.exports = {
	GoogleMail: GoogleMail
};
