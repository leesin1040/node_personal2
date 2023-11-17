require('dotenv').config();
const env = process.env;
const development = {
	username: env.DB_USER,
	password: env.DB_PASS,
	database: env.DB_NAME,
	host: env.DB_HOST,
	dialect: 'mysql',
};
const test = {
	username: env.DB_USER,
	password: null,
	database: 'database_test',
	host: '127.0.0.1',
	dialect: 'mysql',
};
const production = {
	username: env.DB_USER,
	password: null,
	database: 'database_production',
	host: '127.0.0.1',
	dialect: 'mysql',
};
module.exports = { development, production, test };
