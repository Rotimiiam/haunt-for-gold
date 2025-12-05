// Local Multiplayer HUD Component
console.log("Local multiplayer HUD component loaded");

/**
 * LocalMultiplayerHUD - Manages the heads-up display for local multiplayer games
 */
class LocalMultiplayerHUD {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.players = [];
    this.gameSettings = null;
    this.gameTimer = null;
    this.isVisible = false;
    this.gameState = 'waiting'; // waiting, playing, paused, ended
    this.timeRemaining = 300; // 5 minutes default
    this.gameDuration = 300;
    
    this.createHUDElements();
    this.setupEventListeners();
    
    // Set global reference for pause menu callbacks
    window.hudInstance = this;
    
    console.log("Local multiplayer HUD initialized");
  }

  /**
   * Create HUD elements
   */
  createHUDElements() {
    if (!this.container) {
      console.error("HUD container not found");
      return;
    }

    this.container.innerHTML = `
      <div class="local-multiplayer-hud">
        <!-- Top Bar with Game Info -->
        <div class="hud-top-bar">
          <div class="game-timer">
            <span class="timer-label">Time:</span>
            <span class="timer-value" id="timerValue">5:00</span>
          </div>
          <div class="game-status">
            <span class="status-text" id="statusText">Waiting</span>
          </div>
          <div class="game-controls">
            <button class="pause-btn" id="pauseBtn" title="Pause Game">⏸️</button>
            <button class="settings-btn" id="settingsBtn" title="Settings">⚙️</button>
            <button class="quit-btn" id="quitBtn" title="Quit Game">❌</button>
          </div>
        </div>

        <!-- Multi-Player Scoreboard -->
        <div class="multiplayer-scoreboard">
          <div class="scoreboard-header">
            <h3>Players</h3>
            <div class="scoreboard-toggle" id="scoreboardToggle">📊</div>
          </div>
          <div class="player-scores" id="playerScores">
            <!-- Player scores will be dynamically added here -->
          </div>
        </div>

        <!-- Control Reminders -->
        <div class="control-reminders" id="controlReminders">
          <!-- Control reminders will be dynamically added here -->
        </div>

        <!-- Game Messages -->
        <div class="game-messages" id="gameMessages">
          <div class="message-container" id="messageContainer">
            <!-- Game messages will appear here -->
          </div>
        </div>

        <!-- Mini Statistics Panel -->
        <div class="mini-stats-panel" id="miniStatsPanel">
          <div class="stats-header">
            <span>Quick Stats</span>
            <button class="stats-toggle" id="statsToggle">📈</button>
          </div>
          <div class="stats-content" id="statsContent">
            <!-- Mini statistics will be shown here -->
          </div>
        </div>

        <!-- Pause Menu -->
        <div class="pause-menu-overlay" id="pauseMenuOverlay" style="display: none;">
          <div class="pause-menu">
            <div class="pause-menu-header">
              <h2>Game Paused</h2>
              <button class="close-pause-btn" id="closePauseBtn">✕</button>
            </div>
            
            <div class="pause-menu-content">
              <!-- Game Status -->
              <div class="pause-section">
                <h3>Game Status</h3>
                <div class="status-info">
                  <div class="status-item">
                    <span>Time Remaining:</span>
                    <span id="pauseTimeRemaining">--:--</span>
                  </div>
                  <div class="status-item">
                    <span>Players:</span>
                    <span id="pausePlayerCount">0</span>
                  </div>
                  <div class="status-item">
                    <span>Leader:</span>
                    <span id="pauseLeader">None</span>
                  </div>
                </div>
              </div>

              <!-- Quick Settings -->
              <div class="pause-section">
                <h3>Quick Settings</h3>
                <div class="quick-settings">
                  <label class="setting-item">
                    <input type="checkbox" id="pauseSoundEnabled" checked>
                    <span>Sound Effects</span>
                  </label>
                  <label class="setting-item">
                    <input type="checkbox" id="pauseShowControls" checked>
                    <span>Show Control Reminders</span>
                  </label>
                  <label class="setting-item">
                    <input type="checkbox" id="pauseShowStats" checked>
                    <span>Show Statistics Panel</span>
                  </label>
                </div>
              </div>

              <!-- Player Management -->
              <div class="pause-section">
                <h3>Player Management</h3>
                <div class="player-management" id="pausePlayerManagement">
                  <!-- Player management options will be added here -->
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="pause-actions">
                <button class="pause-action-btn resume-btn" id="resumeGameBtn">
                  ▶️ Resume Game
                </button>
                <button class="pause-action-btn restart-btn" id="restartGameBtn">
                  🔄 Restart Game
                </button>
                <button class="pause-action-btn settings-btn" id="fullSettingsBtn">
                  ⚙️ Full Settings
                </button>
                <button class="pause-action-btn quit-btn" id="quitGameBtn">
                  🚪 Quit to Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Get references to key elements
    this.timerValue = document.getElementById('timerValue');
    this.statusText = document.getElementById('statusText');
    this.pauseBtn = document.getElementById('pauseBtn');
    this.settingsBtn = document.getElementById('settingsBtn');
    this.quitBtn = document.getElementById('quitBtn');
    this.playerScores = document.getElementById('playerScores');
    this.controlReminders = document.getElementById('controlReminders');
    this.gameMessages = document.getElementById('gameMessages');
    this.messageContainer = document.getElementById('messageContainer');
    this.miniStatsPanel = document.getElementById('miniStatsPanel');
    this.statsContent = document.getElementById('statsContent');
    this.scoreboardToggle = document.getElementById('scoreboardToggle');
    this.statsToggle = document.getElementById('statsToggle');
    
    // Pause menu elements
    this.pauseMenuOverlay = document.getElementById('pauseMenuOverlay');
    this.closePauseBtn = document.getElementById('closePauseBtn');
    this.resumeGameBtn = document.getElementById('resumeGameBtn');
    this.restartGameBtn = document.getElementById('restartGameBtn');
    this.fullSettingsBtn = document.getElementById('fullSettingsBtn');
    this.quitGameBtn = document.getElementById('quitGameBtn');
    this.pauseTimeRemaining = document.getElementById('pauseTimeRemaining');
    this.pausePlayerCount = document.getElementById('pausePlayerCount');
    this.pauseLeader = document.getElementById('pauseLeader');
    this.pausePlayerManagement = document.getElementById('pausePlayerManagement');
    this.pauseSoundEnabled = document.getElementById('pauseSoundEnabled');
    this.pauseShowControls = document.getElementById('pauseShowControls');
    this.pauseShowStats = document.getElementById('pauseShowStats');
    
    // Add CSS styles
    this.addStyles();
  }

  /**
   * Add CSS styles for the HUD
   */
  addStyles() {
    const styleId = 'local-multiplayer-hud-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .local-multiplayer-hud {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        font-family: 'Courier New', monospace;
        color: white;
        pointer-events: none;
      }

      .local-multiplayer-hud * {
        pointer-events: auto;
      }

      .hud-top-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(0, 0, 0, 0.8);
        padding: 10px 20px;
        border-bottom: 2px solid #333;
      }

      .game-timer {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 18px;
        font-weight: bold;
      }

      .timer-label {
        color: #ccc;
      }

      .timer-value {
        color: #00ff41;
        font-size: 20px;
        text-shadow: 0 0 5px #00ff41;
      }

      .timer-value.warning {
        color: #ffaa00;
        text-shadow: 0 0 5px #ffaa00;
      }

      .timer-value.critical {
        color: #ff4444;
        text-shadow: 0 0 5px #ff4444;
        animation: pulse 1s infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      .game-status {
        font-size: 16px;
        font-weight: bold;
      }

      .status-text {
        padding: 5px 15px;
        border-radius: 15px;
        background: rgba(255, 255, 255, 0.1);
      }

      .status-text.playing {
        background: rgba(0, 255, 65, 0.2);
        color: #00ff41;
      }

      .status-text.paused {
        background: rgba(255, 170, 0, 0.2);
        color: #ffaa00;
      }

      .status-text.ended {
        background: rgba(255, 68, 68, 0.2);
        color: #ff4444;
      }

      .game-controls {
        display: flex;
        gap: 10px;
      }

      .game-controls button {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid #333;
        color: white;
        padding: 8px 12px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
        transition: all 0.3s ease;
      }

      .game-controls button:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: #00ff41;
      }

      .multiplayer-scoreboard {
        position: absolute;
        top: 70px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 10px;
        padding: 15px;
        min-width: 250px;
        max-width: 350px;
        border: 1px solid #333;
      }

      .scoreboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
        border-bottom: 1px solid #333;
        padding-bottom: 10px;
      }

      .scoreboard-header h3 {
        margin: 0;
        color: #00ff41;
        font-size: 16px;
      }

      .scoreboard-toggle {
        cursor: pointer;
        font-size: 18px;
        padding: 5px;
        border-radius: 3px;
        transition: background 0.3s ease;
      }

      .scoreboard-toggle:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .player-score-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .player-score-item:last-child {
        border-bottom: none;
      }

      .player-info {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .player-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;
      }

      .player-name {
        font-weight: bold;
        font-size: 14px;
      }

      .player-score {
        font-weight: bold;
        font-size: 16px;
        color: #00ff41;
      }

      .player-stats {
        font-size: 11px;
        color: #ccc;
        margin-top: 2px;
      }

      .control-reminders {
        position: absolute;
        bottom: 20px;
        left: 20px;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 10px;
        padding: 15px;
        max-width: 300px;
        border: 1px solid #333;
      }

      .control-reminder-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 5px 0;
        font-size: 12px;
      }

      .control-key {
        background: rgba(255, 255, 255, 0.2);
        padding: 2px 8px;
        border-radius: 3px;
        font-weight: bold;
        font-size: 11px;
      }

      .game-messages {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        pointer-events: none;
      }

      .message-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }

      .game-message {
        background: rgba(0, 0, 0, 0.9);
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-size: 18px;
        font-weight: bold;
        text-align: center;
        border: 2px solid #00ff41;
        animation: messageSlide 0.5s ease-out;
        max-width: 400px;
      }

      .game-message.warning {
        border-color: #ffaa00;
        color: #ffaa00;
      }

      .game-message.error {
        border-color: #ff4444;
        color: #ff4444;
      }

      .game-message.success {
        border-color: #00ff41;
        color: #00ff41;
      }

      @keyframes messageSlide {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .mini-stats-panel {
        position: absolute;
        top: 70px;
        left: 20px;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 10px;
        padding: 15px;
        min-width: 200px;
        max-width: 300px;
        border: 1px solid #333;
      }

      .stats-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
        border-bottom: 1px solid #333;
        padding-bottom: 8px;
        font-size: 14px;
        font-weight: bold;
        color: #00ff41;
      }

      .stats-toggle {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 16px;
        padding: 2px;
        border-radius: 3px;
        transition: background 0.3s ease;
      }

      .stats-toggle:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .stats-content {
        font-size: 12px;
      }

      .stat-item {
        display: flex;
        justify-content: space-between;
        padding: 3px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .stat-item:last-child {
        border-bottom: none;
      }

      .stat-label {
        color: #ccc;
      }

      .stat-value {
        color: white;
        font-weight: bold;
      }

      .hidden {
        display: none;
      }

      .collapsed .player-scores,
      .collapsed .stats-content {
        display: none;
      }

      /* Pause Menu Styles */
      .pause-menu-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        z-index: 2000;
        display: flex;
        justify-content: center;
        align-items: center;
        backdrop-filter: blur(5px);
      }

      .pause-menu {
        background: rgba(20, 20, 20, 0.95);
        border: 2px solid #00ff41;
        border-radius: 15px;
        padding: 30px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 0 30px rgba(0, 255, 65, 0.3);
      }

      .pause-menu-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 25px;
        border-bottom: 2px solid #333;
        padding-bottom: 15px;
      }

      .pause-menu-header h2 {
        margin: 0;
        color: #00ff41;
        font-size: 24px;
        text-shadow: 0 0 10px #00ff41;
      }

      .close-pause-btn {
        background: rgba(255, 68, 68, 0.2);
        border: 1px solid #ff4444;
        color: #ff4444;
        width: 35px;
        height: 35px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
      }

      .close-pause-btn:hover {
        background: rgba(255, 68, 68, 0.4);
        transform: scale(1.1);
      }

      .pause-section {
        margin-bottom: 25px;
      }

      .pause-section h3 {
        color: #00ff41;
        font-size: 18px;
        margin: 0 0 15px 0;
        border-left: 3px solid #00ff41;
        padding-left: 10px;
      }

      .status-info {
        display: grid;
        gap: 10px;
      }

      .status-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 5px;
        border-left: 3px solid #333;
      }

      .status-item span:first-child {
        color: #ccc;
        font-weight: bold;
      }

      .status-item span:last-child {
        color: white;
        font-weight: bold;
      }

      .quick-settings {
        display: grid;
        gap: 12px;
      }

      .setting-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 5px;
        cursor: pointer;
        transition: background 0.3s ease;
      }

      .setting-item:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .setting-item input[type="checkbox"] {
        width: 18px;
        height: 18px;
        accent-color: #00ff41;
      }

      .setting-item span {
        color: white;
        font-size: 14px;
      }

      .player-management {
        display: grid;
        gap: 10px;
      }

      .player-management-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 5px;
        border-left: 3px solid;
      }

      .player-info-pause {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .player-indicator-pause {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        border: 2px solid white;
      }

      .player-actions-pause {
        display: flex;
        gap: 5px;
      }

      .player-action-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid #333;
        color: white;
        padding: 4px 8px;
        border-radius: 3px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.3s ease;
      }

      .player-action-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: #00ff41;
      }

      .pause-actions {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 15px;
        margin-top: 25px;
        padding-top: 20px;
        border-top: 2px solid #333;
      }

      .pause-action-btn {
        background: rgba(255, 255, 255, 0.1);
        border: 2px solid #333;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 14px;
        font-weight: bold;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .pause-action-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
      }

      .pause-action-btn.resume-btn {
        border-color: #00ff41;
        color: #00ff41;
      }

      .pause-action-btn.resume-btn:hover {
        background: rgba(0, 255, 65, 0.2);
        box-shadow: 0 0 15px rgba(0, 255, 65, 0.3);
      }

      .pause-action-btn.restart-btn {
        border-color: #ffaa00;
        color: #ffaa00;
      }

      .pause-action-btn.restart-btn:hover {
        background: rgba(255, 170, 0, 0.2);
        box-shadow: 0 0 15px rgba(255, 170, 0, 0.3);
      }

      .pause-action-btn.settings-btn {
        border-color: #4444ff;
        color: #4444ff;
      }

      .pause-action-btn.settings-btn:hover {
        background: rgba(68, 68, 255, 0.2);
        box-shadow: 0 0 15px rgba(68, 68, 255, 0.3);
      }

      .pause-action-btn.quit-btn {
        border-color: #ff4444;
        color: #ff4444;
      }

      .pause-action-btn.quit-btn:hover {
        background: rgba(255, 68, 68, 0.2);
        box-shadow: 0 0 15px rgba(255, 68, 68, 0.3);
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .hud-top-bar {
          padding: 8px 15px;
          font-size: 14px;
        }

        .multiplayer-scoreboard,
        .mini-stats-panel {
          position: relative;
          top: auto;
          left: auto;
          right: auto;
          margin: 10px;
          width: calc(100% - 20px);
          max-width: none;
        }

        .control-reminders {
          position: relative;
          bottom: auto;
          left: auto;
          margin: 10px;
          width: calc(100% - 20px);
          max-width: none;
        }

        .game-message {
          font-size: 16px;
          padding: 12px 20px;
          max-width: 300px;
        }

        .pause-menu {
          padding: 20px;
          width: 95%;
          max-height: 90vh;
        }

        .pause-actions {
          grid-template-columns: 1fr;
        }

        .pause-action-btn {
          padding: 15px;
          font-size: 16px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Pause button
    if (this.pauseBtn) {
      this.pauseBtn.addEventListener('click', () => {
        this.togglePause();
      });
    }

    // Settings button
    if (this.settingsBtn) {
      this.settingsBtn.addEventListener('click', () => {
        this.showSettings();
      });
    }

    // Quit button
    if (this.quitBtn) {
      this.quitBtn.addEventListener('click', () => {
        this.quitGame();
      });
    }

    // Scoreboard toggle
    if (this.scoreboardToggle) {
      this.scoreboardToggle.addEventListener('click', () => {
        this.toggleScoreboard();
      });
    }

    // Stats toggle
    if (this.statsToggle) {
      this.statsToggle.addEventListener('click', () => {
        this.toggleStats();
      });
    }

    // Pause menu event listeners
    if (this.closePauseBtn) {
      this.closePauseBtn.addEventListener('click', () => {
        this.hidePauseMenu();
        if (this.gameState === 'paused') {
          this.togglePause();
        }
      });
    }

    if (this.resumeGameBtn) {
      this.resumeGameBtn.addEventListener('click', () => {
        this.hidePauseMenu();
        if (this.gameState === 'paused') {
          this.togglePause();
        }
      });
    }

    if (this.restartGameBtn) {
      this.restartGameBtn.addEventListener('click', () => {
        this.restartGame();
      });
    }

    if (this.fullSettingsBtn) {
      this.fullSettingsBtn.addEventListener('click', () => {
        this.showFullSettings();
      });
    }

    if (this.quitGameBtn) {
      this.quitGameBtn.addEventListener('click', () => {
        this.quitGame();
      });
    }

    // Quick settings event listeners
    if (this.pauseShowControls) {
      this.pauseShowControls.addEventListener('change', (e) => {
        this.toggleControlReminders(e.target.checked);
      });
    }

    if (this.pauseShowStats) {
      this.pauseShowStats.addEventListener('change', (e) => {
        this.toggleStatsPanel(e.target.checked);
      });
    }

    if (this.pauseSoundEnabled) {
      this.pauseSoundEnabled.addEventListener('change', (e) => {
        this.toggleSoundEffects(e.target.checked);
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (this.pauseMenuOverlay && this.pauseMenuOverlay.style.display !== 'none') {
          this.hidePauseMenu();
          if (this.gameState === 'paused') {
            this.togglePause();
          }
        } else {
          this.togglePause();
        }
      } else if (event.key === 'Tab') {
        event.preventDefault();
        this.toggleScoreboard();
      } else if (event.key === 'F1') {
        event.preventDefault();
        this.toggleControlReminders(!this.controlReminders.classList.contains('hidden'));
      }
    });
  }

  /**
   * Initialize HUD with game settings
   */
  initialize(gameSettings, players) {
    this.gameSettings = gameSettings;
    this.players = players || [];
    this.gameDuration = gameSettings?.gameDuration || 300;
    this.timeRemaining = this.gameDuration;
    
    this.updatePlayerScores();
    this.updateControlReminders();
    this.updateMiniStats();
    this.show();
    
    console.log("HUD initialized with", this.players.length, "players");
  }

  /**
   * Update player scores display
   */
  updatePlayerScores() {
    if (!this.playerScores) return;

    // Sort players by score
    const sortedPlayers = [...this.players].sort((a, b) => (b.score || 0) - (a.score || 0));

    this.playerScores.innerHTML = sortedPlayers.map((player, index) => `
      <div class="player-score-item">
        <div class="player-info">
          <div class="player-indicator" style="background-color: ${player.color || '#00ff41'}"></div>
          <div>
            <div class="player-name">${player.name || `Player ${index + 1}`}</div>
            <div class="player-stats">
              Coins: ${player.stats?.coinsCollected || 0} | 
              Moves: ${player.stats?.movesCount || 0}
            </div>
          </div>
        </div>
        <div class="player-score">${player.score || 0}</div>
      </div>
    `).join('');
  }

  /**
   * Update control reminders
   */
  updateControlReminders() {
    if (!this.controlReminders) return;

    const controls = [];
    
    this.players.forEach((player, index) => {
      if (player.controlScheme) {
        const scheme = player.controlScheme;
        controls.push(`
          <div style="margin-bottom: 10px;">
            <div style="font-weight: bold; color: ${player.color || '#00ff41'}; margin-bottom: 5px;">
              ${player.name || `Player ${index + 1}`}
            </div>
            <div class="control-reminder-item">
              <span>Move Up:</span>
              <span class="control-key">${this.getKeyName(scheme.up)}</span>
            </div>
            <div class="control-reminder-item">
              <span>Move Down:</span>
              <span class="control-key">${this.getKeyName(scheme.down)}</span>
            </div>
            <div class="control-reminder-item">
              <span>Move Left:</span>
              <span class="control-key">${this.getKeyName(scheme.left)}</span>
            </div>
            <div class="control-reminder-item">
              <span>Move Right:</span>
              <span class="control-key">${this.getKeyName(scheme.right)}</span>
            </div>
          </div>
        `);
      }
    });

    this.controlReminders.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 10px; color: #00ff41;">Controls</div>
      ${controls.join('')}
      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #333; font-size: 11px; color: #ccc;">
        <div class="control-reminder-item">
          <span>Pause:</span>
          <span class="control-key">ESC</span>
        </div>
        <div class="control-reminder-item">
          <span>Toggle Scoreboard:</span>
          <span class="control-key">TAB</span>
        </div>
      </div>
    `;
  }

  /**
   * Get human-readable key name
   */
  getKeyName(keyCode) {
    const keyMap = {
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→',
      'KeyW': 'W',
      'KeyA': 'A',
      'KeyS': 'S',
      'KeyD': 'D',
      'KeyI': 'I',
      'KeyJ': 'J',
      'KeyK': 'K',
      'KeyL': 'L'
    };
    
    return keyMap[keyCode] || keyCode;
  }

  /**
   * Update mini statistics panel
   */
  updateMiniStats() {
    if (!this.statsContent) return;

    const totalCoins = this.players.reduce((sum, p) => sum + (p.stats?.coinsCollected || 0), 0);
    const totalMoves = this.players.reduce((sum, p) => sum + (p.stats?.movesCount || 0), 0);
    const totalDamage = this.players.reduce((sum, p) => sum + (p.stats?.totalDamageReceived || 0), 0);
    const avgScore = this.players.length > 0 ? 
      Math.round(this.players.reduce((sum, p) => sum + (p.score || 0), 0) / this.players.length) : 0;

    this.statsContent.innerHTML = `
      <div class="stat-item">
        <span class="stat-label">Total Coins:</span>
        <span class="stat-value">${totalCoins}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Total Moves:</span>
        <span class="stat-value">${totalMoves}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Total Damage:</span>
        <span class="stat-value">${totalDamage}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Avg Score:</span>
        <span class="stat-value">${avgScore}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Game Time:</span>
        <span class="stat-value">${this.formatTime(this.gameDuration - this.timeRemaining)}</span>
      </div>
    `;
  }

  /**
   * Update game timer
   */
  updateTimer(timeRemaining) {
    this.timeRemaining = timeRemaining;
    
    if (this.timerValue) {
      this.timerValue.textContent = this.formatTime(timeRemaining);
      
      // Add warning classes based on time remaining
      this.timerValue.classList.remove('warning', 'critical');
      if (timeRemaining <= 10) {
        this.timerValue.classList.add('critical');
      } else if (timeRemaining <= 60) {
        this.timerValue.classList.add('warning');
      }
    }
    
    this.updateMiniStats();
  }

  /**
   * Update game status
   */
  updateStatus(status) {
    this.gameState = status;
    
    if (this.statusText) {
      this.statusText.textContent = status.charAt(0).toUpperCase() + status.slice(1);
      this.statusText.className = `status-text ${status}`;
    }
    
    // Update pause button
    if (this.pauseBtn) {
      this.pauseBtn.textContent = status === 'paused' ? '▶️' : '⏸️';
      this.pauseBtn.title = status === 'paused' ? 'Resume Game' : 'Pause Game';
    }
  }

  /**
   * Show game message
   */
  showMessage(message, type = 'info', duration = 3000) {
    if (!this.messageContainer) return;

    const messageElement = document.createElement('div');
    messageElement.className = `game-message ${type}`;
    messageElement.textContent = message;
    
    this.messageContainer.appendChild(messageElement);
    
    // Auto-remove message after duration
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.parentNode.removeChild(messageElement);
      }
    }, duration);
  }

  /**
   * Toggle pause state
   */
  togglePause() {
    const newState = this.gameState === 'paused' ? 'playing' : 'paused';
    this.updateStatus(newState);
    
    if (newState === 'paused') {
      this.showPauseMenu();
    } else {
      this.hidePauseMenu();
    }
    
    // Emit pause event
    this.emit('pauseToggled', { paused: newState === 'paused' });
  }

  /**
   * Show settings
   */
  showSettings() {
    this.showPauseMenu();
  }

  /**
   * Quit game
   */
  quitGame() {
    if (confirm('Are you sure you want to quit the game?')) {
      this.emit('gameQuit');
    }
  }

  /**
   * Toggle scoreboard visibility
   */
  toggleScoreboard() {
    const scoreboard = this.container.querySelector('.multiplayer-scoreboard');
    if (scoreboard) {
      scoreboard.classList.toggle('collapsed');
    }
  }

  /**
   * Toggle stats panel visibility
   */
  toggleStats() {
    const statsPanel = this.container.querySelector('.mini-stats-panel');
    if (statsPanel) {
      statsPanel.classList.toggle('collapsed');
    }
  }

  /**
   * Format time in MM:SS format
   */
  formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Update players data
   */
  updatePlayers(players) {
    this.players = players || [];
    this.updatePlayerScores();
    this.updateMiniStats();
  }

  /**
   * Show HUD
   */
  show() {
    if (this.container) {
      this.container.style.display = 'block';
      this.isVisible = true;
    }
  }

  /**
   * Hide HUD
   */
  hide() {
    if (this.container) {
      this.container.style.display = 'none';
      this.isVisible = false;
    }
  }

  /**
   * Event system - emit events
   */
  emit(eventType, data = null) {
    const event = new CustomEvent(`localMultiplayerHUD:${eventType}`, {
      detail: data
    });
    document.dispatchEvent(event);
  }

  /**
   * Show pause menu with local multiplayer options
   */
  showPauseMenu() {
    if (!this.pauseMenuOverlay) return;
    
    // Update pause menu content
    this.updatePauseMenuContent();
    
    // Show the overlay
    this.pauseMenuOverlay.style.display = 'flex';
    
    // Focus on the resume button for keyboard navigation
    if (this.resumeGameBtn) {
      setTimeout(() => this.resumeGameBtn.focus(), 100);
    }
    
    this.emit('pauseMenuShown');
  }

  /**
   * Hide pause menu
   */
  hidePauseMenu() {
    if (!this.pauseMenuOverlay) return;
    
    this.pauseMenuOverlay.style.display = 'none';
    this.emit('pauseMenuHidden');
  }

  /**
   * Update pause menu content with current game state
   */
  updatePauseMenuContent() {
    // Update time remaining
    if (this.pauseTimeRemaining) {
      this.pauseTimeRemaining.textContent = this.formatTime(this.timeRemaining);
    }
    
    // Update player count
    if (this.pausePlayerCount) {
      this.pausePlayerCount.textContent = this.players.length.toString();
    }
    
    // Update leader
    if (this.pauseLeader && this.players.length > 0) {
      const sortedPlayers = [...this.players].sort((a, b) => (b.score || 0) - (a.score || 0));
      const leader = sortedPlayers[0];
      this.pauseLeader.textContent = leader ? (leader.name || 'Unknown') : 'None';
    }
    
    // Update player management section
    this.updatePausePlayerManagement();
    
    // Update quick settings checkboxes
    if (this.pauseShowControls) {
      this.pauseShowControls.checked = !this.controlReminders.classList.contains('hidden');
    }
    
    if (this.pauseShowStats) {
      this.pauseShowStats.checked = !this.miniStatsPanel.classList.contains('hidden');
    }
  }

  /**
   * Update player management section in pause menu
   */
  updatePausePlayerManagement() {
    if (!this.pausePlayerManagement) return;
    
    this.pausePlayerManagement.innerHTML = this.players.map((player, index) => `
      <div class="player-management-item" style="border-left-color: ${player.color || '#00ff41'}">
        <div class="player-info-pause">
          <div class="player-indicator-pause" style="background-color: ${player.color || '#00ff41'}"></div>
          <div>
            <div style="font-weight: bold; color: white;">${player.name || `Player ${index + 1}`}</div>
            <div style="font-size: 12px; color: #ccc;">
              Score: ${player.score || 0} | 
              Coins: ${player.stats?.coinsCollected || 0}
            </div>
          </div>
        </div>
        <div class="player-actions-pause">
          <button class="player-action-btn" onclick="window.hudInstance?.showPlayerControls('${player.id || index}')">
            Controls
          </button>
          <button class="player-action-btn" onclick="window.hudInstance?.showPlayerStats('${player.id || index}')">
            Stats
          </button>
        </div>
      </div>
    `).join('');
  }

  /**
   * Show player controls in a popup
   */
  showPlayerControls(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player || !player.controlScheme) return;
    
    const scheme = player.controlScheme;
    const controlsInfo = `
      ${player.name || 'Player'} Controls:
      
      Move Up: ${this.getKeyName(scheme.up)}
      Move Down: ${this.getKeyName(scheme.down)}
      Move Left: ${this.getKeyName(scheme.left)}
      Move Right: ${this.getKeyName(scheme.right)}
      Action: ${this.getKeyName(scheme.action || 'N/A')}
      
      Type: ${scheme.type || 'keyboard'}
      ${scheme.description ? `Description: ${scheme.description}` : ''}
    `;
    
    this.showMessage(controlsInfo, 'info', 5000);
  }

  /**
   * Show player statistics in a popup
   */
  showPlayerStats(playerId) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return;
    
    const stats = player.stats || {};
    const statsInfo = `
      ${player.name || 'Player'} Statistics:
      
      Score: ${player.score || 0}
      Coins Collected: ${stats.coinsCollected || 0}
      Enemies Hit: ${stats.enemiesHit || 0}
      Bombs Hit: ${stats.bombsHit || 0}
      Moves: ${stats.movesCount || 0}
      Game Time: ${this.formatTime(stats.gameTime || 0)}
    `;
    
    this.showMessage(statsInfo, 'info', 5000);
  }

  /**
   * Restart the game
   */
  restartGame() {
    if (confirm('Are you sure you want to restart the game? All progress will be lost.')) {
      this.hidePauseMenu();
      this.emit('gameRestart');
    }
  }

  /**
   * Show full settings
   */
  showFullSettings() {
    this.showMessage('Full settings panel would open here', 'info');
    this.emit('fullSettingsRequested');
  }

  /**
   * Toggle control reminders visibility
   */
  toggleControlReminders(show) {
    if (!this.controlReminders) return;
    
    if (show) {
      this.controlReminders.classList.remove('hidden');
    } else {
      this.controlReminders.classList.add('hidden');
    }
    
    this.emit('controlRemindersToggled', { visible: show });
  }

  /**
   * Toggle statistics panel visibility
   */
  toggleStatsPanel(show) {
    if (!this.miniStatsPanel) return;
    
    if (show) {
      this.miniStatsPanel.classList.remove('hidden');
    } else {
      this.miniStatsPanel.classList.add('hidden');
    }
    
    this.emit('statsPanelToggled', { visible: show });
  }

  /**
   * Toggle sound effects
   */
  toggleSoundEffects(enabled) {
    this.emit('soundEffectsToggled', { enabled: enabled });
  }

  /**
   * Enhanced control reminders with better formatting
   */
  updateControlReminders() {
    if (!this.controlReminders) return;

    const controls = [];
    
    this.players.forEach((player, index) => {
      if (player.controlScheme) {
        const scheme = player.controlScheme;
        const playerColor = player.color || '#00ff41';
        
        controls.push(`
          <div style="margin-bottom: 15px; padding: 10px; border-left: 3px solid ${playerColor}; background: rgba(255,255,255,0.02);">
            <div style="font-weight: bold; color: ${playerColor}; margin-bottom: 8px; font-size: 14px;">
              ${player.name || `Player ${index + 1}`}
              ${scheme.type === 'gamepad' ? '🎮' : '⌨️'}
            </div>
            <div class="control-reminder-item">
              <span>Move:</span>
              <span class="control-key">${this.getKeyName(scheme.up)}</span>
              <span class="control-key">${this.getKeyName(scheme.down)}</span>
              <span class="control-key">${this.getKeyName(scheme.left)}</span>
              <span class="control-key">${this.getKeyName(scheme.right)}</span>
            </div>
            ${scheme.action ? `
              <div class="control-reminder-item">
                <span>Action:</span>
                <span class="control-key">${this.getKeyName(scheme.action)}</span>
              </div>
            ` : ''}
          </div>
        `);
      }
    });

    this.controlReminders.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 15px; color: #00ff41; font-size: 16px; border-bottom: 1px solid #333; padding-bottom: 8px;">
        🎮 Player Controls
      </div>
      ${controls.join('')}
      <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #333; font-size: 11px; color: #ccc;">
        <div class="control-reminder-item">
          <span>Pause Game:</span>
          <span class="control-key">ESC</span>
        </div>
        <div class="control-reminder-item">
          <span>Toggle Scoreboard:</span>
          <span class="control-key">TAB</span>
        </div>
        <div class="control-reminder-item">
          <span>Toggle Controls:</span>
          <span class="control-key">F1</span>
        </div>
      </div>
    `;
  }

  /**
   * Enhanced key name mapping with gamepad support
   */
  getKeyName(keyCode) {
    const keyMap = {
      // Keyboard keys
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→',
      'KeyW': 'W',
      'KeyA': 'A',
      'KeyS': 'S',
      'KeyD': 'D',
      'KeyI': 'I',
      'KeyJ': 'J',
      'KeyK': 'K',
      'KeyL': 'L',
      'KeyU': 'U',
      'Space': 'SPACE',
      'Enter': 'ENTER',
      'Escape': 'ESC',
      'Tab': 'TAB',
      
      // Gamepad buttons
      'button0': 'A',
      'button1': 'B',
      'button2': 'X',
      'button3': 'Y',
      'button12': 'D↑',
      'button13': 'D↓',
      'button14': 'D←',
      'button15': 'D→',
      'axis0+': 'L→',
      'axis0-': 'L←',
      'axis1+': 'L↓',
      'axis1-': 'L↑',
      
      // Numpad
      'Numpad8': 'N8',
      'Numpad5': 'N5',
      'Numpad4': 'N4',
      'Numpad6': 'N6',
      'Numpad0': 'N0'
    };
    
    return keyMap[keyCode] || keyCode;
  }

  /**
   * Cleanup resources
   */
  destroy() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
    
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    this.players = [];
    this.isVisible = false;
    
    console.log("Local multiplayer HUD destroyed");
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.LocalMultiplayerHUD = LocalMultiplayerHUD;
} else if (typeof global !== 'undefined') {
  global.LocalMultiplayerHUD = LocalMultiplayerHUD;
}

console.log("Local multiplayer HUD component loaded successfully");