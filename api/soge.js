const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function ApiSoge() {
}

ApiSoge.prototype.getSogeHostingForm = function(callback) {
    if (typeof this.sogeHostingForm !== 'undefined')
        return callback(null, this.sogeHostingForm);

    var rs = fs.createReadStream(path.join(__dirname, '../assets/soge-hosting.pdf'));

    var buffers = [];

    rs.on('data', function(d) {
        buffers.push(d);
    });

    rs.on('end', function() {
        this.sogeHostingForm = Buffer.concat(buffers).toString('base64');

        callback(null, this.sogeHostingForm);
    }.bind(this));

    rs.on('error', function(e) {
        callback({status: 500, error: 'server_error',
            log: 'Error while reading soge-hosting.pdf ' + JSON.stringify(e)});
    });
}

ApiSoge.prototype.generateSogeCertificate = function(member, callback) {
	var author = process.env.npm_package_config_soge_author;

	var pdf = new PDFDocument({size: 'A4'});

	var buffers = [];

	pdf.on('data', function(d) {
		buffers.push(d);
	});

	pdf.on('end', function() {
		callback(null, Buffer.concat(buffers).toString('base64'));
	});

	pdf.on('error', function(e) {
		callback({status: 500, error: 'server_error',
			log: 'Error while generating PDF ' + JSON.stringify(e)});
	});

	pdf.font('Helvetica').fontSize('11');

	pdf.text('E-SPORT 42').text(author).text('96 Boulevard Bessières').text('75017 PARIS')
		.moveDown();

	pdf.text(member.givenName + ' ' + member.surname, {align: 'right'})
		.text(member.postalAddress, {align: 'right'});

	if (member.postalAddressLine2)
		pdf.text(member.postalAddressLine2, {align: 'right'});

	pdf.text(member.postcode + ' ' + member.city, {align: 'right'})
		.moveDown();

	pdf.text('Fait à Paris, le ' + (new Date()).toLocaleDateString('fr-FR'), {align: 'right'})
		.moveDown();

	pdf.font('Helvetica-Bold')
		.text('Objet : Attestation d\'adhésion au sein de l\'association E-Sport 42')
		.font('Helvetica')
		.moveDown();

	pdf.text('Madame, Monsieur,').moveDown().text('Je soussigné ' + author
		+ ', agissant en qualité de secrétaire de l\'association E-Sport 42, atteste que '
		+ member.givenName + ' ' + member.surname + ', demeurant au ' + member.postalAddress
		+ (member.postalAddressLine2 ? ', ' + member.postalAddressLine2 + ', ' : ' ')
		+ member.postcode + ' ' + member.city
		+ ', est membre de l\'association E-Sport 42.')
		.moveDown();

	pdf.text(author, {align: 'right'});

	pdf.end();
}

module.exports = ApiSoge;
