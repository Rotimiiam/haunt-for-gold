// Multiplayer Mode - Real Player vs Player Game Logic
console.log("Multiplayer mode script loaded");

class MultiplayerMode {
  constructor() {
    this.socket = null;
    this.gameState = {
      players: {},
      coins: [],
      bombs: [],
      enemies: [],
      myId: null,
      mapWidth: 20,
      mapHeight: 15,
      winningScore: 500,
      difficultyLevel: 1,
      startTime: null
    };
    this.gameStarted = false;
    this.waitingForOpponent = false;
    this.lastMoveTime = 0;
    this.MOVE_COOLDOWN = 150;
    this.BOOST_COOLDOWN = 75; // Faster movement when boosting
    this.isBoosting = false;
  }

  connect() {
    console.log("*** CONNECTING TO MULTIPLAYER SERVER ***");

    // Connect to server
    this.socket = io();

    console.log("*** SOCKET CREATED, SETTING UP EVENTS ***");
    // Set up socket events
    this.setupSocketEvents();
    console.log("*** SOCKET EVENTS SETUP COMPLETE ***");
  }

  // Update game state from server (server is authoritative)
  updateGameState(serverState) {
    console.log("UPDATING GAME STATE FROM SERVER:", {
      players: Object.keys(serverState.players),
      coins: serverState.coins.filter(c => !c.collected).length,
      enemies: serverState.enemies.length
    });

    // Server state is the single source of truth
    this.gameState = serverState;
    this.gameState.myId = this.socket.id;

    // Update all global references
    window.gameState = this.gameState;
    if (typeof gameState !== 'undefined') {
      gameState = this.gameState;
    }

    // Immediately render the new state
    if (this.gameStarted && window.gameRenderer) {
      console.log("RENDERING UPDATED GAME STATE");
      window.gameRenderer.render(this.gameState);
    }
  }

  // No continuous render loop needed - we render on server updates only
  // This ensures perfect synchronization between clients

  // Remove direct coin collection - let server handle it

  setupSocketEvents() {
    console.log("*** SETTING UP SOCKET EVENTS ***");

    // Connected to server
    this.socket.on("connect", () => {
      console.log("*** CONNECTED TO SERVER WITH ID ***:", this.socket.id);
      this.gameState.myId = this.socket.id;

      // Test socket connection
      console.log("Socket connected:", this.socket.connected);
      console.log("Socket transport:", this.socket.io.engine.transport.name);
    });

    // Waiting for opponent
    this.socket.on("waitingForOpponent", () => {
      console.log("Waiting for opponent...");
      console.log("Current socket ID:", this.socket.id);
      console.log("Game started flag:", this.gameStarted);
      this.waitingForOpponent = true;
      document.getElementById("waitingScreen").style.display = "flex";
    });

    // Game ready to start (opponent found)
    this.socket.on("gameReady", (state) => {
      console.log("*** GAME READY EVENT RECEIVED ***");
      console.log("State:", state);
      console.log("Players:", Object.keys(state.players));
      console.log("My ID:", this.socket.id);

      this.waitingForOpponent = false;

      // Update game state from server
      this.updateGameState(state);

      // Start the game
      console.log("*** CALLING START GAME ***");
      this.startGame();

      // Show game start notification
      if (typeof showNotification === 'function') {
        showNotification(
          "Game Started!",
          `First to ${state.winningScore || 500} points wins! Current difficulty: Level ${state.difficultyLevel || 1}`
        );
      }
    });

    // Main game state update from server (this is the key event)
    this.socket.on("gameStateUpdate", (state) => {
      console.log("*** RECEIVED GAME STATE UPDATE FROM SERVER ***");
      this.updateGameState(state);

      // Update UI elements
      updatePlayerCount();
      updateScoreboard();
    });

    // Player joined (for UI updates only)
    this.socket.on("playerJoined", (player) => {
      console.log("Player joined:", player);
      updatePlayerCount();
      updateScoreboard();
    });

    // Player left (for UI updates only)
    this.socket.on("playerLeft", (playerId) => {
      console.log("Player left:", playerId);
      updatePlayerCount();
      updateScoreboard();
    });

    // Coin collected (for UI feedback only)
    this.socket.on("coinCollected", (data) => {
      console.log("COIN COLLECTED FEEDBACK:", data);

      // Show notification only for our own actions
      if (data.playerId === this.gameState.myId) {
        // showNotification("Coin collected!", "+10 points");
      }
      // Note: Game state is updated via gameStateUpdate event
    });

    // Player hit by enemy (for UI feedback only)
    this.socket.on("playerHit", (data) => {
      if (data.playerId === this.gameState.myId) {
        showNotification("Enemy Hit!", "-5 points");
      }
      // Note: Game state is updated via gameStateUpdate event
    });

    // These events are now handled by gameStateUpdate, keeping only for UI feedback

    // Difficulty increase notification
    this.socket.on("difficultyIncrease", (data) => {
      console.log(`Difficulty increased to level ${data.level}`);
      showNotification(
        "Difficulty Increased!",
        `Now Level ${data.level} - More enemies and faster movement!`
      );
    });

    // Bomb hit notification
    this.socket.on("bombHit", (data) => {
      if (data.playerId === this.gameState.myId) {
        console.log(`Hit bomb ${data.bombId}! Lost 20 points.`);
        showNotification("BOOM! Bomb Hit!", "You lost 20 points!");
      }
      // Note: Game state is updated via gameStateUpdate event
    });

    // Bomb exploded (for other players to see)
    this.socket.on("bombExploded", (data) => {
      console.log(`Bomb ${data.bombId} exploded at ${data.x}, ${data.y} by player ${data.playerId}`);
      if (typeof showExplosion === 'function') {
        showExplosion(data.x, data.y);
      }
      // Note: Game state is updated via gameStateUpdate event
    });

    // Game won
    this.socket.on("gameWon", (data) => {
      console.log("Game won:", data);
      this.gameStarted = false;
      showWinnerScreen(data, true); // true = show rematch option
    });

    // Opponent wants rematch
    this.socket.on("opponentWantsRematch", (data) => {
      console.log("Opponent wants rematch:", data);
      showNotification("Rematch Request", `${data.playerName} wants a rematch!`);
      // Update UI to show opponent is waiting
      const rematchBtn = document.getElementById('playAgainBtn');
      if (rematchBtn) {
        rematchBtn.textContent = '👻 Accept Rematch!';
        rematchBtn.style.animation = 'pulseGlow 1s infinite';
      }
    });

    // Rematch starting
    this.socket.on("rematchStarting", () => {
      console.log("Rematch starting!");
      showNotification("Rematch!", "Get ready for round 2!");
      
      // Hide winner screen
      const winnerScreen = document.getElementById('winnerScreen');
      if (winnerScreen) {
        winnerScreen.style.display = 'none';
      }
    });

    // Opponent left
    this.socket.on("opponentLeft", () => {
      console.log("Opponent left the game");
      this.gameStarted = false;
      showNotification("Opponent Left", "Your opponent has left the game");
      
      // Show winner screen with "opponent left" message
      showWinnerScreen({
        winnerId: this.socket.id,
        winnerName: "You",
        winnerScore: this.gameState.players[this.socket.id]?.score || 0,
        reason: "opponent_left"
      }, false);
    });

    // Connection error
    this.socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      showNotification("Connection Error", "Failed to connect to server");
    });

    // Disconnection
    this.socket.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
      this.gameStarted = false;
      showNotification("Disconnected", "Connection to server lost");
    });
  }

  joinGame(playerName) {
    if (!this.socket || !this.socket.connected) {
      console.error("Not connected to server");
      return;
    }

    // Prevent multiple joins
    if (this.waitingForOpponent || this.gameStarted) {
      console.log("Already waiting for opponent or game started, ignoring join request");
      return;
    }

    console.log("*** JOINING GAME WITH NAME ***:", playerName);
    console.log("Socket connected:", this.socket.connected);
    console.log("Socket ID:", this.socket.id);
    this.socket.emit("joinGame", playerName);
  }

  setupControls() {
    // Button controls
    document.getElementById("up").addEventListener("click", () => this.move("up"));
    document.getElementById("down").addEventListener("click", () => this.move("down"));
    document.getElementById("left").addEventListener("click", () => this.move("left"));
    document.getElementById("right").addEventListener("click", () => this.move("right"));

    // Keyboard controls
    document.addEventListener("keydown", (e) => {
      if (!this.gameStarted) return;

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          this.move("up");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          this.move("down");
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          this.move("left");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          this.move("right");
          break;
        case " ": // Spacebar for speed boost
          e.preventDefault();
          this.isBoosting = true;
          break;
      }
    });

    // Release boost on keyup
    document.addEventListener("keyup", (e) => {
      if (e.key === " ") {
        this.isBoosting = false;
      }
    });
  }

  move(direction) {
    // Check movement cooldown (faster when boosting)
    const currentTime = Date.now();
    const cooldown = this.isBoosting ? this.BOOST_COOLDOWN : this.MOVE_COOLDOWN;
    if (currentTime - this.lastMoveTime < cooldown) {
      return;
    }
    this.lastMoveTime = currentTime;

    if (this.socket && this.socket.connected && this.gameStarted) {
      this.socket.emit("move", direction);
    }
  }

  startGame() {
    console.log("Starting multiplayer game");
    this.gameStarted = true;

    // Set game start time
    if (!this.gameState.startTime) {
      this.gameState.startTime = Date.now();
    }

    // Ensure we're not in practice mode
    window.practiceMode = false;
    window.isPracticeMode = false;

    // Update global game state references
    window.gameState = this.gameState;
    if (typeof gameState !== 'undefined') {
      gameState = this.gameState;
    }
    window.gameStarted = true;

    // Also set the global gameStarted variable used by draw()
    if (typeof gameStarted !== 'undefined') {
      gameStarted = true;
    }

    console.log("Global gameState updated in startGame:", this.gameState);

    // Hide home screen and waiting screen
    document.getElementById("homeScreen").style.display = "none";
    document.getElementById("waitingScreen").style.display = "none";

    // Show game container
    const gameContainer = document.querySelector(".game-container");
    if (gameContainer) {
      gameContainer.style.display = "flex";
    }

    // Show game elements
    const canvas = document.getElementById("gameCanvas");
    const scoreboard = document.getElementById("scoreboard");

    console.log("Canvas element:", canvas);
    console.log("Scoreboard element:", scoreboard);

    canvas.style.display = "block";
    document.querySelector(".info").style.display = "none";
    scoreboard.style.display = "block";

    console.log("Canvas display after setting:", canvas.style.display);
    console.log("Canvas dimensions:", canvas.width, "x", canvas.height);

    // Show controls only on mobile (but mobile is blocked anyway)
    if (isMobile()) {
      document.querySelector(".controls").style.display = "grid";
    }

    // Enter fullscreen
    enterFullscreenMode();

    // Update displays
    updatePlayerCount();
    updateScoreboard();

    // Start game loop
    console.log("Starting game loop - gameStarted:", gameStarted, "practiceMode:", window.practiceMode, "isPracticeMode:", window.isPracticeMode);

    // Render the initial game state
    console.log("Rendering initial game state");
    if (window.gameRenderer && this.gameState) {
      window.gameRenderer.render(this.gameState);
    }

    // Set up controls
    this.setupControls();
  }

  disconnect() {
    if (this.socket) {
      this.socket.emit("leaveGame");
      this.socket.disconnect();
      this.socket = null;
    }
    this.gameStarted = false;
    this.waitingForOpponent = false;
    console.log("Multiplayer disconnected - render loop will stop");
  }

  requestRematch() {
    if (this.socket && this.socket.connected) {
      console.log("Requesting rematch...");
      this.socket.emit("requestRematch");
      showNotification("Rematch Requested", "Waiting for opponent...");
    }
  }

  cancelRematch() {
    if (this.socket && this.socket.connected) {
      this.socket.emit("cancelRematch");
    }
  }

  leaveGame() {
    if (this.socket && this.socket.connected) {
      this.socket.emit("leaveGame");
    }
    this.disconnect();
    
    // Return to home screen
    document.getElementById('winnerScreen').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'none';
    document.getElementById('scoreboard').style.display = 'none';
    document.getElementById('homeScreen').style.display = 'flex';
    exitFullscreenMode();
  }

  restart() {
    this.disconnect();

    // Reset game state
    this.gameState = {
      players: {},
      coins: [],
      bombs: [],
      enemies: [],
      myId: null,
      mapWidth: 20,
      mapHeight: 15,
      winningScore: 500,
      difficultyLevel: 1,
      startTime: null
    };

    // Reconnect and join
    this.connect();
  }
}

// Global multiplayer mode instance
window.multiplayerMode = null;

// Global function to start multiplayer mode
window.startMultiplayerMode = function (playerName) {
  console.log("*** STARTING MULTIPLAYER MODE GLOBALLY ***");
  window.isPracticeMode = false;
  window.multiplayerMode = new MultiplayerMode();
  console.log("*** CREATED MULTIPLAYER MODE INSTANCE ***");
  window.multiplayerMode.connect();
  console.log("*** MULTIPLAYER MODE CONNECT CALLED ***");

  // Wait a moment for connection, then join
  setTimeout(() => {
    window.multiplayerMode.joinGame(playerName);
  }, 100);
};

// Global function for joining game (for compatibility)
window.joinGame = function () {
  if (window.multiplayerMode) {
    const playerName = window.playerName || "Player";
    window.multiplayerMode.joinGame(playerName);
  }
};
