const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const api = require('./api.js');

const app = express();

app.use(function(req, res, next) {
	console.log((new Date()).toISOString() + req.ip + ' '
		+ req.method + ' ' + req.originalUrl);

	next();
});

app.use(function(req, res, next) {
	if (!req.secure)
		res.redirect(301, 'https://' + req.hostname + ':' + process.env.npm_package_config_port + req.originalUrl);

	else next();
});

app.use('/api', api());

var clientAppPath = fs.existsSync(path.join(__dirname, 'client_app/build/unbundled')) ?
	path.join(__dirname, 'client_app/build/unbundled') : path.join(__dirname, 'client_app');

app.use(express.static(clientAppPath));

app.use(function(req, res) {
	res.sendFile(path.join(clientAppPath, 'index.html'));
});

https.createServer({
	key: fs.readFileSync(path.join(__dirname, 'keys/tls-key.pem')),
	cert: fs.readFileSync(path.join(__dirname, 'keys/tls-cert.pem'))
}, app).listen(
	process.env.npm_package_config_port,
	process.env.npm_package_config_host
);

http.createServer(app).listen(
	process.env.npm_package_config_insecure_port,
	process.env.npm_package_config_host
);
