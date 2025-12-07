const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const VisitEvent = sequelize.define('VisitEvent', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Unique session identifier'
  },
  userId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Optional user identifier from cookie'
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  referrer: {
    type: DataTypes.STRING,
    allowNull: true
  },
  page: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Page visited (e.g., home, game, credits)'
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
    { fields: ['timestamp'] }
  ]
});

module.exports = VisitEvent;
