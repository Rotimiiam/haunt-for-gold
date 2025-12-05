// Practice Mode - Single Player Game Logic
console.log("Practice mode script loaded");

class PracticeMode {
  constructor() {
    this.gameState = {
      players: {},
      coins: [],
      enemies: [],
      myId: "player1",
      mapWidth: 20,
      mapHeight: 15,
      winningScore: 100,
      difficultyLevel: 1,
      startTime: null,
    };
    this.gameStarted = false;
    this.lastMoveTime = 0;
    this.MOVE_COOLDOWN = 150;
    this.BOOST_COOLDOWN = 75; // Faster movement when boosting
    this.isBoosting = false;
    this.gamepadPollId = null;
    this.activeGamepad = null;
    
    // Initialize witch enemy
    this.witch = null;
    if (typeof WitchEnemy !== 'undefined') {
      this.witch = new WitchEnemy(this.gameState.mapWidth, this.gameState.mapHeight);
      console.log('Witch enemy initialized for practice mode');
    }
  }

  start() {
    console.log("Starting practice mode");

    // Stop any existing game loops
    window.gameStarted = false;

    // Get player name
    const currentPlayerName = window.playerName || "Player";

    // Set game start time
    this.gameState.startTime = Date.now();

    // Get random characters
    const playerCharacter = getRandomCharacter();
    let aiCharacter = getRandomCharacter();
    while (aiCharacter === playerCharacter) {
      aiCharacter = getRandomCharacter();
    }

    // Initialize players
    this.gameState.players = {
      player1: {
        id: "player1",
        name: currentPlayerName,
        x: 2,
        y: 2,
        color: "#4CAF50",
        character: playerCharacter,
        direction: "right",
        mood: "happy",
        score: 0,
        coinsCollected: 0,
        enemiesHit: 0,
        bombsHit: 0,
        isActive: true,
      },
      ai: {
        id: "ai",
        name: "Computer",
        x: 17,
        y: 12,
        color: "#ff6b6b",
        character: aiCharacter,
        direction: "left",
        mood: "happy",
        score: 0,
        coinsCollected: 0,
        enemiesHit: 0,
        bombsHit: 0,
        isActive: true,
      },
    };

    // Generate game elements
    this.generateCoins();
    this.generateEnemies();

    // Set up controls
    this.setupControls();

    // Start the game
    this.startGame();

    // Start AI with a delay
    setTimeout(() => {
      this.startAI();
    }, 2000);
  }

  generateCoins() {
    this.gameState.coins = [];
    // Generate 12 regular coins
    for (let i = 0; i < 12; i++) {
      this.gameState.coins.push({
        id: i,
        x: Math.floor(Math.random() * (this.gameState.mapWidth - 2)) + 1,
        y: Math.floor(Math.random() * (this.gameState.mapHeight - 2)) + 1,
        collected: false,
        type: "normal",
        value: 10,
      });
    }
    // Generate 3 bombs
    for (let i = 0; i < 3; i++) {
      this.gameState.coins.push({
        id: 12 + i,
        x: Math.floor(Math.random() * (this.gameState.mapWidth - 2)) + 1,
        y: Math.floor(Math.random() * (this.gameState.mapHeight - 2)) + 1,
        collected: false,
        type: "bomb",
        value: -20,
      });
    }
  }

  generateEnemies() {
    this.gameState.enemies = [];
    for (let i = 0; i < 9; i++) {
      this.gameState.enemies.push({
        id: i,
        x: Math.floor(Math.random() * (this.gameState.mapWidth - 4)) + 2,
        y: Math.floor(Math.random() * (this.gameState.mapHeight - 4)) + 2,
        direction: Math.floor(Math.random() * 4),
        moveCounter: 0,
      });
    }
  }

  setupControls() {
    // Button controls
    document
      .getElementById("up")
      .addEventListener("click", () => this.move("up"));
    document
      .getElementById("down")
      .addEventListener("click", () => this.move("down"));
    document
      .getElementById("left")
      .addEventListener("click", () => this.move("left"));
    document
      .getElementById("right")
      .addEventListener("click", () => this.move("right"));

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

    // Start gamepad polling
    this.startGamepadPolling();
  }

  startGamepadPolling() {
    const AXIS_THRESHOLD = 0.5;
    const R2_TRIGGER_THRESHOLD = 0.5;

    const pollGamepad = () => {
      if (!this.gameStarted) {
        this.gamepadPollId = requestAnimationFrame(pollGamepad);
        return;
      }

      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gamepad = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];

      if (!gamepad) {
        this.gamepadPollId = requestAnimationFrame(pollGamepad);
        return;
      }

      // Store active gamepad for vibration
      this.activeGamepad = gamepad;

      // Check R2 trigger for boost (button 7 or axis 5)
      let isBoosting = false;
      if (gamepad.buttons[7]?.pressed || gamepad.buttons[7]?.value > R2_TRIGGER_THRESHOLD) {
        isBoosting = true;
      }
      if (gamepad.axes.length > 5 && gamepad.axes[5] > R2_TRIGGER_THRESHOLD) {
        isBoosting = true;
      }
      this.isBoosting = isBoosting;

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

      this.gamepadPollId = requestAnimationFrame(pollGamepad);
    };

    this.gamepadPollId = requestAnimationFrame(pollGamepad);
  }

  // Vibrate controller for feedback
  vibrateController(duration = 100, weakMagnitude = 0.5, strongMagnitude = 0.5) {
    if (!this.activeGamepad?.vibrationActuator) return;

    try {
      this.activeGamepad.vibrationActuator.playEffect("dual-rumble", {
        startDelay: 0,
        duration: duration,
        weakMagnitude: weakMagnitude,
        strongMagnitude: strongMagnitude,
      });
    } catch (e) {
      // Vibration not supported or failed
      console.log("Vibration not supported:", e);
    }
  }

  move(direction) {
    // Check movement cooldown (faster when boosting)
    const currentTime = Date.now();
    const cooldown = this.isBoosting ? this.BOOST_COOLDOWN : this.MOVE_COOLDOWN;
    if (currentTime - this.lastMoveTime < cooldown) {
      return;
    }
    this.lastMoveTime = currentTime;

    this.handleMovement(direction);
  }

  handleMovement(direction) {
    const player = this.gameState.players[this.gameState.myId];
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
      newX < this.gameState.mapWidth - 1 &&
      newY >= 1 &&
      newY < this.gameState.mapHeight - 1
    ) {
      // Check collision with AI player
      const aiPlayer = this.gameState.players["ai"];
      if (!aiPlayer || !(aiPlayer.x === newX && aiPlayer.y === newY)) {
        player.x = newX;
        player.y = newY;

        // Check coin collection
        this.checkCoinCollection(player);

        // Check enemy collision
        this.checkEnemyCollision(player);

        // Check if we need to respawn coins
        this.checkCoinRespawn();

        // Update display
        this.updateDisplay();
      }
    }
  }

  checkCoinCollection(player) {
    const coin = this.gameState.coins.find(
      (c) => c.x === player.x && c.y === player.y && !c.collected
    );

    if (coin) {
      coin.collected = true;

      if (coin.type === "bomb") {
        player.score = Math.max(0, player.score - 20);
        player.mood = "sad";
        player.bombsHit = (player.bombsHit || 0) + 1;
        showNotification("Bomb Hit!", "-20 points");
        // Strong vibration for bomb hit
        this.vibrateController(300, 1.0, 1.0);
      } else {
        player.score += 10;
        player.mood = "happy";
        player.coinsCollected = (player.coinsCollected || 0) + 1;
        // Light vibration for coin collect
        this.vibrateController(50, 0.3, 0.1);
      }

      // Check for winner
      if (player.score >= this.gameState.winningScore) {
        // Victory vibration pattern
        this.vibrateController(500, 0.8, 0.8);
        this.showWinner({
          winnerId: this.gameState.myId,
          winnerName: player.name,
          winnerScore: player.score,
        });
      }
    }
  }

  checkEnemyCollision(player) {
    const enemy = this.gameState.enemies.find(
      (e) => e.x === player.x && e.y === player.y
    );

    if (enemy) {
      player.score = Math.max(0, player.score - 5);
      player.mood = "sad";
      player.enemiesHit = (player.enemiesHit || 0) + 1;
      // Medium vibration for enemy hit
      this.vibrateController(150, 0.6, 0.4);
    }
  }

  startAI() {
    // AI movement interval
    setInterval(() => {
      if (!this.gameStarted) return;

      const ai = this.gameState.players["ai"];
      if (!ai) return;

      // Simple AI: move towards nearest coin
      const nearestCoin = this.findNearestCoin(ai);
      if (nearestCoin) {
        this.moveAITowardsCoin(ai, nearestCoin);
      } else {
        this.moveAIRandomly(ai);
      }

      // Check AI coin collection
      this.checkAICoinCollection(ai);

      // Check if we need to respawn coins
      this.checkCoinRespawn();

      // Update display
      if (this.gameStarted) {
        this.updateDisplay();
      }
    }, 800);

    // Enemy movement interval
    setInterval(() => {
      if (!this.gameStarted) return;

      this.moveEnemies();

      // Update display
      if (this.gameStarted) {
        this.updateDisplay();
      }
    }, 200); // Enemies move faster than AI
  }

  findNearestCoin(player) {
    let nearestCoin = null;
    let minDistance = Infinity;

    this.gameState.coins.forEach((coin) => {
      // AI should only target regular coins, not bombs
      if (!coin.collected && coin.type !== 'bomb') {
        const distance =
          Math.abs(coin.x - player.x) + Math.abs(coin.y - player.y);
        if (distance < minDistance) {
          minDistance = distance;
          nearestCoin = coin;
        }
      }
    });

    return nearestCoin;
  }

  moveAITowardsCoin(ai, coin) {
    if (!coin || !ai) return;

    const dx = coin.x - ai.x;
    const dy = coin.y - ai.y;

    let newX = ai.x;
    let newY = ai.y;

    // Move towards coin
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0) {
        newX++;
        ai.direction = "right";
      } else {
        newX--;
        ai.direction = "left";
      }
    } else {
      if (dy > 0) {
        newY++;
      } else {
        newY--;
      }
    }

    // Check bounds and collision
    if (
      newX >= 1 &&
      newX < this.gameState.mapWidth - 1 &&
      newY >= 1 &&
      newY < this.gameState.mapHeight - 1
    ) {
      const humanPlayer = this.gameState.players[this.gameState.myId];
      if (!humanPlayer || !(humanPlayer.x === newX && humanPlayer.y === newY)) {
        ai.x = newX;
        ai.y = newY;
      }
    }
  }

  moveAIRandomly(ai) {
    const directions = ["up", "down", "left", "right"];
    const direction = directions[Math.floor(Math.random() * directions.length)];

    let newX = ai.x;
    let newY = ai.y;

    switch (direction) {
      case "up":
        newY--;
        break;
      case "down":
        newY++;
        break;
      case "left":
        newX--;
        ai.direction = "left";
        break;
      case "right":
        newX++;
        ai.direction = "right";
        break;
    }

    // Check bounds
    if (
      newX >= 1 &&
      newX < this.gameState.mapWidth - 1 &&
      newY >= 1 &&
      newY < this.gameState.mapHeight - 1
    ) {
      const humanPlayer = this.gameState.players[this.gameState.myId];
      if (!humanPlayer || !(humanPlayer.x === newX && humanPlayer.y === newY)) {
        ai.x = newX;
        ai.y = newY;
      }
    }
  }

  checkAICoinCollection(ai) {
    const coin = this.gameState.coins.find(
      (c) => c.x === ai.x && c.y === ai.y && !c.collected
    );

    if (coin) {
      coin.collected = true;
      ai.score += 10;
      ai.mood = "happy";

      // Check for AI winner
      if (ai.score >= this.gameState.winningScore) {
        this.showWinner({
          winnerId: "ai",
          winnerName: "Computer",
          winnerScore: ai.score,
        });
      }
    }
  }

  moveEnemies() {
    this.gameState.enemies.forEach((enemy) => {
      enemy.moveCounter = (enemy.moveCounter || 0) + 1;

      // Move every 3rd frame for slower movement
      if (enemy.moveCounter % 3 !== 0) return;

      // Change direction randomly sometimes
      if (Math.random() < 0.15) {
        enemy.direction = Math.floor(Math.random() * 4);
      }

      // Calculate new position based on direction
      let newX = enemy.x;
      let newY = enemy.y;

      switch (enemy.direction) {
        case 0:
          newY--;
          break; // up
        case 1:
          newY++;
          break; // down
        case 2:
          newX--;
          break; // left
        case 3:
          newX++;
          break; // right
      }

      // Check bounds
      if (
        newX >= 1 &&
        newX < this.gameState.mapWidth - 1 &&
        newY >= 1 &&
        newY < this.gameState.mapHeight - 1
      ) {
        enemy.x = newX;
        enemy.y = newY;
      } else {
        // Bounce off walls by changing direction
        enemy.direction = Math.floor(Math.random() * 4);
      }
    });
  }

  startGame() {
    console.log("Starting practice game");
    this.gameStarted = true;

    // Ensure GameRenderer is initialized
    if (!window.gameRenderer && typeof GameRenderer !== 'undefined') {
      window.gameRenderer = new GameRenderer('gameCanvas');
      console.log("GameRenderer initialized for practice mode");
    }

    // Hide home screen
    const homeScreen = document.getElementById("homeScreen");
    if (homeScreen) {
      homeScreen.style.display = "none";
    }

    // Set global game state for compatibility with core functions
    window.gameState = this.gameState;
    window.gameStarted = this.gameStarted;

    // Also set the global gameState variable directly
    if (typeof gameState !== "undefined") {
      gameState = this.gameState;
      gameStarted = this.gameStarted;
      gameStateInitialized = true;
    }

    // Hide waiting screen
    document.getElementById("waitingScreen").style.display = "none";

    // Show the correct game container (find the one containing the active canvas)
    const canvas = document.getElementById("gameCanvas");
    if (canvas) {
      const gameContainer = canvas.closest(".game-container");
      if (gameContainer) {
        gameContainer.style.display = "flex";
      }
    }

    // Show game elements
    document.getElementById("gameCanvas").style.display = "block";
    document.querySelector(".info").style.display = "none";
    document.getElementById("scoreboard").style.display = "block";

    // Show controls only on mobile (but mobile is blocked anyway)
    if (isMobile()) {
      document.querySelector(".controls").style.display = "grid";
    }

    // Enter fullscreen
    enterFullscreenMode();

    // Update displays
    this.updateDisplay();

    // Start practice game loop after a small delay to ensure old loops stop
    setTimeout(() => {
      this.startGameLoop();
    }, 100);
  }

  updateDisplay() {
    // Update global state for core functions
    window.gameState = this.gameState;
    window.gameStarted = this.gameStarted;

    // Update UI
    updatePlayerCount();
    updateScoreboard();

    // Draw the game
    if (this.gameStarted) {
      draw();
    }
  }

  startGameLoop() {
    const gameLoop = () => {
      if (this.gameStarted) {
        // Check if game is paused
        const isPaused = this.isPaused || 
                         document.getElementById('pauseOverlay')?.style.display === 'flex';
        
        if (!isPaused) {
          // Update witch
          if (this.witch) {
            const players = Object.values(this.gameState.players);
            this.witch.update(players);
            
            // Check witch collision with human player
            const humanPlayer = this.gameState.players[this.gameState.myId];
            if (humanPlayer && this.witch.checkCollision(humanPlayer)) {
              this.witch.catchPlayer(humanPlayer);
              humanPlayer.score = Math.max(0, humanPlayer.score - 30);
              showNotification("Caught by Witch!", "-30 points");
              this.vibrateController(500, 1.0, 1.0);
            }
            
            // Add witch to game state for rendering
            this.gameState.witch = this.witch.getState();
          }
          
          // Update global state for core functions
          window.gameState = this.gameState;
          window.gameStarted = this.gameStarted;

          // Also update global variables
          if (typeof gameState !== "undefined") {
            gameState = this.gameState;
            gameStarted = this.gameStarted;
          }

          // Draw the game
          if (typeof draw === "function") {
            draw();
          } else {
            console.error("Draw function not found");
          }
        }

        // Continue loop even when paused (so we can unpause)
        requestAnimationFrame(gameLoop);
      }
    };

    // Start the loop
    gameLoop();
  }

  showWinner(data) {
    this.gameStarted = false;
    window.gameStarted = false;
    showWinnerScreen(data);
  }

  checkCoinRespawn() {
    // Check if all regular coins are collected (ignore bombs)
    const uncollectedCoins = this.gameState.coins.filter(
      (coin) => !coin.collected && coin.type !== 'bomb'
    );

    if (uncollectedCoins.length === 0) {
      console.log("All regular coins collected, respawning...");
      // Respawn all coins (including new bombs)
      this.generateCoins();
    }
  }

  restart() {
    this.gameStarted = false;
    window.gameStarted = false;

    this.gameState = {
      players: {},
      coins: [],
      enemies: [],
      myId: "player1",
      mapWidth: 20,
      mapHeight: 15,
      winningScore: 100,
      difficultyLevel: 1,
      startTime: null,
    };
    this.start();
  }
}

// Global practice mode instance
window.practiceMode = null;

// Global function to start practice mode
window.startPracticeMode = function () {
  console.log("Starting practice mode globally");
  window.isPracticeMode = true;
  window.practiceMode = new PracticeMode();
  window.practiceMode.start();
};
