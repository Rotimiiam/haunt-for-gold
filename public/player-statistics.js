// Player Statistics Tracking System
console.log("Player statistics tracking system loaded");

/**
 * PlayerStatistics class - Tracks detailed statistics for individual players
 */
class PlayerStatistics {
  constructor(playerId, playerName) {
    this.playerId = playerId;
    this.playerName = playerName;
    
    // Basic game statistics
    this.stats = {
      // Score tracking
      currentScore: 0,
      highestScore: 0,
      totalScoreGained: 0,
      totalScoreLost: 0,
      
      // Collection statistics
      coinsCollected: 0,
      coinValue: 0,
      averageCoinValue: 0,
      
      // Combat statistics
      enemiesHit: 0,
      bombsHit: 0,
      totalDamageReceived: 0,
      
      // Movement statistics
      movesCount: 0,
      totalDistance: 0,
      averageMovesPerMinute: 0,
      
      // Time statistics
      gameTime: 0,
      activeTime: 0,
      timeInLead: 0,
      
      // Performance metrics
      efficiency: 0, // coins per move
      survivalRate: 0, // percentage of time without taking damage
      consistency: 0, // score variance measure
      
      // Streak tracking
      currentCoinStreak: 0,
      longestCoinStreak: 0,
      currentSafeStreak: 0, // moves without taking damage
      longestSafeStreak: 0
    };
    
    // Detailed tracking arrays
    this.scoreHistory = [];
    this.movementHistory = [];
    this.eventHistory = [];
    this.milestones = [];
    this.achievements = [];
    
    // Real-time tracking
    this.lastUpdateTime = Date.now();
    this.lastPosition = { x: 0, y: 0 };
    this.isInLead = false;
    this.lastScoreUpdate = Date.now();
    
    console.log(`Player statistics initialized for ${playerName} (${playerId})`);
  }

  /**
   * Update score and related statistics
   */
  updateScore(newScore, scoreChange, reason, timestamp = Date.now()) {
    const oldScore = this.stats.currentScore;
    this.stats.currentScore = newScore;
    
    // Track score changes
    if (scoreChange > 0) {
      this.stats.totalScoreGained += scoreChange;
      
      // Update coin streak for positive score changes from coins
      if (reason === 'coin') {
        this.stats.currentCoinStreak++;
        this.stats.longestCoinStreak = Math.max(this.stats.longestCoinStreak, this.stats.currentCoinStreak);
      }
    } else if (scoreChange < 0) {
      this.stats.totalScoreLost += Math.abs(scoreChange);
      this.stats.currentCoinStreak = 0; // Reset coin streak on damage
    }
    
    // Update highest score
    this.stats.highestScore = Math.max(this.stats.highestScore, newScore);
    
    // Record score history
    this.scoreHistory.push({
      timestamp: timestamp,
      oldScore: oldScore,
      newScore: newScore,
      change: scoreChange,
      reason: reason
    });
    
    // Record event
    this.recordEvent('score_updated', {
      oldScore: oldScore,
      newScore: newScore,
      change: scoreChange,
      reason: reason
    }, timestamp);
    
    // Check for milestones
    this.checkScoreMilestones(newScore, oldScore);
    
    this.lastScoreUpdate = timestamp;
  }

  /**
   * Update collection statistics
   */
  updateCollectionStats(itemType, value, timestamp = Date.now()) {
    switch (itemType) {
      case 'coin':
        this.stats.coinsCollected++;
        this.stats.coinValue += value;
        this.stats.averageCoinValue = this.stats.coinValue / this.stats.coinsCollected;
        
        // Update safe streak (collecting coins is safe)
        this.stats.currentSafeStreak++;
        this.stats.longestSafeStreak = Math.max(this.stats.longestSafeStreak, this.stats.currentSafeStreak);
        
        this.recordEvent('coin_collected', { value: value }, timestamp);
        this.checkCollectionMilestones();
        break;
    }
  }

  /**
   * Update combat statistics
   */
  updateCombatStats(eventType, damage, timestamp = Date.now()) {
    switch (eventType) {
      case 'enemy_hit':
        this.stats.enemiesHit++;
        this.stats.totalDamageReceived += damage;
        this.stats.currentSafeStreak = 0; // Reset safe streak
        this.recordEvent('enemy_collision', { damage: damage }, timestamp);
        break;
        
      case 'bomb_hit':
        this.stats.bombsHit++;
        this.stats.totalDamageReceived += damage;
        this.stats.currentSafeStreak = 0; // Reset safe streak
        this.recordEvent('bomb_collision', { damage: damage }, timestamp);
        break;
    }
    
    this.checkCombatMilestones();
  }

  /**
   * Update movement statistics
   */
  updateMovementStats(newPosition, timestamp = Date.now()) {
    // Calculate distance moved
    const distance = Math.abs(newPosition.x - this.lastPosition.x) + Math.abs(newPosition.y - this.lastPosition.y);
    
    if (distance > 0) {
      this.stats.movesCount++;
      this.stats.totalDistance += distance;
      
      // Record movement
      this.movementHistory.push({
        timestamp: timestamp,
        from: { ...this.lastPosition },
        to: { ...newPosition },
        distance: distance
      });
      
      this.recordEvent('player_moved', {
        from: this.lastPosition,
        to: newPosition,
        distance: distance
      }, timestamp);
      
      this.lastPosition = { ...newPosition };
      this.checkMovementMilestones();
    }
  }

  /**
   * Update time-based statistics
   */
  updateTimeStats(gameTime, isActive, isInLead, timestamp = Date.now()) {
    const timeDelta = timestamp - this.lastUpdateTime;
    
    this.stats.gameTime = gameTime;
    
    if (isActive) {
      this.stats.activeTime += timeDelta;
    }
    
    if (isInLead && this.isInLead) {
      this.stats.timeInLead += timeDelta;
    }
    
    this.isInLead = isInLead;
    this.lastUpdateTime = timestamp;
    
    // Calculate derived metrics
    this.calculatePerformanceMetrics();
  }

  /**
   * Calculate performance metrics
   */
  calculatePerformanceMetrics() {
    // Efficiency: coins collected per move
    this.stats.efficiency = this.stats.movesCount > 0 ? this.stats.coinsCollected / this.stats.movesCount : 0;
    
    // Survival rate: percentage of moves without taking damage
    const totalDamageEvents = this.stats.enemiesHit + this.stats.bombsHit;
    this.stats.survivalRate = this.stats.movesCount > 0 ? 
      ((this.stats.movesCount - totalDamageEvents) / this.stats.movesCount) * 100 : 100;
    
    // Average moves per minute
    const gameTimeMinutes = this.stats.gameTime / 60000; // Convert to minutes
    this.stats.averageMovesPerMinute = gameTimeMinutes > 0 ? this.stats.movesCount / gameTimeMinutes : 0;
    
    // Consistency: based on score variance (lower variance = higher consistency)
    if (this.scoreHistory.length > 1) {
      const scores = this.scoreHistory.map(entry => entry.newScore);
      const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
      this.stats.consistency = Math.max(0, 100 - Math.sqrt(variance)); // Higher is more consistent
    }
  }

  /**
   * Check for score milestones
   */
  checkScoreMilestones(newScore, oldScore) {
    const milestoneThresholds = [50, 100, 250, 500, 750, 1000, 1500, 2000];
    
    for (const threshold of milestoneThresholds) {
      if (newScore >= threshold && oldScore < threshold) {
        this.addMilestone(`score_${threshold}`, `Reached ${threshold} points!`, {
          score: newScore,
          threshold: threshold
        });
      }
    }
    
    // Special milestones
    if (newScore >= 100 && this.stats.enemiesHit === 0) {
      this.addMilestone('perfect_100', 'Reached 100 points without taking damage!', {
        score: newScore,
        enemiesHit: this.stats.enemiesHit
      });
    }
  }

  /**
   * Check for collection milestones
   */
  checkCollectionMilestones() {
    const coinThresholds = [5, 10, 25, 50, 100];
    
    for (const threshold of coinThresholds) {
      if (this.stats.coinsCollected === threshold) {
        this.addMilestone(`coins_${threshold}`, `Collected ${threshold} coins!`, {
          coinsCollected: this.stats.coinsCollected
        });
      }
    }
    
    // Streak milestones
    const streakThresholds = [5, 10, 15, 20];
    for (const threshold of streakThresholds) {
      if (this.stats.currentCoinStreak === threshold) {
        this.addMilestone(`streak_${threshold}`, `${threshold} coin streak!`, {
          streak: this.stats.currentCoinStreak
        });
      }
    }
  }

  /**
   * Check for combat milestones
   */
  checkCombatMilestones() {
    // Survival milestones
    if (this.stats.longestSafeStreak >= 50 && !this.hasMilestone('survivor_50')) {
      this.addMilestone('survivor_50', '50 moves without taking damage!', {
        safeStreak: this.stats.longestSafeStreak
      });
    }
    
    if (this.stats.longestSafeStreak >= 100 && !this.hasMilestone('survivor_100')) {
      this.addMilestone('survivor_100', '100 moves without taking damage!', {
        safeStreak: this.stats.longestSafeStreak
      });
    }
  }

  /**
   * Check for movement milestones
   */
  checkMovementMilestones() {
    const moveThresholds = [100, 250, 500, 1000];
    
    for (const threshold of moveThresholds) {
      if (this.stats.movesCount === threshold) {
        this.addMilestone(`moves_${threshold}`, `Made ${threshold} moves!`, {
          movesCount: this.stats.movesCount
        });
      }
    }
    
    // Efficiency milestones
    if (this.stats.efficiency >= 0.5 && this.stats.movesCount >= 20 && !this.hasMilestone('efficient_player')) {
      this.addMilestone('efficient_player', 'Efficient player! High coin-to-move ratio!', {
        efficiency: this.stats.efficiency
      });
    }
  }

  /**
   * Add a milestone
   */
  addMilestone(id, description, data, timestamp = Date.now()) {
    if (this.hasMilestone(id)) return false;
    
    const milestone = {
      id: id,
      description: description,
      data: data,
      timestamp: timestamp,
      achieved: true
    };
    
    this.milestones.push(milestone);
    this.recordEvent('milestone_achieved', milestone, timestamp);
    
    console.log(`Milestone achieved by ${this.playerName}: ${description}`);
    return true;
  }

  /**
   * Check if player has a specific milestone
   */
  hasMilestone(milestoneId) {
    return this.milestones.some(milestone => milestone.id === milestoneId);
  }

  /**
   * Add an achievement
   */
  addAchievement(id, title, description, data, timestamp = Date.now()) {
    if (this.hasAchievement(id)) return false;
    
    const achievement = {
      id: id,
      title: title,
      description: description,
      data: data,
      timestamp: timestamp,
      unlocked: true
    };
    
    this.achievements.push(achievement);
    this.recordEvent('achievement_unlocked', achievement, timestamp);
    
    console.log(`Achievement unlocked by ${this.playerName}: ${title}`);
    return true;
  }

  /**
   * Check if player has a specific achievement
   */
  hasAchievement(achievementId) {
    return this.achievements.some(achievement => achievement.id === achievementId);
  }

  /**
   * Record an event in the player's history
   */
  recordEvent(eventType, eventData, timestamp = Date.now()) {
    const event = {
      type: eventType,
      data: eventData,
      timestamp: timestamp
    };
    
    this.eventHistory.push(event);
    
    // Limit event history to prevent memory issues
    if (this.eventHistory.length > 500) {
      this.eventHistory = this.eventHistory.slice(-250);
    }
  }

  /**
   * Get current statistics summary
   */
  getStatsSummary() {
    return {
      playerId: this.playerId,
      playerName: this.playerName,
      stats: { ...this.stats },
      milestones: this.milestones.length,
      achievements: this.achievements.length,
      lastUpdated: this.lastUpdateTime
    };
  }

  /**
   * Get detailed statistics for post-game summary
   */
  getDetailedStats() {
    return {
      playerId: this.playerId,
      playerName: this.playerName,
      stats: { ...this.stats },
      milestones: [...this.milestones],
      achievements: [...this.achievements],
      scoreHistory: [...this.scoreHistory],
      recentEvents: this.eventHistory.slice(-10), // Last 10 events
      performance: {
        efficiency: this.stats.efficiency,
        survivalRate: this.stats.survivalRate,
        consistency: this.stats.consistency,
        averageMovesPerMinute: this.stats.averageMovesPerMinute
      }
    };
  }

  /**
   * Get real-time display data
   */
  getRealTimeDisplayData() {
    return {
      playerId: this.playerId,
      playerName: this.playerName,
      currentScore: this.stats.currentScore,
      coinsCollected: this.stats.coinsCollected,
      currentStreak: this.stats.currentCoinStreak,
      longestStreak: this.stats.longestCoinStreak,
      efficiency: Math.round(this.stats.efficiency * 100) / 100,
      survivalRate: Math.round(this.stats.survivalRate * 10) / 10,
      recentMilestones: this.milestones.slice(-3), // Last 3 milestones
      isInLead: this.isInLead
    };
  }

  /**
   * Reset statistics (for new game)
   */
  reset() {
    // Reset all stats to initial values
    Object.keys(this.stats).forEach(key => {
      if (typeof this.stats[key] === 'number') {
        this.stats[key] = 0;
      }
    });
    
    // Clear history arrays
    this.scoreHistory = [];
    this.movementHistory = [];
    this.eventHistory = [];
    this.milestones = [];
    this.achievements = [];
    
    // Reset tracking variables
    this.lastUpdateTime = Date.now();
    this.lastPosition = { x: 0, y: 0 };
    this.isInLead = false;
    this.lastScoreUpdate = Date.now();
    
    console.log(`Statistics reset for ${this.playerName}`);
  }

  /**
   * Validate statistics data
   */
  validate() {
    const errors = [];
    
    // Check required fields
    if (!this.playerId) errors.push('Player ID is required');
    if (!this.playerName) errors.push('Player name is required');
    
    // Check numeric values
    if (this.stats.currentScore < 0) errors.push('Current score cannot be negative');
    if (this.stats.coinsCollected < 0) errors.push('Coins collected cannot be negative');
    if (this.stats.movesCount < 0) errors.push('Moves count cannot be negative');
    
    // Check consistency
    if (this.stats.totalScoreGained < this.stats.coinValue) {
      errors.push('Total score gained should be at least equal to coin value');
    }
    
    return errors;
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.PlayerStatistics = PlayerStatistics;
} else if (typeof global !== 'undefined') {
  global.PlayerStatistics = PlayerStatistics;
}

console.log("Player statistics tracking system loaded successfully");