// Local Multiplayer Data Models and Configuration
console.log("Local multiplayer models script loaded");

/**
 * LocalPlayer class - Represents a player in local multiplayer mode
 */
class LocalPlayer {
  constructor(id, name, controlScheme, visualConfig) {
    this.id = id;
    this.name = name || `Player ${id}`;
    this.controlScheme = controlScheme;
    this.visualConfig = visualConfig;
    
    // Game state
    this.position = { x: 1, y: 1 }; // Starting position in grid coordinates
    this.score = 0;
    this.isActive = true;
    this.direction = 'right';
    this.mood = 'happy';
    
    // Enhanced statistics tracking
    this.playerStats = new PlayerStatistics(id, name);
    
    // Legacy stats for backward compatibility
    this.stats = {
      coinsCollected: 0,
      enemiesHit: 0,
      bombsHit: 0,
      movesCount: 0,
      gameTime: 0
    };
    
    // Visual properties
    this.color = visualConfig.primaryColor;
    this.character = visualConfig.character;
    this.lastMoveTime = 0;
  }

  /**
   * Update player position based on direction
   */
  move(direction, gameState) {
    const now = Date.now();
    if (now - this.lastMoveTime < 150) return false; // Movement cooldown
    
    const newPos = { ...this.position };
    
    switch (direction) {
      case 'up':
        newPos.y = Math.max(1, this.position.y - 1);
        break;
      case 'down':
        newPos.y = Math.min(gameState.mapHeight - 2, this.position.y + 1);
        break;
      case 'left':
        newPos.x = Math.max(1, this.position.x - 1);
        break;
      case 'right':
        newPos.x = Math.min(gameState.mapWidth - 2, this.position.x + 1);
        break;
    }
    
    // Check if position changed
    if (newPos.x !== this.position.x || newPos.y !== this.position.y) {
      this.position = newPos;
      this.direction = direction;
      this.lastMoveTime = now;
      
      // Update both legacy and enhanced stats
      this.stats.movesCount++;
      this.playerStats.updateMovementStats(newPos, now);
      
      return true;
    }
    
    return false;
  }

  /**
   * Add score to player
   */
  addScore(points, reason = 'unknown') {
    const oldScore = this.score;
    this.score += points;
    
    if (points > 0) {
      this.mood = 'happy';
    } else if (points < 0) {
      this.mood = 'sad';
    }
    
    // Update enhanced statistics
    this.playerStats.updateScore(this.score, points, reason);
  }

  /**
   * Handle coin collection
   */
  collectCoin(coinValue = 10) {
    this.addScore(coinValue, 'coin');
    
    // Update both legacy and enhanced stats
    this.stats.coinsCollected++;
    this.playerStats.updateCollectionStats('coin', coinValue);
  }

  /**
   * Handle enemy collision
   */
  hitByEnemy(damage = 5) {
    this.addScore(-damage, 'enemy');
    
    // Update both legacy and enhanced stats
    this.stats.enemiesHit++;
    this.playerStats.updateCombatStats('enemy_hit', damage);
  }

  /**
   * Handle bomb collision
   */
  hitByBomb(damage = 20) {
    this.addScore(-damage, 'bomb');
    
    // Update both legacy and enhanced stats
    this.stats.bombsHit++;
    this.playerStats.updateCombatStats('bomb_hit', damage);
  }

  /**
   * Get player data for rendering
   */
  getRenderData() {
    return {
      id: this.id,
      name: this.name,
      x: this.position.x,
      y: this.position.y,
      score: this.score,
      color: this.color,
      character: this.character,
      direction: this.direction,
      mood: this.mood,
      isActive: this.isActive,
      stats: this.playerStats.getRealTimeDisplayData()
    };
  }

  /**
   * Get enhanced statistics summary
   */
  getStatsSummary() {
    return this.playerStats.getStatsSummary();
  }

  /**
   * Get detailed statistics for post-game summary
   */
  getDetailedStats() {
    return this.playerStats.getDetailedStats();
  }

  /**
   * Update time-based statistics
   */
  updateTimeStats(gameTime, isActive, isInLead) {
    this.stats.gameTime = gameTime;
    this.playerStats.updateTimeStats(gameTime, isActive, isInLead);
  }

  /**
   * Get real-time display data for HUD
   */
  getRealTimeDisplayData() {
    return this.playerStats.getRealTimeDisplayData();
  }

  /**
   * Validate player data
   */
  validate() {
    const errors = [];
    
    if (!this.id || typeof this.id !== 'string') {
      errors.push('Player ID must be a non-empty string');
    }
    
    if (!this.name || typeof this.name !== 'string') {
      errors.push('Player name must be a non-empty string');
    }
    
    if (!this.controlScheme || typeof this.controlScheme !== 'object') {
      errors.push('Control scheme must be an object');
    }
    
    if (!this.visualConfig || typeof this.visualConfig !== 'object') {
      errors.push('Visual config must be an object');
    }
    
    return errors;
  }
}

/**
 * Control scheme configurations for different input methods
 */
const CONTROL_SCHEMES = {
  player1: {
    type: 'keyboard',
    up: 'KeyW',
    down: 'KeyS',
    left: 'KeyA',
    right: 'KeyD',
    action: 'Space',
    description: 'WASD + Space'
  },
  
  player2: {
    type: 'keyboard',
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    action: 'Enter',
    description: 'Arrow Keys + Enter'
  },
  
  player3: {
    type: 'keyboard',
    up: 'KeyI',
    down: 'KeyK',
    left: 'KeyJ',
    right: 'KeyL',
    action: 'KeyU',
    description: 'IJKL + U'
  },
  
  player4: {
    type: 'keyboard',
    up: 'Numpad8',
    down: 'Numpad5',
    left: 'Numpad4',
    right: 'Numpad6',
    action: 'Numpad0',
    description: 'Numpad + 0'
  },
  
  // Gamepad control schemes
  gamepad1: {
    type: 'gamepad',
    index: 0,
    up: 'button12',      // D-pad up
    down: 'button13',    // D-pad down
    left: 'button14',    // D-pad left
    right: 'button15',   // D-pad right
    action: 'button0',   // A button (Xbox) / X button (PlayStation)
    altUp: 'axis1-',     // Left stick up (negative Y axis)
    altDown: 'axis1+',   // Left stick down (positive Y axis)
    altLeft: 'axis0-',   // Left stick left (negative X axis)
    altRight: 'axis0+',  // Left stick right (positive X axis)
    description: 'Gamepad 1'
  },
  
  gamepad2: {
    type: 'gamepad',
    index: 1,
    up: 'button12',
    down: 'button13',
    left: 'button14',
    right: 'button15',
    action: 'button0',
    altUp: 'axis1-',
    altDown: 'axis1+',
    altLeft: 'axis0-',
    altRight: 'axis0+',
    description: 'Gamepad 2'
  },
  
  gamepad3: {
    type: 'gamepad',
    index: 2,
    up: 'button12',
    down: 'button13',
    left: 'button14',
    right: 'button15',
    action: 'button0',
    altUp: 'axis1-',
    altDown: 'axis1+',
    altLeft: 'axis0-',
    altRight: 'axis0+',
    description: 'Gamepad 3'
  },
  
  gamepad4: {
    type: 'gamepad',
    index: 3,
    up: 'button12',
    down: 'button13',
    left: 'button14',
    right: 'button15',
    action: 'button0',
    altUp: 'axis1-',
    altDown: 'axis1+',
    altLeft: 'axis0-',
    altRight: 'axis0+',
    description: 'Gamepad 4'
  }
};

/**
 * LocalGameSettings class - Configuration for local multiplayer games
 */
class LocalGameSettings {
  constructor(options = {}) {
    // Player settings
    this.playerCount = options.playerCount || 2;
    this.maxPlayers = 4;
    this.minPlayers = 2;
    
    // Game duration and win conditions
    this.gameDuration = options.gameDuration || 300; // 5 minutes in seconds
    this.winCondition = options.winCondition || 'score'; // 'score', 'time', 'coins'
    this.targetScore = options.targetScore || 500;
    this.targetCoins = options.targetCoins || 50;
    
    // Difficulty settings
    this.difficulty = options.difficulty || 'medium'; // 'easy', 'medium', 'hard'
    this.enemySpeed = this.getDifficultyValue('enemySpeed');
    this.enemyCount = this.getDifficultyValue('enemyCount');
    this.coinSpawnRate = this.getDifficultyValue('coinSpawnRate');
    
    // Map settings
    this.mapSize = options.mapSize || 'medium'; // 'small', 'medium', 'large'
    this.mapDimensions = this.getMapDimensions();
    
    // Game features
    this.powerUpsEnabled = options.powerUpsEnabled !== false;
    this.friendlyFire = options.friendlyFire || false;
    this.respawnEnabled = options.respawnEnabled || false;
    this.bombsEnabled = options.bombsEnabled !== false;
    
    // Custom rules
    this.customRules = options.customRules || {};
    
    // Validate settings
    this.validate();
  }

  /**
   * Get difficulty-based values
   */
  getDifficultyValue(property) {
    const difficultyValues = {
      easy: {
        enemySpeed: 0.5,
        enemyCount: 2,
        coinSpawnRate: 1.5
      },
      medium: {
        enemySpeed: 1.0,
        enemyCount: 3,
        coinSpawnRate: 1.0
      },
      hard: {
        enemySpeed: 1.5,
        enemyCount: 4,
        coinSpawnRate: 0.7
      }
    };
    
    return difficultyValues[this.difficulty][property];
  }

  /**
   * Get map dimensions based on size
   */
  getMapDimensions() {
    const mapSizes = {
      small: { width: 15, height: 12 },
      medium: { width: 20, height: 15 },
      large: { width: 25, height: 18 }
    };
    
    return mapSizes[this.mapSize];
  }

  /**
   * Update game settings
   */
  updateSettings(newSettings) {
    Object.assign(this, newSettings);
    this.validate();
  }

  /**
   * Get settings for game initialization
   */
  getGameConfig() {
    return {
      playerCount: this.playerCount,
      mapWidth: this.mapDimensions.width,
      mapHeight: this.mapDimensions.height,
      winningScore: this.targetScore,
      difficultyLevel: this.difficulty,
      gameDuration: this.gameDuration,
      enemyCount: this.enemyCount,
      enemySpeed: this.enemySpeed,
      coinSpawnRate: this.coinSpawnRate,
      powerUpsEnabled: this.powerUpsEnabled,
      bombsEnabled: this.bombsEnabled
    };
  }

  /**
   * Validate settings
   */
  validate() {
    const errors = [];
    
    if (this.playerCount < this.minPlayers || this.playerCount > this.maxPlayers) {
      errors.push(`Player count must be between ${this.minPlayers} and ${this.maxPlayers}`);
    }
    
    if (this.gameDuration <= 0) {
      errors.push('Game duration must be positive');
    }
    
    if (this.targetScore <= 0) {
      errors.push('Target score must be positive');
    }
    
    if (!['easy', 'medium', 'hard'].includes(this.difficulty)) {
      errors.push('Difficulty must be easy, medium, or hard');
    }
    
    if (!['small', 'medium', 'large'].includes(this.mapSize)) {
      errors.push('Map size must be small, medium, or large');
    }
    
    if (!['score', 'time', 'coins'].includes(this.winCondition)) {
      errors.push('Win condition must be score, time, or coins');
    }
    
    if (errors.length > 0) {
      throw new Error('Invalid game settings: ' + errors.join(', '));
    }
  }
}

/**
 * Player visual configuration system
 */
const PLAYER_COLORS = [
  '#00ff41', // Green (Player 1)
  '#ff4444', // Red (Player 2)
  '#4444ff', // Blue (Player 3)
  '#ffff00', // Yellow (Player 4)
  '#ff44ff', // Magenta (Extra)
  '#44ffff', // Cyan (Extra)
  '#ff8844', // Orange (Extra)
  '#8844ff'  // Purple (Extra)
];

const PLAYER_CHARACTERS = [
  'Alex', 'Bella', 'Charlie', 'Daisy', 
  'Zoe', 'Leo', 'Mia', 'Noah'
];

/**
 * Create visual configuration for a player
 */
function createPlayerVisualConfig(playerId, playerIndex) {
  const colorIndex = playerIndex % PLAYER_COLORS.length;
  const characterIndex = playerIndex % PLAYER_CHARACTERS.length;
  
  return {
    playerId: playerId,
    character: PLAYER_CHARACTERS[characterIndex],
    primaryColor: PLAYER_COLORS[colorIndex],
    secondaryColor: adjustColorBrightness(PLAYER_COLORS[colorIndex], -20),
    indicator: {
      shape: ['circle', 'square', 'triangle', 'star'][playerIndex % 4],
      size: 4,
      borderColor: '#ffffff',
      glowEffect: true
    },
    nameTag: {
      visible: true,
      position: 'above',
      fontSize: 12,
      color: '#ffffff'
    }
  };
}

/**
 * Adjust color brightness
 */
function adjustColorBrightness(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

/**
 * Create gamepad control scheme for a specific controller
 */
function createGamepadControlScheme(controllerIndex, controllerId) {
  return {
    type: 'gamepad',
    index: controllerIndex,
    controllerId: controllerId,
    up: 'button12',      // D-pad up
    down: 'button13',    // D-pad down
    left: 'button14',    // D-pad left
    right: 'button15',   // D-pad right
    action: 'button0',   // A button (Xbox) / X button (PlayStation)
    altUp: 'axis1-',     // Left stick up (negative Y axis)
    altDown: 'axis1+',   // Left stick down (positive Y axis)
    altLeft: 'axis0-',   // Left stick left (negative X axis)
    altRight: 'axis0+',  // Left stick right (positive X axis)
    description: `Gamepad ${controllerIndex + 1}`,
    deadzone: 0.3        // Threshold for analog stick movement
  };
}

/**
 * Factory function to create a local player
 */
function createLocalPlayer(playerId, playerName, playerIndex, controllerIndex = null) {
  let controlScheme;
  
  if (controllerIndex !== null) {
    // Use gamepad control scheme
    controlScheme = createGamepadControlScheme(controllerIndex, `gamepad_${controllerIndex}`);
  } else {
    // Use keyboard control scheme
    controlScheme = CONTROL_SCHEMES[`player${playerIndex + 1}`] || CONTROL_SCHEMES.player1;
  }
  
  const visualConfig = createPlayerVisualConfig(playerId, playerIndex);
  
  return new LocalPlayer(playerId, playerName, controlScheme, visualConfig);
}

/**
 * Validate control scheme
 */
function validateControlScheme(controlScheme) {
  const errors = [];
  const requiredKeys = ['up', 'down', 'left', 'right', 'action'];
  
  for (const key of requiredKeys) {
    if (!controlScheme[key]) {
      errors.push(`Missing required control: ${key}`);
    }
  }
  
  if (!controlScheme.type) {
    errors.push('Control scheme must have a type');
  }
  
  return errors;
}

// Export classes and functions for use in other modules
if (typeof window !== 'undefined') {
  window.LocalPlayer = LocalPlayer;
  window.LocalGameSettings = LocalGameSettings;
  window.CONTROL_SCHEMES = CONTROL_SCHEMES;
  window.PLAYER_COLORS = PLAYER_COLORS;
  window.PLAYER_CHARACTERS = PLAYER_CHARACTERS;
  window.createLocalPlayer = createLocalPlayer;
  window.createPlayerVisualConfig = createPlayerVisualConfig;
  window.createGamepadControlScheme = createGamepadControlScheme;
  window.validateControlScheme = validateControlScheme;
} else if (typeof global !== 'undefined') {
  // Node.js environment
  global.LocalPlayer = LocalPlayer;
  global.LocalGameSettings = LocalGameSettings;
  global.CONTROL_SCHEMES = CONTROL_SCHEMES;
  global.PLAYER_COLORS = PLAYER_COLORS;
  global.PLAYER_CHARACTERS = PLAYER_CHARACTERS;
  global.createLocalPlayer = createLocalPlayer;
  global.createPlayerVisualConfig = createPlayerVisualConfig;
  global.createGamepadControlScheme = createGamepadControlScheme;
  global.validateControlScheme = validateControlScheme;
}

console.log("Local multiplayer models loaded successfully");