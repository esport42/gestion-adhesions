#!/usr/bin/env node
const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const api = require('./api.js');

function main() {
	const app = express();

	app.use(function(req, res, next) {
		console.log((new Date()).toISOString() + req.ip + ' '
			+ req.method + ' ' + req.originalUrl);

		next();
	});

	if (process.env.npm_package_config_port) {
		app.use(function(req, res, next) {
			if (!req.secure)
				res.redirect(301, 'https://' + req.hostname + ':' + process.env.npm_package_config_port + req.originalUrl);

			else next();
		});
	}

	app.use('/api', api());

	if (process.env.npm_package_config_serve_app) {
		var clientAppPath = fs.existsSync(path.join(__dirname, 'client_app/build/unbundled')) ?
			path.join(__dirname, 'client_app/build/unbundled') : path.join(__dirname, 'client_app');

		app.use(process.env.npm_package_config_app_prefix || '/', express.static(clientAppPath));

		app.use(process.env.npm_package_config_app_prefix || '/', function(req, res) {
			res.sendFile(path.join(clientAppPath, 'index.html'));
		});
	}

	if (process.env.npm_package_config_port) {
		https.createServer({
			key: fs.readFileSync(path.join(__dirname, 'keys/tls-key.pem')),
			cert: fs.readFileSync(path.join(__dirname, 'keys/tls-cert.pem'))
		}, app).listen(
		process.env.npm_package_config_port,
		process.env.npm_package_config_host
		);
	}

	if (process.env.npm_package_config_insecure_port) {
		http.createServer(app).listen(
			process.env.npm_package_config_insecure_port,
			process.env.npm_package_config_host
		);
	}
}

if (module === require.main)
	main();
