#!/usr/bin/env node
const fs = require('fs');
const mysql = require('mysql');

function main() {
	var sql = fs.readFileSync('init-database.sql', 'utf-8');

	var c = mysql.createConnection(
		process.env.npm_package_config_es42_database_socket_path ? {
			socketPath: process.env.npm_package_config_es42_database_socket_path,
			user: process.env.npm_package_config_es42_database_user,
			password: process.env.npm_package_config_es42_database_password,
			database: process.env.npm_package_config_es42_database_dbname,
		} : {
			host: process.env.npm_package_config_es42_database_host,
			port: process.env.npm_package_config_es42_database_port,
			user: process.env.npm_package_config_es42_database_user,
			password: process.env.npm_package_config_es42_database_password,
			database: process.env.npm_package_config_es42_database_dbname,
		}
	);

	c.query(sql);
	c.end();
}

if (module === require.main)
	main();
