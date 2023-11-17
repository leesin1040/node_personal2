const CryptoJS = require('crypto-js');
require('dotenv').config();
const env = process.env;

module.exports = (password) => {
	return CryptoJS.SHA3(password, env.JWT_SECREAT_KEY).toString();
};
