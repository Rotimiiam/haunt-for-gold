// Local Multiplayer Game State Management
console.log("Local multiplayer game state management script loaded");

/**
 * LocalMultiplayerGame class - Manages complete game state for local multiplayer
 */
class LocalMultiplayerGame {
  constructor(gameSettings) {
    // Core game state
    this.gameSettings = gameSettings || new LocalGameSettings();
    this.players = new Map();
    this.gameState = this.initializeGameState();
    
    // Game timing
    this.gameTimer = null;
    this.gameStartTime = null;
    this.gameEndTime = null;
    this.gameDuration = this.gameSettings.gameDuration; // in seconds
    this.timeRemaining = this.gameDuration;
    this.isPaused = false;
    
    // Round management
    this.currentRound = 1;
    this.maxRounds = 1; // Single round by default
    this.roundStartTime = null;
    this.roundEndTime = null;
    
    // Score tracking and ranking
    this.scoreHistory = [];
    this.leaderboard = [];
    this.winCondition = this.gameSettings.winCondition;
    this.targetScore = this.gameSettings.targetScore;
    
    // Game status
    this.isActive = false;
    this.isSetupPhase = true;
    this.gameWinner = null;
    this.gameResult = null;
    
    // Event listeners
    this.eventListeners = new Map();
    
    // Statistics tracking
    this.gameStats = {
      totalCoinsCollected: 0,
      totalBombsHit: 0,
      totalEnemiesHit: 0,
      totalMoves: 0,
      difficultyChanges: 0,
      gameEvents: []
    };
    
    // Player statistics tracking
    this.playerStatistics = new Map();
    
    console.log("LocalMultiplayerGame initialized with settings:", this.gameSettings);
  }

  /**
   * Initialize the base game state
   */
  initializeGameState() {
    const config = this.gameSettings.getGameConfig();
    
    return {
      // Map configuration
      mapWidth: config.mapWidth,
      mapHeight: config.mapHeight,
      
      // Game objects
      players: {},
      coins: [],
      bombs: [],
      enemies: [],
      
      // Game settings
      winningScore: config.winningScore,
      difficultyLevel: 1,
      totalPointsCollected: 0,
      difficultyThreshold: 200,
      
      // Game status
      gameStarted: false,
      gameEnded: false,
      isPaused: false,
      
      // Timing
      startTime: null,
      endTime: null,
      timeRemaining: this.gameDuration
    };
  }

  /**
   * Add a player to the game during setup phase
   */
  addPlayer(playerId, playerName, controlScheme, visualConfig) {
    if (!this.isSetupPhase) {
      throw new Error("Cannot add players after game has started");
    }
    
    if (this.players.size >= this.gameSettings.maxPlayers) {
      throw new Error(`Maximum ${this.gameSettings.maxPlayers} players allowed`);
    }
    
    if (this.players.has(playerId)) {
      throw new Error(`Player ${playerId} already exists`);
    }
    
    // Create player instance
    const player = new LocalPlayer(playerId, playerName, controlScheme, visualConfig);
    
    // Set starting position to avoid overlap
    const startPositions = [
      { x: 2, y: 2 },
      { x: this.gameState.mapWidth - 3, y: 2 },
      { x: 2, y: this.gameState.mapHeight - 3 },
      { x: this.gameState.mapWidth - 3, y: this.gameState.mapHeight - 3 }
    ];
    
    const playerIndex = this.players.size;
    if (startPositions[playerIndex]) {
      player.position = startPositions[playerIndex];
    }
    
    // Add to players collection
    this.players.set(playerId, player);
    
    // Create player statistics tracker
    const playerStats = new PlayerStatistics(playerId, playerName);
    this.playerStatistics.set(playerId, playerStats);
    
    // Update game state
    this.gameState.players[playerId] = player.getRenderData();
    
    // Record event
    this.recordGameEvent('player_joined', {
      playerId: playerId,
      playerName: playerName,
      playerCount: this.players.size
    });
    
    // Emit event
    this.emit('playerJoined', {
      playerId: playerId,
      player: player,
      playerCount: this.players.size
    });
    
    console.log(`Player ${playerName} (${playerId}) added to game. Total players: ${this.players.size}`);
    
    return player;
  }

  /**
   * Remove a player from the game
   */
  removePlayer(playerId) {
    const player = this.players.get(playerId);
    if (!player) {
      console.warn(`Player ${playerId} not found for removal`);
      return false;
    }
    
    const playerName = player.name;
    
    // Remove from players collection
    this.players.delete(playerId);
    
    // Remove player statistics
    this.playerStatistics.delete(playerId);
    
    // Remove from game state
    delete this.gameState.players[playerId];
    
    // Record event
    this.recordGameEvent('player_left', {
      playerId: playerId,
      playerName: playerName,
      playerCount: this.players.size,
      wasActive: this.isActive
    });
    
    // Emit event
    this.emit('playerLeft', {
      playerId: playerId,
      playerName: playerName,
      playerCount: this.players.size
    });
    
    // Check if game should continue
    if (this.isActive && this.players.size < 2) {
      this.handleInsufficientPlayers();
    }
    
    console.log(`Player ${playerName} (${playerId}) removed from game. Remaining players: ${this.players.size}`);
    
    return true;
  }

  /**
   * Handle situation when there are insufficient players to continue
   */
  handleInsufficientPlayers() {
    if (this.players.size === 1) {
      // One player remaining - they win by default
      const remainingPlayer = Array.from(this.players.values())[0];
      this.endGame(remainingPlayer.id, 'opponent_left');
    } else if (this.players.size === 0) {
      // No players remaining - end game
      this.endGame(null, 'all_players_left');
    }
  }

  /**
   * Start the game
   */
  startGame() {
    if (!this.isSetupPhase) {
      throw new Error("Game has already started");
    }
    
    if (this.players.size < 2) {
      throw new Error("Need at least 2 players to start the game");
    }
    
    // Initialize game objects
    this.generateCoins();
    this.generateBombs();
    this.generateEnemies();
    
    // Set game state
    this.isSetupPhase = false;
    this.isActive = true;
    this.gameStartTime = Date.now();
    this.roundStartTime = Date.now();
    this.gameState.gameStarted = true;
    this.gameState.startTime = this.gameStartTime;
    
    // Start game timer
    this.startGameTimer();
    
    // Record event
    this.recordGameEvent('game_started', {
      playerCount: this.players.size,
      gameSettings: this.gameSettings,
      startTime: this.gameStartTime
    });
    
    // Emit event
    this.emit('gameStarted', {
      gameState: this.getGameState(),
      players: Array.from(this.players.values()),
      startTime: this.gameStartTime
    });
    
    console.log(`Local multiplayer game started with ${this.players.size} players`);
    
    return this.getGameState();
  }

  /**
   * Start the game timer
   */
  startGameTimer() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
    
    this.gameTimer = setInterval(() => {
      if (this.isPaused || !this.isActive) return;
      
      this.timeRemaining--;
      this.gameState.timeRemaining = this.timeRemaining;
      
      // Update player time statistics
      this.updatePlayerTimeStats();
      
      // Emit time update with player statistics
      this.emit('timeUpdate', {
        timeRemaining: this.timeRemaining,
        gameDuration: this.gameDuration,
        playerDisplayData: this.getAllPlayerDisplayData()
      });
      
      // Check if time is up
      if (this.timeRemaining <= 0) {
        this.handleTimeUp();
      }
      
      // Emit warnings at specific intervals
      if (this.timeRemaining === 60) {
        this.emit('timeWarning', { message: '1 minute remaining!', timeRemaining: 60 });
      } else if (this.timeRemaining === 30) {
        this.emit('timeWarning', { message: '30 seconds remaining!', timeRemaining: 30 });
      } else if (this.timeRemaining === 10) {
        this.emit('timeWarning', { message: '10 seconds remaining!', timeRemaining: 10 });
      }
      
    }, 1000); // Update every second
  }

  /**
   * Handle time up scenario
   */
  handleTimeUp() {
    if (this.winCondition === 'time') {
      // Time-based win condition - highest score wins
      const sortedPlayers = Array.from(this.players.values())
        .sort((a, b) => b.score - a.score);
      
      if (sortedPlayers.length > 0) {
        const winner = sortedPlayers[0];
        this.endGame(winner.id, 'time_up');
      } else {
        this.endGame(null, 'time_up_no_players');
      }
    } else {
      // Score-based game - extend time or end in draw
      this.endGame(null, 'time_up_draw');
    }
  }

  /**
   * Pause the game
   */
  pauseGame() {
    if (!this.isActive || this.isPaused) return false;
    
    this.isPaused = true;
    this.gameState.isPaused = true;
    
    // Record event
    this.recordGameEvent('game_paused', {
      timeRemaining: this.timeRemaining,
      pauseTime: Date.now()
    });
    
    // Emit event
    this.emit('gamePaused', {
      timeRemaining: this.timeRemaining
    });
    
    console.log("Game paused");
    return true;
  }

  /**
   * Resume the game
   */
  resumeGame() {
    if (!this.isActive || !this.isPaused) return false;
    
    this.isPaused = false;
    this.gameState.isPaused = false;
    
    // Record event
    this.recordGameEvent('game_resumed', {
      timeRemaining: this.timeRemaining,
      resumeTime: Date.now()
    });
    
    // Emit event
    this.emit('gameResumed', {
      timeRemaining: this.timeRemaining
    });
    
    console.log("Game resumed");
    return true;
  }

  /**
   * End the game
   */
  endGame(winnerId = null, reason = 'manual') {
    if (!this.isActive) return false;
    
    // Stop timer
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
    
    // Set end state
    this.isActive = false;
    this.gameEndTime = Date.now();
    this.roundEndTime = Date.now();
    this.gameState.gameEnded = true;
    this.gameState.endTime = this.gameEndTime;
    
    // Determine winner and result
    this.gameWinner = winnerId ? this.players.get(winnerId) : null;
    this.gameResult = this.calculateGameResult(winnerId, reason);
    
    // Update final leaderboard
    this.updateLeaderboard();
    
    // Record final statistics
    this.recordGameEvent('game_ended', {
      winnerId: winnerId,
      winnerName: this.gameWinner ? this.gameWinner.name : null,
      reason: reason,
      duration: this.gameEndTime - this.gameStartTime,
      finalScores: this.getPlayerScores(),
      gameStats: this.gameStats
    });
    
    // Emit event
    this.emit('gameEnded', {
      winnerId: winnerId,
      winner: this.gameWinner,
      reason: reason,
      gameResult: this.gameResult,
      leaderboard: this.leaderboard,
      gameStats: this.gameStats
    });
    
    console.log(`Game ended. Winner: ${this.gameWinner ? this.gameWinner.name : 'None'}, Reason: ${reason}`);
    
    return this.gameResult;
  }

  /**
   * Update player movement
   */
  updatePlayerMovement(playerId, newPosition) {
    const playerStats = this.playerStatistics.get(playerId);
    if (playerStats) {
      playerStats.updateMovementStats(newPosition);
      this.gameStats.totalMoves++;
    }
  }

  /**
   * Update player time statistics
   */
  updatePlayerTimeStats() {
    const currentTime = Date.now();
    const gameTime = currentTime - this.gameStartTime;
    
    // Determine who is in the lead
    const sortedPlayers = Array.from(this.players.values())
      .sort((a, b) => b.score - a.score);
    const leaderId = sortedPlayers.length > 0 ? sortedPlayers[0].id : null;
    
    // Update each player's time statistics
    for (const [playerId, playerStats] of this.playerStatistics) {
      const isInLead = playerId === leaderId;
      const isActive = this.isActive && !this.isPaused;
      playerStats.updateTimeStats(gameTime, isActive, isInLead);
    }
  }

  /**
   * Get all player statistics
   */
  getAllPlayerStatistics() {
    const playerStatsArray = [];
    for (const [playerId, playerStats] of this.playerStatistics) {
      playerStatsArray.push(playerStats.getDetailedStats());
    }
    return playerStatsArray;
  }

  /**
   * Get real-time display data for all players
   */
  getAllPlayerDisplayData() {
    const displayData = [];
    for (const [playerId, playerStats] of this.playerStatistics) {
      displayData.push(playerStats.getRealTimeDisplayData());
    }
    return displayData;
  }

  /**
   * Calculate game result
   */
  calculateGameResult(winnerId, reason) {
    const players = Array.from(this.players.values());
    const duration = this.gameEndTime - this.gameStartTime;
    
    // Get final player statistics
    const playerStatistics = this.getAllPlayerStatistics();
    
    return {
      winnerId: winnerId,
      winnerName: this.gameWinner ? this.gameWinner.name : null,
      reason: reason,
      duration: duration,
      playerCount: players.length,
      finalScores: this.getPlayerScores(),
      leaderboard: this.leaderboard,
      gameStats: this.gameStats,
      gameSettings: this.gameSettings,
      playerStatistics: playerStatistics
    };
  }

  /**
   * Update player score
   */
  updatePlayerScore(playerId, scoreChange, reason = 'unknown') {
    const player = this.players.get(playerId);
    const playerStats = this.playerStatistics.get(playerId);
    
    if (!player) {
      console.warn(`Player ${playerId} not found for score update`);
      return false;
    }
    
    const oldScore = player.score;
    
    // Update player score based on reason
    switch (reason) {
      case 'coin':
        player.collectCoin(Math.abs(scoreChange));
        this.gameStats.totalCoinsCollected++;
        if (playerStats) {
          playerStats.updateScore(player.score, scoreChange, reason);
          playerStats.updateCollectionStats('coin', Math.abs(scoreChange));
        }
        break;
      case 'enemy':
        player.hitByEnemy(Math.abs(scoreChange));
        this.gameStats.totalEnemiesHit++;
        if (playerStats) {
          playerStats.updateScore(player.score, scoreChange, reason);
          playerStats.updateCombatStats('enemy_hit', Math.abs(scoreChange));
        }
        break;
      case 'bomb':
        player.hitByBomb(Math.abs(scoreChange));
        this.gameStats.totalBombsHit++;
        if (playerStats) {
          playerStats.updateScore(player.score, scoreChange, reason);
          playerStats.updateCombatStats('bomb_hit', Math.abs(scoreChange));
        }
        break;
      default:
        player.addScore(scoreChange);
        if (playerStats) {
          playerStats.updateScore(player.score, scoreChange, reason);
        }
    }
    
    // Update game state
    this.gameState.players[playerId] = player.getRenderData();
    
    // Record score change
    this.scoreHistory.push({
      playerId: playerId,
      playerName: player.name,
      oldScore: oldScore,
      newScore: player.score,
      change: scoreChange,
      reason: reason,
      timestamp: Date.now()
    });
    
    // Update leaderboard
    this.updateLeaderboard();
    
    // Record event
    this.recordGameEvent('score_updated', {
      playerId: playerId,
      playerName: player.name,
      oldScore: oldScore,
      newScore: player.score,
      change: scoreChange,
      reason: reason
    });
    
    // Emit event with statistics
    this.emit('scoreUpdated', {
      playerId: playerId,
      player: player,
      oldScore: oldScore,
      newScore: player.score,
      change: scoreChange,
      reason: reason,
      leaderboard: this.leaderboard,
      playerStats: playerStats ? playerStats.getRealTimeDisplayData() : null
    });
    
    // Check win condition
    this.checkWinCondition(player);
    
    return true;
  }

  /**
   * Check if win condition is met
   */
  checkWinCondition(player) {
    if (!this.isActive) return false;
    
    let hasWon = false;
    
    switch (this.winCondition) {
      case 'score':
        hasWon = player.score >= this.targetScore;
        break;
      case 'coins':
        hasWon = player.stats.coinsCollected >= this.gameSettings.targetCoins;
        break;
      case 'time':
        // Time-based games are handled by the timer
        break;
    }
    
    if (hasWon) {
      this.endGame(player.id, 'win_condition_met');
      return true;
    }
    
    return false;
  }

  /**
   * Update leaderboard
   */
  updateLeaderboard() {
    const players = Array.from(this.players.values());
    
    this.leaderboard = players
      .map((player, index) => ({
        rank: 0, // Will be set below
        playerId: player.id,
        playerName: player.name,
        score: player.score,
        stats: { ...player.stats },
        color: player.color,
        character: player.character
      }))
      .sort((a, b) => {
        // Primary sort by score
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        // Secondary sort by coins collected
        if (b.stats.coinsCollected !== a.stats.coinsCollected) {
          return b.stats.coinsCollected - a.stats.coinsCollected;
        }
        // Tertiary sort by fewer enemies hit (better performance)
        return a.stats.enemiesHit - b.stats.enemiesHit;
      })
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
  }

  /**
   * Get player scores
   */
  getPlayerScores() {
    const scores = {};
    for (const [playerId, player] of this.players) {
      scores[playerId] = {
        name: player.name,
        score: player.score,
        stats: { ...player.stats }
      };
    }
    return scores;
  }

  /**
   * Generate coins for the game
   */
  generateCoins() {
    this.gameState.coins = [];
    const coinCount = 15; // Standard coin count
    
    for (let i = 0; i < coinCount; i++) {
      this.gameState.coins.push({
        id: i,
        x: Math.floor(Math.random() * (this.gameState.mapWidth - 2)) + 1,
        y: Math.floor(Math.random() * (this.gameState.mapHeight - 2)) + 1,
        collected: false,
        type: 'coin',
        value: 10
      });
    }
    
    console.log(`Generated ${coinCount} coins`);
  }

  /**
   * Generate bombs for the game
   */
  generateBombs() {
    this.gameState.bombs = [];
    
    if (!this.gameSettings.bombsEnabled) {
      return;
    }
    
    // Generate bombs based on difficulty
    const bombCount = Math.max(0, this.gameState.difficultyLevel - 1);
    
    for (let i = 0; i < bombCount; i++) {
      let x, y;
      let attempts = 0;
      
      // Try to place bomb in a position that doesn't overlap with coins
      do {
        x = Math.floor(Math.random() * (this.gameState.mapWidth - 2)) + 1;
        y = Math.floor(Math.random() * (this.gameState.mapHeight - 2)) + 1;
        attempts++;
      } while (attempts < 10 && this.gameState.coins.some(coin => coin.x === x && coin.y === y));
      
      this.gameState.bombs.push({
        id: i,
        x: x,
        y: y,
        exploded: false,
        damage: 20
      });
    }
    
    console.log(`Generated ${bombCount} bombs`);
  }

  /**
   * Generate enemies for the game
   */
  generateEnemies() {
    this.gameState.enemies = [];
    const enemyCount = 9 + (this.gameState.difficultyLevel - 1) * 2;
    
    for (let i = 0; i < enemyCount; i++) {
      this.gameState.enemies.push({
        id: i,
        x: Math.floor(Math.random() * (this.gameState.mapWidth - 4)) + 2,
        y: Math.floor(Math.random() * (this.gameState.mapHeight - 4)) + 2,
        direction: Math.floor(Math.random() * 4), // 0: up, 1: right, 2: down, 3: left
        moveCounter: 0,
        difficultyLevel: this.gameState.difficultyLevel,
        damage: 5
      });
    }
    
    console.log(`Generated ${enemyCount} enemies`);
  }

  /**
   * Record a game event for statistics
   */
  recordGameEvent(eventType, eventData) {
    const event = {
      type: eventType,
      timestamp: Date.now(),
      data: eventData
    };
    
    this.gameStats.gameEvents.push(event);
    
    // Limit event history to prevent memory issues
    if (this.gameStats.gameEvents.length > 1000) {
      this.gameStats.gameEvents = this.gameStats.gameEvents.slice(-500);
    }
  }

  /**
   * Get current game state
   */
  getGameState() {
    return {
      ...this.gameState,
      timeRemaining: this.timeRemaining,
      isActive: this.isActive,
      isPaused: this.isPaused,
      isSetupPhase: this.isSetupPhase,
      currentRound: this.currentRound,
      leaderboard: this.leaderboard
    };
  }

  /**
   * Get game statistics
   */
  getGameStats() {
    return {
      ...this.gameStats,
      gameDuration: this.gameEndTime ? (this.gameEndTime - this.gameStartTime) : null,
      playerCount: this.players.size,
      scoreHistory: this.scoreHistory,
      leaderboard: this.leaderboard
    };
  }

  /**
   * Event system - Add event listener
   */
  on(eventType, callback) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType).push(callback);
  }

  /**
   * Event system - Remove event listener
   */
  off(eventType, callback) {
    if (!this.eventListeners.has(eventType)) return;
    
    const listeners = this.eventListeners.get(eventType);
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Event system - Emit event
   */
  emit(eventType, eventData) {
    if (!this.eventListeners.has(eventType)) return;
    
    const listeners = this.eventListeners.get(eventType);
    listeners.forEach(callback => {
      try {
        callback(eventData);
      } catch (error) {
        console.error(`Error in event listener for ${eventType}:`, error);
      }
    });
  }

  /**
   * Validate game state consistency
   */
  validateGameState() {
    const errors = [];
    
    // Check player count
    if (this.players.size !== Object.keys(this.gameState.players).length) {
      errors.push('Player count mismatch between players map and game state');
    }
    
    // Check player data consistency
    for (const [playerId, player] of this.players) {
      const gameStatePlayer = this.gameState.players[playerId];
      if (!gameStatePlayer) {
        errors.push(`Player ${playerId} missing from game state`);
        continue;
      }
      
      if (player.score !== gameStatePlayer.score) {
        errors.push(`Score mismatch for player ${playerId}`);
      }
      
      if (player.position.x !== gameStatePlayer.x || player.position.y !== gameStatePlayer.y) {
        errors.push(`Position mismatch for player ${playerId}`);
      }
    }
    
    // Check game timing
    if (this.isActive && this.timeRemaining < 0) {
      errors.push('Negative time remaining while game is active');
    }
    
    return errors;
  }

  /**
   * Cleanup resources
   */
  destroy() {
    // Stop timer
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
    
    // Clear players
    this.players.clear();
    
    // Clear event listeners
    this.eventListeners.clear();
    
    // Reset state
    this.isActive = false;
    this.isSetupPhase = true;
    
    console.log("LocalMultiplayerGame destroyed");
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.LocalMultiplayerGame = LocalMultiplayerGame;
} else if (typeof global !== 'undefined') {
  global.LocalMultiplayerGame = LocalMultiplayerGame;
}

console.log("Local multiplayer game state management loaded successfully");