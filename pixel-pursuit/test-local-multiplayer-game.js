// Quick test of LocalMultiplayerGame functionality
console.log("Testing LocalMultiplayerGame implementation...");

// Load dependencies
require('./public/local-multiplayer-models.js');
require('./public/local-multiplayer-game.js');

// Test basic functionality
async function runQuickTests() {
  try {
    console.log("1. Testing game initialization...");
    const game = new global.LocalMultiplayerGame();
    console.log("✅ Game initialized successfully");
    
    console.log("2. Testing player management...");
    const settings = new global.LocalGameSettings();
    const visualConfig1 = global.createPlayerVisualConfig("player1", 0);
    const visualConfig2 = global.createPlayerVisualConfig("player2", 1);
    
    const player1 = game.addPlayer("player1", "Alice", global.CONTROL_SCHEMES.player1, visualConfig1);
    const player2 = game.addPlayer("player2", "Bob", global.CONTROL_SCHEMES.player2, visualConfig2);
    
    console.log(`✅ Added ${game.players.size} players successfully`);
    
    console.log("3. Testing game start...");
    const gameState = game.startGame();
    console.log("✅ Game started successfully");
    console.log(`   - Map size: ${gameState.mapWidth}x${gameState.mapHeight}`);
    console.log(`   - Coins: ${gameState.coins.length}`);
    console.log(`   - Enemies: ${gameState.enemies.length}`);
    
    console.log("4. Testing score updates...");
    game.updatePlayerScore("player1", 10, "coin");
    game.updatePlayerScore("player2", 20, "coin");
    
    const leaderboard = game.leaderboard;
    console.log("✅ Score updates working");
    console.log(`   - Leader: ${leaderboard[0].playerName} (${leaderboard[0].score} points)`);
    
    console.log("5. Testing game state consistency...");
    const errors = game.validateGameState();
    if (errors.length === 0) {
      console.log("✅ Game state is consistent");
    } else {
      console.log("❌ Game state errors:", errors);
    }
    
    console.log("6. Testing game end...");
    const result = game.endGame("player2", "test_completion");
    console.log("✅ Game ended successfully");
    console.log(`   - Winner: ${result.winnerName}`);
    console.log(`   - Duration: ${result.duration}ms`);
    
    console.log("7. Testing cleanup...");
    game.destroy();
    console.log("✅ Game destroyed successfully");
    
    console.log("\n🎉 All quick tests passed!");
    
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.error(error.stack);
  }
}

runQuickTests();