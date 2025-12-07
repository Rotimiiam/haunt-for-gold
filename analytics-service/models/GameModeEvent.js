const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GameModeEvent = sequelize.define('GameModeEvent', {
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
  gameMode: {
    type: DataTypes.ENUM('practice', 'online', 'local'),
    allowNull: false,
    comment: 'Type of game mode played'
  },
  gameId: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Unique identifier for the game session'
  },
  startedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  endedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Game duration in seconds'
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Whether the game was completed or abandoned'
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  result: {
    type: DataTypes.ENUM('win', 'lose', 'tie', 'abandoned'),
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['sessionId'] },
    { fields: ['userId'] },
    { fields: ['gameMode'] },
    { fields: ['startedAt'] },
    { fields: ['completed'] }
  ]
});

module.exports = GameModeEvent;
