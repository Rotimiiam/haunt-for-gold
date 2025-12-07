const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PageViewEvent = sequelize.define('PageViewEvent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  page: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Page identifier (e.g., home, game, credits)'
  },
  path: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Full URL path'
  },
  timeOnPage: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Time spent on page in seconds'
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['sessionId'] },
    { fields: ['userId'] },
    { fields: ['page'] },
    { fields: ['timestamp'] }
  ]
});

module.exports = PageViewEvent;
