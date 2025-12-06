/**
 * Local Multiplayer Setup and Integration
 * Handles the setup UI and game initialization for local multiplayer
 */

class LocalMultiplayerSetup {
  constructor() {
    this.playerCount = 2;
    this.playerNames = [];
    this.playerColors = ['#00ff41', '#ff6b00', '#ffd700', '#ff69b4'];
    this.gameSettings = null;
    this.game = null;
    this.connectedControllers = [];
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupControllerDetection();
    this.updatePlayerNameInputs();
  }

  setupControllerDetection() {
    // Listen for gamepad connections
    window.addEventListener('gamepadconnected', () => {
      this.updateConnectedControllers();
      this.updateLocalMultiplayerButton();
    });

    window.addEventListener('gamepaddisconnected', () => {
      this.updateConnectedControllers();
      this.updateLocalMultiplayerButton();
    });

    // Initial check
    this.updateConnectedControllers();
    this.updateLocalMultiplayerButton();
  }

  updateConnectedControllers() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    this.connectedControllers = Array.from(gamepads).filter(gp => gp !== null);
  }

  updateLocalMultiplayerButton() {
    const localBtn = document.getElementById('localMultiplayerBtn');
    if (!localBtn) return;

    const controllerCount = this.connectedControllers.length;
    
    if (controllerCount >= 2) {
      // Enable button - enough controllers
      localBtn.disabled = false;
      localBtn.style.opacity = '1';
      localBtn.innerHTML = `<span>🎮 LOCAL MULTIPLAYER (${controllerCount} Controllers)</span>`;
    } else {
      // Disable button - need more controllers
      localBtn.disabled = true;
      localBtn.style.opacity = '0.5';
      localBtn.innerHTML = `<span>🎮 LOCAL MULTIPLAYER (Need ${2 - controllerCount} more controller${controllerCount === 1 ? '' : 's'})</span>`;
    }
  }

  bindEvents() {
    // Local multiplayer button
    const localBtn = document.getElementById('localMultiplayerBtn');
    if (localBtn) {
      localBtn.addEventListener('click', () => {
        if (this.connectedControllers.length >= 2) {
          this.showSetup();
        } else {
          this.showControllerRequiredMessage();
        }
      });
    }

    // Player count buttons
    document.querySelectorAll('.player-count-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.setPlayerCount(parseInt(e.target.dataset.count));
      });
    });

    // Start game button
    const startBtn = document.getElementById('startLocalGameBtn');
    if (startBtn) {
      startBtn.addEventListener('click', () => this.startGame());
    }

    // Cancel button
    const cancelBtn = document.getElementById('cancelLocalSetupBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.hideSetup());
    }
  }

  showSetup() {
    // Refresh controller count
    this.updateConnectedControllers();
    
    if (this.connectedControllers.length < 2) {
      this.showControllerRequiredMessage();
      return;
    }

    const setupScreen = document.getElementById('localMultiplayerSetup');
    if (setupScreen) {
      setupScreen.style.display = 'flex';
      
      // Set max player count based on controllers
      const maxPlayers = Math.min(4, this.connectedControllers.length);
      this.playerCount = Math.min(this.playerCount, maxPlayers);
      
      // Update player count buttons
      document.querySelectorAll('.player-count-btn').forEach(btn => {
        const count = parseInt(btn.dataset.count);
        if (count > maxPlayers) {
          btn.disabled = true;
          btn.style.opacity = '0.4';
          btn.title = `Need ${count} controllers`;
        } else {
          btn.disabled = false;
          btn.style.opacity = '1';
          btn.title = '';
        }
      });
      
      // Pre-fill player 1 name from cookie
      if (window.simpleAuth && window.simpleAuth.hasName()) {
        const input = document.getElementById('localPlayer1Name');
        if (input) input.value = window.simpleAuth.getName();
      }
      
      this.setPlayerCount(this.playerCount);
    }
  }

  hideSetup() {
    const setupScreen = document.getElementById('localMultiplayerSetup');
    if (setupScreen) {
      setupScreen.style.display = 'none';
    }
  }

  showControllerRequiredMessage() {
    // Show a message that controllers are required
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="dialog-content haunted-panel glow" style="max-width: 400px; text-align: center;">
        <h2 class="spooky-title" style="font-size: 1.5rem;">🎮 Controllers Required 🎮</h2>
        <p style="color: #b8b8b8; margin: 20px 0;">
          Local multiplayer requires at least 2 game controllers connected to your device.
        </p>
        <p style="color: var(--ghost-green); margin-bottom: 20px;">
          Currently detected: ${this.connectedControllers.length} controller(s)
        </p>
        <p style="color: #666; font-size: 0.9rem; margin-bottom: 20px;">
          Connect Xbox, PlayStation, or other compatible controllers and try again.
        </p>
        <button class="spooky-btn" onclick="this.parentElement.parentElement.remove()">
          Got it!
        </button>
      </div>
    `;
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  setPlayerCount(count) {
    this.playerCount = count;
    
    // Update button states
    document.querySelectorAll('.player-count-btn').forEach(btn => {
      const btnCount = parseInt(btn.dataset.count);
      if (btnCount === count) {
        btn.style.borderColor = 'var(--ghost-green)';
        btn.style.boxShadow = '0 0 15px rgba(0, 255, 65, 0.5)';
      } else {
        btn.style.borderColor = '';
        btn.style.boxShadow = '';
      }
    });

    this.updatePlayerNameInputs();
  }

  updatePlayerNameInputs() {
    const container = document.getElementById('playerNameInputs');
    if (!container) return;

    container.innerHTML = '';

    for (let i = 1; i <= this.playerCount; i++) {
      const color = this.playerColors[i - 1];
      const defaultName = i === 1 && window.simpleAuth?.hasName() 
        ? window.simpleAuth.getName() 
        : `Player ${i}`;

      const inputDiv = document.createElement('div');
      inputDiv.style.cssText = 'display: flex; align-items: center; margin-bottom: 10px; gap: 10px;';
      inputDiv.innerHTML = `
        <span style="color: ${color}; font-size: 1.5rem; width: 30px;">👻</span>
        <input type="text" id="localPlayer${i}Name" class="spectral-input" 
               placeholder="Player ${i}" value="${defaultName}" maxlength="15"
               style="flex: 1; border-color: ${color};">
        <button class="keyboard-btn spooky-btn" data-player="${i}" 
                style="padding: 8px 12px; font-size: 0.9rem; min-width: auto;">
          ⌨️
        </button>
      `;
      container.appendChild(inputDiv);
    }
    
    // Add keyboard button listeners
    this.setupKeyboardButtons();
  }
  
  setupKeyboardButtons() {
    document.querySelectorAll('.keyboard-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const playerNum = e.target.dataset.player;
        const input = document.getElementById(`localPlayer${playerNum}Name`);
        
        if (input && window.onScreenKeyboard) {
          window.onScreenKeyboard.show(input, (value) => {
            input.value = value;
          });
        }
      });
    });
  }

  getPlayerNames() {
    const names = [];
    for (let i = 1; i <= this.playerCount; i++) {
      const input = document.getElementById(`localPlayer${i}Name`);
      names.push(input?.value?.trim() || `Player ${i}`);
    }
    return names;
  }

  startGame() {
    // Get settings
    const duration = parseInt(document.getElementById('localGameDuration')?.value || 120);
    const winningScore = parseInt(document.getElementById('localWinningScore')?.value || 500);
    const playerNames = this.getPlayerNames();

    // Validate
    if (playerNames.some(name => !name)) {
      alert('Please enter names for all players!');
      return;
    }

    // Hide setup
    this.hideSetup();
    
    // Hide home screen
    const homeScreen = document.getElementById('homeScreen');
    if (homeScreen) homeScreen.style.display = 'none';

    // Initialize local multiplayer game
    this.initializeGame(playerNames, duration, winningScore);
  }

  initializeGame(playerNames, duration, winningScore) {

    // Create game settings
    const settings = {
      playerCount: playerNames.length,
      gameDuration: duration,
      winCondition: 'score',
      targetScore: winningScore,
      mapWidth: 20,
      mapHeight: 15,
      bombsEnabled: true,
      maxPlayers: 4
    };

    // Show game canvas - ensure it's visible
    const canvas = document.getElementById('gameCanvas');
    const scoreboard = document.getElementById('scoreboard');
    const gameContainer = document.querySelector('.game-container');
    
    if (gameContainer) {
      gameContainer.style.display = 'flex';
    }
    
    if (canvas) {
      canvas.style.display = 'block';
      canvas.style.visibility = 'visible';
      console.log('Canvas shown for local multiplayer:', canvas.width, 'x', canvas.height);
    } else {
      console.error('Canvas element not found!');
    }
    
    if (scoreboard) {
      scoreboard.style.display = 'block';
    }

    // Enter fullscreen mode like practice mode
    if (typeof enterFullscreenMode === 'function') {
      enterFullscreenMode();
    }

    // Initialize game state
    this.initLocalGameState(playerNames, settings);
  }

  initLocalGameState(playerNames, settings) {
    // Create local game state similar to practice mode but with multiple players
    const gameState = {
      mapWidth: settings.mapWidth,
      mapHeight: settings.mapHeight,
      players: {},
      coins: [],
      bombs: [],
      enemies: [],
      witch: null,
      winningScore: settings.targetScore,
      difficultyLevel: 1,
      gameStarted: true,
      gameEnded: false,
      isPaused: false,
      isLocalMultiplayer: true,
      timeRemaining: settings.gameDuration
    };

    // Initialize witch enemy
    if (typeof WitchEnemy !== 'undefined') {
      this.witch = new WitchEnemy(settings.mapWidth, settings.mapHeight);
      console.log('🧙‍♀️ Witch enemy initialized for local multiplayer');
    }

    // Starting positions for players
    const startPositions = [
      { x: 2, y: 2 },
      { x: settings.mapWidth - 3, y: 2 },
      { x: 2, y: settings.mapHeight - 3 },
      { x: settings.mapWidth - 3, y: settings.mapHeight - 3 }
    ];

    // Add players
    playerNames.forEach((name, index) => {
      const playerId = `local_player_${index + 1}`;
      const pos = startPositions[index];
      
      gameState.players[playerId] = {
        id: playerId,
        name: name,
        x: pos.x,
        y: pos.y,
        score: 0,
        color: this.playerColors[index],
        character: 'Alex',
        direction: 'right',
        mood: 'happy',
        isActive: true,
        playerIndex: index + 1
      };
    });

    // Generate coins
    for (let i = 0; i < 15; i++) {
      gameState.coins.push({
        id: i,
        x: Math.floor(Math.random() * (settings.mapWidth - 2)) + 1,
        y: Math.floor(Math.random() * (settings.mapHeight - 2)) + 1,
        collected: false,
        value: 10
      });
    }

    // Generate enemies
    for (let i = 0; i < 9; i++) {
      gameState.enemies.push({
        id: i,
        x: Math.floor(Math.random() * (settings.mapWidth - 4)) + 2,
        y: Math.floor(Math.random() * (settings.mapHeight - 4)) + 2,
        direction: Math.floor(Math.random() * 4)
      });
    }

    // Store game state globally
    window.localGameState = gameState;
    window.localGameSettings = settings;
    window.isLocalMultiplayer = true;
    
    // Set global gameStarted flag for ESC key pause to work
    window.gameStarted = true;
    if (typeof gameStarted !== 'undefined') {
      gameStarted = true;
    }

    // Start the game loop
    this.startLocalGameLoop(gameState, settings);
    
    // Update scoreboard
    this.updateLocalScoreboard(gameState);

    // Setup keyboard controls
    this.setupLocalControls(gameState);

    // Start timer
    this.startLocalTimer(gameState, settings);
  }

  setupLocalControls(gameState) {
    // Track last move time for each player (for movement cooldown)
    const lastMoveTime = {};
    const MOVE_COOLDOWN = 150; // ms between moves
    const BOOST_COOLDOWN = 75; // Faster movement when boosting (R2 held)
    const AXIS_THRESHOLD = 0.5; // Joystick threshold
    const R2_TRIGGER_THRESHOLD = 0.5; // Trigger threshold for boost
    let lastPauseButtonState = false; // Track pause button state for edge detection

    // Gamepad polling loop
    const pollGamepads = () => {
      // Don't process game input if on-screen keyboard is active
      if (window.onScreenKeyboardActive === true) {
        window.localGamepadPoll = requestAnimationFrame(pollGamepads);
        return;
      }

      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const currentTime = Date.now();
      
      // Check for pause button on any controller (Start button - button 9)
      let pausePressed = false;
      for (const gamepad of gamepads) {
        if (gamepad && gamepad.buttons[9]?.pressed) {
          pausePressed = true;
          break;
        }
      }
      
      // Toggle pause on rising edge (button just pressed)
      if (pausePressed && !lastPauseButtonState) {
        gameState.isPaused = !gameState.isPaused;
        if (gameState.isPaused) {
          // Show pause screen
          if (typeof window.pauseGame === 'function') {
            window.pauseGame();
          }
        } else {
          // Hide pause screen
          if (typeof window.resumeGame === 'function') {
            window.resumeGame();
          }
        }
      }
      lastPauseButtonState = pausePressed;
      
      // Skip movement processing if paused or game ended
      if (gameState.gameEnded || gameState.isPaused) {
        window.localGamepadPoll = requestAnimationFrame(pollGamepads);
        return;
      }

      // Check each connected gamepad
      gamepads.forEach((gamepad, index) => {
        if (!gamepad) return;
        
        const playerId = `local_player_${index + 1}`;
        const player = gameState.players[playerId];
        if (!player) return;

        // Check if R2 trigger is pressed for speed boost (button 7 on standard gamepad)
        // R2 can be a button or an axis depending on the controller
        let isBoosting = false;
        if (gamepad.buttons[7]?.pressed || gamepad.buttons[7]?.value > R2_TRIGGER_THRESHOLD) {
          isBoosting = true;
        }
        // Also check axis 5 for R2 on some controllers (value ranges from -1 to 1, pressed is > 0)
        if (gamepad.axes.length > 5 && gamepad.axes[5] > R2_TRIGGER_THRESHOLD) {
          isBoosting = true;
        }

        // Check cooldown (faster when boosting)
        const cooldown = isBoosting ? BOOST_COOLDOWN : MOVE_COOLDOWN;
        if (lastMoveTime[playerId] && currentTime - lastMoveTime[playerId] < cooldown) {
          return;
        }

        let newX = player.x;
        let newY = player.y;
        let moved = false;

        // Check D-pad (buttons 12-15 on standard gamepad)
        if (gamepad.buttons[12]?.pressed) { newY--; moved = true; player.direction = 'up'; }
        if (gamepad.buttons[13]?.pressed) { newY++; moved = true; player.direction = 'down'; }
        if (gamepad.buttons[14]?.pressed) { newX--; moved = true; player.direction = 'left'; }
        if (gamepad.buttons[15]?.pressed) { newX++; moved = true; player.direction = 'right'; }

        // Check left analog stick (axes 0 and 1)
        if (!moved && gamepad.axes.length >= 2) {
          const axisX = gamepad.axes[0];
          const axisY = gamepad.axes[1];

          if (axisY < -AXIS_THRESHOLD) { newY--; moved = true; player.direction = 'up'; }
          if (axisY > AXIS_THRESHOLD) { newY++; moved = true; player.direction = 'down'; }
          if (axisX < -AXIS_THRESHOLD) { newX--; moved = true; player.direction = 'left'; }
          if (axisX > AXIS_THRESHOLD) { newX++; moved = true; player.direction = 'right'; }
        }

        if (moved && this.isValidMove(newX, newY, gameState)) {
          player.x = newX;
          player.y = newY;
          lastMoveTime[playerId] = currentTime;
          this.checkLocalCollisions(playerId, gameState);
        }
      });

      window.localGamepadPoll = requestAnimationFrame(pollGamepads);
    };

    // Start polling
    window.localGamepadPoll = requestAnimationFrame(pollGamepads);
  }

  isValidMove(x, y, gameState) {
    return x > 0 && x < gameState.mapWidth - 1 && 
           y > 0 && y < gameState.mapHeight - 1;
  }

  // Vibrate a specific controller by index
  vibrateController(gamepadIndex, duration = 100, weakMagnitude = 0.5, strongMagnitude = 0.5) {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gamepad = gamepads[gamepadIndex];
    
    if (!gamepad?.vibrationActuator) return;

    try {
      gamepad.vibrationActuator.playEffect("dual-rumble", {
        startDelay: 0,
        duration: duration,
        weakMagnitude: weakMagnitude,
        strongMagnitude: strongMagnitude,
      });
    } catch (e) {
      // Vibration not supported
    }
  }

  // Get gamepad index from player ID
  getGamepadIndexFromPlayerId(playerId) {
    const match = playerId.match(/local_player_(\d+)/);
    return match ? parseInt(match[1]) - 1 : 0;
  }

  checkLocalCollisions(playerId, gameState) {
    const player = gameState.players[playerId];
    if (!player) return;

    const gamepadIndex = this.getGamepadIndexFromPlayerId(playerId);

    // Check coin collisions
    gameState.coins.forEach(coin => {
      if (!coin.collected && coin.x === player.x && coin.y === player.y) {
        coin.collected = true;
        player.score += coin.value;
        
        // Light vibration for coin collect
        this.vibrateController(gamepadIndex, 50, 0.3, 0.1);
        
        // Respawn coin
        setTimeout(() => {
          coin.x = Math.floor(Math.random() * (gameState.mapWidth - 2)) + 1;
          coin.y = Math.floor(Math.random() * (gameState.mapHeight - 2)) + 1;
          coin.collected = false;
        }, 2000);

        this.updateLocalScoreboard(gameState);
        this.checkWinCondition(gameState);

        // Show effect
        if (window.spookyEffects) {
          window.spookyEffects.coinBurst(player.x * 32 + 200, player.y * 32 + 100);
        }
      }
    });

    // Check enemy collisions
    gameState.enemies.forEach(enemy => {
      if (enemy.x === player.x && enemy.y === player.y) {
        player.score = Math.max(0, player.score - 5);
        
        // Medium vibration for enemy hit
        this.vibrateController(gamepadIndex, 150, 0.6, 0.4);
        
        this.updateLocalScoreboard(gameState);
        
        if (window.spookyEffects) {
          window.spookyEffects.screenShake();
        }
      }
    });

    // Check bomb collisions
    gameState.bombs?.forEach(bomb => {
      if (!bomb.exploded && bomb.x === player.x && bomb.y === player.y) {
        bomb.exploded = true;
        player.score = Math.max(0, player.score - 20);
        
        // Strong vibration for bomb hit
        this.vibrateController(gamepadIndex, 300, 1.0, 1.0);
        
        this.updateLocalScoreboard(gameState);
        
        if (window.spookyEffects) {
          window.spookyEffects.screenShake();
        }
      }
    });
  }

  checkWinCondition(gameState) {
    const settings = window.localGameSettings;
    
    Object.values(gameState.players).forEach(player => {
      if (player.score >= settings.targetScore) {
        this.endLocalGame(gameState, player);
      }
    });
  }

  startLocalGameLoop(gameState, settings) {
    // Enemy movement
    const moveEnemies = () => {
      if (gameState.gameEnded || gameState.isPaused) return;

      gameState.enemies.forEach(enemy => {
        const directions = [
          { dx: 0, dy: -1 },
          { dx: 1, dy: 0 },
          { dx: 0, dy: 1 },
          { dx: -1, dy: 0 }
        ];

        // Random direction change
        if (Math.random() < 0.1) {
          enemy.direction = Math.floor(Math.random() * 4);
        }

        const dir = directions[enemy.direction];
        const newX = enemy.x + dir.dx;
        const newY = enemy.y + dir.dy;

        if (this.isValidMove(newX, newY, gameState)) {
          enemy.x = newX;
          enemy.y = newY;
        } else {
          enemy.direction = Math.floor(Math.random() * 4);
        }

        // Check collision with players
        Object.keys(gameState.players).forEach(playerId => {
          this.checkLocalCollisions(playerId, gameState);
        });
      });

      // Update witch
      if (this.witch) {
        const players = Object.values(gameState.players);
        this.witch.update(players);
        
        // Check witch collision with all players
        players.forEach((player, index) => {
          if (this.witch.checkCollision(player)) {
            this.witch.catchPlayer(player);
            player.score = Math.max(0, player.score - 30);
            
            // Vibrate the player's controller
            const gamepadIndex = index;
            this.vibrateController(gamepadIndex, 500, 1.0, 1.0);
            
            // Show notification
            if (window.spookyEffects) {
              window.spookyEffects.screenShake();
            }
            
            this.updateLocalScoreboard(gameState);
          }
        });
        
        // Add witch to game state for rendering
        gameState.witch = this.witch.getState();
      }
    };

    // Render loop
    const render = () => {
      if (gameState.gameEnded) return;

      // Initialize renderer if not available
      if (!window.gameRenderer && typeof GameRenderer !== 'undefined') {
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
          window.gameRenderer = new GameRenderer('gameCanvas');
          console.log('GameRenderer initialized for local multiplayer');
        } else {
          console.error('Cannot initialize renderer - canvas not found');
        }
      }

      if (window.gameRenderer) {
        window.gameRenderer.render(gameState);
      } else {
        console.warn('GameRenderer not available for rendering');
      }

      window.localRenderFrame = requestAnimationFrame(render);
    };

    // Start loops
    window.localEnemyInterval = setInterval(moveEnemies, 500);
    render();
  }

  startLocalTimer(gameState, settings) {
    window.localTimerInterval = setInterval(() => {
      if (gameState.gameEnded || gameState.isPaused) return;

      gameState.timeRemaining--;
      
      // Update timer display (created in updateLocalScoreboard)
      const timerDisplay = document.getElementById('localGameTimer');
      if (timerDisplay) {
        const minutes = Math.floor(gameState.timeRemaining / 60);
        const seconds = gameState.timeRemaining % 60;
        timerDisplay.textContent = `⏳ ${minutes}:${seconds.toString().padStart(2, '0')}`;
      }

      if (gameState.timeRemaining <= 0) {
        // Find winner by highest score
        const players = Object.values(gameState.players);
        const winner = players.reduce((a, b) => a.score > b.score ? a : b);
        this.endLocalGame(gameState, winner);
      }
    }, 1000);
  }

  updateLocalScoreboard(gameState) {
    const scoreboard = document.getElementById('scoreboard');
    if (!scoreboard) return;

    // Sort players by score
    const sortedPlayers = Object.values(gameState.players)
      .sort((a, b) => b.score - a.score);

    // Get current timer value to preserve it
    const existingTimer = document.getElementById('localGameTimer');
    const timerValue = existingTimer ? existingTimer.textContent : '';

    // Update scoreboard HTML
    let html = '<h3>👻 Scoreboard 👻</h3>';
    
    // Single timer display
    const minutes = Math.floor(gameState.timeRemaining / 60);
    const seconds = gameState.timeRemaining % 60;
    const timeDisplay = timerValue || `⏳ ${minutes}:${seconds.toString().padStart(2, '0')}`;
    html += `<div id="localGameTimer" class="cursed-timer" style="text-align: center; margin-bottom: 15px; font-size: 1.5rem;">${timeDisplay}</div>`;

    sortedPlayers.forEach((player, index) => {
      const isFirst = index === 0;
      html += `
        <div class="spooky-score-item ${isFirst ? 'first-place' : ''}" style="border-left: 4px solid ${player.color};">
          <span class="rank">${index + 1}</span>
          <span class="player-name" style="color: ${player.color};">${player.name}</span>
          <span class="score">${player.score}</span>
        </div>
      `;
    });

    scoreboard.innerHTML = html;
  }

  endLocalGame(gameState, winner) {
    gameState.gameEnded = true;

    // Stop loops
    clearInterval(window.localEnemyInterval);
    clearInterval(window.localTimerInterval);
    cancelAnimationFrame(window.localRenderFrame);
    cancelAnimationFrame(window.localGamepadPoll);

    // Show winner screen
    const winnerScreen = document.getElementById('winnerScreen');
    const winnerTitle = document.getElementById('winnerTitle');
    const winnerMessage = document.getElementById('winnerMessage');

    if (winnerScreen) {
      winnerScreen.style.display = 'flex';
      
      if (winnerTitle) {
        winnerTitle.textContent = `🏆 ${winner.name} WINS! 🏆`;
        winnerTitle.style.color = winner.color;
      }
      
      if (winnerMessage) {
        const scores = Object.values(gameState.players)
          .map(p => `${p.name}: ${p.score}`)
          .join(' | ');
        winnerMessage.textContent = `Final Scores: ${scores}`;
      }
    }

    // Setup return buttons
    const playAgainBtn = document.getElementById('playAgainBtn');
    const homeBtn = document.getElementById('homeBtn');

    if (playAgainBtn) {
      playAgainBtn.onclick = () => {
        winnerScreen.style.display = 'none';
        this.showSetup();
      };
    }

    if (homeBtn) {
      homeBtn.onclick = () => {
        console.log("Local multiplayer - returning to home");
        
        // Stop all game loops
        if (window.localEnemyInterval) {
          clearInterval(window.localEnemyInterval);
          window.localEnemyInterval = null;
        }
        if (window.localTimerInterval) {
          clearInterval(window.localTimerInterval);
          window.localTimerInterval = null;
        }
        if (window.localRenderFrame) {
          cancelAnimationFrame(window.localRenderFrame);
          window.localRenderFrame = null;
        }
        if (window.localGamepadPoll) {
          cancelAnimationFrame(window.localGamepadPoll);
          window.localGamepadPoll = null;
        }
        
        // Reset game state
        window.localGameState = null;
        window.localGameSettings = null;
        window.isLocalMultiplayer = false;
        
        // Hide game screens
        winnerScreen.style.display = 'none';
        document.getElementById('gameCanvas').style.display = 'none';
        document.getElementById('scoreboard').style.display = 'none';
        
        // Show home screen
        document.getElementById('homeScreen').style.display = 'flex';
        
        exitFullscreenMode();
        
        console.log("Local multiplayer cleanup complete");
      };
    }
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.localMultiplayerSetup = new LocalMultiplayerSetup();
});

// Local multiplayer setup loaded
