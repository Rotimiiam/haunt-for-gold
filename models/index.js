const User = require('./User');
const GameHistory = require('./GameHistory');
const PlayerName = require('./PlayerName');

// Define associations
User.hasMany(GameHistory, { foreignKey: 'userId', as: 'gameHistory' });
GameHistory.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
    User,
    GameHistory,
    PlayerName
};
