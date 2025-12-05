/**
 * Authentication Manager
 * Handles user authentication, registration, and session management
 */

// Create the auth manager as a singleton
const authManager = {
  currentUser: null,
  authListeners: [],

  /**
   * Initialize the auth manager
   * @returns {Promise} Resolves when initialization is complete
   */
  init: async function () {
    console.log("Auth manager initializing");
    try {
      // Check if user is already logged in
      const user = this.getCurrentUserFromStorage();
      if (user) {
        this.currentUser = user;
        console.log("User found in storage:", user.username);
      }
      
      // Start periodic check for guest user expiration (every 5 minutes)
      this.startGuestExpirationCheck();
      
      return this.currentUser;
    } catch (error) {
      console.error("Error initializing auth manager:", error);
      return null;
    }
  },
  
  /**
   * Start periodic check for guest user expiration
   */
  startGuestExpirationCheck: function() {
    // Check every 5 minutes
    setInterval(() => {
      const user = this.getCurrentUserFromStorage();
      if (!user && this.currentUser) {
        // User was signed out due to expiration
        this.currentUser = null;
        this.notifyListeners();
      }
    }, 5 * 60 * 1000); // 5 minutes
  },

  /**
   * Get current user from local storage
   * @returns {Object|null} User object or null if not logged in
   */
  getCurrentUserFromStorage: function () {
    const userJson = localStorage.getItem("currentUser");
    if (!userJson) return null;
    
    const user = JSON.parse(userJson);
    
    // Check if guest user has expired (24 hours)
    if (user.isGuest && user.guestExpiresAt) {
      const now = Date.now();
      if (now > user.guestExpiresAt) {
        console.log('Guest session expired, signing out');
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.notifyListeners();
        return null;
      }
    }
    
    return user;
  },

  /**
   * Get current logged in user
   * @returns {Object|null} User object or null if not logged in
   */
  getCurrentUser: function () {
    // Always check storage to handle guest expiration
    const user = this.getCurrentUserFromStorage();
    if (!user && this.currentUser) {
      // User expired, clear current user
      this.currentUser = null;
      this.notifyListeners();
    } else if (user) {
      this.currentUser = user;
    }
    return this.currentUser;
  },

  /**
   * Check if user is logged in
   * @returns {boolean} True if user is logged in
   */
  isLoggedIn: function () {
    return !!this.currentUser;
  },

  /**
   * Add auth state change listener
   * @param {Function} listener Callback function that receives user object
   */
  addAuthListener: function (listener) {
    this.authListeners.push(listener);
  },

  /**
   * Remove auth state change listener
   * @param {Function} listener Listener to remove
   */
  removeAuthListener: function (listener) {
    this.authListeners = this.authListeners.filter((l) => l !== listener);
  },

  /**
   * Notify all listeners of auth state change
   */
  notifyListeners: function () {
    this.authListeners.forEach((listener) => {
      try {
        listener(this.currentUser);
      } catch (error) {
        console.error("Error in auth listener:", error);
      }
    });
  },

  /**
   * Login with username/email and password
   * @param {string} username Username or email
   * @param {string} password Password
   * @returns {Promise} Resolves with user object
   */
  login: async function (username, password) {
    console.log("Logging in user:", username);

    // For demo purposes, simulate a successful login
    // In a real app, this would make an API call to your backend
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simple validation
        if (!username || !password) {
          reject(new Error("Username and password are required"));
          return;
        }

        // Create mock user
        const user = {
          id: "user_" + Date.now(),
          username: username,
          displayName: username.split("@")[0],
          email: username.includes("@") ? username : null,
          isGuest: false,
          stats: {
            totalGames: Math.floor(Math.random() * 50),
            wins: Math.floor(Math.random() * 20),
            highestScore: Math.floor(Math.random() * 500),
          },
        };

        // Save user to storage
        localStorage.setItem("currentUser", JSON.stringify(user));
        this.currentUser = user;

        // Notify listeners
        this.notifyListeners();

        resolve(user);
      }, 500); // Simulate network delay
    });
  },

  /**
   * Register a new user
   * @param {string} username Username
   * @param {string} password Password
   * @param {string} displayName Display name
   * @param {string|null} email Email (optional)
   * @returns {Promise} Resolves with user object
   */
  register: async function (username, password, displayName, email) {
    console.log("Registering user:", username);

    // For demo purposes, simulate a successful registration
    // In a real app, this would make an API call to your backend
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simple validation
        if (!username || !password) {
          reject(new Error("Username and password are required"));
          return;
        }

        // Create mock user
        const user = {
          id: "user_" + Date.now(),
          username: username,
          displayName: displayName || username,
          email: email,
          isGuest: false,
          stats: {
            totalGames: 0,
            wins: 0,
            highestScore: 0,
          },
        };

        // Save user to storage
        localStorage.setItem("currentUser", JSON.stringify(user));
        this.currentUser = user;

        // Notify listeners
        this.notifyListeners();

        resolve(user);
      }, 500); // Simulate network delay
    });
  },

  /**
   * Login as guest
   * @returns {Promise} Resolves with guest user object
   */
  loginAsGuest: async function () {
    console.log("Logging in as guest");

    return new Promise((resolve) => {
      setTimeout(() => {
        // Create guest user
        const guestId = "guest_" + Date.now();
        const guestNumber = Math.floor(Math.random() * 1000);
        const now = Date.now();
        const oneDayInMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        const user = {
          id: guestId,
          username: "guest" + guestNumber,
          displayName: "Guest " + guestNumber,
          isGuest: true,
          guestExpiresAt: now + oneDayInMs, // Expire after 24 hours
          stats: {
            totalGames: 0,
            wins: 0,
            highestScore: 0,
          },
        };

        // Save user to storage
        localStorage.setItem("currentUser", JSON.stringify(user));
        this.currentUser = user;

        // Notify listeners
        this.notifyListeners();

        resolve(user);
      }, 300); // Simulate network delay
    });
  },

  /**
   * Logout current user
   * @returns {Promise} Resolves when logout is complete
   */
  logout: async function () {
    console.log("Logging out user");

    return new Promise((resolve) => {
      setTimeout(() => {
        // Clear user from storage
        localStorage.removeItem("currentUser");
        this.currentUser = null;

        // Notify listeners
        this.notifyListeners();

        resolve();
      }, 300);
    });
  },

  /**
   * Save game result
   * @param {Object} gameData Game result data
   * @returns {Promise} Resolves when save is complete
   */
  saveGameResult: async function (gameData) {
    console.log("Saving game result:", gameData);

    if (!this.currentUser) {
      console.warn("Cannot save game result: User not logged in");
      return;
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const user = this.currentUser;
        
        // Initialize game history if it doesn't exist
        if (!user.gameHistory) {
          user.gameHistory = [];
        }
        
        // Create game record
        const gameRecord = {
          gameId: gameData.gameId || 'game_' + Date.now(),
          gameMode: gameData.gameMode || 'practice',
          score: gameData.score || 0,
          opponent: gameData.opponent || null,
          result: gameData.result || (gameData.isWinner ? 'win' : 'lose'),
          duration: gameData.duration || 0,
          coinsCollected: gameData.coinsCollected || 0,
          enemiesHit: gameData.enemiesHit || 0,
          bombsHit: gameData.bombsHit || 0,
          playedAt: new Date().toISOString()
        };
        
        // Add to history (keep last 100 games)
        user.gameHistory.unshift(gameRecord);
        if (user.gameHistory.length > 100) {
          user.gameHistory = user.gameHistory.slice(0, 100);
        }
        
        // Update comprehensive stats
        const stats = user.stats || {};
        stats.totalGames = (stats.totalGames || 0) + 1;
        stats.totalScore = (stats.totalScore || 0) + gameRecord.score;
        stats.totalCoinsCollected = (stats.totalCoinsCollected || 0) + gameRecord.coinsCollected;
        stats.totalEnemiesHit = (stats.totalEnemiesHit || 0) + gameRecord.enemiesHit;
        stats.totalBombsHit = (stats.totalBombsHit || 0) + gameRecord.bombsHit;
        stats.totalPlayTime = (stats.totalPlayTime || 0) + gameRecord.duration;
        
        if (gameRecord.result === 'win') {
          stats.wins = (stats.wins || 0) + 1;
          stats.currentStreak = (stats.currentStreak || 0) + 1;
          stats.longestStreak = Math.max(stats.longestStreak || 0, stats.currentStreak);
        } else {
          stats.currentStreak = 0;
        }
        
        if (gameRecord.score > (stats.highestScore || 0)) {
          stats.highestScore = gameRecord.score;
        }
        
        // Calculate derived stats
        user.winRate = Math.round((stats.wins / stats.totalGames) * 100);
        user.averageScore = Math.round(stats.totalScore / stats.totalGames);
        user.stats = stats;
        
        // Save updated user to storage
        localStorage.setItem("currentUser", JSON.stringify(user));

        // Notify listeners
        this.notifyListeners();

        resolve();
      }, 300);
    });
  },
  
  /**
   * Get game history with pagination
   * @param {number} page Page number (1-based)
   * @param {number} limit Games per page
   * @returns {Promise} Resolves with history and pagination info
   */
  getGameHistory: async function(page = 1, limit = 5) {
    if (!this.currentUser) {
      throw new Error('User not logged in');
    }
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const history = this.currentUser.gameHistory || [];
        const totalGames = history.length;
        const totalPages = Math.ceil(totalGames / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const pageHistory = history.slice(startIndex, endIndex);
        
        resolve({
          history: pageHistory,
          pagination: {
            currentPage: page,
            totalPages: totalPages,
            totalGames: totalGames,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        });
      }, 200);
    });
  },
  
  /**
   * Update user profile
   * @param {Object} profileData Profile data to update
   * @returns {Promise} Resolves when update is complete
   */
  updateProfile: async function(profileData) {
    if (!this.currentUser || this.currentUser.isGuest) {
      throw new Error('Cannot update profile for guest users');
    }
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const user = this.currentUser;
          
          if (profileData.displayName) {
            user.displayName = profileData.displayName;
          }
          
          if (profileData.preferences) {
            user.preferences = { ...user.preferences, ...profileData.preferences };
          }
          
          // Save updated user to storage
          localStorage.setItem('currentUser', JSON.stringify(user));
          
          // Notify listeners
          this.notifyListeners();
          
          resolve(user);
        } catch (error) {
          reject(error);
        }
      }, 300);
    });
  },

  /**
   * Get leaderboard data
   * @param {string} type Leaderboard type ('highScore', 'wins', etc.)
   * @param {number} limit Maximum number of entries
   * @returns {Promise} Resolves with leaderboard data
   */
  getLeaderboard: async function (type, limit) {
    console.log("Getting leaderboard:", type, limit);

    // For demo purposes, generate mock leaderboard data
    // In a real app, this would make an API call to your backend
    return new Promise((resolve) => {
      setTimeout(() => {
        const leaderboard = [];

        // Generate mock entries
        for (let i = 0; i < limit; i++) {
          leaderboard.push({
            rank: i + 1,
            username: "player" + (i + 1),
            displayName: "Player " + (i + 1),
            value:
              type === "highScore"
                ? Math.floor(500 - i * 20 + Math.random() * 30)
                : Math.floor(30 - i * 2 + Math.random() * 5),
          });
        }

        resolve(leaderboard);
      }, 500);
    });
  },
};

// Make available globally
window.authManager = authManager;
console.log("Auth manager initialized and attached to window object");
