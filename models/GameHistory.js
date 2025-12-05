const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GameHistory = sequelize.define('GameHistory', {
    gameId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    gameMode: {
        type: DataTypes.ENUM('practice', 'multiplayer'),
        allowNull: false
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    opponent: {
        type: DataTypes.STRING,
        allowNull: true
    },
    result: {
        type: DataTypes.ENUM('win', 'lose'),
        allowNull: false
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    coinsCollected: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    enemiesHit: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    bombsHit: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    playedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = GameHistory;
