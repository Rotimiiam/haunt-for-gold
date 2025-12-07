const sequelize = require('../config/database');
const VisitEvent = require('./VisitEvent');
const GameModeEvent = require('./GameModeEvent');
const UserSession = require('./UserSession');
const PageViewEvent = require('./PageViewEvent');

module.exports = {
  sequelize,
  VisitEvent,
  GameModeEvent,
  UserSession,
  PageViewEvent
};
