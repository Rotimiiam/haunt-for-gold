const express = require('express');
const router = express.Router();
const { VisitEvent, GameModeEvent, UserSession, PageViewEvent } = require('../models');
const { Op } = require('sequelize');

/**
 * Track a visit event
 * POST /api/analytics/visit
 */
router.post('/visit', async (req, res) => {
  try {
    const { sessionId, userId, ipAddress, userAgent, referrer, page } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const visit = await VisitEvent.create({
      sessionId,
      userId,
      ipAddress,
      userAgent,
      referrer,
      page
    });

    // Update or create user session
    const [session, created] = await UserSession.findOrCreate({
      where: { sessionId },
      defaults: {
        sessionId,
        userId,
        startTime: new Date(),
        lastActivityTime: new Date(),
        pageViews: 1,
        isActive: true
      }
    });

    if (!created) {
      session.lastActivityTime = new Date();
      session.pageViews += 1;
      if (userId && !session.userId) {
        session.userId = userId;
      }
      await session.save();
    }

    res.status(201).json({ success: true, visitId: visit.id });
  } catch (error) {
    console.error('Error tracking visit:', error);
    res.status(500).json({ error: 'Failed to track visit' });
  }
});

/**
 * Track a game mode event (start)
 * POST /api/analytics/game/start
 */
router.post('/game/start', async (req, res) => {
  try {
    const { sessionId, userId, gameMode, gameId } = req.body;
    
    if (!sessionId || !gameMode) {
      return res.status(400).json({ error: 'sessionId and gameMode are required' });
    }

    if (!['practice', 'online', 'local'].includes(gameMode)) {
      return res.status(400).json({ error: 'Invalid gameMode. Must be practice, online, or local' });
    }

    const gameEvent = await GameModeEvent.create({
      sessionId,
      userId,
      gameMode,
      gameId,
      startedAt: new Date()
    });

    // Update user session
    const session = await UserSession.findOne({ where: { sessionId } });
    if (session) {
      session.lastActivityTime = new Date();
      session.gamesPlayed += 1;
      await session.save();
    }

    res.status(201).json({ success: true, eventId: gameEvent.id });
  } catch (error) {
    console.error('Error tracking game start:', error);
    res.status(500).json({ error: 'Failed to track game start' });
  }
});

/**
 * Track a game mode event (end)
 * POST /api/analytics/game/end
 */
router.post('/game/end', async (req, res) => {
  try {
    const { sessionId, gameId, completed, score, result } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    // Find the most recent game event for this session
    let gameEvent;
    if (gameId) {
      gameEvent = await GameModeEvent.findOne({
        where: { sessionId, gameId },
        order: [['startedAt', 'DESC']]
      });
    } else {
      gameEvent = await GameModeEvent.findOne({
        where: { sessionId, endedAt: null },
        order: [['startedAt', 'DESC']]
      });
    }

    if (!gameEvent) {
      return res.status(404).json({ error: 'Game event not found' });
    }

    const endedAt = new Date();
    const duration = Math.floor((endedAt - new Date(gameEvent.startedAt)) / 1000);

    gameEvent.endedAt = endedAt;
    gameEvent.duration = duration;
    gameEvent.completed = completed !== undefined ? completed : true;
    if (score !== undefined) gameEvent.score = score;
    if (result) gameEvent.result = result;
    
    await gameEvent.save();

    // Update session activity
    const session = await UserSession.findOne({ where: { sessionId } });
    if (session) {
      session.lastActivityTime = new Date();
      await session.save();
    }

    res.json({ success: true, eventId: gameEvent.id, duration });
  } catch (error) {
    console.error('Error tracking game end:', error);
    res.status(500).json({ error: 'Failed to track game end' });
  }
});

/**
 * Track a page view event
 * POST /api/analytics/pageview
 */
router.post('/pageview', async (req, res) => {
  try {
    const { sessionId, userId, page, path, timeOnPage } = req.body;
    
    if (!sessionId || !page) {
      return res.status(400).json({ error: 'sessionId and page are required' });
    }

    const pageView = await PageViewEvent.create({
      sessionId,
      userId,
      page,
      path,
      timeOnPage
    });

    // Update session activity
    const session = await UserSession.findOne({ where: { sessionId } });
    if (session) {
      session.lastActivityTime = new Date();
      await session.save();
    }

    res.status(201).json({ success: true, eventId: pageView.id });
  } catch (error) {
    console.error('Error tracking page view:', error);
    res.status(500).json({ error: 'Failed to track page view' });
  }
});

/**
 * End a user session
 * POST /api/analytics/session/end
 */
router.post('/session/end', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    const session = await UserSession.findOne({ where: { sessionId } });
    
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    session.endTime = new Date();
    session.isActive = false;
    session.duration = Math.floor((session.endTime - new Date(session.startTime)) / 1000);
    await session.save();

    res.json({ success: true, duration: session.duration });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({ error: 'Failed to end session' });
  }
});

/**
 * Get total visit counts
 * GET /api/analytics/visits/total
 */
router.get('/visits/total', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {};
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = new Date(startDate);
      if (endDate) where.timestamp[Op.lte] = new Date(endDate);
    }

    const totalVisits = await VisitEvent.count({ where });
    const uniqueSessions = await VisitEvent.count({
      where,
      distinct: true,
      col: 'sessionId'
    });

    res.json({ 
      totalVisits, 
      uniqueSessions,
      startDate: startDate || 'all',
      endDate: endDate || 'all'
    });
  } catch (error) {
    console.error('Error getting visit totals:', error);
    res.status(500).json({ error: 'Failed to get visit totals' });
  }
});

/**
 * Get game mode statistics
 * GET /api/analytics/games/modes
 */
router.get('/games/modes', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {};
    if (startDate || endDate) {
      where.startedAt = {};
      if (startDate) where.startedAt[Op.gte] = new Date(startDate);
      if (endDate) where.startedAt[Op.lte] = new Date(endDate);
    }

    const practiceCount = await GameModeEvent.count({ where: { ...where, gameMode: 'practice' } });
    const onlineCount = await GameModeEvent.count({ where: { ...where, gameMode: 'online' } });
    const localCount = await GameModeEvent.count({ where: { ...where, gameMode: 'local' } });

    res.json({
      practice: practiceCount,
      online: onlineCount,
      local: localCount,
      total: practiceCount + onlineCount + localCount,
      startDate: startDate || 'all',
      endDate: endDate || 'all'
    });
  } catch (error) {
    console.error('Error getting game mode stats:', error);
    res.status(500).json({ error: 'Failed to get game mode statistics' });
  }
});

/**
 * Get active user sessions and concurrent players
 * GET /api/analytics/sessions/active
 */
router.get('/sessions/active', async (req, res) => {
  try {
    // Consider sessions active if last activity was within the last 30 minutes
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const activeSessions = await UserSession.count({
      where: {
        isActive: true,
        lastActivityTime: {
          [Op.gte]: thirtyMinutesAgo
        }
      }
    });

    // Count concurrent players (active game sessions in last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const concurrentPlayers = await GameModeEvent.count({
      where: {
        startedAt: {
          [Op.gte]: fiveMinutesAgo
        },
        endedAt: null
      }
    });

    res.json({
      activeSessions,
      concurrentPlayers,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error getting active sessions:', error);
    res.status(500).json({ error: 'Failed to get active sessions' });
  }
});

/**
 * Get game completion rates
 * GET /api/analytics/games/completion
 */
router.get('/games/completion', async (req, res) => {
  try {
    const { startDate, endDate, gameMode } = req.query;
    
    const where = {};
    if (startDate || endDate) {
      where.startedAt = {};
      if (startDate) where.startedAt[Op.gte] = new Date(startDate);
      if (endDate) where.startedAt[Op.lte] = new Date(endDate);
    }
    if (gameMode) {
      where.gameMode = gameMode;
    }

    const totalGames = await GameModeEvent.count({ where });
    const completedGames = await GameModeEvent.count({
      where: { ...where, completed: true }
    });

    const completionRate = totalGames > 0 
      ? ((completedGames / totalGames) * 100).toFixed(2) 
      : 0;

    // Get breakdown by mode if no specific mode requested
    let byMode = null;
    if (!gameMode) {
      byMode = {};
      for (const mode of ['practice', 'online', 'local']) {
        const modeTotal = await GameModeEvent.count({ 
          where: { ...where, gameMode: mode } 
        });
        const modeCompleted = await GameModeEvent.count({
          where: { ...where, gameMode: mode, completed: true }
        });
        byMode[mode] = {
          total: modeTotal,
          completed: modeCompleted,
          completionRate: modeTotal > 0 
            ? ((modeCompleted / modeTotal) * 100).toFixed(2) 
            : 0
        };
      }
    }

    res.json({
      totalGames,
      completedGames,
      completionRate: parseFloat(completionRate),
      byMode,
      startDate: startDate || 'all',
      endDate: endDate || 'all'
    });
  } catch (error) {
    console.error('Error getting completion rates:', error);
    res.status(500).json({ error: 'Failed to get completion rates' });
  }
});

/**
 * Get page view statistics
 * GET /api/analytics/pageviews
 */
router.get('/pageviews', async (req, res) => {
  try {
    const { startDate, endDate, page } = req.query;
    
    const where = {};
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = new Date(startDate);
      if (endDate) where.timestamp[Op.lte] = new Date(endDate);
    }
    if (page) {
      where.page = page;
    }

    const totalPageViews = await PageViewEvent.count({ where });
    
    // Get breakdown by page
    const pageBreakdown = await PageViewEvent.findAll({
      attributes: [
        'page',
        [require('sequelize').fn('COUNT', require('sequelize').col('page')), 'count']
      ],
      where,
      group: ['page'],
      raw: true
    });

    res.json({
      totalPageViews,
      pageBreakdown,
      startDate: startDate || 'all',
      endDate: endDate || 'all'
    });
  } catch (error) {
    console.error('Error getting page views:', error);
    res.status(500).json({ error: 'Failed to get page view statistics' });
  }
});

/**
 * Get user engagement metrics
 * GET /api/analytics/engagement
 */
router.get('/engagement', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {};
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) where.startTime[Op.gte] = new Date(startDate);
      if (endDate) where.startTime[Op.lte] = new Date(endDate);
    }

    // Get average session duration
    const sessions = await UserSession.findAll({
      where: {
        ...where,
        duration: { [Op.not]: null }
      },
      attributes: ['duration'],
      raw: true
    });

    const avgDuration = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + s.duration, 0) / sessions.length
      : 0;

    // Get average page views per session
    const avgPageViews = await UserSession.findAll({
      where,
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('pageViews')), 'avgPageViews']
      ],
      raw: true
    });

    // Get average games per session
    const avgGames = await UserSession.findAll({
      where,
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('gamesPlayed')), 'avgGames']
      ],
      raw: true
    });

    res.json({
      averageSessionDuration: Math.round(avgDuration),
      averagePageViewsPerSession: parseFloat(avgPageViews[0]?.avgPageViews || 0).toFixed(2),
      averageGamesPerSession: parseFloat(avgGames[0]?.avgGames || 0).toFixed(2),
      totalSessions: sessions.length,
      startDate: startDate || 'all',
      endDate: endDate || 'all'
    });
  } catch (error) {
    console.error('Error getting engagement metrics:', error);
    res.status(500).json({ error: 'Failed to get engagement metrics' });
  }
});

/**
 * Get peak usage times
 * GET /api/analytics/peak-usage
 */
router.get('/peak-usage', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const where = {};
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp[Op.gte] = new Date(startDate);
      if (endDate) where.timestamp[Op.lte] = new Date(endDate);
    }

    // Get visits by hour of day
    const visitsByHour = await VisitEvent.findAll({
      attributes: [
        [require('sequelize').fn('strftime', '%H', require('sequelize').col('timestamp')), 'hour'],
        [require('sequelize').fn('COUNT', '*'), 'count']
      ],
      where,
      group: [require('sequelize').fn('strftime', '%H', require('sequelize').col('timestamp'))],
      order: [[require('sequelize').fn('COUNT', '*'), 'DESC']],
      raw: true,
      limit: 24
    });

    // Get visits by day of week
    const visitsByDay = await VisitEvent.findAll({
      attributes: [
        [require('sequelize').fn('strftime', '%w', require('sequelize').col('timestamp')), 'dayOfWeek'],
        [require('sequelize').fn('COUNT', '*'), 'count']
      ],
      where,
      group: [require('sequelize').fn('strftime', '%w', require('sequelize').col('timestamp'))],
      order: [[require('sequelize').fn('COUNT', '*'), 'DESC']],
      raw: true
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const formattedByDay = visitsByDay.map(d => ({
      day: dayNames[parseInt(d.dayOfWeek)],
      count: d.count
    }));

    res.json({
      byHour: visitsByHour,
      byDay: formattedByDay,
      peakHour: visitsByHour.length > 0 ? visitsByHour[0].hour : null,
      peakDay: formattedByDay.length > 0 ? formattedByDay[0].day : null,
      startDate: startDate || 'all',
      endDate: endDate || 'all'
    });
  } catch (error) {
    console.error('Error getting peak usage:', error);
    res.status(500).json({ error: 'Failed to get peak usage data' });
  }
});

/**
 * Get comprehensive analytics dashboard data
 * GET /api/analytics/dashboard
 */
router.get('/dashboard', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Build date filter
    const dateFilter = {};
    if (startDate || endDate) {
      if (startDate) dateFilter[Op.gte] = new Date(startDate);
      if (endDate) dateFilter[Op.lte] = new Date(endDate);
    }

    // Get total visits
    const totalVisits = await VisitEvent.count({
      where: startDate || endDate ? { timestamp: dateFilter } : {}
    });

    // Get unique sessions
    const uniqueSessions = await VisitEvent.count({
      distinct: true,
      col: 'sessionId',
      where: startDate || endDate ? { timestamp: dateFilter } : {}
    });

    // Get game mode counts
    const practiceCount = await GameModeEvent.count({ 
      where: { 
        gameMode: 'practice',
        ...(startDate || endDate ? { startedAt: dateFilter } : {})
      } 
    });
    const onlineCount = await GameModeEvent.count({ 
      where: { 
        gameMode: 'online',
        ...(startDate || endDate ? { startedAt: dateFilter } : {})
      } 
    });
    const localCount = await GameModeEvent.count({ 
      where: { 
        gameMode: 'local',
        ...(startDate || endDate ? { startedAt: dateFilter } : {})
      } 
    });

    // Get active sessions
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const activeSessions = await UserSession.count({
      where: {
        isActive: true,
        lastActivityTime: { [Op.gte]: thirtyMinutesAgo }
      }
    });

    // Get concurrent players
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const concurrentPlayers = await GameModeEvent.count({
      where: {
        startedAt: { [Op.gte]: fiveMinutesAgo },
        endedAt: null
      }
    });

    // Get completion rates
    const totalGames = practiceCount + onlineCount + localCount;
    const completedGames = await GameModeEvent.count({
      where: { 
        completed: true,
        ...(startDate || endDate ? { startedAt: dateFilter } : {})
      }
    });
    const completionRate = totalGames > 0 
      ? ((completedGames / totalGames) * 100).toFixed(2) 
      : 0;

    res.json({
      traffic: {
        totalVisits,
        uniqueSessions,
        activeSessions,
        concurrentPlayers
      },
      games: {
        byMode: {
          practice: practiceCount,
          online: onlineCount,
          local: localCount,
          total: totalGames
        },
        completion: {
          total: totalGames,
          completed: completedGames,
          rate: parseFloat(completionRate)
        }
      },
      dateRange: {
        start: startDate || 'all',
        end: endDate || 'all'
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

module.exports = router;
