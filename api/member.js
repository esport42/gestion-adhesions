const crypto = require('crypto');
const apiGoogleDirectory = require('./google-directory.js');
const googleDirectory = new apiGoogleDirectory.GoogleDirectory();
const apiGoogleMail = require('./google-mail.js');
const googleMail = new apiGoogleMail.GoogleMail();
const ApiSoge = require('./soge.js');
const apiSoge = new ApiSoge();

function _validateMember(member) {
	const countries = [
		'AF', 'AX', 'AL', 'DZ', 'AS', 'AD', 'AO', 'AI', 'AQ', 'AG', 'AR', 'AM',
		'AW', 'AU', 'AT', 'AZ', 'BS', 'BH', 'BD', 'BB', 'BY', 'BE', 'BZ', 'BJ',
		'BM', 'BT', 'BO', 'BQ', 'BA', 'BW', 'BV', 'BR', 'IO', 'BN', 'BG', 'BF',
		'BI', 'CV', 'KH', 'CM', 'CA', 'KY', 'CF', 'TD', 'CL', 'CN', 'CX', 'CC',
		'CO', 'KM', 'CG', 'CD', 'CK', 'CR', 'CI', 'HR', 'CU', 'CW', 'CY', 'CZ',
		'DK', 'DJ', 'DM', 'DO', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'ET', 'FK',
		'FO', 'FJ', 'FI', 'FR', 'GF', 'PF', 'TF', 'GA', 'GM', 'GE', 'DE', 'GH',
		'GI', 'GR', 'GL', 'GD', 'GP', 'GU', 'GT', 'GG', 'GN', 'GW', 'GY', 'HT',
		'HM', 'VA', 'HN', 'HK', 'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IM',
		'IL', 'IT', 'JM', 'JP', 'JE', 'JO', 'KZ', 'KE', 'KI', 'KP', 'KR', 'KW',
		'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI', 'LT', 'LU', 'MO', 'MK',
		'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MQ', 'MR', 'MU', 'YT', 'MX',
		'FM', 'MD', 'MC', 'MN', 'ME', 'MS', 'MA', 'MZ', 'MM', 'NA', 'NR', 'NP',
		'NL', 'NC', 'NZ', 'NI', 'NE', 'NG', 'NU', 'NF', 'MP', 'NO', 'OM', 'PK',
		'PW', 'PS', 'PA', 'PG', 'PY', 'PE', 'PH', 'PN', 'PL', 'PT', 'PR', 'QA',
		'RE', 'RO', 'RU', 'RW', 'BL', 'SH', 'KN', 'LC', 'MF', 'PM', 'VC', 'WS',
		'SM', 'ST', 'SA', 'SN', 'RS', 'SC', 'SL', 'SG', 'SX', 'SK', 'SI', 'SB',
		'SO', 'ZA', 'GS', 'SS', 'ES', 'LK', 'SD', 'SR', 'SJ', 'SZ', 'SE', 'CH',
		'SY', 'TW', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TK', 'TO', 'TT', 'TN', 'TR',
		'TM', 'TC', 'TV', 'UG', 'UA', 'AE', 'GB', 'US', 'UM', 'UY', 'UZ', 'VU',
		'VE', 'VN', 'VG', 'VI', 'WF', 'EH', 'YE', 'ZM', 'ZW'
	];

	var invalidAttributes = [];

	if (member.givenName.length > 40 || !/^[A-Za-z0-9\- ]+$/.test(member.givenName))
		invalidAttributes.push('givenName');

	if (member.surname.length > 40 || !/^[A-Za-z0-9\- ]+$/.test(member.surname))
		invalidAttributes.push('surname');

	if (member.birthdate === NaN || member.birthdate <= -2208988800000 || member.birthdate >= Date.now())
		invalidAttributes.push('birthdate');

	if (member.phone && !/^\+(?:33[1-79][0-9]{8}|(?!33)[0-9]{4,15})$/.test(member.phone))
		invalidAttributes.push('phone');

	/* Hurting-eyes Ultimate Regex (HEAVY).
	 * Cannot be Understood normally. Must have No Soul and Sacrifice 3 days to Understand.
	 * When Modified, inflicts 3000 MB data loss unless the Modifier has Extended Knowledge of Regexes.
	 */
	if (!/^(?:[A-Za-z0-9!#$%&'*+\-/=?^_`{|}~]+(?:\.[A-Za-z0-9!#$%&'*+\-/=?^_`{|}~]+)*|"(?:[^"\\]|\\.)+")@(?:[A-Za-z0-9!#$%&'*+\-/=?^_`{|}~]+(?:\.[A-Za-z0-9!#$%&'*+\-/=?^_`{|}~]+)*|\[(?:[^[\\\]]|\\.)+\])$/.test(member.email))
		invalidAttributes.push('email');

	if (countries.indexOf(member.country) == -1)
		invalidAttributes.push('country');

	if (member.country == 'FR' && !/^[0-9]{5}$/.test(member.postcode))
		invalidAttributes.push('postcode');

	return invalidAttributes;
}

function createMember(api) {
	return function(req, res, next) {
		const requiredParameters = ['xlogin', 'signupKey', 'birthdate', 'postalAddress', 'postcode', 'city', 'country'];

		for (param of requiredParameters)
			if (typeof req.body[param] === 'undefined' || req.body[param] == '')
				return next({status: 400, error: 'missing_parameter', requiredParameters: requiredParameters});

		if (typeof api.locals.ftUsers[req.body.xlogin] === 'undefined'
			|| req.body.signupKey !== api.locals.ftUsers[req.body.xlogin].signupKey)
			return next({status: 403, error: 'invalid_signup_key'});

		var member = {
			xlogin: req.body.xlogin,
			givenName: api.locals.ftUsers[req.body.xlogin].givenName,
			surname: api.locals.ftUsers[req.body.xlogin].surname,
			birthdate: Date.parse(req.body.birthdate),
			postalAddress: req.body.postalAddress,
			postalAddressLine2: req.body.postalAddressLine2 || '',
			postcode: req.body.postcode,
			city: req.body.city,
			country: req.body.country,
			email: req.body.email || api.locals.ftUsers[req.body.xlogin].email,
			nick: req.body.nick || '',
			phone: (typeof req.body.phone !== 'undefined') ?
				req.body.phone.replace(/ |-|\(|\)/g, '').replace(/^0(?=[1-9][0-9]{8}$)/g, '+33') : '',
			steam: req.body.steam || '',
			soge: Boolean(req.body.soge)
		};

		var invalidParameters = _validateMember(member);

		if (invalidParameters.length > 0)
			return next({status: 400, error: 'invalid_parameter',
				invalidParameter: invalidParameters});

		crypto.randomBytes(15, function(e, d) {
			if (e) return next({status: 500, error: 'server_error',
				log: 'Error while generating password ' + JSON.stringify(e)});

			member.password = d.toString('base64');

			googleDirectory.insertUser(member, function(e, d) {
				if (e) return next(e);

				member.googleUser = d;

				/* add to es42 database */

				api.render('welcome-email.ejs', {
					sender: process.env.npm_package_config_google_user,
					member: member,
					discordUrl: 'https://discord.gg/QWW2qZY'
				}, function(e, d) {
					if (e) return console.log('Error while rendering welcome-email.ejs', e);

					googleMail.sendMail(d, function(err) {
						if (err) console.log(err.log);
					});
				});

				if (member.soge) {
                    apiSoge.getSogeHostingForm(function(e, d) {
                        if (e) return console.log(e.log);

                        var sogeHostingForm = d;

                        apiSoge.generateSogeCertificate(member, function(e, d) {
                            if (e) return console.log(e.log);

                            api.render('soge-email.ejs', {
                                sender: process.env.npm_package_config_google_user,
                                member: member,
                                sogeAuthor: process.env.npm_package_config_soge_author,
                                sogeCertificate: d,
                                sogeHosting: sogeHostingForm
                            }, function(e, d) {
                                if (e) return console.log('Error while rendering soge-email.ejs', e);

                                googleMail.sendMail(d, function(err) {
                                    if (err) console.log(err.log);
                                });
                            });
                        });
                    });
				}

				delete member.password;

				res.status(201).json(member);
			});
		});
	};
}

module.exports = {
	createMember: createMember
}
