// Local Multiplayer Game State Management Tests
console.log("Loading local multiplayer game state management tests");

/**
 * Test suite for LocalMultiplayerGame class
 */
class LocalMultiplayerGameTests {
  constructor() {
    this.testResults = [];
    this.setupComplete = false;
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log("Starting LocalMultiplayerGame tests...");
    
    // Setup tests
    await this.testGameInitialization();
    await this.testPlayerManagement();
    await this.testGameStateManagement();
    await this.testTimerAndRoundManagement();
    await this.testScoreTrackingAndRanking();
    await this.testWinConditions();
    await this.testEventSystem();
    await this.testGameStateConsistency();
    
    // Report results
    this.reportResults();
    
    return this.testResults;
  }

  /**
   * Test game initialization
   */
  async testGameInitialization() {
    console.log("Testing game initialization...");
    
    try {
      // Test default initialization
      const game1 = new LocalMultiplayerGame();
      this.assert(game1 instanceof LocalMultiplayerGame, "Game should be instance of LocalMultiplayerGame");
      this.assert(game1.isSetupPhase === true, "Game should start in setup phase");
      this.assert(game1.isActive === false, "Game should not be active initially");
      this.assert(game1.players.size === 0, "Game should start with no players");
      
      // Test initialization with custom settings
      const customSettings = new LocalGameSettings({
        playerCount: 3,
        gameDuration: 600,
        winCondition: 'score',
        targetScore: 1000,
        difficulty: 'hard'
      });
      
      const game2 = new LocalMultiplayerGame(customSettings);
      this.assert(game2.gameDuration === 600, "Game duration should match custom settings");
      this.assert(game2.targetScore === 1000, "Target score should match custom settings");
      this.assert(game2.gameSettings.difficulty === 'hard', "Difficulty should match custom settings");
      
      // Test game state initialization
      const gameState = game1.getGameState();
      this.assert(gameState.mapWidth > 0, "Map width should be positive");
      this.assert(gameState.mapHeight > 0, "Map height should be positive");
      this.assert(Array.isArray(gameState.coins), "Coins should be an array");
      this.assert(Array.isArray(gameState.bombs), "Bombs should be an array");
      this.assert(Array.isArray(gameState.enemies), "Enemies should be an array");
      
      this.addTestResult("Game Initialization", true, "All initialization tests passed");
      
    } catch (error) {
      this.addTestResult("Game Initialization", false, error.message);
    }
  }

  /**
   * Test player management (join/leave functionality)
   */
  async testPlayerManagement() {
    console.log("Testing player management...");
    
    try {
      const game = new LocalMultiplayerGame();
      
      // Test adding players
      const player1 = game.addPlayer(
        "player1", 
        "Alice", 
        CONTROL_SCHEMES.player1, 
        createPlayerVisualConfig("player1", 0)
      );
      
      this.assert(game.players.size === 1, "Should have 1 player after adding first player");
      this.assert(player1.name === "Alice", "Player name should be set correctly");
      this.assert(game.gameState.players["player1"] !== undefined, "Player should be in game state");
      
      const player2 = game.addPlayer(
        "player2", 
        "Bob", 
        CONTROL_SCHEMES.player2, 
        createPlayerVisualConfig("player2", 1)
      );
      
      this.assert(game.players.size === 2, "Should have 2 players after adding second player");
      this.assert(player2.name === "Bob", "Second player name should be set correctly");
      
      // Test player positions don't overlap
      this.assert(
        player1.position.x !== player2.position.x || player1.position.y !== player2.position.y,
        "Players should have different starting positions"
      );
      
      // Test adding duplicate player (should fail)
      try {
        game.addPlayer("player1", "Charlie", CONTROL_SCHEMES.player3, createPlayerVisualConfig("player1", 2));
        this.assert(false, "Should not allow duplicate player IDs");
      } catch (error) {
        this.assert(error.message.includes("already exists"), "Should throw error for duplicate player");
      }
      
      // Test removing player
      const removed = game.removePlayer("player1");
      this.assert(removed === true, "Should successfully remove player");
      this.assert(game.players.size === 1, "Should have 1 player after removal");
      this.assert(game.gameState.players["player1"] === undefined, "Player should be removed from game state");
      
      // Test removing non-existent player
      const notRemoved = game.removePlayer("nonexistent");
      this.assert(notRemoved === false, "Should return false for non-existent player");
      
      this.addTestResult("Player Management", true, "All player management tests passed");
      
    } catch (error) {
      this.addTestResult("Player Management", false, error.message);
    }
  }

  /**
   * Test game state management
   */
  async testGameStateManagement() {
    console.log("Testing game state management...");
    
    try {
      const game = new LocalMultiplayerGame();
      
      // Add players
      game.addPlayer("player1", "Alice", CONTROL_SCHEMES.player1, createPlayerVisualConfig("player1", 0));
      game.addPlayer("player2", "Bob", CONTROL_SCHEMES.player2, createPlayerVisualConfig("player2", 1));
      
      // Test starting game
      const gameState = game.startGame();
      this.assert(game.isActive === true, "Game should be active after starting");
      this.assert(game.isSetupPhase === false, "Should not be in setup phase after starting");
      this.assert(gameState.gameStarted === true, "Game state should show game as started");
      this.assert(gameState.coins.length > 0, "Should have coins after starting");
      
      // Test pause/resume
      const paused = game.pauseGame();
      this.assert(paused === true, "Should successfully pause game");
      this.assert(game.isPaused === true, "Game should be paused");
      this.assert(game.gameState.isPaused === true, "Game state should show paused");
      
      const resumed = game.resumeGame();
      this.assert(resumed === true, "Should successfully resume game");
      this.assert(game.isPaused === false, "Game should not be paused after resume");
      
      // Test ending game
      const result = game.endGame("player1", "test_end");
      this.assert(game.isActive === false, "Game should not be active after ending");
      this.assert(result.winnerId === "player1", "Winner should be set correctly");
      this.assert(result.reason === "test_end", "End reason should be set correctly");
      
      this.addTestResult("Game State Management", true, "All game state management tests passed");
      
    } catch (error) {
      this.addTestResult("Game State Management", false, error.message);
    }
  }

  /**
   * Test timer and round management
   */
  async testTimerAndRoundManagement() {
    console.log("Testing timer and round management...");
    
    try {
      const game = new LocalMultiplayerGame(new LocalGameSettings({ gameDuration: 5 })); // 5 second game
      
      // Add players and start game
      game.addPlayer("player1", "Alice", CONTROL_SCHEMES.player1, createPlayerVisualConfig("player1", 0));
      game.addPlayer("player2", "Bob", CONTROL_SCHEMES.player2, createPlayerVisualConfig("player2", 1));
      
      game.startGame();
      
      // Test initial timer state
      this.assert(game.timeRemaining === 5, "Should start with full time");
      this.assert(game.gameTimer !== null, "Game timer should be running");
      
      // Test timer countdown (wait a bit)
      await new Promise(resolve => setTimeout(resolve, 1100)); // Wait 1.1 seconds
      
      this.assert(game.timeRemaining < 5, "Time should have decreased");
      this.assert(game.timeRemaining >= 3, "Time should not decrease too quickly");
      
      // Test pause stops timer
      const initialTime = game.timeRemaining;
      game.pauseGame();
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 0.5 seconds
      
      this.assert(game.timeRemaining === initialTime, "Time should not decrease when paused");
      
      // Test resume continues timer
      game.resumeGame();
      
      await new Promise(resolve => setTimeout(resolve, 1100)); // Wait 1.1 seconds
      
      this.assert(game.timeRemaining < initialTime, "Time should decrease after resume");
      
      // Clean up
      game.destroy();
      
      this.addTestResult("Timer and Round Management", true, "All timer and round management tests passed");
      
    } catch (error) {
      this.addTestResult("Timer and Round Management", false, error.message);
    }
  }

  /**
   * Test score tracking and ranking system
   */
  async testScoreTrackingAndRanking() {
    console.log("Testing score tracking and ranking...");
    
    try {
      const game = new LocalMultiplayerGame();
      
      // Add players
      game.addPlayer("player1", "Alice", CONTROL_SCHEMES.player1, createPlayerVisualConfig("player1", 0));
      game.addPlayer("player2", "Bob", CONTROL_SCHEMES.player2, createPlayerVisualConfig("player2", 1));
      
      game.startGame();
      
      // Test score updates
      const updated1 = game.updatePlayerScore("player1", 10, "coin");
      this.assert(updated1 === true, "Should successfully update player score");
      
      const player1 = game.players.get("player1");
      this.assert(player1.score === 10, "Player score should be updated");
      this.assert(player1.stats.coinsCollected === 1, "Coin collection stat should be updated");
      
      // Test different score update reasons
      game.updatePlayerScore("player1", 5, "enemy");
      this.assert(player1.score === 5, "Score should decrease for enemy hit");
      this.assert(player1.stats.enemiesHit === 1, "Enemy hit stat should be updated");
      
      game.updatePlayerScore("player2", 20, "coin");
      game.updatePlayerScore("player2", 10, "coin");
      
      // Test leaderboard
      game.updateLeaderboard();
      const leaderboard = game.leaderboard;
      
      this.assert(leaderboard.length === 2, "Leaderboard should have 2 players");
      this.assert(leaderboard[0].playerName === "Bob", "Bob should be first (higher score)");
      this.assert(leaderboard[0].score === 30, "First place score should be 30");
      this.assert(leaderboard[1].playerName === "Alice", "Alice should be second");
      this.assert(leaderboard[1].score === 5, "Second place score should be 5");
      
      // Test score history
      this.assert(game.scoreHistory.length > 0, "Should have score history");
      this.assert(game.scoreHistory[0].playerId === "player1", "First score change should be for player1");
      this.assert(game.scoreHistory[0].reason === "coin", "First score change reason should be coin");
      
      this.addTestResult("Score Tracking and Ranking", true, "All score tracking and ranking tests passed");
      
    } catch (error) {
      this.addTestResult("Score Tracking and Ranking", false, error.message);
    }
  }

  /**
   * Test win conditions
   */
  async testWinConditions() {
    console.log("Testing win conditions...");
    
    try {
      // Test score-based win condition
      const scoreGame = new LocalMultiplayerGame(new LocalGameSettings({
        winCondition: 'score',
        targetScore: 50
      }));
      
      scoreGame.addPlayer("player1", "Alice", CONTROL_SCHEMES.player1, createPlayerVisualConfig("player1", 0));
      scoreGame.addPlayer("player2", "Bob", CONTROL_SCHEMES.player2, createPlayerVisualConfig("player2", 1));
      
      scoreGame.startGame();
      
      // Update score to just below target
      scoreGame.updatePlayerScore("player1", 45, "coin");
      this.assert(scoreGame.isActive === true, "Game should still be active below target score");
      
      // Update score to meet target
      scoreGame.updatePlayerScore("player1", 10, "coin");
      this.assert(scoreGame.isActive === false, "Game should end when target score is reached");
      this.assert(scoreGame.gameWinner.id === "player1", "Player1 should be the winner");
      
      // Test time-based win condition
      const timeGame = new LocalMultiplayerGame(new LocalGameSettings({
        winCondition: 'time',
        gameDuration: 1 // 1 second game
      }));
      
      timeGame.addPlayer("player1", "Alice", CONTROL_SCHEMES.player1, createPlayerVisualConfig("player1", 0));
      timeGame.addPlayer("player2", "Bob", CONTROL_SCHEMES.player2, createPlayerVisualConfig("player2", 1));
      
      timeGame.startGame();
      
      // Give player2 higher score
      timeGame.updatePlayerScore("player2", 30, "coin");
      timeGame.updatePlayerScore("player1", 20, "coin");
      
      // Wait for time to run out
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      this.assert(timeGame.isActive === false, "Time-based game should end when time runs out");
      this.assert(timeGame.gameWinner.id === "player2", "Player with highest score should win in time-based game");
      
      this.addTestResult("Win Conditions", true, "All win condition tests passed");
      
    } catch (error) {
      this.addTestResult("Win Conditions", false, error.message);
    }
  }

  /**
   * Test event system
   */
  async testEventSystem() {
    console.log("Testing event system...");
    
    try {
      const game = new LocalMultiplayerGame();
      let eventsFired = [];
      
      // Register event listeners
      game.on('playerJoined', (data) => {
        eventsFired.push({ type: 'playerJoined', data });
      });
      
      game.on('gameStarted', (data) => {
        eventsFired.push({ type: 'gameStarted', data });
      });
      
      game.on('scoreUpdated', (data) => {
        eventsFired.push({ type: 'scoreUpdated', data });
      });
      
      game.on('gameEnded', (data) => {
        eventsFired.push({ type: 'gameEnded', data });
      });
      
      // Trigger events
      game.addPlayer("player1", "Alice", CONTROL_SCHEMES.player1, createPlayerVisualConfig("player1", 0));
      game.addPlayer("player2", "Bob", CONTROL_SCHEMES.player2, createPlayerVisualConfig("player2", 1));
      
      this.assert(eventsFired.length === 2, "Should have fired 2 playerJoined events");
      this.assert(eventsFired[0].type === 'playerJoined', "First event should be playerJoined");
      this.assert(eventsFired[0].data.playerName === 'Alice', "First event should be for Alice");
      
      game.startGame();
      
      this.assert(eventsFired.length === 3, "Should have fired gameStarted event");
      this.assert(eventsFired[2].type === 'gameStarted', "Third event should be gameStarted");
      
      game.updatePlayerScore("player1", 10, "coin");
      
      this.assert(eventsFired.length === 4, "Should have fired scoreUpdated event");
      this.assert(eventsFired[3].type === 'scoreUpdated', "Fourth event should be scoreUpdated");
      
      game.endGame("player1", "test");
      
      this.assert(eventsFired.length === 5, "Should have fired gameEnded event");
      this.assert(eventsFired[4].type === 'gameEnded', "Fifth event should be gameEnded");
      
      // Test event listener removal
      const testCallback = () => eventsFired.push({ type: 'test' });
      game.on('test', testCallback);
      game.emit('test', {});
      
      this.assert(eventsFired.length === 6, "Should have fired test event");
      
      game.off('test', testCallback);
      game.emit('test', {});
      
      this.assert(eventsFired.length === 6, "Should not fire test event after removal");
      
      this.addTestResult("Event System", true, "All event system tests passed");
      
    } catch (error) {
      this.addTestResult("Event System", false, error.message);
    }
  }

  /**
   * Test game state consistency and updates
   */
  async testGameStateConsistency() {
    console.log("Testing game state consistency...");
    
    try {
      const game = new LocalMultiplayerGame();
      
      // Add players
      game.addPlayer("player1", "Alice", CONTROL_SCHEMES.player1, createPlayerVisualConfig("player1", 0));
      game.addPlayer("player2", "Bob", CONTROL_SCHEMES.player2, createPlayerVisualConfig("player2", 1));
      
      game.startGame();
      
      // Test initial state consistency
      let errors = game.validateGameState();
      this.assert(errors.length === 0, `Game state should be consistent initially. Errors: ${errors.join(', ')}`);
      
      // Update scores and test consistency
      game.updatePlayerScore("player1", 25, "coin");
      game.updatePlayerScore("player2", 15, "coin");
      
      errors = game.validateGameState();
      this.assert(errors.length === 0, `Game state should be consistent after score updates. Errors: ${errors.join(', ')}`);
      
      // Test game state retrieval
      const gameState = game.getGameState();
      this.assert(gameState.players["player1"].score === 25, "Game state should reflect player1 score");
      this.assert(gameState.players["player2"].score === 15, "Game state should reflect player2 score");
      this.assert(gameState.isActive === true, "Game state should show game as active");
      this.assert(gameState.leaderboard.length === 2, "Game state should include leaderboard");
      
      // Test game statistics
      const stats = game.getGameStats();
      this.assert(stats.totalCoinsCollected === 2, "Stats should show 2 coins collected");
      this.assert(stats.playerCount === 2, "Stats should show 2 players");
      this.assert(Array.isArray(stats.gameEvents), "Stats should include game events");
      this.assert(stats.gameEvents.length > 0, "Should have recorded game events");
      
      this.addTestResult("Game State Consistency", true, "All game state consistency tests passed");
      
    } catch (error) {
      this.addTestResult("Game State Consistency", false, error.message);
    }
  }

  /**
   * Add test result
   */
  addTestResult(testName, passed, message) {
    this.testResults.push({
      name: testName,
      passed: passed,
      message: message,
      timestamp: new Date().toISOString()
    });
    
    const status = passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${status}: ${testName} - ${message}`);
  }

  /**
   * Assert helper
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  /**
   * Report test results
   */
  reportResults() {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(result => result.passed).length;
    const failedTests = totalTests - passedTests;
    
    console.log("\n" + "=".repeat(50));
    console.log("LOCAL MULTIPLAYER GAME STATE MANAGEMENT TEST RESULTS");
    console.log("=".repeat(50));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (failedTests > 0) {
      console.log("\nFailed Tests:");
      this.testResults
        .filter(result => !result.passed)
        .forEach(result => {
          console.log(`❌ ${result.name}: ${result.message}`);
        });
    }
    
    console.log("=".repeat(50));
    
    return {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      successRate: (passedTests / totalTests) * 100,
      results: this.testResults
    };
  }
}

// Export for use in test runner
if (typeof window !== 'undefined') {
  window.LocalMultiplayerGameTests = LocalMultiplayerGameTests;
} else if (typeof global !== 'undefined') {
  global.LocalMultiplayerGameTests = LocalMultiplayerGameTests;
}

console.log("Local multiplayer game state management tests loaded successfully");