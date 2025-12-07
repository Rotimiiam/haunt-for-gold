require('dotenv').config();
const { Sequelize } = require('sequelize');
const path = require('path');

const databasePath = process.env.DATABASE_PATH || path.join(__dirname, '..', 'analytics.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: databasePath,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

module.exports = sequelize;
