require('dotenv').config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const passport = require("./config/passport.js");
const authRoutes = require("./routes/auth");
const { User, GameHistory, PlayerName } = require("./models");
const sequelize = require("./config/database");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Session configuration
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'goldgrab_secret_key',
  resave: false,
  saveUninitialized: false,
  store: new SequelizeStore({
    db: sequelize,
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    secure: process.env.NODE_ENV === 'production'
  }
});

// Share session with socket.io
const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));

// Socket.io authentication
io.use((socket, next) => {
  const session = socket.request.session;
  if (session && session.passport && session.passport.user) {
    // User is authenticated
    socket.userId = session.passport.user;
  }
  next();
});

// Connect to Database
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('SQLite connected successfully');
    // Sync models
    await sequelize.sync();
    console.log('Models synced');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(sessionMiddleware);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Serve static files with proper MIME types
app.use(express.static(path.join(__dirname, "public"), {
  setHeaders: (res, filePath) => {
    // Set proper MIME types for common file extensions
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (filePath.endsWith('.ttf')) {
      res.setHeader('Content-Type', 'font/ttf');
    } else if (filePath.endsWith('.html')) {
      res.setHeader('Content-Type', 'text/html');
    }
  }
}));

// API routes
app.use('/api/auth', authRoutes);

// Check if name is available (using SQLite)
app.post('/api/check-name', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim().length < 2) {
      return res.json({ available: false, error: 'Name too short' });
    }
    
    const normalizedName = name.trim().toLowerCase();
    
    // Check if name exists in database
    const existing = await PlayerName.findOne({
      where: { normalizedName }
    });
    
    res.json({ available: !existing });
  } catch (error) {
    console.error('Error checking name:', error);
    res.status(500).json({ available: false, error: 'Server error' });
  }
});

// Register a name (using SQLite)
app.post('/api/register-name', async (req, res) => {
  try {
    const { name, id } = req.body;
    
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Name too short' });
    }
    
    if (!id) {
      return res.status(400).json({ success: false, error: 'Player ID required' });
    }
    
    const normalizedName = name.trim().toLowerCase();
    const displayName = name.trim();
    
    // Check if name already exists
    const existing = await PlayerName.findOne({
      where: { normalizedName }
    });
    
    if (existing) {
      // Check if same player is updating their name
      if (existing.oderId === id) {
        // Update last seen
        existing.lastSeen = new Date();
        await existing.save();
        console.log(`Updated last seen for: ${displayName} (ID: ${id})`);
        return res.json({ success: true });
      }
      // Different player trying to use taken name
      return res.status(409).json({ success: false, error: 'Name already taken' });
    }
    
    // Create new player name entry
    await PlayerName.create({
      name: displayName,
      normalizedName,
      oderId: id,
      registeredAt: new Date(),
      lastSeen: new Date()
    });
    
    console.log(`Registered new name: ${displayName} (ID: ${id})`);
    res.json({ success: true });
  } catch (error) {
    console.error('Error registering name:', error);
    
    // Handle unique constraint violation
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, error: 'Name already taken' });
    }
    
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Game API routes for saving game results
app.post('/api/game/result', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { gameId, gameMode, score, opponent, result, duration, coinsCollected, enemiesHit, bombsHit } = req.body;

    // Validate required fields
    if (!gameId || !gameMode || score === undefined || !result) {
      return res.status(400).json({ error: 'Missing required game data' });
    }

    // Add game result to user's history
    // Note: req.user is a Sequelize instance now, and we added addGameResult method to it
    await req.user.addGameResult({
      gameId,
      gameMode,
      score,
      opponent,
      result,
      duration,
      coinsCollected,
      enemiesHit,
      bombsHit
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error saving game result:', error);
    res.status(500).json({ error: 'Failed to save game result' });
  }
});

// Health check endpoint for monitoring
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Game rooms management
// This Map supports multiple concurrent matches - each room is independent
// Keys are room IDs, values are room objects with their own players, coins, enemies, etc.
const gameRooms = new Map();
let nextRoomId = 1;

// Game room structure
function createGameRoom() {
  return {
    id: nextRoomId++,
    players: {},
    coins: [],
    bombs: [], // Separate bombs from coins
    enemies: [],
    mapWidth: 20,
    mapHeight: 15,
    gameStarted: false,
    maxPlayers: process.env.MAX_PLAYERS || 2,
    winningScore: process.env.WINNING_SCORE || 500,
    difficultyLevel: 1,
    totalPointsCollected: 0,
    difficultyThreshold: process.env.DIFFICULTY_THRESHOLD || 200,
    usedCharacters: new Set(), // Track which characters are in use in this room
    gameDuration: 60, // 1 minute game duration
    timeRemaining: 60,
    gameTimer: null,
    startTime: null,
  };
}

// Start game timer for a room
function startGameTimer(room) {
  room.startTime = Date.now();
  room.timeRemaining = room.gameDuration;
  
  // Clear any existing timer
  if (room.gameTimer) {
    clearInterval(room.gameTimer);
  }
  
  room.gameTimer = setInterval(() => {
    room.timeRemaining--;
    
    // Send time update to all players
    Object.keys(room.players).forEach(playerId => {
      io.to(playerId).emit("timeUpdate", {
        timeRemaining: room.timeRemaining,
        gameDuration: room.gameDuration
      });
    });
    
    // Check if time is up
    if (room.timeRemaining <= 0) {
      endGameByTime(room);
    }
  }, 1000);
  
  console.log(`[Timer] Started for room ${room.id} - ${room.gameDuration} seconds`);
}

// End game when time runs out
function endGameByTime(room) {
  // Stop the timer
  if (room.gameTimer) {
    clearInterval(room.gameTimer);
    room.gameTimer = null;
  }
  
  room.gameStarted = false;
  
  // Find the winner (highest score)
  const players = Object.values(room.players);
  if (players.length === 0) return;
  
  const sortedPlayers = players.sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const isTie = sortedPlayers.length > 1 && sortedPlayers[0].score === sortedPlayers[1].score;
  
  console.log(`[Timer] Game ended for room ${room.id} - Winner: ${winner.name} with ${winner.score} points`);
  
  // Notify all players
  Object.keys(room.players).forEach(playerId => {
    io.to(playerId).emit("gameWon", {
      winnerId: winner.id,
      winnerName: isTie ? "Tie" : winner.name,
      winnerScore: winner.score,
      reason: isTie ? "tie" : "time_up",
      finalScores: players.map(p => ({ name: p.name, score: p.score }))
    });
  });
}

// Get an unused character for the room
function getUniqueCharacter(room) {
  const characterNames = ["Alex", "Bella", "Charlie", "Daisy"];
  const availableCharacters = characterNames.filter(
    (char) => !room.usedCharacters.has(char)
  );

  if (availableCharacters.length === 0) {
    // If all characters are used (shouldn't happen with 2 players), reset and start over
    room.usedCharacters.clear();
    return characterNames[0];
  }

  const character =
    availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
  room.usedCharacters.add(character);
  return character;
}

// Generate coins for a room
function generateCoins(room) {
  const coins = [];
  for (let i = 0; i < 15; i++) {
    coins.push({
      id: i,
      x: Math.floor(Math.random() * (room.mapWidth - 2)) + 1,
      y: Math.floor(Math.random() * (room.mapHeight - 2)) + 1,
      collected: false
    });
  }
  return coins;
}

// Generate bombs for a room based on difficulty level
function generateBombs(room) {
  const bombs = [];

  // Only add bombs at difficulty level 2 and above
  if (room.difficultyLevel > 1) {
    // Add one bomb per difficulty level above 1, up to 5 bombs max
    const bombCount = Math.min(5, room.difficultyLevel - 1);
    console.log(`Generating ${bombCount} bombs at difficulty level ${room.difficultyLevel}`);

    for (let i = 0; i < bombCount; i++) {
      let x, y;
      let attempts = 0;

      // Try to place bomb in a position that doesn't overlap with coins or other bombs
      do {
        x = Math.floor(Math.random() * (room.mapWidth - 2)) + 1;
        y = Math.floor(Math.random() * (room.mapHeight - 2)) + 1;
        attempts++;
      } while (attempts < 10 && (
        room.coins.some(coin => coin.x === x && coin.y === y) ||
        bombs.some(bomb => bomb.x === x && bomb.y === y)
      ));

      bombs.push({
        id: i,
        x: x,
        y: y,
        exploded: false
      });
    }
  }

  return bombs;
}

// Generate enemies for a room
function generateEnemies(room) {
  // Base number of enemies is 9, plus 2 more per difficulty level
  const enemyCount = 9 + (room.difficultyLevel - 1) * 2;
  console.log(
    `Generating ${enemyCount} enemies at difficulty level ${room.difficultyLevel}`
  );

  const enemies = [];
  for (let i = 0; i < enemyCount; i++) {
    // Make sure enemies are placed within bounds
    const x = Math.floor(Math.random() * (room.mapWidth - 4)) + 2; // Stay away from edges
    const y = Math.floor(Math.random() * (room.mapHeight - 4)) + 2;

    enemies.push({
      id: i,
      x: x,
      y: y,
      direction: Math.floor(Math.random() * 4), // 0: up, 1: right, 2: down, 3: left
      moveCounter: 0, // Counter for movement timing
      difficultyLevel: room.difficultyLevel,
    });
  }
  return enemies;
}

// Find or create available room
// NOTE: This function is not currently used because we use first-come-first-serve matchmaking
// which creates a new room for each pair of players. However, it's kept here for potential
// future use if we want to implement room-based matchmaking instead.
function findAvailableRoom() {
  // Look for a room with space
  for (let [roomId, room] of gameRooms) {
    if (
      Object.keys(room.players).length < room.maxPlayers &&
      !room.gameStarted
    ) {
      return room;
    }
  }

  // Create new room if none available
  const newRoom = createGameRoom();
  newRoom.coins = generateCoins(newRoom);
  newRoom.bombs = generateBombs(newRoom);
  newRoom.enemies = generateEnemies(newRoom);
  gameRooms.set(newRoom.id, newRoom);
  console.log(`Created new game room ${newRoom.id}`);
  return newRoom;
}

// Move enemies periodically for all rooms
setInterval(() => {
  gameRooms.forEach((room, roomId) => {
    if (!room.gameStarted) return;

    room.enemies.forEach((enemy) => {
      // Increment move counter
      enemy.moveCounter = (enemy.moveCounter || 0) + 1;

      // Calculate movement frequency based on difficulty (enemies get faster)
      // Base speed: move every 3 ticks at level 1
      // Each difficulty level reduces the interval by 10%
      const baseInterval = 3;
      const speedMultiplier = 1 + (enemy.difficultyLevel - 1) * 0.1;
      const moveInterval = Math.max(
        1,
        Math.floor(baseInterval / speedMultiplier)
      );

      // Only move if it's time
      if (enemy.moveCounter % moveInterval !== 0) {
        return;
      }

      // Change direction randomly (less likely at higher difficulties)
      const directionChangeChance = 0.15;
      if (Math.random() < directionChangeChance) {
        enemy.direction = Math.floor(Math.random() * 4);
      }

      // Calculate new position
      let newX = enemy.x;
      let newY = enemy.y;

      switch (enemy.direction) {
        case 0:
          newY--;
          break; // up
        case 1:
          newX++;
          break; // right
        case 2:
          newY++;
          break; // down
        case 3:
          newX--;
          break; // left
      }

      // Bounds checking - ensure enemies stay within the play area
      if (
        newX >= 1 &&
        newX < room.mapWidth - 1 &&
        newY >= 1 &&
        newY < room.mapHeight - 1
      ) {
        // Safe to move
        enemy.x = newX;
        enemy.y = newY;
      } else {
        // Hit a wall, reverse direction
        enemy.direction = (enemy.direction + 2) % 4;
      }

      // Check for collisions with players in this room
      Object.values(room.players).forEach((player) => {
        if (player.x === enemy.x && player.y === enemy.y) {
          // Player hit enemy - lose points
          player.score = Math.max(0, player.score - 5);

          // Change mood to sad
          player.mood = "sad";
          player.lastMoodChange = Date.now();

          // Set player mood to sad
          player.mood = "sad";
          player.lastMoodChange = Date.now();

          // Respawn player
          player.x = Math.floor(Math.random() * (room.mapWidth - 2)) + 1;
          player.y = Math.floor(Math.random() * (room.mapHeight - 2)) + 1;

          // Notify player about hit
          io.to(player.id).emit("playerHit", {
            playerId: player.id,
            score: player.score,
            x: player.x,
            y: player.y,
          });

          // Broadcast complete game state to room
          const gameStateUpdate = {
            players: room.players,
            coins: room.coins,
            bombs: room.bombs,
            enemies: room.enemies,
            mapWidth: room.mapWidth,
            mapHeight: room.mapHeight,
            difficultyLevel: room.difficultyLevel,
            winningScore: room.winningScore
          };

          Object.keys(room.players).forEach((playerId) => {
            io.to(playerId).emit("gameStateUpdate", gameStateUpdate);
          });
        }
      });
    });

    // Send complete game state update to room
    Object.keys(room.players).forEach((playerId) => {
      const gameStateUpdate = {
        players: room.players,
        coins: room.coins,
        bombs: room.bombs,
        enemies: room.enemies,
        mapWidth: room.mapWidth,
        mapHeight: room.mapHeight,
        difficultyLevel: room.difficultyLevel,
        winningScore: room.winningScore
      };
      io.to(playerId).emit("gameStateUpdate", gameStateUpdate);
    });
  });
}, 200); // Faster update rate for smoother movement

// Matchmaking queue for online multiplayer (first-come-first-serve)
const matchmakingQueue = [];

// Log queue status periodically
setInterval(() => {
  if (matchmakingQueue.length > 0) {
    console.log(`[Matchmaking] Queue status: ${matchmakingQueue.length} players waiting`);
    matchmakingQueue.forEach((p, i) => {
      console.log(`  ${i + 1}. ${p.playerName} (${p.socketId}) - waiting ${Math.round((Date.now() - p.joinedAt) / 1000)}s`);
    });
  }
}, 10000); // Log every 10 seconds if queue has players

// Socket handling
io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);
  console.log(`[Connection] Total connected clients: ${io.engine.clientsCount}`);
  let playerRoom = null;

  // Handle join game request - First Come First Serve matchmaking
  socket.on("joinGame", (playerName) => {
    console.log(`[JoinGame] Player ${socket.id} attempting to join with name: ${playerName}`);
    console.log(`[JoinGame] Current queue size: ${matchmakingQueue.length}`);

    // Check if player is already in a room or queue
    if (playerRoom) {
      console.log(`Player ${socket.id} is already in room ${playerRoom.id}, ignoring join request`);
      return;
    }

    // Check if already in queue
    const inQueue = matchmakingQueue.find(p => p.socketId === socket.id);
    if (inQueue) {
      console.log(`Player ${socket.id} is already in matchmaking queue`);
      return;
    }

    // Add to matchmaking queue
    const queueEntry = {
      socketId: socket.id,
      playerName: playerName,
      joinedAt: Date.now()
    };
    matchmakingQueue.push(queueEntry);
    console.log(`[JoinGame] Player ${socket.id} (${playerName}) added to matchmaking queue`);
    console.log(`[JoinGame] Queue size after add: ${matchmakingQueue.length}`);
    console.log(`[JoinGame] Queue contents:`, matchmakingQueue.map(p => `${p.playerName}(${p.socketId})`));

    // If only one player in queue, wait for opponent
    if (matchmakingQueue.length === 1) {
      socket.emit("waitingForOpponent");
      return;
    }

    // If we have 2+ players, match the first two
    if (matchmakingQueue.length >= 2) {
      const player1 = matchmakingQueue.shift();
      const player2 = matchmakingQueue.shift();

      console.log(`Matching ${player1.playerName} with ${player2.playerName}`);

      // Create a new room for these two players
      const room = createGameRoom();
      room.coins = generateCoins(room);
      room.bombs = generateBombs(room);
      room.enemies = generateEnemies(room);
      gameRooms.set(room.id, room);

      // Add both players to the room
      const players = [player1, player2];
      const startPositions = [
        { x: 2, y: 2 },
        { x: room.mapWidth - 3, y: room.mapHeight - 3 }
      ];
      const playerColors = ['#00ff41', '#ff6b00'];

      players.forEach((p, index) => {
        const uniqueCharacter = getUniqueCharacter(room);
        room.players[p.socketId] = {
          id: p.socketId,
          name: p.playerName,
          x: startPositions[index].x,
          y: startPositions[index].y,
          color: playerColors[index],
          character: uniqueCharacter,
          direction: "right",
          mood: "happy",
          lastMoodChange: Date.now(),
          score: 0,
          isActive: true,
        };

        // Set playerRoom for each socket
        const playerSocket = io.sockets.sockets.get(p.socketId);
        if (playerSocket) {
          playerSocket.playerRoom = room;
        }
      });

      // Set playerRoom for current socket
      if (socket.id === player1.socketId || socket.id === player2.socketId) {
        playerRoom = room;
      }

      // Start the game
      room.gameStarted = true;
      console.log(`Room ${room.id} created and starting with players: ${player1.playerName}, ${player2.playerName}`);

      // Start the game timer (1 minute)
      startGameTimer(room);

      // Send game ready to both players
      players.forEach(p => {
        io.to(p.socketId).emit("gameReady", {
          players: room.players,
          coins: room.coins,
          bombs: room.bombs,
          enemies: room.enemies,
          mapWidth: room.mapWidth,
          mapHeight: room.mapHeight,
          difficultyLevel: room.difficultyLevel,
          winningScore: room.winningScore,
          roomId: room.id,
          gameDuration: room.gameDuration,
          timeRemaining: room.timeRemaining
        });
      });
    }
  });

  // Handle rematch request
  socket.on("requestRematch", () => {
    if (!playerRoom) return;

    // Mark this player as wanting rematch
    const player = playerRoom.players[socket.id];
    if (player) {
      player.wantsRematch = true;
      console.log(`Player ${player.name} wants rematch in room ${playerRoom.id}`);

      // Notify other player
      Object.keys(playerRoom.players).forEach(playerId => {
        if (playerId !== socket.id) {
          io.to(playerId).emit("opponentWantsRematch", { playerName: player.name });
        }
      });

      // Check if both players want rematch
      const allPlayers = Object.values(playerRoom.players);
      const allWantRematch = allPlayers.every(p => p.wantsRematch);

      if (allWantRematch && allPlayers.length === 2) {
        console.log(`Both players want rematch in room ${playerRoom.id}, restarting game`);

        // Stop existing timer if any
        if (playerRoom.gameTimer) {
          clearInterval(playerRoom.gameTimer);
          playerRoom.gameTimer = null;
        }

        // Reset the room
        playerRoom.gameStarted = false;
        playerRoom.difficultyLevel = 1;
        playerRoom.totalPointsCollected = 0;
        playerRoom.timeRemaining = playerRoom.gameDuration;
        playerRoom.coins = generateCoins(playerRoom);
        playerRoom.bombs = generateBombs(playerRoom);
        playerRoom.enemies = generateEnemies(playerRoom);

        // Reset players
        const startPositions = [
          { x: 2, y: 2 },
          { x: playerRoom.mapWidth - 3, y: playerRoom.mapHeight - 3 }
        ];

        allPlayers.forEach((p, index) => {
          p.score = 0;
          p.x = startPositions[index].x;
          p.y = startPositions[index].y;
          p.wantsRematch = false;
          p.mood = "happy";
          p.isActive = true;
        });

        playerRoom.gameStarted = true;

        // Start new timer
        startGameTimer(playerRoom);

        // Send game ready to both players
        Object.keys(playerRoom.players).forEach(playerId => {
          io.to(playerId).emit("rematchStarting");
          io.to(playerId).emit("gameReady", {
            players: playerRoom.players,
            coins: playerRoom.coins,
            bombs: playerRoom.bombs,
            enemies: playerRoom.enemies,
            mapWidth: playerRoom.mapWidth,
            mapHeight: playerRoom.mapHeight,
            difficultyLevel: playerRoom.difficultyLevel,
            winningScore: playerRoom.winningScore,
            roomId: playerRoom.id,
            gameDuration: playerRoom.gameDuration,
            timeRemaining: playerRoom.timeRemaining
          });
        });
      }
    }
  });

  // Handle cancel rematch
  socket.on("cancelRematch", () => {
    if (!playerRoom) return;
    
    const player = playerRoom.players[socket.id];
    if (player) {
      player.wantsRematch = false;
    }
  });

  // Handle leave game (return to menu)
  socket.on("leaveGame", () => {
    if (playerRoom) {
      const player = playerRoom.players[socket.id];
      if (player && player.character) {
        playerRoom.usedCharacters.delete(player.character);
      }
      delete playerRoom.players[socket.id];

      // Notify other players
      Object.keys(playerRoom.players).forEach(playerId => {
        io.to(playerId).emit("playerLeft", socket.id);
        io.to(playerId).emit("opponentLeft");
      });

      // Clean up empty rooms
      if (Object.keys(playerRoom.players).length === 0) {
        gameRooms.delete(playerRoom.id);
        console.log(`Deleted empty room ${playerRoom.id}`);
      }

      playerRoom = null;
    }

    // Remove from matchmaking queue if present
    const queueIndex = matchmakingQueue.findIndex(p => p.socketId === socket.id);
    if (queueIndex !== -1) {
      matchmakingQueue.splice(queueIndex, 1);
      console.log(`Removed ${socket.id} from matchmaking queue`);
    }
  });

  // Handle movement
  socket.on("move", (direction) => {
    if (!playerRoom) return;
    const player = playerRoom.players[socket.id];
    if (!player) return;

    let newX = player.x;
    let newY = player.y;

    switch (direction) {
      case "up":
        newY--;
        break;
      case "down":
        newY++;
        break;
      case "left":
        newX--;
        player.direction = "left";
        break;
      case "right":
        newX++;
        player.direction = "right";
        break;
    }

    // Check bounds
    if (
      newX >= 1 &&
      newX < playerRoom.mapWidth - 1 &&
      newY >= 1 &&
      newY < playerRoom.mapHeight - 1
    ) {
      // Check for collision with other players
      let collision = false;
      Object.values(playerRoom.players).forEach((otherPlayer) => {
        if (
          otherPlayer.id !== socket.id &&
          otherPlayer.x === newX &&
          otherPlayer.y === newY
        ) {
          collision = true;
        }
      });

      // Only move if no collision with other players
      if (!collision) {
        player.x = newX;
        player.y = newY;

        // Check coin collection (only if player actually moved)
        const coin = playerRoom.coins.find(
          (c) => c.x === newX && c.y === newY && !c.collected
        );

        // Check bomb collision (separate from coins)
        const bomb = playerRoom.bombs.find(
          (b) => b.x === newX && b.y === newY && !b.exploded
        );

        if (coin) {
          // Normal coin collection - always gain points
          coin.collected = true;
          player.score += 10;
          playerRoom.totalPointsCollected += 10;

          // Change mood to happy
          player.mood = "happy";
          player.lastMoodChange = Date.now();

          // Notify player about coin collection
          socket.emit("coinCollected", {
            coinId: coin.id,
            playerId: socket.id,
            score: player.score
          });

          console.log(`Player ${player.name} collected coin ${coin.id}! Score: ${player.score}`);
        }

        if (bomb) {
          // Bomb explosion - lose points
          bomb.exploded = true;
          player.score = Math.max(0, player.score - 20);

          // Change mood to sad
          player.mood = "sad";
          player.lastMoodChange = Date.now();

          // Notify player about bomb
          socket.emit("bombHit", {
            playerId: socket.id,
            score: player.score,
            bombId: bomb.id,
            x: bomb.x,
            y: bomb.y
          });

          // Visual effect for other players
          Object.keys(playerRoom.players).forEach((playerId) => {
            if (playerId !== socket.id) {
              io.to(playerId).emit("bombExploded", {
                bombId: bomb.id,
                x: bomb.x,
                y: bomb.y,
                playerId: socket.id
              });
            }
          });

          console.log(`Player ${player.name} hit bomb ${bomb.id}! Score: ${player.score}`);
        }

        // Only check difficulty increase and other logic if something was collected/hit
        if (coin || bomb) {
          // Check if difficulty should increase (only based on coins collected)
          const previousLevel = playerRoom.difficultyLevel;
          playerRoom.difficultyLevel =
            Math.floor(
              playerRoom.totalPointsCollected / playerRoom.difficultyThreshold
            ) + 1;

          // If difficulty level increased, update enemies
          if (playerRoom.difficultyLevel > previousLevel) {
            console.log(
              `Room ${playerRoom.id} difficulty increased to level ${playerRoom.difficultyLevel}`
            );

            // Update existing enemies with new difficulty level
            playerRoom.enemies.forEach((enemy) => {
              enemy.difficultyLevel = playerRoom.difficultyLevel;
            });

            // Add new enemies (2 per difficulty level increase)
            const newEnemiesCount = 2;
            const currentEnemyCount = playerRoom.enemies.length;

            for (let i = 0; i < newEnemiesCount; i++) {
              playerRoom.enemies.push({
                id: currentEnemyCount + i,
                x: Math.floor(Math.random() * (playerRoom.mapWidth - 4)) + 2,
                y: Math.floor(Math.random() * (playerRoom.mapHeight - 4)) + 2,
                direction: Math.floor(Math.random() * 4),
                difficultyLevel: playerRoom.difficultyLevel,
              });
            }

            // Regenerate bombs with new difficulty level
            playerRoom.bombs = generateBombs(playerRoom);
            console.log(`Generated ${playerRoom.bombs.length} bombs for difficulty level ${playerRoom.difficultyLevel}`);

            // Notify players about difficulty increase
            Object.keys(playerRoom.players).forEach((playerId) => {
              io.to(playerId).emit("difficultyIncrease", {
                level: playerRoom.difficultyLevel,
                enemyCount: playerRoom.enemies.length,
              });
            });
          }

          // Send complete game state update to ALL players in room
          const gameStateUpdate = {
            players: playerRoom.players,
            coins: playerRoom.coins,
            bombs: playerRoom.bombs,
            enemies: playerRoom.enemies,
            mapWidth: playerRoom.mapWidth,
            mapHeight: playerRoom.mapHeight,
            difficultyLevel: playerRoom.difficultyLevel,
            winningScore: playerRoom.winningScore
          };

          console.log(`Server: Broadcasting complete game state to all players in room ${playerRoom.id}`);
          Object.keys(playerRoom.players).forEach((playerId) => {
            io.to(playerId).emit("gameStateUpdate", gameStateUpdate);
          });



          // Check for winner
          if (player.score >= playerRoom.winningScore) {
            console.log(
              `Player ${player.name} (${socket.id}) won the game in room ${playerRoom.id}!`
            );

            // Notify all players about the winner
            Object.keys(playerRoom.players).forEach((playerId) => {
              io.to(playerId).emit("gameWon", {
                winnerId: socket.id,
                winnerName: player.name,
                winnerScore: player.score,
              });
            });
          }

          // Check if all coins collected (respawn coins independently of bombs)
          if (playerRoom.coins.every((c) => c.collected)) {
            // Respawn only coins
            playerRoom.coins = generateCoins(playerRoom);
            console.log(`Respawned ${playerRoom.coins.length} coins`);

            // Send complete game state update
            const gameStateUpdate = {
              players: playerRoom.players,
              coins: playerRoom.coins,
              bombs: playerRoom.bombs,
              enemies: playerRoom.enemies,
              mapWidth: playerRoom.mapWidth,
              mapHeight: playerRoom.mapHeight,
              difficultyLevel: playerRoom.difficultyLevel,
              winningScore: playerRoom.winningScore
            };

            Object.keys(playerRoom.players).forEach((playerId) => {
              io.to(playerId).emit("gameStateUpdate", gameStateUpdate);
            });
          }
          
          // Check if all bombs exploded (respawn bombs independently of coins)
          if (playerRoom.bombs.length > 0 && playerRoom.bombs.every((b) => b.exploded)) {
            // Respawn only bombs
            playerRoom.bombs = generateBombs(playerRoom);
            console.log(`Respawned ${playerRoom.bombs.length} bombs`);

            // Send complete game state update
            const gameStateUpdate = {
              players: playerRoom.players,
              coins: playerRoom.coins,
              bombs: playerRoom.bombs,
              enemies: playerRoom.enemies,
              mapWidth: playerRoom.mapWidth,
              mapHeight: playerRoom.mapHeight,
              difficultyLevel: playerRoom.difficultyLevel,
              winningScore: playerRoom.winningScore
            };

            Object.keys(playerRoom.players).forEach((playerId) => {
              io.to(playerId).emit("gameStateUpdate", gameStateUpdate);
            });
          }
        }

        // Broadcast complete game state to ALL players in room
        const gameStateUpdate = {
          players: playerRoom.players,
          coins: playerRoom.coins,
          bombs: playerRoom.bombs,
          enemies: playerRoom.enemies,
          mapWidth: playerRoom.mapWidth,
          mapHeight: playerRoom.mapHeight,
          difficultyLevel: playerRoom.difficultyLevel,
          winningScore: playerRoom.winningScore
        };

        Object.keys(playerRoom.players).forEach((playerId) => {
          io.to(playerId).emit("gameStateUpdate", gameStateUpdate);
        });
      }
    }
  }); // Close collision block and move handler

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    
    // Remove from matchmaking queue
    const queueIndex = matchmakingQueue.findIndex(p => p.socketId === socket.id);
    if (queueIndex !== -1) {
      matchmakingQueue.splice(queueIndex, 1);
      console.log(`Removed disconnected player ${socket.id} from matchmaking queue`);
    }

    if (playerRoom) {
      // Remove the player's character from used characters
      const player = playerRoom.players[socket.id];
      if (player && player.character) {
        playerRoom.usedCharacters.delete(player.character);
      }
      delete playerRoom.players[socket.id];

      // Notify other players in room
      Object.keys(playerRoom.players).forEach((playerId) => {
        io.to(playerId).emit("playerLeft", socket.id);
        io.to(playerId).emit("opponentLeft");
      });

      // Clean up empty rooms or stop timer if only one player left
      if (Object.keys(playerRoom.players).length === 0) {
        // Stop the game timer
        if (playerRoom.gameTimer) {
          clearInterval(playerRoom.gameTimer);
          playerRoom.gameTimer = null;
        }
        gameRooms.delete(playerRoom.id);
        console.log(`Deleted empty room ${playerRoom.id}`);
      } else if (Object.keys(playerRoom.players).length === 1) {
        // Only one player left - stop timer and end game
        if (playerRoom.gameTimer) {
          clearInterval(playerRoom.gameTimer);
          playerRoom.gameTimer = null;
        }
        playerRoom.gameStarted = false;
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `Game settings: Max Players: ${process.env.MAX_PLAYERS || 2
    }, Winning Score: ${process.env.WINNING_SCORE || 500}`
  );
});
