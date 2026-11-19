require('dotenv').config();
const path = require('path');

module.exports = {
  development: {
    dialect: process.env.DB_DIALECT || 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT || 'sqlite',
    storage: path.join(__dirname, '../database.sqlite'),
    logging: false
  }
};
