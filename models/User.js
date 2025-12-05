const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 20]
    }
  },
  displayName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [0, 30]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [6, 100]
    }
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isGuest: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  githubId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  stats: {
    type: DataTypes.JSON,
    defaultValue: {
      totalGames: 0,
      wins: 0,
      losses: 0,
      highestScore: 0,
      totalScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      totalCoinsCollected: 0,
      totalEnemiesHit: 0,
      totalBombsHit: 0,
      totalPlayTime: 0
    }
  },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: {
      character: 'Alex',
      soundEnabled: true,
      notificationsEnabled: true,
      theme: 'dark'
    }
  }
}, {
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password') && user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance method to compare password
User.prototype.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to add game result
User.prototype.addGameResult = async function (gameData) {
  const { GameHistory } = require('./index');

  // Create game history record
  await GameHistory.create({
    userId: this.id,
    ...gameData
  });

  // Update stats
  const stats = { ...this.stats };
  stats.totalGames += 1;
  stats.totalScore += gameData.score;
  stats.totalCoinsCollected += gameData.coinsCollected || 0;
  stats.totalEnemiesHit += gameData.enemiesHit || 0;
  stats.totalBombsHit += gameData.bombsHit || 0;
  stats.totalPlayTime += gameData.duration || 0;

  if (gameData.score > stats.highestScore) {
    stats.highestScore = gameData.score;
  }

  if (gameData.result === 'win') {
    stats.wins += 1;
    stats.currentStreak += 1;
    if (stats.currentStreak > stats.longestStreak) {
      stats.longestStreak = stats.currentStreak;
    }
  } else {
    stats.losses += 1;
    stats.currentStreak = 0;
  }

  this.stats = stats;
  await this.save();
};

// Static method to get leaderboard
User.getLeaderboard = async function (type = 'highScore', limit = 10) {
  let order;

  switch (type) {
    case 'highScore':
      order = [[sequelize.json('stats.highestScore'), 'DESC']];
      break;
    case 'wins':
      order = [[sequelize.json('stats.wins'), 'DESC']];
      break;
    case 'totalGames':
      order = [[sequelize.json('stats.totalGames'), 'DESC']];
      break;
    default:
      order = [[sequelize.json('stats.highestScore'), 'DESC']];
  }

  const users = await User.findAll({
    where: { isGuest: false },
    attributes: ['username', 'displayName', 'avatar', 'stats'],
    order: order,
    limit: limit
  });

  return users.map((user, index) => {
    const plainUser = user.get({ plain: true });
    // Calculate virtuals
    const winRate = plainUser.stats.totalGames === 0 ? 0 : Math.round((plainUser.stats.wins / plainUser.stats.totalGames) * 100);
    const averageScore = plainUser.stats.totalGames === 0 ? 0 : Math.round(plainUser.stats.totalScore / plainUser.stats.totalGames);

    return {
      rank: index + 1,
      username: plainUser.username,
      displayName: plainUser.displayName,
      avatar: plainUser.avatar,
      stats: plainUser.stats,
      winRate,
      averageScore
    };
  });
};

module.exports = User;
