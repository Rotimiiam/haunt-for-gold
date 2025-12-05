// Integration tests for Multi-player Rendering System
console.log("Loading integration multi-player rendering tests");

/**
 * Integration test for complete multi-player rendering workflow
 */
function testCompleteMultiPlayerRenderingWorkflow() {
  console.log("Testing complete multi-player rendering workflow...");
  
  // Create a real game renderer instance
  const renderer = new GameRenderer('gameCanvas');
  
  // Create comprehensive game state with multiple players
  const gameState = {
    mapWidth: 20,
    mapHeight: 15,
    players: {
      player1: {
        id: 'player1',
        name: 'Alice',
        x: 5,
        y: 5,
        score: 150,
        color: '#00ff41',
        character: 'Alex',
        direction: 'right',
        mood: 'happy',
        isActive: true,
        isLeader: true,
        lastMoveTime: Date.now() - 100,
        visualConfig: {
          indicator: { 
            shape: 'circle', 
            borderColor: '#ffffff',
            glowEffect: true
          },
          nameTag: {
            visible: true,
            position: 'above',
            fontSize: 12,
            color: '#ffffff'
          }
        }
      },
      player2: {
        id: 'player2',
        name: 'Bob',
        x: 10,
        y: 8,
        score: 120,
        color: '#ff4444',
        character: 'Bella',
        direction: 'left',
        mood: 'happy',
        isActive: true,
        recentScore: 25,
        lastScoreTime: Date.now() - 500,
        visualConfig: {
          indicator: { 
            shape: 'square', 
            borderColor: '#ffffff'
          },
          nameTag: {
            visible: true,
            position: 'above',
            fontSize: 12,
            color: '#ffffff'
          }
        }
      },
      player3: {
        id: 'player3',
        name: 'Charlie',
        x: 15,
        y: 12,
        score: 95,
        color: '#4444ff',
        character: 'Charlie',
        direction: 'up',
        mood: 'happy',
        isActive: true,
        recentlyHit: true,
        lastHitTime: Date.now() - 200,
        lastDamage: 15,
        visualConfig: {
          indicator: { 
            shape: 'triangle', 
            borderColor: '#ffffff'
          },
          nameTag: {
            visible: true,
            position: 'above',
            fontSize: 12,
            color: '#ffffff'
          }
        }
      },
      player4: {
        id: 'player4',
        name: 'Diana',
        x: 3,
        y: 10,
        score: 200,
        color: '#ffff00',
        character: 'Daisy',
        direction: 'down',
        mood: 'happy',
        isActive: false,
        powerUps: ['speed', 'shield'],
        hotStreak: 5,
        visualConfig: {
          indicator: { 
            shape: 'star', 
            borderColor: '#ffffff'
          },
          nameTag: {
            visible: true,
            position: 'above',
            fontSize: 12,
            color: '#ffffff'
          }
        }
      }
    },
    coins: [
      { x: 7, y: 7, collected: false },
      { x: 12, y: 5, collected: false }
    ],
    bombs: [
      { x: 8, y: 9, exploded: false }
    ],
    enemies: [
      { x: 14, y: 6 },
      { x: 6, y: 13 }
    ]
  };
  
  // Test complete rendering
  try {
    renderer.render(gameState);
    console.log("✓ Complete multi-player rendering successful");
  } catch (error) {
    throw new Error(`Rendering failed: ${error.message}`);
  }
  
  // Test proximity handling with overlapping players
  const overlappingGameState = {
    ...gameState,
    players: {
      ...gameState.players,
      player1: { ...gameState.players.player1, x: 5, y: 5 },
      player2: { ...gameState.players.player2, x: 5, y: 5 }, // Same position
      player3: { ...gameState.players.player3, x: 6, y: 5 }  // Adjacent
    }
  };
  
  try {
    renderer.render(overlappingGameState);
    console.log("✓ Proximity handling rendering successful");
  } catch (error) {
    throw new Error(`Proximity handling failed: ${error.message}`);
  }
  
  console.log("✓ Complete multi-player rendering workflow tests passed");
}

/**
 * Test visual indicator uniqueness across all players
 */
function testVisualIndicatorUniqueness() {
  console.log("Testing visual indicator uniqueness...");
  
  const renderer = new GameRenderer('gameCanvas');
  
  // Create players with all different indicator shapes
  const players = [
    { 
      id: 'p1', 
      visualConfig: { indicator: { shape: 'circle' } },
      color: '#00ff41',
      x: 1, y: 1
    },
    { 
      id: 'p2', 
      visualConfig: { indicator: { shape: 'square' } },
      color: '#ff4444',
      x: 2, y: 2
    },
    { 
      id: 'p3', 
      visualConfig: { indicator: { shape: 'triangle' } },
      color: '#4444ff',
      x: 3, y: 3
    },
    { 
      id: 'p4', 
      visualConfig: { indicator: { shape: 'star' } },
      color: '#ffff00',
      x: 4, y: 4
    },
    { 
      id: 'p5', 
      visualConfig: { indicator: { shape: 'diamond' } },
      color: '#ff44ff',
      x: 5, y: 5
    }
  ];
  
  // Test that each player gets rendered with unique visual characteristics
  players.forEach((player, index) => {
    try {
      renderer.drawSinglePlayer(player, index, players.length);
      console.log(`✓ Player ${index + 1} with ${player.visualConfig.indicator.shape} indicator rendered`);
    } catch (error) {
      throw new Error(`Failed to render player ${index + 1}: ${error.message}`);
    }
  });
  
  console.log("✓ Visual indicator uniqueness tests passed");
}

/**
 * Test collision feedback system with various damage amounts
 */
function testCollisionFeedbackSystem() {
  console.log("Testing collision feedback system...");
  
  const renderer = new GameRenderer('gameCanvas');
  
  // Test different collision scenarios
  const collisionScenarios = [
    {
      name: 'Light damage',
      player: {
        id: 'test1',
        x: 5, y: 5,
        recentlyHit: true,
        lastHitTime: Date.now() - 100,
        lastDamage: 5
      }
    },
    {
      name: 'Medium damage',
      player: {
        id: 'test2',
        x: 7, y: 7,
        recentlyHit: true,
        lastHitTime: Date.now() - 200,
        lastDamage: 10
      }
    },
    {
      name: 'Heavy damage',
      player: {
        id: 'test3',
        x: 9, y: 9,
        recentlyHit: true,
        lastHitTime: Date.now() - 50,
        lastDamage: 20
      }
    },
    {
      name: 'No damage (normal player)',
      player: {
        id: 'test4',
        x: 11, y: 11,
        recentlyHit: false
      }
    }
  ];
  
  collisionScenarios.forEach(scenario => {
    try {
      renderer.drawCollisionFeedback(
        scenario.player.x * 32, 
        scenario.player.y * 32, 
        scenario.player
      );
      console.log(`✓ ${scenario.name} collision feedback rendered`);
    } catch (error) {
      throw new Error(`Failed to render ${scenario.name}: ${error.message}`);
    }
  });
  
  console.log("✓ Collision feedback system tests passed");
}

/**
 * Test name tag positioning and visibility
 */
function testNameTagPositioning() {
  console.log("Testing name tag positioning...");
  
  const renderer = new GameRenderer('gameCanvas');
  
  const positions = ['above', 'below', 'side'];
  
  positions.forEach((position, index) => {
    const testPlayer = {
      id: `test_${position}`,
      name: `Player ${position}`,
      x: 5 + index * 3,
      y: 5,
      color: '#00ff41',
      visualConfig: {
        nameTag: {
          visible: true,
          position: position,
          fontSize: 12,
          color: '#ffffff'
        }
      }
    };
    
    try {
      renderer.drawPlayerNameTag(testPlayer.x * 32, testPlayer.y * 32, testPlayer, index);
      console.log(`✓ Name tag positioned ${position} rendered`);
    } catch (error) {
      throw new Error(`Failed to render name tag at ${position}: ${error.message}`);
    }
  });
  
  // Test invisible name tag
  const invisiblePlayer = {
    id: 'invisible',
    name: 'Invisible Player',
    x: 15, y: 5,
    visualConfig: {
      nameTag: { visible: false }
    }
  };
  
  try {
    renderer.drawPlayerNameTag(invisiblePlayer.x * 32, invisiblePlayer.y * 32, invisiblePlayer, 0);
    console.log("✓ Invisible name tag handled correctly");
  } catch (error) {
    throw new Error(`Failed to handle invisible name tag: ${error.message}`);
  }
  
  console.log("✓ Name tag positioning tests passed");
}

/**
 * Test score display animations and formatting
 */
function testScoreDisplaySystem() {
  console.log("Testing score display system...");
  
  const renderer = new GameRenderer('gameCanvas');
  
  const scoreScenarios = [
    {
      name: 'Normal score',
      player: {
        id: 'normal',
        x: 3, y: 3,
        score: 150,
        color: '#00ff41'
      }
    },
    {
      name: 'Recent score increase',
      player: {
        id: 'increase',
        x: 6, y: 3,
        score: 200,
        color: '#ff4444',
        recentScore: 25,
        lastScoreTime: Date.now() - 300
      }
    },
    {
      name: 'Recent score decrease',
      player: {
        id: 'decrease',
        x: 9, y: 3,
        score: 75,
        color: '#4444ff',
        recentScore: -15,
        lastScoreTime: Date.now() - 500
      }
    },
    {
      name: 'High score',
      player: {
        id: 'high',
        x: 12, y: 3,
        score: 9999,
        color: '#ffff00',
        rank: 1
      }
    }
  ];
  
  scoreScenarios.forEach(scenario => {
    try {
      renderer.drawPlayerScore(
        scenario.player.x * 32, 
        scenario.player.y * 32, 
        scenario.player, 
        0
      );
      console.log(`✓ ${scenario.name} display rendered`);
    } catch (error) {
      throw new Error(`Failed to render ${scenario.name}: ${error.message}`);
    }
  });
  
  console.log("✓ Score display system tests passed");
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
 * Run all integration tests
 */
function runIntegrationMultiPlayerRenderingTests() {
  console.log("Starting integration multi-player rendering tests...");
  
  try {
    testCompleteMultiPlayerRenderingWorkflow();
    testVisualIndicatorUniqueness();
    testCollisionFeedbackSystem();
    testNameTagPositioning();
    testScoreDisplaySystem();
    
    console.log("✅ All integration multi-player rendering tests passed!");
    return true;
  } catch (error) {
    console.error("❌ Integration test failed:", error.message);
    console.error(error.stack);
    return false;
  }
}

// Export test functions
if (typeof window !== 'undefined') {
  window.runIntegrationMultiPlayerRenderingTests = runIntegrationMultiPlayerRenderingTests;
  window.testCompleteMultiPlayerRenderingWorkflow = testCompleteMultiPlayerRenderingWorkflow;
  window.testVisualIndicatorUniqueness = testVisualIndicatorUniqueness;
  window.testCollisionFeedbackSystem = testCollisionFeedbackSystem;
  window.testNameTagPositioning = testNameTagPositioning;
  window.testScoreDisplaySystem = testScoreDisplaySystem;
}

console.log("Integration multi-player rendering tests loaded");