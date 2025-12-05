// Collision Detection and Resolution System for Local Multiplayer
console.log("Collision resolver script loaded");

/**
 * CollisionResolver class - Handles all collision detection and resolution for local multiplayer
 */
class CollisionResolver {
  constructor() {
    this.collisionHistory = new Map(); // Track recent collisions to prevent spam
    this.coinCollectionQueue = []; // Queue for fair coin collection
    this.lastCollisionCheck = 0;
    this.COLLISION_COOLDOWN = 100; // ms between collision checks for same entities
  }

  /**
   * Resolve player-to-player collisions
   * Players can occupy the same space but don't block movement
   */
  resolvePlayerCollision(player1, player2) {
    if (!player1 || !player2 || player1.id === player2.id) {
      return { collision: false };
    }

    // Check if players are at the same position
    const collision = player1.position.x === player2.position.x && 
                     player1.position.y === player2.position.y;

    if (collision) {
      const collisionKey = `${player1.id}_${player2.id}`;
      const now = Date.now();
      
      // Check collision cooldown to prevent spam
      if (this.collisionHistory.has(collisionKey)) {
        const lastCollision = this.collisionHistory.get(collisionKey);
        if (now - lastCollision < this.COLLISION_COOLDOWN) {
          return { collision: true, handled: false };
        }
      }

      // Update collision history
      this.collisionHistory.set(collisionKey, now);
      this.collisionHistory.set(`${player2.id}_${player1.id}`, now);

      // Players don't block each other's movement in local multiplayer
      // This allows for more dynamic gameplay
      return {
        collision: true,
        handled: true,
        effect: 'overlap',
        players: [player1.id, player2.id]
      };
    }

    return { collision: false };
  }

  /**
   * Resolve player-to-coin collision with fair priority system
   */
  resolvePlayerCoinCollision(players, coins) {
    const collisions = [];
    const now = Date.now();

    // Clear old collision queue entries
    this.coinCollectionQueue = this.coinCollectionQueue.filter(
      entry => now - entry.timestamp < 50 // 50ms window for fair collection
    );

    // Check each coin against all players
    coins.forEach(coin => {
      if (coin.collected) return;

      const playersAtCoin = players.filter(player => 
        player.position.x === coin.x && 
        player.position.y === coin.y &&
        player.isActive
      );

      if (playersAtCoin.length === 0) return;

      if (playersAtCoin.length === 1) {
        // Single player collision - straightforward
        const player = playersAtCoin[0];
        collisions.push({
          type: 'coin',
          playerId: player.id,
          coinId: coin.id,
          coinType: coin.type || 'normal',
          position: { x: coin.x, y: coin.y },
          priority: 1
        });
      } else {
        // Multiple players at same coin - use fair priority system
        const winner = this.determineCoinCollectionPriority(playersAtCoin, coin);
        if (winner) {
          collisions.push({
            type: 'coin',
            playerId: winner.id,
            coinId: coin.id,
            coinType: coin.type || 'normal',
            position: { x: coin.x, y: coin.y },
            priority: playersAtCoin.length,
            contested: true,
            contestants: playersAtCoin.map(p => p.id)
          });
        }
      }
    });

    return collisions;
  }

  /**
   * Determine fair coin collection priority when multiple players collide
   */
  determineCoinCollectionPriority(players, coin) {
    const now = Date.now();
    
    // Add all players to the collection queue with timestamps
    players.forEach(player => {
      const existingEntry = this.coinCollectionQueue.find(
        entry => entry.playerId === player.id && entry.coinId === coin.id
      );
      
      if (!existingEntry) {
        this.coinCollectionQueue.push({
          playerId: player.id,
          coinId: coin.id,
          timestamp: now,
          playerScore: player.score
        });
      }
    });

    // Get all entries for this coin
    const coinEntries = this.coinCollectionQueue.filter(
      entry => entry.coinId === coin.id
    );

    if (coinEntries.length === 0) return null;

    // Priority system:
    // 1. First arrival (earliest timestamp)
    // 2. If timestamps are very close (< 16ms), favor player with lower score
    // 3. If scores are equal, use player ID for consistency

    coinEntries.sort((a, b) => {
      const timeDiff = a.timestamp - b.timestamp;
      
      // If timestamps are very close (within one frame), use score-based fairness
      if (Math.abs(timeDiff) < 16) {
        const scoreDiff = a.playerScore - b.playerScore;
        if (scoreDiff !== 0) {
          return scoreDiff; // Lower score gets priority
        }
        // If scores are equal, use consistent player ID ordering
        return a.playerId.localeCompare(b.playerId);
      }
      
      return timeDiff; // Earlier timestamp wins
    });

    const winnerEntry = coinEntries[0];
    const winner = players.find(p => p.id === winnerEntry.playerId);

    // Remove all entries for this coin from the queue
    this.coinCollectionQueue = this.coinCollectionQueue.filter(
      entry => entry.coinId !== coin.id
    );

    return winner;
  }

  /**
   * Resolve player-to-enemy collision for multiple players
   */
  resolvePlayerEnemyCollision(players, enemies) {
    const collisions = [];
    const now = Date.now();

    enemies.forEach(enemy => {
      const playersAtEnemy = players.filter(player =>
        player.position.x === enemy.x &&
        player.position.y === enemy.y &&
        player.isActive
      );

      playersAtEnemy.forEach(player => {
        const collisionKey = `${player.id}_enemy_${enemy.id}`;
        
        // Check collision cooldown
        if (this.collisionHistory.has(collisionKey)) {
          const lastCollision = this.collisionHistory.get(collisionKey);
          if (now - lastCollision < this.COLLISION_COOLDOWN) {
            return; // Skip this collision
          }
        }

        // Update collision history
        this.collisionHistory.set(collisionKey, now);

        collisions.push({
          type: 'enemy',
          playerId: player.id,
          enemyId: enemy.id,
          position: { x: enemy.x, y: enemy.y },
          damage: 5 // Default enemy damage
        });
      });
    });

    return collisions;
  }

  /**
   * Resolve player-to-bomb collision
   */
  resolvePlayerBombCollision(players, bombs) {
    const collisions = [];
    const now = Date.now();

    bombs.forEach(bomb => {
      if (bomb.exploded) return;

      const playersAtBomb = players.filter(player =>
        player.position.x === bomb.x &&
        player.position.y === bomb.y &&
        player.isActive
      );

      playersAtBomb.forEach(player => {
        const collisionKey = `${player.id}_bomb_${bomb.id}`;
        
        // Check collision cooldown
        if (this.collisionHistory.has(collisionKey)) {
          const lastCollision = this.collisionHistory.get(collisionKey);
          if (now - lastCollision < this.COLLISION_COOLDOWN) {
            return; // Skip this collision
          }
        }

        // Update collision history
        this.collisionHistory.set(collisionKey, now);

        collisions.push({
          type: 'bomb',
          playerId: player.id,
          bombId: bomb.id,
          position: { x: bomb.x, y: bomb.y },
          damage: 20 // Default bomb damage
        });
      });
    });

    return collisions;
  }

  /**
   * Check if a position is valid for movement (not blocked by walls)
   */
  isValidPosition(x, y, gameState) {
    // Check map boundaries
    if (x < 1 || x >= gameState.mapWidth - 1 || 
        y < 1 || y >= gameState.mapHeight - 1) {
      return false;
    }

    // In this game, walls are only at the boundaries
    // Players can move freely within the play area
    return true;
  }

  /**
   * Check if movement would cause collision with walls
   */
  checkWallCollision(fromX, fromY, toX, toY, gameState) {
    return !this.isValidPosition(toX, toY, gameState);
  }

  /**
   * Process all collisions for a game state update
   */
  processAllCollisions(gameState) {
    if (!gameState || !gameState.players) {
      return { collisions: [], updates: [] };
    }

    const players = Object.values(gameState.players).filter(p => p.isActive !== false);
    const coins = gameState.coins || [];
    const enemies = gameState.enemies || [];
    const bombs = gameState.bombs || [];

    const allCollisions = [];
    const updates = [];

    // Process player-to-player collisions
    for (let i = 0; i < players.length; i++) {
      for (let j = i + 1; j < players.length; j++) {
        const collision = this.resolvePlayerCollision(players[i], players[j]);
        if (collision.collision && collision.handled) {
          allCollisions.push(collision);
        }
      }
    }

    // Process player-to-coin collisions
    const coinCollisions = this.resolvePlayerCoinCollision(players, coins);
    allCollisions.push(...coinCollisions);

    // Process coin collection updates
    coinCollisions.forEach(collision => {
      const coin = coins.find(c => c.id === collision.coinId);
      if (coin) {
        coin.collected = true;
        updates.push({
          type: 'coin_collected',
          playerId: collision.playerId,
          coinId: collision.coinId,
          coinType: collision.coinType,
          contested: collision.contested || false
        });
      }
    });

    // Process player-to-enemy collisions
    const enemyCollisions = this.resolvePlayerEnemyCollision(players, enemies);
    allCollisions.push(...enemyCollisions);

    // Process player-to-bomb collisions
    const bombCollisions = this.resolvePlayerBombCollision(players, bombs);
    allCollisions.push(...bombCollisions);

    // Mark bombs as exploded
    bombCollisions.forEach(collision => {
      const bomb = bombs.find(b => b.id === collision.bombId);
      if (bomb) {
        bomb.exploded = true;
        updates.push({
          type: 'bomb_exploded',
          playerId: collision.playerId,
          bombId: collision.bombId
        });
      }
    });

    return {
      collisions: allCollisions,
      updates: updates
    };
  }

  /**
   * Get collision statistics for debugging
   */
  getCollisionStats() {
    return {
      historySize: this.collisionHistory.size,
      queueSize: this.coinCollectionQueue.length,
      lastCheck: this.lastCollisionCheck
    };
  }

  /**
   * Clear collision history (useful for game reset)
   */
  clearHistory() {
    this.collisionHistory.clear();
    this.coinCollectionQueue = [];
    this.lastCollisionCheck = 0;
  }

  /**
   * Validate collision resolver state
   */
  validate() {
    const errors = [];
    
    if (!(this.collisionHistory instanceof Map)) {
      errors.push('Collision history must be a Map');
    }
    
    if (!Array.isArray(this.coinCollectionQueue)) {
      errors.push('Coin collection queue must be an array');
    }
    
    if (typeof this.COLLISION_COOLDOWN !== 'number' || this.COLLISION_COOLDOWN < 0) {
      errors.push('Collision cooldown must be a non-negative number');
    }
    
    return errors;
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.CollisionResolver = CollisionResolver;
} else if (typeof global !== 'undefined') {
  global.CollisionResolver = CollisionResolver;
}

console.log("CollisionResolver class loaded successfully");