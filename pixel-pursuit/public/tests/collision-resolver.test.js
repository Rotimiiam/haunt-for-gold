// Tests for CollisionResolver class
console.log("Loading collision resolver tests");

// Test suite for CollisionResolver
function runCollisionResolverTests() {
  console.log("Running CollisionResolver tests...");
  
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

  // Create test data helpers
  function createTestPlayer(id, x, y, score = 0) {
    return {
      id: id,
      position: { x: x, y: y },
      score: score,
      isActive: true
    };
  }

  function createTestCoin(id, x, y, type = 'normal') {
    return {
      id: id,
      x: x,
      y: y,
      type: type,
      collected: false
    };
  }

  function createTestEnemy(id, x, y) {
    return {
      id: id,
      x: x,
      y: y
    };
  }

  function createTestBomb(id, x, y) {
    return {
      id: id,
      x: x,
      y: y,
      exploded: false
    };
  }

  function createTestGameState(players, coins = [], enemies = [], bombs = []) {
    return {
      players: players.reduce((acc, player) => {
        acc[player.id] = player;
        return acc;
      }, {}),
      coins: coins,
      enemies: enemies,
      bombs: bombs,
      mapWidth: 20,
      mapHeight: 15
    };
  }

  // Test CollisionResolver instantiation
  test('CollisionResolver can be instantiated', () => {
    const resolver = new CollisionResolver();
    assertTrue(resolver instanceof CollisionResolver);
    assertTrue(resolver.collisionHistory instanceof Map);
    assertTrue(Array.isArray(resolver.coinCollectionQueue));
  });

  // Test validation
  test('CollisionResolver validation works', () => {
    const resolver = new CollisionResolver();
    const errors = resolver.validate();
    assertEquals(errors.length, 0, 'New resolver should have no validation errors');
  });

  // Test player-to-player collision detection
  test('Player-to-player collision detection - no collision', () => {
    const resolver = new CollisionResolver();
    const player1 = createTestPlayer('p1', 1, 1);
    const player2 = createTestPlayer('p2', 2, 2);
    
    const result = resolver.resolvePlayerCollision(player1, player2);
    assertFalse(result.collision, 'Players at different positions should not collide');
  });

  test('Player-to-player collision detection - collision detected', () => {
    const resolver = new CollisionResolver();
    const player1 = createTestPlayer('p1', 1, 1);
    const player2 = createTestPlayer('p2', 1, 1);
    
    const result = resolver.resolvePlayerCollision(player1, player2);
    assertTrue(result.collision, 'Players at same position should collide');
    assertTrue(result.handled, 'Collision should be handled');
    assertEquals(result.effect, 'overlap', 'Effect should be overlap');
  });

  test('Player-to-player collision - same player ignored', () => {
    const resolver = new CollisionResolver();
    const player1 = createTestPlayer('p1', 1, 1);
    
    const result = resolver.resolvePlayerCollision(player1, player1);
    assertFalse(result.collision, 'Same player should not collide with itself');
  });

  test('Player-to-player collision cooldown works', () => {
    const resolver = new CollisionResolver();
    const player1 = createTestPlayer('p1', 1, 1);
    const player2 = createTestPlayer('p2', 1, 1);
    
    // First collision
    const result1 = resolver.resolvePlayerCollision(player1, player2);
    assertTrue(result1.collision && result1.handled, 'First collision should be handled');
    
    // Immediate second collision (should be on cooldown)
    const result2 = resolver.resolvePlayerCollision(player1, player2);
    assertTrue(result2.collision, 'Collision should still be detected');
    assertFalse(result2.handled, 'Second collision should not be handled due to cooldown');
  });

  // Test single player coin collection
  test('Single player coin collection', () => {
    const resolver = new CollisionResolver();
    const players = [createTestPlayer('p1', 5, 5)];
    const coins = [createTestCoin('c1', 5, 5)];
    
    const collisions = resolver.resolvePlayerCoinCollision(players, coins);
    assertEquals(collisions.length, 1, 'Should detect one coin collision');
    assertEquals(collisions[0].playerId, 'p1', 'Player 1 should collect the coin');
    assertEquals(collisions[0].coinId, 'c1', 'Coin 1 should be collected');
    assertEquals(collisions[0].priority, 1, 'Single player should have priority 1');
  });

  test('Multiple players coin collection - fair priority', () => {
    const resolver = new CollisionResolver();
    const players = [
      createTestPlayer('p1', 5, 5, 10), // Higher score
      createTestPlayer('p2', 5, 5, 5)   // Lower score
    ];
    const coins = [createTestCoin('c1', 5, 5)];
    
    const collisions = resolver.resolvePlayerCoinCollision(players, coins);
    assertEquals(collisions.length, 1, 'Should detect one coin collision');
    assertEquals(collisions[0].playerId, 'p2', 'Player with lower score should get priority');
    assertTrue(collisions[0].contested, 'Collision should be marked as contested');
    assertEquals(collisions[0].contestants.length, 2, 'Should have 2 contestants');
  });

  test('Coin collection ignores collected coins', () => {
    const resolver = new CollisionResolver();
    const players = [createTestPlayer('p1', 5, 5)];
    const coins = [createTestCoin('c1', 5, 5)];
    coins[0].collected = true;
    
    const collisions = resolver.resolvePlayerCoinCollision(players, coins);
    assertEquals(collisions.length, 0, 'Should not detect collision with collected coin');
  });

  test('Coin collection ignores inactive players', () => {
    const resolver = new CollisionResolver();
    const players = [createTestPlayer('p1', 5, 5)];
    players[0].isActive = false;
    const coins = [createTestCoin('c1', 5, 5)];
    
    const collisions = resolver.resolvePlayerCoinCollision(players, coins);
    assertEquals(collisions.length, 0, 'Should not detect collision with inactive player');
  });

  // Test enemy collision detection
  test('Player-to-enemy collision detection', () => {
    const resolver = new CollisionResolver();
    const players = [createTestPlayer('p1', 3, 3)];
    const enemies = [createTestEnemy('e1', 3, 3)];
    
    const collisions = resolver.resolvePlayerEnemyCollision(players, enemies);
    assertEquals(collisions.length, 1, 'Should detect one enemy collision');
    assertEquals(collisions[0].playerId, 'p1', 'Player 1 should collide with enemy');
    assertEquals(collisions[0].enemyId, 'e1', 'Enemy 1 should be involved');
    assertEquals(collisions[0].damage, 5, 'Default enemy damage should be 5');
  });

  test('Multiple players enemy collision', () => {
    const resolver = new CollisionResolver();
    const players = [
      createTestPlayer('p1', 3, 3),
      createTestPlayer('p2', 3, 3)
    ];
    const enemies = [createTestEnemy('e1', 3, 3)];
    
    const collisions = resolver.resolvePlayerEnemyCollision(players, enemies);
    assertEquals(collisions.length, 2, 'Should detect two enemy collisions');
    assertTrue(collisions.some(c => c.playerId === 'p1'), 'Player 1 should collide');
    assertTrue(collisions.some(c => c.playerId === 'p2'), 'Player 2 should collide');
  });

  test('Enemy collision cooldown works', () => {
    const resolver = new CollisionResolver();
    const players = [createTestPlayer('p1', 3, 3)];
    const enemies = [createTestEnemy('e1', 3, 3)];
    
    // First collision
    const collisions1 = resolver.resolvePlayerEnemyCollision(players, enemies);
    assertEquals(collisions1.length, 1, 'First collision should be detected');
    
    // Immediate second collision (should be on cooldown)
    const collisions2 = resolver.resolvePlayerEnemyCollision(players, enemies);
    assertEquals(collisions2.length, 0, 'Second collision should be on cooldown');
  });

  // Test bomb collision detection
  test('Player-to-bomb collision detection', () => {
    const resolver = new CollisionResolver();
    const players = [createTestPlayer('p1', 7, 7)];
    const bombs = [createTestBomb('b1', 7, 7)];
    
    const collisions = resolver.resolvePlayerBombCollision(players, bombs);
    assertEquals(collisions.length, 1, 'Should detect one bomb collision');
    assertEquals(collisions[0].playerId, 'p1', 'Player 1 should collide with bomb');
    assertEquals(collisions[0].bombId, 'b1', 'Bomb 1 should be involved');
    assertEquals(collisions[0].damage, 20, 'Default bomb damage should be 20');
  });

  test('Bomb collision ignores exploded bombs', () => {
    const resolver = new CollisionResolver();
    const players = [createTestPlayer('p1', 7, 7)];
    const bombs = [createTestBomb('b1', 7, 7)];
    bombs[0].exploded = true;
    
    const collisions = resolver.resolvePlayerBombCollision(players, bombs);
    assertEquals(collisions.length, 0, 'Should not detect collision with exploded bomb');
  });

  // Test position validation
  test('Position validation - valid positions', () => {
    const resolver = new CollisionResolver();
    const gameState = { mapWidth: 20, mapHeight: 15 };
    
    assertTrue(resolver.isValidPosition(1, 1, gameState), 'Position (1,1) should be valid');
    assertTrue(resolver.isValidPosition(10, 7, gameState), 'Position (10,7) should be valid');
    assertTrue(resolver.isValidPosition(18, 13, gameState), 'Position (18,13) should be valid');
  });

  test('Position validation - invalid positions', () => {
    const resolver = new CollisionResolver();
    const gameState = { mapWidth: 20, mapHeight: 15 };
    
    assertFalse(resolver.isValidPosition(0, 5, gameState), 'Position (0,5) should be invalid (wall)');
    assertFalse(resolver.isValidPosition(19, 5, gameState), 'Position (19,5) should be invalid (wall)');
    assertFalse(resolver.isValidPosition(5, 0, gameState), 'Position (5,0) should be invalid (wall)');
    assertFalse(resolver.isValidPosition(5, 14, gameState), 'Position (5,14) should be invalid (wall)');
    assertFalse(resolver.isValidPosition(-1, 5, gameState), 'Position (-1,5) should be invalid (out of bounds)');
    assertFalse(resolver.isValidPosition(20, 5, gameState), 'Position (20,5) should be invalid (out of bounds)');
  });

  test('Wall collision detection', () => {
    const resolver = new CollisionResolver();
    const gameState = { mapWidth: 20, mapHeight: 15 };
    
    assertTrue(resolver.checkWallCollision(1, 1, 0, 1, gameState), 'Moving into wall should be collision');
    assertFalse(resolver.checkWallCollision(1, 1, 2, 1, gameState), 'Moving to valid position should not be collision');
  });

  // Test comprehensive collision processing
  test('Process all collisions - comprehensive test', () => {
    const resolver = new CollisionResolver();
    const players = [
      createTestPlayer('p1', 5, 5),
      createTestPlayer('p2', 5, 5), // Same position as p1
      createTestPlayer('p3', 7, 7)
    ];
    const coins = [
      createTestCoin('c1', 5, 5), // At p1 and p2 position
      createTestCoin('c2', 7, 7)  // At p3 position
    ];
    const enemies = [createTestEnemy('e1', 7, 7)]; // At p3 position
    const bombs = [createTestBomb('b1', 9, 9)];
    
    const gameState = createTestGameState(players, coins, enemies, bombs);
    const result = resolver.processAllCollisions(gameState);
    
    assertTrue(result.collisions.length > 0, 'Should detect multiple collisions');
    assertTrue(result.updates.length > 0, 'Should generate updates');
    
    // Check that coins are marked as collected
    const coinUpdates = result.updates.filter(u => u.type === 'coin_collected');
    assertEquals(coinUpdates.length, 2, 'Should have 2 coin collection updates');
  });

  test('Process all collisions - empty game state', () => {
    const resolver = new CollisionResolver();
    const gameState = createTestGameState([]);
    
    const result = resolver.processAllCollisions(gameState);
    assertEquals(result.collisions.length, 0, 'Empty game state should have no collisions');
    assertEquals(result.updates.length, 0, 'Empty game state should have no updates');
  });

  test('Process all collisions - null game state', () => {
    const resolver = new CollisionResolver();
    
    const result = resolver.processAllCollisions(null);
    assertEquals(result.collisions.length, 0, 'Null game state should have no collisions');
    assertEquals(result.updates.length, 0, 'Null game state should have no updates');
  });

  // Test collision statistics and management
  test('Collision statistics', () => {
    const resolver = new CollisionResolver();
    const stats = resolver.getCollisionStats();
    
    assertTrue(typeof stats.historySize === 'number', 'History size should be a number');
    assertTrue(typeof stats.queueSize === 'number', 'Queue size should be a number');
    assertTrue(typeof stats.lastCheck === 'number', 'Last check should be a number');
  });

  test('Clear collision history', () => {
    const resolver = new CollisionResolver();
    const player1 = createTestPlayer('p1', 1, 1);
    const player2 = createTestPlayer('p2', 1, 1);
    
    // Create some collision history
    resolver.resolvePlayerCollision(player1, player2);
    assertTrue(resolver.collisionHistory.size > 0, 'Should have collision history');
    
    // Clear history
    resolver.clearHistory();
    assertEquals(resolver.collisionHistory.size, 0, 'History should be cleared');
    assertEquals(resolver.coinCollectionQueue.length, 0, 'Queue should be cleared');
  });

  // Test edge cases
  test('Coin priority with equal scores and timestamps', () => {
    const resolver = new CollisionResolver();
    const players = [
      createTestPlayer('p2', 5, 5, 10), // Same score, different ID
      createTestPlayer('p1', 5, 5, 10)  // Same score, different ID
    ];
    const coins = [createTestCoin('c1', 5, 5)];
    
    const collisions = resolver.resolvePlayerCoinCollision(players, coins);
    assertEquals(collisions.length, 1, 'Should detect one coin collision');
    // With equal scores, should use consistent player ID ordering (p1 < p2)
    assertEquals(collisions[0].playerId, 'p1', 'Player with lexicographically smaller ID should win');
  });

  test('Multiple enemy collisions with same player', () => {
    const resolver = new CollisionResolver();
    const players = [createTestPlayer('p1', 5, 5)];
    const enemies = [
      createTestEnemy('e1', 5, 5),
      createTestEnemy('e2', 5, 5)
    ];
    
    const collisions = resolver.resolvePlayerEnemyCollision(players, enemies);
    assertEquals(collisions.length, 2, 'Should detect collisions with both enemies');
    assertTrue(collisions.every(c => c.playerId === 'p1'), 'All collisions should involve player 1');
  });

  // Performance test
  test('Performance with many entities', () => {
    const resolver = new CollisionResolver();
    const players = [];
    const coins = [];
    
    // Create many entities
    for (let i = 0; i < 100; i++) {
      players.push(createTestPlayer(`p${i}`, i % 10, Math.floor(i / 10)));
      coins.push(createTestCoin(`c${i}`, i % 10, Math.floor(i / 10)));
    }
    
    const gameState = createTestGameState(players, coins);
    
    const startTime = performance.now();
    const result = resolver.processAllCollisions(gameState);
    const endTime = performance.now();
    
    const duration = endTime - startTime;
    assertTrue(duration < 100, `Performance test should complete in < 100ms, took ${duration}ms`);
    assertTrue(result.collisions.length > 0, 'Should detect some collisions with many entities');
  });

  // Return test results
  console.log(`\nCollisionResolver Tests Complete:`);
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
  window.runCollisionResolverTests = runCollisionResolverTests;
} else if (typeof global !== 'undefined') {
  global.runCollisionResolverTests = runCollisionResolverTests;
}

console.log("CollisionResolver tests loaded");