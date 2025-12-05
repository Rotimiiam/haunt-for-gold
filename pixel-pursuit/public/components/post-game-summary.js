// Post-Game Summary Component
console.log("Post-game summary component loaded");

/**
 * PostGameSummary - Shows detailed individual performance after game ends
 */
class PostGameSummary {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.gameResult = null;
    this.playerStats = [];
    this.isVisible = false;
    
    this.createSummaryElements();
    this.setupEventListeners();
    
    console.log("Post-game summary initialized");
  }

  /**
   * Create summary elements
   */
  createSummaryElements() {
    if (!this.container) {
      console.error("Post-game summary container not found");
      return;
    }

    this.container.innerHTML = `
      <div class="post-game-summary">
        <div class="summary-header">
          <h2>Game Summary</h2>
          <div class="game-info" id="gameInfo">
            <!-- Game duration, winner, etc. -->
          </div>
        </div>
        
        <div class="winner-announcement" id="winnerAnnouncement">
          <!-- Winner announcement -->
        </div>
        
        <div class="leaderboard-section">
          <h3>Final Rankings</h3>
          <div class="leaderboard" id="finalLeaderboard">
            <!-- Final player rankings -->
          </div>
        </div>
        
        <div class="detailed-stats-section">
          <h3>Individual Performance</h3>
          <div class="player-stats-tabs" id="playerStatsTabs">
            <!-- Player tabs for detailed stats -->
          </div>
          <div class="player-stats-content" id="playerStatsContent">
            <!-- Detailed player statistics -->
          </div>
        </div>
        
        <div class="achievements-section">
          <h3>Achievements & Milestones</h3>
          <div class="achievements-grid" id="achievementsGrid">
            <!-- Player achievements and milestones -->
          </div>
        </div>
        
        <div class="game-statistics-section">
          <h3>Game Statistics</h3>
          <div class="game-stats-grid" id="gameStatsGrid">
            <!-- Overall game statistics -->
          </div>
        </div>
        
        <div class="summary-actions">
          <button class="play-again-btn" id="playAgainBtn">Play Again</button>
          <button class="export-stats-btn" id="exportStatsBtn">Export Stats</button>
          <button class="close-summary-btn" id="closeSummaryBtn">Close</button>
        </div>
      </div>
    `;

    // Get references to key elements
    this.gameInfo = document.getElementById('gameInfo');
    this.winnerAnnouncement = document.getElementById('winnerAnnouncement');
    this.finalLeaderboard = document.getElementById('finalLeaderboard');
    this.playerStatsTabs = document.getElementById('playerStatsTabs');
    this.playerStatsContent = document.getElementById('playerStatsContent');
    this.achievementsGrid = document.getElementById('achievementsGrid');
    this.gameStatsGrid = document.getElementById('gameStatsGrid');
    
    // Add CSS styles
    this.addStyles();
  }

  /**
   * Add CSS styles for the post-game summary
   */
  addStyles() {
    const styleId = 'post-game-summary-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .post-game-summary {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        color: white;
        font-family: 'Courier New', monospace;
        overflow-y: auto;
        z-index: 1000;
        padding: 20px;
        box-sizing: border-box;
      }

      .summary-header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #333;
        padding-bottom: 20px;
      }

      .summary-header h2 {
        margin: 0 0 15px 0;
        color: #00ff41;
        font-size: 32px;
        text-shadow: 0 0 10px #00ff41;
      }

      .game-info {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-top: 15px;
      }

      .info-item {
        background: rgba(255, 255, 255, 0.1);
        padding: 10px;
        border-radius: 8px;
        text-align: center;
      }

      .info-label {
        color: #ccc;
        font-size: 12px;
        margin-bottom: 5px;
      }

      .info-value {
        color: white;
        font-size: 18px;
        font-weight: bold;
      }

      .winner-announcement {
        text-align: center;
        margin: 30px 0;
        padding: 20px;
        background: linear-gradient(45deg, #ffd700, #ffed4e);
        color: #000;
        border-radius: 15px;
        font-size: 24px;
        font-weight: bold;
        text-shadow: none;
      }

      .winner-announcement.no-winner {
        background: linear-gradient(45deg, #666, #999);
        color: white;
      }

      .leaderboard-section {
        margin: 30px 0;
      }

      .leaderboard-section h3 {
        color: #00ff41;
        margin-bottom: 15px;
        font-size: 20px;
      }

      .leaderboard {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .leaderboard-entry {
        display: grid;
        grid-template-columns: 60px 1fr 100px 150px;
        align-items: center;
        background: rgba(255, 255, 255, 0.1);
        padding: 15px;
        border-radius: 10px;
        border-left: 4px solid;
      }

      .leaderboard-entry.rank-1 {
        border-left-color: #ffd700;
        background: rgba(255, 215, 0, 0.2);
      }

      .leaderboard-entry.rank-2 {
        border-left-color: #c0c0c0;
        background: rgba(192, 192, 192, 0.2);
      }

      .leaderboard-entry.rank-3 {
        border-left-color: #cd7f32;
        background: rgba(205, 127, 50, 0.2);
      }

      .rank-number {
        font-size: 24px;
        font-weight: bold;
        text-align: center;
      }

      .player-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .player-name {
        font-size: 18px;
        font-weight: bold;
      }

      .player-score {
        font-size: 20px;
        font-weight: bold;
        color: #00ff41;
        text-align: center;
      }

      .quick-stats {
        font-size: 12px;
        color: #ccc;
        text-align: right;
      }

      .detailed-stats-section {
        margin: 30px 0;
      }

      .detailed-stats-section h3 {
        color: #00ff41;
        margin-bottom: 15px;
        font-size: 20px;
      }

      .player-stats-tabs {
        display: flex;
        gap: 5px;
        margin-bottom: 20px;
        flex-wrap: wrap;
      }

      .stats-tab {
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: white;
        padding: 10px 15px;
        border-radius: 8px 8px 0 0;
        cursor: pointer;
        font-family: inherit;
        font-size: 14px;
        transition: all 0.3s ease;
      }

      .stats-tab.active {
        background: rgba(0, 255, 65, 0.2);
        border-bottom: 2px solid #00ff41;
      }

      .stats-tab:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .player-stats-content {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 0 10px 10px 10px;
        padding: 20px;
        min-height: 300px;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
      }

      .stats-category {
        background: rgba(255, 255, 255, 0.05);
        padding: 15px;
        border-radius: 8px;
        border-left: 3px solid #00ff41;
      }

      .stats-category h4 {
        margin: 0 0 10px 0;
        color: #00ff41;
        font-size: 16px;
      }

      .stat-row {
        display: flex;
        justify-content: space-between;
        padding: 5px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .stat-row:last-child {
        border-bottom: none;
      }

      .stat-label {
        color: #ccc;
        font-size: 14px;
      }

      .stat-value {
        color: white;
        font-weight: bold;
        font-size: 14px;
      }

      .achievements-section {
        margin: 30px 0;
      }

      .achievements-section h3 {
        color: #00ff41;
        margin-bottom: 15px;
        font-size: 20px;
      }

      .achievements-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      }

      .player-achievements {
        background: rgba(255, 255, 255, 0.1);
        padding: 15px;
        border-radius: 10px;
        border-left: 4px solid;
      }

      .achievements-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 15px;
      }

      .achievements-header h4 {
        margin: 0;
        font-size: 16px;
      }

      .achievement-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .achievement-item:last-child {
        border-bottom: none;
      }

      .achievement-icon {
        font-size: 16px;
      }

      .achievement-text {
        flex: 1;
        font-size: 13px;
      }

      .achievement-time {
        font-size: 11px;
        color: #ccc;
      }

      .game-statistics-section {
        margin: 30px 0;
      }

      .game-statistics-section h3 {
        color: #00ff41;
        margin-bottom: 15px;
        font-size: 20px;
      }

      .game-stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
      }

      .game-stat-card {
        background: rgba(255, 255, 255, 0.1);
        padding: 15px;
        border-radius: 10px;
        text-align: center;
      }

      .game-stat-value {
        font-size: 24px;
        font-weight: bold;
        color: #00ff41;
        margin-bottom: 5px;
      }

      .game-stat-label {
        font-size: 12px;
        color: #ccc;
      }

      .summary-actions {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-top: 40px;
        padding-top: 20px;
        border-top: 2px solid #333;
      }

      .summary-actions button {
        background: rgba(0, 255, 65, 0.2);
        border: 2px solid #00ff41;
        color: #00ff41;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-family: inherit;
        font-size: 16px;
        font-weight: bold;
        transition: all 0.3s ease;
      }

      .summary-actions button:hover {
        background: rgba(0, 255, 65, 0.4);
        transform: translateY(-2px);
      }

      .play-again-btn {
        background: rgba(255, 215, 0, 0.2) !important;
        border-color: #ffd700 !important;
        color: #ffd700 !important;
      }

      .play-again-btn:hover {
        background: rgba(255, 215, 0, 0.4) !important;
      }

      .export-stats-btn {
        background: rgba(68, 68, 255, 0.2) !important;
        border-color: #4444ff !important;
        color: #4444ff !important;
      }

      .export-stats-btn:hover {
        background: rgba(68, 68, 255, 0.4) !important;
      }

      .hidden {
        display: none;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .post-game-summary {
        animation: fadeIn 0.5s ease;
      }

      .performance-chart {
        width: 100%;
        height: 200px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        margin-top: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        font-size: 14px;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Play again button
    const playAgainBtn = document.getElementById('playAgainBtn');
    if (playAgainBtn) {
      playAgainBtn.addEventListener('click', () => {
        this.emit('playAgain');
      });
    }

    // Export stats button
    const exportStatsBtn = document.getElementById('exportStatsBtn');
    if (exportStatsBtn) {
      exportStatsBtn.addEventListener('click', () => {
        this.exportStatistics();
      });
    }

    // Close summary button
    const closeSummaryBtn = document.getElementById('closeSummaryBtn');
    if (closeSummaryBtn) {
      closeSummaryBtn.addEventListener('click', () => {
        this.hide();
      });
    }

    // Escape key to close
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isVisible) {
        this.hide();
      }
    });
  }

  /**
   * Show post-game summary with results
   */
  showSummary(gameResult, playerStats) {
    this.gameResult = gameResult;
    this.playerStats = playerStats;
    
    this.updateGameInfo();
    this.updateWinnerAnnouncement();
    this.updateLeaderboard();
    this.updatePlayerStatsTabs();
    this.updateAchievements();
    this.updateGameStatistics();
    
    this.show();
  }

  /**
   * Update game information section
   */
  updateGameInfo() {
    if (!this.gameInfo || !this.gameResult) return;

    const duration = this.formatDuration(this.gameResult.duration);
    const playerCount = this.gameResult.playerCount;
    const totalScore = Object.values(this.gameResult.finalScores)
      .reduce((sum, player) => sum + player.score, 0);
    const totalCoins = this.gameResult.gameStats.totalCoinsCollected;

    this.gameInfo.innerHTML = `
      <div class="info-item">
        <div class="info-label">Game Duration</div>
        <div class="info-value">${duration}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Players</div>
        <div class="info-value">${playerCount}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Total Score</div>
        <div class="info-value">${totalScore}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Coins Collected</div>
        <div class="info-value">${totalCoins}</div>
      </div>
    `;
  }

  /**
   * Update winner announcement
   */
  updateWinnerAnnouncement() {
    if (!this.winnerAnnouncement || !this.gameResult) return;

    if (this.gameResult.winnerId && this.gameResult.winnerName) {
      this.winnerAnnouncement.innerHTML = `
        🏆 ${this.gameResult.winnerName} Wins! 🏆
      `;
      this.winnerAnnouncement.className = 'winner-announcement';
    } else {
      this.winnerAnnouncement.innerHTML = `
        🤝 Game Ended - No Winner 🤝
      `;
      this.winnerAnnouncement.className = 'winner-announcement no-winner';
    }
  }

  /**
   * Update final leaderboard
   */
  updateLeaderboard() {
    if (!this.finalLeaderboard || !this.gameResult) return;

    const leaderboard = this.gameResult.leaderboard || [];
    
    this.finalLeaderboard.innerHTML = leaderboard.map(entry => `
      <div class="leaderboard-entry rank-${entry.rank}">
        <div class="rank-number">#${entry.rank}</div>
        <div class="player-info">
          <span class="player-name" style="color: ${entry.color}">${entry.playerName}</span>
        </div>
        <div class="player-score">${entry.score}</div>
        <div class="quick-stats">
          Coins: ${entry.stats.coinsCollected}<br>
          Moves: ${entry.stats.movesCount}
        </div>
      </div>
    `).join('');
  }

  /**
   * Update player statistics tabs
   */
  updatePlayerStatsTabs() {
    if (!this.playerStatsTabs || !this.playerStats) return;

    // Create tabs for each player
    this.playerStatsTabs.innerHTML = this.playerStats.map((playerStat, index) => `
      <button class="stats-tab ${index === 0 ? 'active' : ''}" 
              data-player-id="${playerStat.playerId}">
        ${playerStat.playerName}
      </button>
    `).join('');

    // Add click listeners to tabs
    const tabs = this.playerStatsTabs.querySelectorAll('.stats-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        tab.classList.add('active');
        // Update content
        const playerId = tab.dataset.playerId;
        this.updatePlayerStatsContent(playerId);
      });
    });

    // Show first player's stats by default
    if (this.playerStats.length > 0) {
      this.updatePlayerStatsContent(this.playerStats[0].playerId);
    }
  }

  /**
   * Update player statistics content
   */
  updatePlayerStatsContent(playerId) {
    if (!this.playerStatsContent) return;

    const playerStat = this.playerStats.find(p => p.playerId === playerId);
    if (!playerStat) return;

    const stats = playerStat.stats;
    const performance = playerStat.performance;

    this.playerStatsContent.innerHTML = `
      <div class="stats-grid">
        <div class="stats-category">
          <h4>📊 Score Statistics</h4>
          <div class="stat-row">
            <span class="stat-label">Final Score</span>
            <span class="stat-value">${stats.currentScore}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Highest Score</span>
            <span class="stat-value">${stats.highestScore}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Score Gained</span>
            <span class="stat-value">+${stats.totalScoreGained}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Score Lost</span>
            <span class="stat-value">-${stats.totalScoreLost}</span>
          </div>
        </div>

        <div class="stats-category">
          <h4>🪙 Collection Statistics</h4>
          <div class="stat-row">
            <span class="stat-label">Coins Collected</span>
            <span class="stat-value">${stats.coinsCollected}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Coin Value</span>
            <span class="stat-value">${stats.coinValue}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Average Coin Value</span>
            <span class="stat-value">${stats.averageCoinValue.toFixed(1)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Longest Streak</span>
            <span class="stat-value">${stats.longestCoinStreak}</span>
          </div>
        </div>

        <div class="stats-category">
          <h4>⚔️ Combat Statistics</h4>
          <div class="stat-row">
            <span class="stat-label">Enemies Hit</span>
            <span class="stat-value">${stats.enemiesHit}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Bombs Hit</span>
            <span class="stat-value">${stats.bombsHit}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Total Damage</span>
            <span class="stat-value">${stats.totalDamageReceived}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Longest Safe Streak</span>
            <span class="stat-value">${stats.longestSafeStreak}</span>
          </div>
        </div>

        <div class="stats-category">
          <h4>🏃 Movement Statistics</h4>
          <div class="stat-row">
            <span class="stat-label">Total Moves</span>
            <span class="stat-value">${stats.movesCount}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Distance Traveled</span>
            <span class="stat-value">${stats.totalDistance}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Moves Per Minute</span>
            <span class="stat-value">${stats.averageMovesPerMinute.toFixed(1)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Active Time</span>
            <span class="stat-value">${this.formatDuration(stats.activeTime)}</span>
          </div>
        </div>

        <div class="stats-category">
          <h4>🎯 Performance Metrics</h4>
          <div class="stat-row">
            <span class="stat-label">Efficiency</span>
            <span class="stat-value">${performance.efficiency.toFixed(3)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Survival Rate</span>
            <span class="stat-value">${performance.survivalRate.toFixed(1)}%</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Consistency</span>
            <span class="stat-value">${performance.consistency.toFixed(1)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Time in Lead</span>
            <span class="stat-value">${this.formatDuration(stats.timeInLead)}</span>
          </div>
        </div>

        <div class="stats-category">
          <h4>⏱️ Time Statistics</h4>
          <div class="stat-row">
            <span class="stat-label">Game Time</span>
            <span class="stat-value">${this.formatDuration(stats.gameTime)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Active Time</span>
            <span class="stat-value">${this.formatDuration(stats.activeTime)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Time in Lead</span>
            <span class="stat-value">${this.formatDuration(stats.timeInLead)}</span>
          </div>
          <div class="stat-row">
            <span class="stat-label">Activity Rate</span>
            <span class="stat-value">${((stats.activeTime / stats.gameTime) * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Update achievements section
   */
  updateAchievements() {
    if (!this.achievementsGrid || !this.playerStats) return;

    this.achievementsGrid.innerHTML = this.playerStats.map(playerStat => {
      const milestones = playerStat.milestones || [];
      const achievements = playerStat.achievements || [];
      
      return `
        <div class="player-achievements" style="border-left-color: ${playerStat.color || '#00ff41'}">
          <div class="achievements-header">
            <h4>${playerStat.playerName}</h4>
            <span>(${milestones.length + achievements.length} total)</span>
          </div>
          
          ${milestones.map(milestone => `
            <div class="achievement-item">
              <span class="achievement-icon">🏆</span>
              <span class="achievement-text">${milestone.description}</span>
              <span class="achievement-time">${this.formatTime(milestone.timestamp)}</span>
            </div>
          `).join('')}
          
          ${achievements.map(achievement => `
            <div class="achievement-item">
              <span class="achievement-icon">🎖️</span>
              <span class="achievement-text">${achievement.title}: ${achievement.description}</span>
              <span class="achievement-time">${this.formatTime(achievement.timestamp)}</span>
            </div>
          `).join('')}
          
          ${milestones.length + achievements.length === 0 ? 
            '<div class="achievement-item"><span class="achievement-text">No achievements this game</span></div>' : ''}
        </div>
      `;
    }).join('');
  }

  /**
   * Update game statistics
   */
  updateGameStatistics() {
    if (!this.gameStatsGrid || !this.gameResult) return;

    const gameStats = this.gameResult.gameStats;
    
    this.gameStatsGrid.innerHTML = `
      <div class="game-stat-card">
        <div class="game-stat-value">${gameStats.totalCoinsCollected}</div>
        <div class="game-stat-label">Total Coins Collected</div>
      </div>
      <div class="game-stat-card">
        <div class="game-stat-value">${gameStats.totalEnemiesHit}</div>
        <div class="game-stat-label">Total Enemy Hits</div>
      </div>
      <div class="game-stat-card">
        <div class="game-stat-value">${gameStats.totalBombsHit}</div>
        <div class="game-stat-label">Total Bomb Hits</div>
      </div>
      <div class="game-stat-card">
        <div class="game-stat-value">${gameStats.totalMoves}</div>
        <div class="game-stat-label">Total Moves</div>
      </div>
      <div class="game-stat-card">
        <div class="game-stat-value">${this.formatDuration(this.gameResult.duration)}</div>
        <div class="game-stat-label">Game Duration</div>
      </div>
      <div class="game-stat-card">
        <div class="game-stat-value">${this.gameResult.playerCount}</div>
        <div class="game-stat-label">Players</div>
      </div>
    `;
  }

  /**
   * Export statistics to JSON
   */
  exportStatistics() {
    if (!this.gameResult || !this.playerStats) {
      console.warn('No statistics to export');
      return;
    }

    const exportData = {
      gameResult: this.gameResult,
      playerStats: this.playerStats,
      exportTime: new Date().toISOString(),
      version: '1.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `game-stats-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    link.click();
    
    console.log('Statistics exported successfully');
  }

  /**
   * Format duration in milliseconds to readable string
   */
  formatDuration(milliseconds) {
    if (!milliseconds || milliseconds < 0) return '0:00';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Format timestamp to readable time
   */
  formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString();
  }

  /**
   * Show the summary
   */
  show() {
    if (this.container) {
      this.container.style.display = 'block';
      this.isVisible = true;
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
  }

  /**
   * Hide the summary
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
      this.isVisible = false;
      document.body.style.overflow = ''; // Restore scrolling
    }
  }

  /**
   * Event system - emit events
   */
  emit(eventType, data = null) {
    const event = new CustomEvent(`postGameSummary:${eventType}`, {
      detail: data
    });
    document.dispatchEvent(event);
  }

  /**
   * Clear summary data
   */
  clear() {
    this.gameResult = null;
    this.playerStats = [];
    
    if (this.gameInfo) this.gameInfo.innerHTML = '';
    if (this.winnerAnnouncement) this.winnerAnnouncement.innerHTML = '';
    if (this.finalLeaderboard) this.finalLeaderboard.innerHTML = '';
    if (this.playerStatsTabs) this.playerStatsTabs.innerHTML = '';
    if (this.playerStatsContent) this.playerStatsContent.innerHTML = '';
    if (this.achievementsGrid) this.achievementsGrid.innerHTML = '';
    if (this.gameStatsGrid) this.gameStatsGrid.innerHTML = '';
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.clear();
    
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    document.body.style.overflow = ''; // Restore scrolling
    
    console.log("Post-game summary destroyed");
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.PostGameSummary = PostGameSummary;
} else if (typeof global !== 'undefined') {
  global.PostGameSummary = PostGameSummary;
}

console.log("Post-game summary component loaded successfully");