// Unit tests for Local Multiplayer Data Models
console.log("Loading local multiplayer models tests");

// Mock DOM environment for testing
if (typeof window === 'undefined') {
  global.window = {};
}

// Load the models
if (typeof require !== 'undefined') {
  // Node.js environment
  require('../local-multiplayer-models.js');
  // Make global references available as window references for tests
  window.LocalPlayer = global.LocalPlayer;
  window.LocalGameSettings = global.LocalGameSettings;
  window.CONTROL_SCHEMES = global.CONTROL_SCHEMES;
  window.PLAYER_COLORS = global.PLAYER_COLORS;
  window.PLAYER_CHARACTERS = global.PLAYER_CHARACTERS;
  window.createLocalPlayer = global.createLocalPlayer;
  window.createPlayerVisualConfig = global.createPlayerVisualConfig;
  window.validateControlScheme = global.validateControlScheme;
} else {
  // Browser environment - models should already be loaded
}

/**
 * Test suite for LocalPlayer class
 */
function testLocalPlayer() {
  console.log("Testing LocalPlayer class...");
  
  // Test constructor
  const controlScheme = {
    type: 'keyboard',
    up: 'KeyW',
    down: 'KeyS',
    left: 'KeyA',
    right: 'KeyD',
    action: 'Space'
  };
  
  const visualConfig = {
    playerId: 'player1',
    character: 'Alex',
    primaryColor: '#00ff41',
    secondaryColor: '#00cc33',
    indicator: { shape: 'circle', size: 4 },
    nameTag: { visible: true, position: 'above' }
  };
  
  const player = new window.LocalPlayer('player1', 'TestPlayer', controlScheme, visualConfig);
  
  // Test initial state
  assert(player.id === 'player1', 'Player ID should be set correctly');
  assert(player.name === 'TestPlayer', 'Player name should be set correctly');
  assert(player.score === 0, 'Initial score should be 0');
  assert(player.isActive === true, 'Player should be active initially');
  assert(player.position.x === 1 && player.position.y === 1, 'Initial position should be (1,1)');
  
  // Test movement
  const gameState = { mapWidth: 20, mapHeight: 15 };
  const moved = player.move('right', gameState);
  assert(moved === true, 'Movement should succeed');
  assert(player.position.x === 2, 'Player should move right');
  assert(player.direction === 'right', 'Direction should be updated');
  
  // Test boundary checking
  player.position = { x: 1, y: 1 };
  const boundaryMove = player.move('left', gameState);
  assert(boundaryMove === false, 'Should not move beyond left boundary');
  assert(player.position.x === 1, 'Position should remain at boundary');
  
  // Test score management
  player.addScore(10);
  assert(player.score === 10, 'Score should increase');
  assert(player.mood === 'happy', 'Mood should be happy after positive score');
  
  player.addScore(-5);
  assert(player.score === 5, 'Score should decrease');
  assert(player.mood === 'sad', 'Mood should be sad after negative score');
  
  // Test coin collection
  player.collectCoin(15);
  assert(player.score === 20, 'Score should increase by coin value');
  assert(player.stats.coinsCollected === 1, 'Coins collected stat should increment');
  
  // Test enemy hit
  player.hitByEnemy(8);
  assert(player.score === 12, 'Score should decrease by enemy damage');
  assert(player.stats.enemiesHit === 1, 'Enemies hit stat should increment');
  
  // Test bomb hit
  player.hitByBomb(20);
  assert(player.score === -8, 'Score should decrease by bomb damage');
  assert(player.stats.bombsHit === 1, 'Bombs hit stat should increment');
  
  // Test render data
  const renderData = player.getRenderData();
  assert(renderData.id === 'player1', 'Render data should include player ID');
  assert(renderData.name === 'TestPlayer', 'Render data should include player name');
  assert(renderData.score === -8, 'Render data should include current score');
  
  // Test validation
  const errors = player.validate();
  assert(errors.length === 0, 'Valid player should have no validation errors');
  
  // Test invalid player
  const invalidPlayer = new window.LocalPlayer('', '', null, null);
  const invalidErrors = invalidPlayer.validate();
  assert(invalidErrors.length > 0, 'Invalid player should have validation errors');
  
  console.log("✓ LocalPlayer tests passed");
}

/**
 * Test suite for LocalGameSettings class
 */
function testLocalGameSettings() {
  console.log("Testing LocalGameSettings class...");
  
  // Test default settings
  const defaultSettings = new window.LocalGameSettings();
  assert(defaultSettings.playerCount === 2, 'Default player count should be 2');
  assert(defaultSettings.gameDuration === 300, 'Default game duration should be 300 seconds');
  assert(defaultSettings.winCondition === 'score', 'Default win condition should be score');
  assert(defaultSettings.difficulty === 'medium', 'Default difficulty should be medium');
  assert(defaultSettings.mapSize === 'medium', 'Default map size should be medium');
  
  // Test custom settings
  const customOptions = {
    playerCount: 4,
    gameDuration: 600,
    winCondition: 'time',
    targetScore: 1000,
    difficulty: 'hard',
    mapSize: 'large',
    powerUpsEnabled: false,
    friendlyFire: true
  };
  
  const customSettings = new window.LocalGameSettings(customOptions);
  assert(customSettings.playerCount === 4, 'Custom player count should be set');
  assert(customSettings.gameDuration === 600, 'Custom game duration should be set');
  assert(customSettings.winCondition === 'time', 'Custom win condition should be set');
  assert(customSettings.powerUpsEnabled === false, 'Custom power-ups setting should be set');
  assert(customSettings.friendlyFire === true, 'Custom friendly fire setting should be set');
  
  // Test difficulty values
  assert(customSettings.enemySpeed === 1.5, 'Hard difficulty should have faster enemies');
  assert(customSettings.enemyCount === 4, 'Hard difficulty should have more enemies');
  assert(customSettings.coinSpawnRate === 0.7, 'Hard difficulty should have slower coin spawn');
  
  // Test map dimensions
  const largeDimensions = customSettings.getMapDimensions();
  assert(largeDimensions.width === 25, 'Large map should have width 25');
  assert(largeDimensions.height === 18, 'Large map should have height 18');
  
  // Test game config
  const gameConfig = customSettings.getGameConfig();
  assert(gameConfig.playerCount === 4, 'Game config should include player count');
  assert(gameConfig.mapWidth === 25, 'Game config should include map width');
  assert(gameConfig.winningScore === 1000, 'Game config should include winning score');
  
  // Test settings update
  customSettings.updateSettings({ playerCount: 3, difficulty: 'easy' });
  assert(customSettings.playerCount === 3, 'Settings should be updated');
  assert(customSettings.difficulty === 'easy', 'Difficulty should be updated');
  assert(customSettings.enemySpeed === 0.5, 'Enemy speed should update with difficulty');
  
  // Test validation errors
  try {
    new window.LocalGameSettings({ playerCount: 10 }); // Invalid player count
    assert(false, 'Should throw error for invalid player count');
  } catch (error) {
    assert(error.message.includes('Player count'), 'Should throw player count error');
  }
  
  try {
    new window.LocalGameSettings({ gameDuration: -100 }); // Invalid duration
    assert(false, 'Should throw error for invalid duration');
  } catch (error) {
    assert(error.message.includes('Game duration'), 'Should throw duration error');
  }
  
  try {
    new window.LocalGameSettings({ difficulty: 'impossible' }); // Invalid difficulty
    assert(false, 'Should throw error for invalid difficulty');
  } catch (error) {
    assert(error.message.includes('Difficulty'), 'Should throw difficulty error');
  }
  
  console.log("✓ LocalGameSettings tests passed");
}

/**
 * Test suite for control schemes
 */
function testControlSchemes() {
  console.log("Testing control schemes...");
  
  // Test that all required control schemes exist
  assert(window.CONTROL_SCHEMES.player1, 'Player 1 control scheme should exist');
  assert(window.CONTROL_SCHEMES.player2, 'Player 2 control scheme should exist');
  assert(window.CONTROL_SCHEMES.player3, 'Player 3 control scheme should exist');
  assert(window.CONTROL_SCHEMES.player4, 'Player 4 control scheme should exist');
  
  // Test control scheme structure
  const player1Controls = window.CONTROL_SCHEMES.player1;
  assert(player1Controls.type === 'keyboard', 'Player 1 should use keyboard');
  assert(player1Controls.up === 'KeyW', 'Player 1 up should be W key');
  assert(player1Controls.down === 'KeyS', 'Player 1 down should be S key');
  assert(player1Controls.left === 'KeyA', 'Player 1 left should be A key');
  assert(player1Controls.right === 'KeyD', 'Player 1 right should be D key');
  assert(player1Controls.action === 'Space', 'Player 1 action should be Space');
  
  // Test control scheme validation
  const validScheme = window.CONTROL_SCHEMES.player1;
  const validErrors = window.validateControlScheme(validScheme);
  assert(validErrors.length === 0, 'Valid control scheme should have no errors');
  
  const invalidScheme = { type: 'keyboard', up: 'KeyW' }; // Missing keys
  const invalidErrors = window.validateControlScheme(invalidScheme);
  assert(invalidErrors.length > 0, 'Invalid control scheme should have errors');
  
  console.log("✓ Control schemes tests passed");
}

/**
 * Test suite for player visual configuration
 */
function testPlayerVisualConfig() {
  console.log("Testing player visual configuration...");
  
  // Test visual config creation
  const visualConfig = window.createPlayerVisualConfig('player1', 0);
  assert(visualConfig.playerId === 'player1', 'Visual config should have correct player ID');
  assert(visualConfig.character === 'Alex', 'First player should get Alex character');
  assert(visualConfig.primaryColor === '#00ff41', 'First player should get green color');
  assert(visualConfig.indicator.shape === 'circle', 'First player should get circle indicator');
  
  // Test different player indices
  const visualConfig2 = window.createPlayerVisualConfig('player2', 1);
  assert(visualConfig2.character === 'Bella', 'Second player should get Bella character');
  assert(visualConfig2.primaryColor === '#ff4444', 'Second player should get red color');
  assert(visualConfig2.indicator.shape === 'square', 'Second player should get square indicator');
  
  // Test color and character arrays
  assert(window.PLAYER_COLORS.length >= 4, 'Should have at least 4 player colors');
  assert(window.PLAYER_CHARACTERS.length >= 4, 'Should have at least 4 player characters');
  
  // Test that colors are valid hex codes
  window.PLAYER_COLORS.forEach((color, index) => {
    assert(color.startsWith('#'), `Color ${index} should start with #`);
    assert(color.length === 7, `Color ${index} should be 7 characters long`);
  });
  
  console.log("✓ Player visual configuration tests passed");
}

/**
 * Test suite for player factory function
 */
function testPlayerFactory() {
  console.log("Testing player factory function...");
  
  // Test player creation
  const player = window.createLocalPlayer('test1', 'TestPlayer', 0);
  assert(player instanceof window.LocalPlayer, 'Factory should create LocalPlayer instance');
  assert(player.id === 'test1', 'Player should have correct ID');
  assert(player.name === 'TestPlayer', 'Player should have correct name');
  assert(player.controlScheme.type === 'keyboard', 'Player should have keyboard controls');
  assert(player.visualConfig.character === 'Alex', 'Player should have correct character');
  
  // Test different player indices
  const player2 = window.createLocalPlayer('test2', 'Player2', 1);
  assert(player2.controlScheme.up === 'ArrowUp', 'Second player should have arrow key controls');
  assert(player2.visualConfig.primaryColor === '#ff4444', 'Second player should have red color');
  
  console.log("✓ Player factory tests passed");
}

/**
 * Simple assertion function for testing
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Run all tests
 */
function runAllTests() {
  console.log("Starting local multiplayer models tests...");
  
  try {
    testLocalPlayer();
    testLocalGameSettings();
    testControlSchemes();
    testPlayerVisualConfig();
    testPlayerFactory();
    
    console.log("✅ All local multiplayer models tests passed!");
    return true;
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error(error.stack);
    return false;
  }
}

// Export test functions
if (typeof window !== 'undefined') {
  window.runLocalMultiplayerTests = runAllTests;
  window.testLocalPlayer = testLocalPlayer;
  window.testLocalGameSettings = testLocalGameSettings;
  window.testControlSchemes = testControlSchemes;
  window.testPlayerVisualConfig = testPlayerVisualConfig;
  window.testPlayerFactory = testPlayerFactory;
}

// Auto-run tests if this is the main module
if (typeof require !== 'undefined' && require.main === module) {
  runAllTests();
}

console.log("Local multiplayer models tests loaded");