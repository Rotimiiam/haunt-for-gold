// Integration tests for CollisionResolver with LocalMultiplayerIntegration
console.log("Loading collision resolver integration tests");

// Integration test suite for CollisionResolver with LocalMultiplayerIntegration
function runCollisionResolverIntegrationTests() {
  console.log("Running CollisionResolver Integration tests...");
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
  };

  function test(name, testFn) {
    results.total++;
    try {
      testFn();
      results.passed++;
      results.details.push({ name, status: 'PASS' });
      console.log(`✓ ${name}`);
    } catch (error) {
      results.failed++;
      results.details.push({ name, status: 'FAIL', error: error.message });
      console.error(`✗ ${name}: ${error.message}`);
    }
  }

  function assertEquals(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(`Expected ${expected}, got ${actual}. ${message}`);
    }
  }

  function assertTrue(condition, message = '') {
    if (!condition) {
      throw new Error(`Expected true, got false. ${message}`);
    }
  }

  function assertFalse(condition, message = '') {
    if (condition) {
      throw new Error(`Expected false, got true. ${message}`);
    }
  }

  // Helper to create mock game state
  function createMockGameState(players, coins = [], enemies = [], bombs = []) {
    return {
      players: players.reduce((acc, player) => {
        acc[player.id] = {
          id: player.id,
          name: player.name,
          position: player.position,
          score: player.score,
          isActive: player.isActive !== false
        };
        return acc;
      }, {}),
      coins: coins,
      enemies: enemies,
      bombs: bombs,
      mapWidth: 20,
      mapHeight: 15
    };
  }

  // Test LocalMultiplayerIntegration with CollisionResolver
  test('LocalMultiplayerIntegration initializes with CollisionResolver', () => {
    const integration = new LocalMultiplayerIntegration();
    const playerNames = ['Alice', 'Bob'];
    
    integration.initializeGame(playerNames);
    
    const resolver = integration.getCollisionResolver();
    assertTrue(resolver instanceof CollisionResolver, 'Should have CollisionResolver instance');
  });

  test('Player movement validates position using CollisionResolver', () => {
    const integration = new LocalMultiplayerIntegration();
    const playerNames = ['Alice'];
    
    integration.initializeGame(playerNames);
    
    // Mock game state with boundaries
    window.gameState = createMockGameState([
      { id: 'local_player_1', name: 'Alice', position: { x: 1, y: 1 }, score: 0 }
    ]);
    
    // Try to move to invalid position (wall)
    const player = integration.getPlayer('local_player_1');
    const originalPos = { ...player.position };
    
    // This should be blocked by collision resolver
    integration.handlePlayerMove('local_player_1', 'left'); // Would move to x=0 (wall)
    
    assertEquals(player.position.x, originalPos.x, 'Player should not move into wall');
    assertEquals(player.position.y, originalPos.y, 'Player Y position should not change');
  });

  test('Coin collection uses fair priority system', () => {
    const integration = new LocalMultiplayerIntegration();
    const playerNames = ['Alice', 'Bob'];
    
    integration.initializeGame(playerNames);
    
    // Create players at same position with different scores
    const players = [
      { id: 'local_player_1', name: 'Alice', position: { x: 5, y: 5 }, score: 100 },
      { id: 'local_player_2', name: 'Bob', position: { x: 5, y: 5 }, score: 50 }
    ];
    
    const coins = [
      { id: 'coin1', x: 5, y: 5, collected: false, type: 'normal' }
    ];
    
    window.gameState = createMockGameState(players, coins);
    
    // Process collisions
    integration.processCollisions();
    
    // Bob (lower score) should get the coin due to fair priority
    const bobPlayer = integration.getPlayer('local_player_2');
    assertTrue(bobPlayer.score > 50, 'Bob should have collected the coin');
    assertTrue(coins[0].collected, 'Coin should be marked as collected');
  });

  test('Enemy collision applies damage correctly', () => {
    const integration = new LocalMultiplayerIntegration();
    const playerNames = ['Alice'];
    
    integration.initializeGame(playerNames);
    
    const players = [
      { id: 'local_player_1', name: 'Alice', position: { x: 3, y: 3 }, score: 100 }
    ];
    
    const enemies = [
      { id: 'enemy1', x: 3, y: 3 }
    ];
    
    window.gameState = createMockGameState(players, [], enemies);
    
    const originalScore = integration.getPlayer('local_player_1').score;
    
    // Process collisions
    integration.processCollisions();
    
    const newScore = integration.getPlayer('local_player_1').score;
    assertTrue(newScore < originalScore, 'Player score should decrease after enemy hit');
  });

  test('Bomb collision applies damage and marks bomb as exploded', () => {
    const integration = new LocalMultiplayerIntegration();
    const playerNames = ['Alice'];
    
    integration.initializeGame(playerNames);
    
    const players = [
      { id: 'local_player_1', name: 'Alice', position: { x: 7, y: 7 }, score: 100 }
    ];
    
    const bombs = [
      { id: 'bomb1', x: 7, y: 7, exploded: false }
    ];
    
    window.gameState = createMockGameState(players, [], [], bombs);
    
    const originalScore = integration.getPlayer('local_player_1').score;
    
    // Process collisions
    integration.processCollisions();
    
    const newScore = integration.getPlayer('local_player_1').score;
    assertTrue(newScore < originalScore, 'Player score should decrease after bomb hit');
    assertTrue(bombs[0].exploded, 'Bomb should be marked as exploded');
  });

  test('Multiple players can overlap without blocking movement', () => {
    const integration = new LocalMultiplayerIntegration();
    const playerNames = ['Alice', 'Bob'];
    
    integration.initializeGame(playerNames);
    
    // Set both players to same position
    const alice = integration.getPlayer('local_player_1');
    const bob = integration.getPlayer('local_player_2');
    
    alice.position = { x: 5, y: 5 };
    bob.position = { x: 5, y: 5 };
    
    window.gameState = createMockGameState([
      { id: 'local_player_1', name: 'Alice', position: { x: 5, y: 5 }, score: 0 },
      { id: 'local_player_2', name: 'Bob', position: { x: 5, y: 5 }, score: 0 }
    ]);
    
    // Both players should be able to move from the same position
    integration.handlePlayerMove('local_player_1', 'right');
    integration.handlePlayerMove('local_player_2', 'left');
    
    // Players should have moved (no blocking)
    assertTrue(alice.position.x !== bob.position.x, 'Players should be able to move past each other');
  });

  test('Collision cooldown prevents spam damage', () => {
    const integration = new LocalMultiplayerIntegration();
    const playerNames = ['Alice'];
    
    integration.initializeGame(playerNames);
    
    const players = [
      { id: 'local_player_1', name: 'Alice', position: { x: 3, y: 3 }, score: 100 }
    ];
    
    const enemies = [
      { id: 'enemy1', x: 3, y: 3 }
    ];
    
    window.gameState = createMockGameState(players, [], enemies);
    
    // First collision
    integration.processCollisions();
    const scoreAfterFirst = integration.getPlayer('local_player_1').score;
    
    // Immediate second collision (should be on cooldown)
    integration.processCollisions();
    const scoreAfterSecond = integration.getPlayer('local_player_1').score;
    
    assertEquals(scoreAfterFirst, scoreAfterSecond, 'Score should not change during cooldown period');
  });

  test('Win condition check works after coin collection', () => {
    const integration = new LocalMultiplayerIntegration();
    const playerNames = ['Alice'];
    
    // Set low target score for easy testing
    integration.initializeGame(playerNames, { targetScore: 20 });
    
    const alice = integration.getPlayer('local_player_1');
    alice.score = 15; // Close to winning
    
    const players = [
      { id: 'local_player_1', name: 'Alice', position: { x: 5, y: 5 }, score: 15 }
    ];
    
    const coins = [
      { id: 'coin1', x: 5, y: 5, collected: false, type: 'normal' }
    ];
    
    window.gameState = createMockGameState(players, coins);
    
    // Mock showWinnerScreen to track if it's called
    let winnerCalled = false;
    const originalShowWinner = window.showWinnerScreen;
    window.showWinnerScreen = (data) => {
      winnerCalled = true;
      assertEquals(data.winnerId, 'local_player_1', 'Alice should be the winner');
    };
    
    // Process collisions (should trigger win)
    integration.processCollisions();
    
    assertTrue(winnerCalled, 'Win condition should be triggered');
    
    // Restore original function
    window.showWinnerScreen = originalShowWinner;
  });

  test('Collision resolver statistics are accessible', () => {
    const integration = new LocalMultiplayerIntegration();
    const playerNames = ['Alice', 'Bob'];
    
    integration.initializeGame(playerNames);
    
    const resolver = integration.getCollisionResolver();
    const stats = resolver.getCollisionStats();
    
    assertTrue(typeof stats.historySize === 'number', 'History size should be a number');
    assertTrue(typeof stats.queueSize === 'number', 'Queue size should be a number');
    assertTrue(typeof stats.lastCheck === 'number', 'Last check should be a number');
  });

  test('Collision resolver cleanup works properly', () => {
    const integration = new LocalMultiplayerIntegration();
    const playerNames = ['Alice'];
    
    integration.initializeGame(playerNames);
    
    const resolver = integration.getCollisionResolver();
    
    // Create some collision history
    const players = [
      { id: 'local_player_1', name: 'Alice', position: { x: 3, y: 3 }, score: 100 }
    ];
    
    const enemies = [
      { id: 'enemy1', x: 3, y: 3 }
    ];
    
    window.gameState = createMockGameState(players, [], enemies);
    integration.processCollisions();
    
    // Should have some collision history
    assertTrue(resolver.getCollisionStats().historySize >= 0, 'Should have collision history');
    
    // Cleanup
    integration.destroy();
    
    // Collision resolver should be cleaned up
    const cleanedResolver = integration.getCollisionResolver();
    assertTrue(cleanedResolver === null, 'Collision resolver should be null after cleanup');
  });

  // Return test results
  console.log(`\nCollisionResolver Integration Tests Complete:`);
  console.log(`Passed: ${results.passed}/${results.total}`);
  console.log(`Failed: ${results.failed}/${results.total}`);
  
  if (results.failed > 0) {
    console.log('\nFailed tests:');
    results.details.filter(d => d.status === 'FAIL').forEach(d => {
      console.log(`- ${d.name}: ${d.error}`);
    });
  }
  
  return results;
}

// Export test function
if (typeof window !== 'undefined') {
  window.runCollisionResolverIntegrationTests = runCollisionResolverIntegrationTests;
} else if (typeof global !== 'undefined') {
  global.runCollisionResolverIntegrationTests = runCollisionResolverIntegrationTests;
}

console.log("CollisionResolver integration tests loaded");