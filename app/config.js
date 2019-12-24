require('dotenv').config();
const path = require('path');

var config = {};

config.db = {
  user: process.env.DB_USER, 
  password: process.env.DB_PASSWORD,
  name: process.env.DB_NAME
};

config.db.details = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql'
};

config.keys = {
  secret: '5d9d65e6831d3f7ffa60f75bef149f546744d7a73c9307b5b84894501df77336'
};

config.upload = path.join('public', 'upload');

module.exports = config;