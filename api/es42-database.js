const mysql = require('mysql');

function Es42Database() {
	this.pool = mysql.createPool(
		process.env.npm_package_config_es42_database_socket_path ? {
			socketPath: process.env.npm_package_config_es42_database_socket_path,
			user: process.env.npm_package_config_es42_database_user,
			password: process.env.npm_package_config_es42_database_password,
			database: process.env.npm_package_config_es42_database_dbname,
			connectionLimit: 20
		} : {
			host: process.env.npm_package_config_es42_database_host,
			port: process.env.npm_package_config_es42_database_port,
			user: process.env.npm_package_config_es42_database_user,
			password: process.env.npm_package_config_es42_database_password,
			database: process.env.npm_package_config_es42_database_dbname,
			connectionLimit: 20
		}
	);
}

Es42Database.prototype.insertMember = function(member, callback) {
	console.log(member);
	this.pool.query('INSERT INTO members SET ?', [member], function(e) {
		if (e)
			return callback({status: 500, error: 'server_error',
				log: 'Error from E-Sport 42 database ' + e.code});

		callback();
	});
}

module.exports = {
	Es42Database: Es42Database
};
