
const express = require('express');
const passport = require('passport');
const { Op } = require('sequelize');
const { User } = require('../models');
const router = express.Router();

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
};

// Get current user
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user.get({ plain: true });

    // Calculate virtuals
    user.winRate = user.stats.totalGames === 0 ? 0 : Math.round((user.stats.wins / user.stats.totalGames) * 100);
    user.averageScore = user.stats.totalGames === 0 ? 0 : Math.round(user.stats.totalScore / user.stats.totalGames);

    res.json({ user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, password, displayName, email } = req.body;

    // Validation
    if (!username || !password || !displayName) {
      return res.status(400).json({ error: 'Username, password, and display name are required' });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: 'Username must be between 3 and 20 characters' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    }

    // Create new user
    const user = await User.create({
      username,
      password,
      displayName,
      email: email || undefined,
      isGuest: false
    });

    // Log the user in
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Login failed after registration' });
      }

      const userResponse = user.get({ plain: true });
      userResponse.winRate = 0;
      userResponse.averageScore = 0;
      res.json({ user: userResponse });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: 'Login failed' });
    }

    if (!user) {
      return res.status(401).json({ error: info.message || 'Invalid credentials' });
    }

    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Login failed' });
      }

      const userResponse = user.get({ plain: true });
      userResponse.winRate = userResponse.stats.totalGames === 0 ? 0 : Math.round((userResponse.stats.wins / userResponse.stats.totalGames) * 100);
      userResponse.averageScore = userResponse.stats.totalGames === 0 ? 0 : Math.round(userResponse.stats.totalScore / userResponse.stats.totalGames);
      res.json({ user: userResponse });
    });
  })(req, res, next);
});

// Guest login
router.post('/guest', async (req, res) => {
  try {
    // Generate a unique guest username
    const guestNumber = Math.floor(Math.random() * 10000);
    const guestUsername = `Guest_${guestNumber} `;

    // Create guest user (not saved to database)
    const guestUser = {
      id: `guest_${Date.now()}_${guestNumber} `,
      username: guestUsername,
      displayName: guestUsername,
      isGuest: true,
      stats: {
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
      },
      gameHistory: [],
      preferences: {
        character: 'Alex',
        soundEnabled: true,
        notificationsEnabled: true,
        theme: 'dark'
      },
      winRate: 0,
      averageScore: 0
    };

    // Store guest user in session
    req.session.guestUser = guestUser;

    res.json({ user: guestUser });
  } catch (error) {
    console.error('Guest login error:', error);
    res.status(500).json({ error: 'Guest login failed' });
  }
});

// Logout user
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }

    // Clear guest user from session
    req.session.guestUser = null;

    res.json({ success: true });
  });
});

// Update user profile
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { displayName, preferences } = req.body;

    if (!displayName) {
      return res.status(400).json({ error: 'Display name is required' });
    }

    // Update user
    req.user.displayName = displayName;
    if (preferences) {
      req.user.preferences = { ...req.user.preferences, ...preferences };
    }

    await req.user.save();

    const userResponse = req.user.get({ plain: true });
    userResponse.winRate = userResponse.stats.totalGames === 0 ? 0 : Math.round((userResponse.stats.wins / userResponse.stats.totalGames) * 100);
    userResponse.averageScore = userResponse.stats.totalGames === 0 ? 0 : Math.round(userResponse.stats.totalScore / userResponse.stats.totalGames);
    res.json({ user: userResponse });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Profile update failed' });
  }
});

// Get user game history
router.get('/history', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await req.user.getGameHistory({
      limit,
      offset,
      order: [['playedAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      history: rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalGames: count,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Game history error:', error);
    res.status(500).json({ error: 'Failed to fetch game history' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const type = req.query.type || 'highScore';
    const limit = parseInt(req.query.limit) || 10;

    const leaderboard = await User.getLeaderboard(type, limit);
    res.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to game
    res.redirect('/');
  }
);

module.exports = router;
