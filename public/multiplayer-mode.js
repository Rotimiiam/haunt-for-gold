// Multiplayer Mode - Real Player vs Player Game Logic


class MultiplayerMode {
  constructor() {
    this.socket = null;
    this.gameState = {
      players: {},
      coins: [],
      bombs: [],
      enemies: [],
      witch: null,
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
    this.witch = null;
    this.controlsSetup = false; // Track if controls are already set up
    this.keydownHandler = null; // Store reference to handler
    this.keyupHandler = null; // Store reference to handler
  }

  connect() {
    console.log("*** CONNECTING TO MULTIPLAYER SERVER ***");

    // Set up controls early (before socket connects)
    this.setupControls();

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
      
      // Auto-join game when connected (if we have a pending player name)
      if (this.pendingPlayerName && !this.waitingForOpponent && !this.gameStarted) {
        console.log("Auto-joining game with pending name:", this.pendingPlayerName);
        this.joinGame(this.pendingPlayerName);
        this.pendingPlayerName = null;
      }
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

    // Witch spawned - play cackle sound and start vibration
    this.socket.on("witchSpawned", (data) => {
      console.log("🧙‍♀️ Witch spawned!", data);
      showNotification("🧙‍♀️ The Witch!", "She's hunting you! (-30 pts)");
      
      // Play cackle sound
      if (!this.witchCackleSound) {
        this.witchCackleSound = new Audio('sounds/witch-cackle.mp4a');
        this.witchCackleSound.volume = 0.5;
      }
      try {
        this.witchCackleSound.currentTime = 0;
        this.witchCackleSound.play().catch(() => {});
      } catch (e) {}
      
      // Start haunting vibration pattern
      this.startWitchVibration();
    });

    // Witch despawned
    this.socket.on("witchDespawned", (data) => {
      console.log("👻 Witch despawned");
      showNotification("👻 Witch Gone", "She vanished... for now");
      this.stopWitchVibration();
    });

    // Witch hit player
    this.socket.on("witchHit", (data) => {
      console.log("🧙‍♀️ Witch caught player!", data);
      showNotification("🧙‍♀️ WITCH GOT YOU!", "-30 points!");
      
      // Strong vibration feedback
      this.vibrateController(400, 1.0, 1.0);
    });

    // Time update from server
    this.socket.on("timeUpdate", (data) => {
      this.gameState.timeRemaining = data.timeRemaining;
      this.gameState.gameDuration = data.gameDuration;
      
      // Update timer display in scoreboard
      this.updateTimerDisplay(data.timeRemaining);
      
      // Warning at 10 seconds
      if (data.timeRemaining === 10) {
        showNotification("⏰ 10 Seconds!", "Hurry up!");
      }
    });

    // Game won
    this.socket.on("gameWon", (data) => {
      console.log("Game won:", data);
      this.gameStarted = false;
      
      // Stop gamepad polling
      if (this.gamepadPollId) {
        cancelAnimationFrame(this.gamepadPollId);
        this.gamepadPollId = null;
      }
      
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
      
      // Reset game state
      this.gameStarted = false;
      
      // Hide winner screen
      const winnerScreen = document.getElementById('winnerScreen');
      if (winnerScreen) {
        winnerScreen.style.display = 'none';
      }
      
      // Show game canvas and scoreboard
      const canvas = document.getElementById('gameCanvas');
      const scoreboard = document.getElementById('scoreboard');
      if (canvas) canvas.style.display = 'block';
      if (scoreboard) scoreboard.style.display = 'block';
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
      return;
    }

    console.log("*** JOINING GAME WITH NAME ***:", playerName);
    console.log("Socket connected:", this.socket.connected);
    console.log("Socket ID:", this.socket.id);
    this.socket.emit("joinGame", playerName);
  }

  setupControls() {
    // Only set up controls once to avoid duplicate listeners
    if (this.controlsSetup) {
      console.log("Controls already set up, skipping");
      return;
    }

    console.log("Setting up multiplayer controls");

    // Button controls
    const upBtn = document.getElementById("up");
    const downBtn = document.getElementById("down");
    const leftBtn = document.getElementById("left");
    const rightBtn = document.getElementById("right");

    if (upBtn) upBtn.addEventListener("click", () => this.move("up"));
    if (downBtn) downBtn.addEventListener("click", () => this.move("down"));
    if (leftBtn) leftBtn.addEventListener("click", () => this.move("left"));
    if (rightBtn) rightBtn.addEventListener("click", () => this.move("right"));

    // Keyboard controls - store handler reference for cleanup
    this.keydownHandler = (e) => {
      if (!this.gameStarted) {
        return;
      }

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
    };

    // Release boost on keyup
    this.keyupHandler = (e) => {
      if (e.key === " ") {
        this.isBoosting = false;
      }
    };

    document.addEventListener("keydown", this.keydownHandler);
    document.addEventListener("keyup", this.keyupHandler);

    // Controller/Gamepad support
    this.setupGamepadControls();

    this.controlsSetup = true;
    console.log("Multiplayer controls setup complete");
  }

  setupGamepadControls() {
    const AXIS_THRESHOLD = 0.5;
    let lastPauseButtonState = false;
    
    const pollGamepads = () => {
      if (!this.gameStarted) {
        this.gamepadPollId = requestAnimationFrame(pollGamepads);
        return;
      }

      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      
      for (const gamepad of gamepads) {
        if (!gamepad) continue;

        // Check for pause button (Start button - button 9)
        const pauseButtonPressed = gamepad.buttons[9]?.pressed;
        if (pauseButtonPressed && !lastPauseButtonState) {
          // Button just pressed (rising edge)
          if (typeof window.togglePause === 'function') {
            window.togglePause();
          }
        }
        lastPauseButtonState = pauseButtonPressed;

        // Skip movement if game is paused
        if (window.gamePaused) {
          this.gamepadPollId = requestAnimationFrame(pollGamepads);
          return;
        }

        // Check for boost (R2 trigger - button 7)
        if (gamepad.buttons[7]?.pressed || gamepad.buttons[7]?.value > 0.5) {
          this.isBoosting = true;
        } else {
          this.isBoosting = false;
        }

        // Check D-pad (buttons 12-15)
        if (gamepad.buttons[12]?.pressed) this.move("up");
        if (gamepad.buttons[13]?.pressed) this.move("down");
        if (gamepad.buttons[14]?.pressed) this.move("left");
        if (gamepad.buttons[15]?.pressed) this.move("right");

        // Check left analog stick
        if (gamepad.axes.length >= 2) {
          const axisX = gamepad.axes[0];
          const axisY = gamepad.axes[1];

          if (axisY < -AXIS_THRESHOLD) this.move("up");
          if (axisY > AXIS_THRESHOLD) this.move("down");
          if (axisX < -AXIS_THRESHOLD) this.move("left");
          if (axisX > AXIS_THRESHOLD) this.move("right");
        }

        // Only use first connected controller
        break;
      }

      this.gamepadPollId = requestAnimationFrame(pollGamepads);
    };

    this.gamepadPollId = requestAnimationFrame(pollGamepads);
  }

  updateTimerDisplay(timeRemaining) {
    // Find or create timer element in scoreboard
    let timerElement = document.getElementById('onlineGameTimer');
    
    if (!timerElement) {
      // Create timer element if it doesn't exist
      const scoreboard = document.getElementById('scoreboard');
      if (scoreboard) {
        timerElement = document.createElement('div');
        timerElement.id = 'onlineGameTimer';
        timerElement.className = 'cursed-timer';
        timerElement.style.cssText = 'text-align: center; margin-bottom: 15px; font-size: 1.5rem; color: #ffd700; position: relative;';
        // Insert at the top of scoreboard after the title
        const title = scoreboard.querySelector('h3');
        if (title && title.nextSibling) {
          scoreboard.insertBefore(timerElement, title.nextSibling);
        } else {
          scoreboard.prepend(timerElement);
        }
      }
    }
    
    if (timerElement) {
      const minutes = Math.floor(timeRemaining / 60);
      const seconds = timeRemaining % 60;
      timerElement.textContent = `⏳ ${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      // Change color when low on time
      if (timeRemaining <= 10) {
        timerElement.style.color = '#ff4444';
        timerElement.style.animation = 'pulse 0.5s infinite';
      } else if (timeRemaining <= 30) {
        timerElement.style.color = '#ff6b00';
        timerElement.style.animation = 'none';
      } else {
        timerElement.style.color = '#ffd700';
        timerElement.style.animation = 'none';
      }
    }
  }

  move(direction) {
    // Don't move if paused
    if (window.gamePaused) return;

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

  pause() {
    // Pause is handled globally, but we can add mode-specific logic here if needed
    console.log("Multiplayer mode paused");
  }

  resume() {
    // Resume is handled globally, but we can add mode-specific logic here if needed
    console.log("Multiplayer mode resumed");
  }

  startGame() {
    console.log("Starting multiplayer game");
    this.gameStarted = true;

    // Ensure GameRenderer is initialized before rendering
    if (!window.gameRenderer && typeof GameRenderer !== 'undefined') {
      const canvas = document.getElementById('gameCanvas');
      if (canvas) {
        console.log("Initializing GameRenderer for multiplayer mode");
        window.gameRenderer = new GameRenderer('gameCanvas');
      } else {
        console.error("Cannot initialize GameRenderer - canvas element not found");
      }
    }

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
      gameContainer.style.visibility = "visible";
      gameContainer.style.opacity = "1";
      console.log("Game container shown:", gameContainer.style.display);
    } else {
      console.error("Game container not found!");
    }

    // Show game elements - ensure canvas is visible
    const canvas = document.getElementById("gameCanvas");
    const scoreboard = document.getElementById("scoreboard");
    const infoDiv = document.querySelector(".info");

    console.log("Canvas element:", canvas);
    console.log("Scoreboard element:", scoreboard);

    if (canvas) {
      // Aggressively ensure canvas is visible
      canvas.style.display = "block";
      canvas.style.visibility = "visible";
      canvas.style.opacity = "1";
      canvas.style.position = "relative";
      canvas.style.zIndex = "10";
      
      console.log("Canvas display after setting:", canvas.style.display);
      console.log("Canvas visibility:", canvas.style.visibility);
      console.log("Canvas dimensions:", canvas.width, "x", canvas.height);
      console.log("Canvas computed style:", window.getComputedStyle(canvas).display);
      
      // Force a reflow to ensure canvas is rendered
      canvas.offsetHeight;
      
      // Double-check after a short delay
      setTimeout(() => {
        if (canvas.style.display !== "block") {
          console.warn("Canvas display was reset, forcing again");
          canvas.style.display = "block";
          canvas.style.visibility = "visible";
        }
        console.log("Canvas final check - display:", canvas.style.display, "visibility:", canvas.style.visibility);
      }, 100);
    } else {
      console.error("Canvas element not found!");
    }

    if (infoDiv) {
      infoDiv.style.display = "none";
    }
    
    if (scoreboard) {
      scoreboard.style.display = "block";
    } else {
      console.error("Scoreboard element not found!");
    }

    // Initialize witch enemy for online multiplayer
    if (typeof WitchEnemy !== 'undefined' && !this.witch) {
      this.witch = new WitchEnemy(this.gameState.mapWidth, this.gameState.mapHeight);
      console.log('🧙‍♀️ Witch enemy initialized for online multiplayer');
    }

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

    // Start background music
    if (typeof playBackgroundMusic === 'function') {
      playBackgroundMusic();
    }

    // Start continuous render loop
    this.startRenderLoop();

    // Ensure controls are set up (should already be done in connect())
    if (!this.controlsSetup) {
      this.setupControls();
    }
  }

  startRenderLoop() {
    console.log("Starting multiplayer render loop");
    
    // Ensure canvas is visible before starting render loop
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
      canvas.style.display = "block";
      canvas.style.visibility = "visible";
      console.log("Canvas visibility ensured in render loop start");
    }
    
    const renderLoop = () => {
      if (!this.gameStarted) {
        console.log("Render loop stopped - game not started");
        return;
      }

      // Update witch if active (client-side prediction)
      if (this.witch && this.gameState) {
        const players = Object.values(this.gameState.players);
        this.witch.update(players);
        
        // Add witch state to game state for rendering
        this.gameState.witch = this.witch.getState();
      }

      if (window.gameRenderer && this.gameState) {
        try {
          window.gameRenderer.render(this.gameState);
        } catch (error) {
          console.error("Error rendering game state:", error);
        }
      } else {
        // Try to initialize renderer if missing
        if (!window.gameRenderer && typeof GameRenderer !== 'undefined') {
          const canvas = document.getElementById('gameCanvas');
          if (canvas) {
            console.log("Re-initializing GameRenderer in render loop");
            try {
              window.gameRenderer = new GameRenderer('gameCanvas');
              console.log("GameRenderer successfully initialized");
            } catch (error) {
              console.error("Error initializing GameRenderer:", error);
            }
          } else {
            console.error("Canvas not found in render loop");
          }
        } else if (!window.gameRenderer) {
          console.error("GameRenderer class not available");
        } else if (!this.gameState) {
          console.error("Game state not available");
        }
      }

      this.renderFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();
  }

  disconnect() {
    if (this.socket) {
      this.socket.emit("leaveGame");
      this.socket.disconnect();
      this.socket = null;
    }
    this.gameStarted = false;
    this.waitingForOpponent = false;
    this.pendingPlayerName = null;
    
    // Stop render loop
    if (this.renderFrameId) {
      cancelAnimationFrame(this.renderFrameId);
      this.renderFrameId = null;
    }
    
    // Stop gamepad polling
    if (this.gamepadPollId) {
      cancelAnimationFrame(this.gamepadPollId);
      this.gamepadPollId = null;
    }
    
    // Stop witch vibration
    if (typeof this.stopWitchVibration === 'function') {
      this.stopWitchVibration();
    }
    
    // Clean up keyboard event listeners
    if (this.keydownHandler) {
      document.removeEventListener("keydown", this.keydownHandler);
      this.keydownHandler = null;
    }
    if (this.keyupHandler) {
      document.removeEventListener("keyup", this.keyupHandler);
      this.keyupHandler = null;
    }
    this.controlsSetup = false;
    
    // Hide game elements
    const canvas = document.getElementById('gameCanvas');
    const scoreboard = document.getElementById('scoreboard');
    const gameContainer = document.querySelector('.game-container');
    const waitingScreen = document.getElementById('waitingScreen');
    
    if (canvas) canvas.style.display = 'none';
    if (scoreboard) scoreboard.style.display = 'none';
    if (gameContainer) gameContainer.style.display = 'none';
    if (waitingScreen) waitingScreen.style.display = 'none';
    
    // Show home screen
    const homeScreen = document.getElementById('homeScreen');
    if (homeScreen) {
      homeScreen.style.display = 'flex';
      homeScreen.style.visibility = 'visible';
    }
    
    // Exit fullscreen
    if (typeof exitFullscreenMode === 'function') {
      exitFullscreenMode();
    }
    
    console.log("Multiplayer disconnected - render loop stopped");
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
      witch: null,
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

  // Vibrate controller for feedback
  vibrateController(duration = 100, weakMagnitude = 0.5, strongMagnitude = 0.5) {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gamepad = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];
    
    if (!gamepad?.vibrationActuator) return;

    try {
      gamepad.vibrationActuator.playEffect("dual-rumble", {
        startDelay: 0,
        duration: duration,
        weakMagnitude: weakMagnitude,
        strongMagnitude: strongMagnitude,
      });
    } catch (e) {
      console.log("Vibration not supported:", e);
    }
  }

  // Haunting vibration pattern while witch is active
  startWitchVibration() {
    this.stopWitchVibration(); // Clear any existing
    this.witchVibrationInterval = setInterval(() => {
      if (this.gameState.witch && this.gameState.witch.isActive) {
        this.vibrateController(50, 0.2, 0.1);
      }
    }, 500);
  }

  stopWitchVibration() {
    if (this.witchVibrationInterval) {
      clearInterval(this.witchVibrationInterval);
      this.witchVibrationInterval = null;
    }
  }
}

// Global multiplayer mode instance
window.multiplayerMode = null;

// Global function to start multiplayer mode
window.startMultiplayerMode = function (playerName) {
  console.log("*** STARTING MULTIPLAYER MODE GLOBALLY ***");
  window.isPracticeMode = false;
  window.practiceMode = false;
  
  // Hide home screen immediately
  const homeScreen = document.getElementById("homeScreen");
  if (homeScreen) {
    homeScreen.style.display = "none";
    homeScreen.style.visibility = "hidden";
    console.log("Home screen hidden");
  }
  
  // Show waiting screen immediately with !important-like approach
  const waitingScreen = document.getElementById("waitingScreen");
  if (waitingScreen) {
    waitingScreen.style.cssText = "display: flex !important; visibility: visible !important; opacity: 1 !important;";
    console.log("Waiting screen shown - display:", waitingScreen.style.display);
    console.log("Waiting screen computed:", window.getComputedStyle(waitingScreen).display);
  } else {
    console.error("Waiting screen element not found!");
  }
  
  window.multiplayerMode = new MultiplayerMode();
  // Store the player name for when socket connects
  window.multiplayerMode.pendingPlayerName = playerName;
  console.log("*** CREATED MULTIPLAYER MODE INSTANCE ***");
  window.multiplayerMode.connect();
  console.log("*** MULTIPLAYER MODE CONNECT CALLED ***");

  // The joinGame will be called automatically when socket connects (see setupSocketEvents)
  // But also try immediately in case socket is already connected
  setTimeout(() => {
    if (window.multiplayerMode && window.multiplayerMode.socket && window.multiplayerMode.socket.connected) {
      if (window.multiplayerMode.pendingPlayerName) {
        console.log("Socket already connected, joining game immediately");
        window.multiplayerMode.joinGame(window.multiplayerMode.pendingPlayerName);
        window.multiplayerMode.pendingPlayerName = null;
      }
    } else {
      console.log("Socket not connected yet, will auto-join when connected");
    }
  }, 100);
};

// Global function for joining game (for compatibility)
window.joinGame = function () {
  if (window.multiplayerMode) {
    const playerName = window.playerName || "Player";
    window.multiplayerMode.joinGame(playerName);
  }
};
