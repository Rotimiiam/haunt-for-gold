const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * PlayerName Model
 * Stores unique player names for the simple auth system
 */
const PlayerName = sequelize.define('PlayerName', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 20]
    }
  },
  normalizedName: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  oderId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Client-side generated player ID from cookie'
  },
  registeredAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  lastSeen: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'player_names',
  timestamps: true
});

module.exports = PlayerName;
