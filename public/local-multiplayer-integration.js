// Local Multiplayer Integration with existing game
console.log("Local multiplayer integration script loaded");

/**
 * Integration layer between local multiplayer models and existing game
 */
class LocalMultiplayerIntegration {
  constructor() {
    this.players = new Map();
    this.gameSettings = null;
    this.gameActive = false;
    this.inputHandlers = new Map();
    this.controllerManager = null;
    this.gamepadInputInterval = null;
    this.collisionResolver = null;
  }

  /**
   * Initialize local multiplayer game
   */
  initializeGame(playerNames, customSettings = {}, controllerAssignments = null) {
    console.log("Initializing local multiplayer game with players:", playerNames);

    // Initialize collision resolver
    const CollisionResolverClass = window.CollisionResolver || global.CollisionResolver;
    if (CollisionResolverClass) {
      this.collisionResolver = new CollisionResolverClass();
    } else {
      console.warn("CollisionResolver not available, collision detection will be limited");
    }

    // Initialize controller manager if not already done
    if (!this.controllerManager) {
      const ControllerManagerClass = window.ControllerManager || global.ControllerManager;
      if (ControllerManagerClass) {
        this.controllerManager = new ControllerManagerClass();
        this.controllerManager.startMonitoring();
      }
    }

    // Create game settings
    this.gameSettings = new LocalGameSettings({
      playerCount: playerNames.length,
      ...customSettings
    });

    // Create players
    this.players.clear();
    playerNames.forEach((name, index) => {
      const playerId = `local_player_${index + 1}`;
      let controllerIndex = null;

      // Check if we have controller assignments
      if (controllerAssignments && controllerAssignments[index] !== undefined) {
        controllerIndex = controllerAssignments[index];
        // Assign controller to player in controller manager
        this.controllerManager.assignControllerToPlayer(controllerIndex, playerId);
      }

      const player = createLocalPlayer(playerId, name, index, controllerIndex);
      this.players.set(playerId, player);

      // Set starting positions to avoid overlap
      const startPositions = [
        { x: 2, y: 2 },
        { x: this.gameSettings.mapDimensions.width - 3, y: 2 },
        { x: 2, y: this.gameSettings.mapDimensions.height - 3 },
        { x: this.gameSettings.mapDimensions.width - 3, y: this.gameSettings.mapDimensions.height - 3 }
      ];

      if (startPositions[index]) {
        player.position = startPositions[index];
      }
    });

    // Setup input handlers
    this.setupInputHandlers();

    console.log("Local multiplayer game initialized with", this.players.size, "players");
    return this.getGameConfig();
  }

  /**
   * Setup input handlers for all players
   */
  setupInputHandlers() {
    // Clear existing handlers
    this.inputHandlers.clear();

    // Clear existing gamepad input interval
    if (this.gamepadInputInterval) {
      clearInterval(this.gamepadInputInterval);
    }

    // Add keyboard event listener for keyboard players
    document.addEventListener('keydown', (event) => {
      if (!this.gameActive) return;

      // Find which player this key belongs to (only keyboard players)
      for (const [playerId, player] of this.players) {
        const controls = player.controlScheme;
        if (controls.type !== 'keyboard') continue;

        let direction = null;

        switch (event.code) {
          case controls.up:
            direction = 'up';
            break;
          case controls.down:
            direction = 'down';
            break;
          case controls.left:
            direction = 'left';
            break;
          case controls.right:
            direction = 'right';
            break;
        }

        if (direction) {
          event.preventDefault();
          this.handlePlayerMove(playerId, direction);
          break; // Only one player should handle each key
        }
      }
    });

    // Setup gamepad input polling for gamepad players
    this.gamepadInputInterval = setInterval(() => {
      if (!this.gameActive || !this.controllerManager) return;

      this.handleGamepadInput();
    }, 16); // ~60 FPS polling
  }

  /**
   * Handle gamepad input for all gamepad players
   */
  handleGamepadInput() {
    for (const [playerId, player] of this.players) {
      const controls = player.controlScheme;
      if (controls.type !== 'gamepad') continue;

      const controllerIndex = this.controllerManager.getControllerForPlayer(playerId);
      if (controllerIndex === null) continue;

      // Check D-pad buttons
      let direction = null;

      if (this.controllerManager.isButtonJustPressed(controllerIndex, controls.up)) {
        direction = 'up';
      } else if (this.controllerManager.isButtonJustPressed(controllerIndex, controls.down)) {
        direction = 'down';
      } else if (this.controllerManager.isButtonJustPressed(controllerIndex, controls.left)) {
        direction = 'left';
      } else if (this.controllerManager.isButtonJustPressed(controllerIndex, controls.right)) {
        direction = 'right';
      }

      // Check analog stick if no D-pad input
      if (!direction) {
        const xAxis = this.controllerManager.getAxisValue(controllerIndex, 'axis0');
        const yAxis = this.controllerManager.getAxisValue(controllerIndex, 'axis1');
        const deadzone = controls.deadzone || 0.3;

        if (Math.abs(xAxis) > deadzone || Math.abs(yAxis) > deadzone) {
          // Determine primary direction
          if (Math.abs(xAxis) > Math.abs(yAxis)) {
            direction = xAxis > 0 ? 'right' : 'left';
          } else {
            direction = yAxis > 0 ? 'down' : 'up';
          }
        }
      }

      if (direction) {
        this.handlePlayerMove(playerId, direction);
      }
    }
  }

  /**
   * Handle player movement
   */
  handlePlayerMove(playerId, direction) {
    const player = this.players.get(playerId);
    if (!player || !player.isActive) return;

    const gameConfig = this.gameSettings.getGameConfig();

    // Check if movement is valid using collision resolver
    if (this.collisionResolver) {
      const newPos = this.calculateNewPosition(player.position, direction);
      if (!this.collisionResolver.isValidPosition(newPos.x, newPos.y, window.gameState)) {
        return; // Invalid movement, don't proceed
      }
    }

    const moved = player.move(direction, gameConfig);

    if (moved) {
      // Update global game state if it exists
      if (window.gameState && window.gameState.players) {
        window.gameState.players[playerId] = player.getRenderData();
      }

      // Process collisions after movement
      this.processCollisions();

      // Trigger render update
      if (window.gameRenderer) {
        window.gameRenderer.render(window.gameState);
      }
    }
  }

  /**
   * Calculate new position based on current position and direction
   */
  calculateNewPosition(currentPos, direction) {
    const newPos = { ...currentPos };

    switch (direction) {
      case 'up':
        newPos.y--;
        break;
      case 'down':
        newPos.y++;
        break;
      case 'left':
        newPos.x--;
        break;
      case 'right':
        newPos.x++;
        break;
    }

    return newPos;
  }

  /**
   * Process all collisions in the current game state
   */
  processCollisions() {
    if (!this.collisionResolver || !window.gameState) return;

    const result = this.collisionResolver.processAllCollisions(window.gameState);

    // Handle collision updates
    result.updates.forEach(update => {
      switch (update.type) {
        case 'coin_collected':
          this.handleCoinCollection(update);
          break;
        case 'bomb_exploded':
          this.handleBombExplosion(update);
          break;
      }
    });

    // Handle enemy and bomb collisions
    result.collisions.forEach(collision => {
      switch (collision.type) {
        case 'enemy':
          this.handleEnemyCollision(collision);
          break;
        case 'bomb':
          this.handleBombCollision(collision);
          break;
        case 'overlap':
          // Player overlap is allowed in local multiplayer
          break;
      }
    });
  }

  /**
   * Handle coin collection
   */
  handleCoinCollection(update) {
    const player = this.players.get(update.playerId);
    if (!player) return;

    // Update player score and stats
    player.collectCoin(10); // Default coin value

    // Update global game state
    if (window.gameState && window.gameState.players) {
      window.gameState.players[update.playerId] = player.getRenderData();
    }

    // Show notification
    if (typeof showNotification === 'function') {
      const message = update.contested ?
        `${player.name} collected coin (contested!)` :
        `${player.name} collected coin!`;
      // showNotification("Coin Collected!", message);
    }

    // Check win condition
    this.checkWinCondition();
  }

  /**
   * Handle enemy collision
   */
  handleEnemyCollision(collision) {
    const player = this.players.get(collision.playerId);
    if (!player) return;

    // Apply damage
    player.hitByEnemy(collision.damage);

    // Update global game state
    if (window.gameState && window.gameState.players) {
      window.gameState.players[collision.playerId] = player.getRenderData();
    }

    // Show notification
    if (typeof showNotification === 'function') {
      showNotification("Enemy Hit!", `${player.name} lost ${collision.damage} points!`);
    }
  }

  /**
   * Handle bomb collision
   */
  handleBombCollision(collision) {
    const player = this.players.get(collision.playerId);
    if (!player) return;

    // Apply damage
    player.hitByBomb(collision.damage);

    // Update global game state
    if (window.gameState && window.gameState.players) {
      window.gameState.players[collision.playerId] = player.getRenderData();
    }

    // Show explosion effect
    if (typeof showExplosion === 'function') {
      showExplosion(collision.position.x, collision.position.y);
    }

    // Show notification
    if (typeof showNotification === 'function') {
      showNotification("Bomb Hit!", `${player.name} lost ${collision.damage} points!`);
    }
  }

  /**
   * Handle bomb explosion
   */
  handleBombExplosion(update) {
    // Show explosion effect
    if (typeof showExplosion === 'function' && window.gameState && window.gameState.bombs) {
      const bomb = window.gameState.bombs.find(b => b.id === update.bombId);
      if (bomb) {
        showExplosion(bomb.x, bomb.y);
      }
    }
  }

  /**
   * Start the local multiplayer game
   */
  startGame() {
    this.gameActive = true;

    // Update global game state
    if (window.gameState) {
      // Add local players to game state
      window.gameState.players = {};
      for (const [playerId, player] of this.players) {
        window.gameState.players[playerId] = player.getRenderData();
      }

      // Apply game settings
      const config = this.gameSettings.getGameConfig();
      window.gameState.mapWidth = config.mapWidth;
      window.gameState.mapHeight = config.mapHeight;
      window.gameState.winningScore = config.winningScore;
      window.gameState.difficultyLevel = config.difficultyLevel;
    }

    console.log("Local multiplayer game started");
  }

  /**
   * Stop the local multiplayer game
   */
  stopGame() {
    this.gameActive = false;
    console.log("Local multiplayer game stopped");
  }

  /**
   * Get current game configuration
   */
  getGameConfig() {
    if (!this.gameSettings) return null;

    return {
      ...this.gameSettings.getGameConfig(),
      players: Array.from(this.players.values()).map(p => p.getRenderData()),
      isLocalMultiplayer: true
    };
  }

  /**
   * Get player by ID
   */
  getPlayer(playerId) {
    return this.players.get(playerId);
  }

  /**
   * Get all players
   */
  getAllPlayers() {
    return Array.from(this.players.values());
  }

  /**
   * Update player score (for coin collection, etc.)
   */
  updatePlayerScore(playerId, scoreChange, reason = 'unknown') {
    const player = this.players.get(playerId);
    if (!player) return;

    switch (reason) {
      case 'coin':
        player.collectCoin(Math.abs(scoreChange));
        break;
      case 'enemy':
        player.hitByEnemy(Math.abs(scoreChange));
        break;
      case 'bomb':
        player.hitByBomb(Math.abs(scoreChange));
        break;
      default:
        player.addScore(scoreChange);
    }

    // Update global game state
    if (window.gameState && window.gameState.players) {
      window.gameState.players[playerId] = player.getRenderData();
    }

    // Check for win condition
    this.checkWinCondition();
  }

  /**
   * Check if any player has won
   */
  checkWinCondition() {
    if (!this.gameSettings) return;

    const winCondition = this.gameSettings.winCondition;
    const targetScore = this.gameSettings.targetScore;

    for (const [playerId, player] of this.players) {
      if (winCondition === 'score' && player.score >= targetScore) {
        this.handleGameWin(playerId);
        return;
      }
    }
  }

  /**
   * Handle game win
   */
  handleGameWin(winnerId) {
    this.gameActive = false;
    const winner = this.players.get(winnerId);

    if (winner && typeof showWinnerScreen === 'function') {
      showWinnerScreen({
        winnerId: winnerId,
        winnerName: winner.name,
        winnerScore: winner.score
      });
    }

    console.log(`Local multiplayer game won by ${winner ? winner.name : winnerId}`);
  }

  /**
   * Get current leaderboard
   */
  getLeaderboard() {
    const players = Array.from(this.players.values());
    return players
      .sort((a, b) => b.score - a.score)
      .map((player, index) => ({
        rank: index + 1,
        id: player.id,
        name: player.name,
        score: player.score,
        stats: player.stats
      }));
  }

  /**
   * Get controller manager instance
   */
  getControllerManager() {
    return this.controllerManager;
  }

  /**
   * Get available controllers for setup
   */
  getAvailableControllers() {
    if (!this.controllerManager) {
      const ControllerManagerClass = window.ControllerManager || global.ControllerManager;
      if (ControllerManagerClass) {
        this.controllerManager = new ControllerManagerClass();
        this.controllerManager.startMonitoring();
      }
    }
    return this.controllerManager ? this.controllerManager.getAvailableControllers() : [];
  }

  /**
   * Check if local multiplayer is available
   */
  isLocalMultiplayerAvailable() {
    if (!this.controllerManager) {
      const ControllerManagerClass = window.ControllerManager || global.ControllerManager;
      if (ControllerManagerClass) {
        this.controllerManager = new ControllerManagerClass();
        this.controllerManager.startMonitoring();
      }
    }
    return this.controllerManager ? this.controllerManager.isLocalMultiplayerAvailable() : false;
  }

  /**
   * Get maximum supported players
   */
  getMaxPlayers() {
    if (!this.controllerManager) {
      const ControllerManagerClass = window.ControllerManager || global.ControllerManager;
      if (ControllerManagerClass) {
        this.controllerManager = new ControllerManagerClass();
        this.controllerManager.startMonitoring();
      }
    }
    return this.controllerManager ? this.controllerManager.getMaxPlayers() : 0;
  }

  /**
   * Get collision resolver for advanced usage
   */
  getCollisionResolver() {
    return this.collisionResolver;
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.gameActive = false;

    if (this.gamepadInputInterval) {
      clearInterval(this.gamepadInputInterval);
      this.gamepadInputInterval = null;
    }

    if (this.controllerManager) {
      this.controllerManager.destroy();
      this.controllerManager = null;
    }

    if (this.collisionResolver) {
      this.collisionResolver.clearHistory();
      this.collisionResolver = null;
    }

    this.players.clear();
    this.inputHandlers.clear();

    console.log("LocalMultiplayerIntegration destroyed");
  }
}

// Global instance
window.localMultiplayerIntegration = null;

/**
 * Initialize local multiplayer mode
 */
window.initializeLocalMultiplayer = function (playerNames, settings = {}, controllerAssignments = null) {
  window.localMultiplayerIntegration = new LocalMultiplayerIntegration();
  return window.localMultiplayerIntegration.initializeGame(playerNames, settings, controllerAssignments);
};

/**
 * Start local multiplayer game
 */
window.startLocalMultiplayer = function () {
  if (window.localMultiplayerIntegration) {
    window.localMultiplayerIntegration.startGame();
  }
};

/**
 * Stop local multiplayer game
 */
window.stopLocalMultiplayer = function () {
  if (window.localMultiplayerIntegration) {
    window.localMultiplayerIntegration.stopGame();
  }
};

/**
 * Get available controllers
 */
window.getAvailableControllers = function () {
  if (!window.localMultiplayerIntegration) {
    window.localMultiplayerIntegration = new LocalMultiplayerIntegration();
  }
  return window.localMultiplayerIntegration.getAvailableControllers();
};

/**
 * Check if local multiplayer is available
 */
window.isLocalMultiplayerAvailable = function () {
  if (!window.localMultiplayerIntegration) {
    window.localMultiplayerIntegration = new LocalMultiplayerIntegration();
  }
  return window.localMultiplayerIntegration.isLocalMultiplayerAvailable();
};

/**
 * Get controller manager for advanced usage
 */
window.getControllerManager = function () {
  if (!window.localMultiplayerIntegration) {
    window.localMultiplayerIntegration = new LocalMultiplayerIntegration();
  }
  return window.localMultiplayerIntegration.getControllerManager();
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.LocalMultiplayerIntegration = LocalMultiplayerIntegration;
} else if (typeof global !== 'undefined') {
  global.LocalMultiplayerIntegration = LocalMultiplayerIntegration;
}

console.log("Local multiplayer integration loaded successfully");