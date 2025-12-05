// Real-Time Score Display Component
console.log("Real-time score display component loaded");

/**
 * RealTimeScoreDisplay - Shows live player statistics and scores
 */
class RealTimeScoreDisplay {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.players = new Map();
    this.updateInterval = null;
    this.isVisible = false;
    
    this.createDisplayElements();
    this.setupEventListeners();
    
    console.log("Real-time score display initialized");
  }

  /**
   * Create display elements
   */
  createDisplayElements() {
    if (!this.container) {
      console.error("Score display container not found");
      return;
    }

    this.container.innerHTML = `
      <div class="real-time-score-display">
        <div class="score-header">
          <h3>Live Scores</h3>
          <div class="display-controls">
            <button class="toggle-details-btn" title="Toggle Details">📊</button>
            <button class="toggle-stats-btn" title="Toggle Statistics">📈</button>
          </div>
        </div>
        
        <div class="player-scores-container" id="playerScoresContainer">
          <!-- Player score cards will be dynamically added here -->
        </div>
        
        <div class="game-statistics" id="gameStatistics">
          <div class="stats-header">
            <h4>Game Statistics</h4>
          </div>
          <div class="stats-content" id="statsContent">
            <!-- Game-wide statistics will be shown here -->
          </div>
        </div>
      </div>
    `;

    // Get references to key elements
    this.playerScoresContainer = document.getElementById('playerScoresContainer');
    this.gameStatistics = document.getElementById('gameStatistics');
    this.statsContent = document.getElementById('statsContent');
    
    // Add CSS styles
    this.addStyles();
  }

  /**
   * Add CSS styles for the score display
   */
  addStyles() {
    const styleId = 'real-time-score-display-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .real-time-score-display {
        background: rgba(0, 0, 0, 0.8);
        border-radius: 10px;
        padding: 15px;
        color: white;
        font-family: 'Courier New', monospace;
        max-width: 400px;
        margin: 10px;
      }

      .score-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        border-bottom: 2px solid #333;
        padding-bottom: 10px;
      }

      .score-header h3 {
        margin: 0;
        color: #00ff41;
        font-size: 18px;
      }

      .display-controls button {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid #333;
        color: white;
        padding: 5px 8px;
        margin-left: 5px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
      }

      .display-controls button:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .player-score-card {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 10px;
        border-left: 4px solid;
        position: relative;
        transition: all 0.3s ease;
      }

      .player-score-card.leading {
        background: rgba(255, 215, 0, 0.2);
        border-left-color: #ffd700;
        box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
      }

      .player-score-card .player-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
      }

      .player-name {
        font-weight: bold;
        font-size: 16px;
      }

      .player-score {
        font-size: 18px;
        font-weight: bold;
        color: #00ff41;
      }

      .player-stats {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        font-size: 12px;
        margin-top: 8px;
      }

      .stat-item {
        display: flex;
        justify-content: space-between;
        padding: 2px 0;
      }

      .stat-label {
        color: #ccc;
      }

      .stat-value {
        color: white;
        font-weight: bold;
      }

      .milestone-indicator {
        position: absolute;
        top: 5px;
        right: 5px;
        background: #ff4444;
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: bold;
      }

      .recent-milestones {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid #333;
      }

      .milestone-item {
        font-size: 11px;
        color: #ffd700;
        margin-bottom: 2px;
        display: flex;
        align-items: center;
      }

      .milestone-item::before {
        content: "🏆";
        margin-right: 4px;
      }

      .game-statistics {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 2px solid #333;
      }

      .stats-header h4 {
        margin: 0 0 10px 0;
        color: #00ff41;
        font-size: 14px;
      }

      .game-stat-item {
        display: flex;
        justify-content: space-between;
        padding: 3px 0;
        font-size: 12px;
      }

      .streak-indicator {
        display: inline-block;
        background: linear-gradient(45deg, #ff4444, #ff8844);
        color: white;
        padding: 2px 6px;
        border-radius: 10px;
        font-size: 10px;
        margin-left: 5px;
      }

      .efficiency-bar {
        width: 100%;
        height: 4px;
        background: #333;
        border-radius: 2px;
        margin-top: 4px;
        overflow: hidden;
      }

      .efficiency-fill {
        height: 100%;
        background: linear-gradient(90deg, #ff4444, #ffff00, #00ff41);
        transition: width 0.3s ease;
      }

      .hidden {
        display: none;
      }

      @keyframes scoreUpdate {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }

      .score-updated {
        animation: scoreUpdate 0.3s ease;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Toggle details button
    const toggleDetailsBtn = this.container.querySelector('.toggle-details-btn');
    if (toggleDetailsBtn) {
      toggleDetailsBtn.addEventListener('click', () => {
        this.toggleDetails();
      });
    }

    // Toggle statistics button
    const toggleStatsBtn = this.container.querySelector('.toggle-stats-btn');
    if (toggleStatsBtn) {
      toggleStatsBtn.addEventListener('click', () => {
        this.toggleStatistics();
      });
    }
  }

  /**
   * Add or update a player in the display
   */
  addPlayer(playerId, playerData) {
    this.players.set(playerId, {
      ...playerData,
      lastScore: playerData.currentScore || 0,
      lastUpdate: Date.now()
    });
    
    this.createPlayerCard(playerId, playerData);
    this.updateDisplay();
  }

  /**
   * Remove a player from the display
   */
  removePlayer(playerId) {
    this.players.delete(playerId);
    
    const playerCard = document.getElementById(`player-card-${playerId}`);
    if (playerCard) {
      playerCard.remove();
    }
    
    this.updateDisplay();
  }

  /**
   * Update player data
   */
  updatePlayer(playerId, playerData) {
    const existingPlayer = this.players.get(playerId);
    if (!existingPlayer) {
      this.addPlayer(playerId, playerData);
      return;
    }

    // Check if score changed for animation
    const scoreChanged = existingPlayer.lastScore !== playerData.currentScore;
    
    this.players.set(playerId, {
      ...playerData,
      lastScore: playerData.currentScore || 0,
      lastUpdate: Date.now()
    });

    this.updatePlayerCard(playerId, playerData, scoreChanged);
  }

  /**
   * Create a player score card
   */
  createPlayerCard(playerId, playerData) {
    const playerCard = document.createElement('div');
    playerCard.id = `player-card-${playerId}`;
    playerCard.className = 'player-score-card';
    playerCard.style.borderLeftColor = playerData.color || '#00ff41';

    this.playerScoresContainer.appendChild(playerCard);
    this.updatePlayerCard(playerId, playerData, false);
  }

  /**
   * Update a player score card
   */
  updatePlayerCard(playerId, playerData, scoreChanged = false) {
    const playerCard = document.getElementById(`player-card-${playerId}`);
    if (!playerCard) return;

    // Add leading class if player is in lead
    if (playerData.isInLead) {
      playerCard.classList.add('leading');
    } else {
      playerCard.classList.remove('leading');
    }

    // Create milestone indicator
    const milestoneCount = playerData.recentMilestones ? playerData.recentMilestones.length : 0;
    const milestoneIndicator = milestoneCount > 0 ? 
      `<div class="milestone-indicator">${milestoneCount}</div>` : '';

    // Create recent milestones display
    const recentMilestones = playerData.recentMilestones && playerData.recentMilestones.length > 0 ?
      `<div class="recent-milestones">
        ${playerData.recentMilestones.map(milestone => 
          `<div class="milestone-item">${milestone.description}</div>`
        ).join('')}
      </div>` : '';

    // Create streak indicator
    const streakIndicator = playerData.currentStreak > 1 ? 
      `<span class="streak-indicator">${playerData.currentStreak}x</span>` : '';

    // Create efficiency bar
    const efficiencyPercent = Math.min(100, (playerData.efficiency || 0) * 100);
    const efficiencyBar = `
      <div class="efficiency-bar">
        <div class="efficiency-fill" style="width: ${efficiencyPercent}%"></div>
      </div>
    `;

    playerCard.innerHTML = `
      ${milestoneIndicator}
      <div class="player-header">
        <span class="player-name" style="color: ${playerData.color || '#white'}">${playerData.playerName}</span>
        <span class="player-score ${scoreChanged ? 'score-updated' : ''}">${playerData.currentScore || 0}</span>
      </div>
      
      <div class="player-stats">
        <div class="stat-item">
          <span class="stat-label">Coins:</span>
          <span class="stat-value">${playerData.coinsCollected || 0}${streakIndicator}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Best Streak:</span>
          <span class="stat-value">${playerData.longestStreak || 0}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Efficiency:</span>
          <span class="stat-value">${(playerData.efficiency || 0).toFixed(2)}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Survival:</span>
          <span class="stat-value">${(playerData.survivalRate || 0).toFixed(1)}%</span>
        </div>
      </div>
      
      ${efficiencyBar}
      ${recentMilestones}
    `;

    // Trigger score animation if score changed
    if (scoreChanged) {
      const scoreElement = playerCard.querySelector('.player-score');
      setTimeout(() => {
        scoreElement.classList.remove('score-updated');
      }, 300);
    }
  }

  /**
   * Update the entire display
   */
  updateDisplay() {
    // Sort players by score for proper ordering
    const sortedPlayers = Array.from(this.players.entries())
      .sort(([, a], [, b]) => (b.currentScore || 0) - (a.currentScore || 0));

    // Reorder player cards
    sortedPlayers.forEach(([playerId], index) => {
      const playerCard = document.getElementById(`player-card-${playerId}`);
      if (playerCard) {
        this.playerScoresContainer.appendChild(playerCard);
      }
    });

    // Update game statistics
    this.updateGameStatistics();
  }

  /**
   * Update game-wide statistics
   */
  updateGameStatistics() {
    if (!this.statsContent) return;

    const players = Array.from(this.players.values());
    if (players.length === 0) return;

    const totalCoins = players.reduce((sum, p) => sum + (p.coinsCollected || 0), 0);
    const totalScore = players.reduce((sum, p) => sum + (p.currentScore || 0), 0);
    const avgEfficiency = players.reduce((sum, p) => sum + (p.efficiency || 0), 0) / players.length;
    const avgSurvival = players.reduce((sum, p) => sum + (p.survivalRate || 0), 0) / players.length;
    const highestStreak = Math.max(...players.map(p => p.longestStreak || 0));

    this.statsContent.innerHTML = `
      <div class="game-stat-item">
        <span class="stat-label">Total Coins:</span>
        <span class="stat-value">${totalCoins}</span>
      </div>
      <div class="game-stat-item">
        <span class="stat-label">Total Score:</span>
        <span class="stat-value">${totalScore}</span>
      </div>
      <div class="game-stat-item">
        <span class="stat-label">Avg Efficiency:</span>
        <span class="stat-value">${avgEfficiency.toFixed(2)}</span>
      </div>
      <div class="game-stat-item">
        <span class="stat-label">Avg Survival:</span>
        <span class="stat-value">${avgSurvival.toFixed(1)}%</span>
      </div>
      <div class="game-stat-item">
        <span class="stat-label">Best Streak:</span>
        <span class="stat-value">${highestStreak}</span>
      </div>
    `;
  }

  /**
   * Start real-time updates
   */
  startUpdates(updateIntervalMs = 1000) {
    this.stopUpdates();
    
    this.updateInterval = setInterval(() => {
      this.updateDisplay();
    }, updateIntervalMs);
  }

  /**
   * Stop real-time updates
   */
  stopUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Show the display
   */
  show() {
    if (this.container) {
      this.container.style.display = 'block';
      this.isVisible = true;
    }
  }

  /**
   * Hide the display
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
      this.isVisible = false;
    }
  }

  /**
   * Toggle details visibility
   */
  toggleDetails() {
    const playerStats = this.container.querySelectorAll('.player-stats');
    playerStats.forEach(stats => {
      stats.classList.toggle('hidden');
    });
  }

  /**
   * Toggle statistics visibility
   */
  toggleStatistics() {
    if (this.gameStatistics) {
      this.gameStatistics.classList.toggle('hidden');
    }
  }

  /**
   * Clear all players
   */
  clear() {
    this.players.clear();
    if (this.playerScoresContainer) {
      this.playerScoresContainer.innerHTML = '';
    }
    this.updateGameStatistics();
  }

  /**
   * Get current display data
   */
  getDisplayData() {
    return {
      players: Array.from(this.players.entries()),
      isVisible: this.isVisible,
      updateInterval: this.updateInterval !== null
    };
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stopUpdates();
    this.clear();
    
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    console.log("Real-time score display destroyed");
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.RealTimeScoreDisplay = RealTimeScoreDisplay;
} else if (typeof global !== 'undefined') {
  global.RealTimeScoreDisplay = RealTimeScoreDisplay;
}

console.log("Real-time score display component loaded successfully");