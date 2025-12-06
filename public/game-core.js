// Core Game Functions - Shared between Practice and Multiplayer
// Game core script loaded

// Early mobile detection and blocking
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  document.addEventListener("DOMContentLoaded", () => {
    blockMobileDevices();
  });
}

// Game variables
let canvas;
let ctx;
let gameStarted = false;
let gamePaused = false;
let playerName = "";

// Game state (will be managed by practice/multiplayer modes)
let gameState = {
  players: {},
  coins: [],
  enemies: [],
  myId: null,
  mapWidth: 20,
  mapHeight: 15,
  winningScore: 500,
  difficultyLevel: 1
};

// Prevent gameState from being accidentally reset
let gameStateInitialized = false;

// Player state tracking
const playerStates = {};
const characterNames = ["Alex", "Bella", "Charlie", "Daisy", "Zoe", "Leo", "Mia", "Noah", "Chloe", "Sam", "Finn", "Grace"];
const usedCharacters = new Set();

// Constants
const TILE_SIZE = 32;
const COLORS = {
  BACKGROUND: "#000000",
  WALL: "#444444",
  PLAYER: "#00ff41",
  COIN: "#ffff00",
  COIN_IMAGE: "assets/coin.png",
  BOMB: "#ff0000",
  ENEMY: "#ff4444",
};

// Game textures
const textures = {
  grass: new Image(),
  brick: new Image(),
  coin: new Image(),
  bomb: new Image(),
  snake: new Image(),
  snakeRed: new Image(),
  loaded: {
    grass: false,
    brick: false,
    coin: false,
    bomb: false,
    snake: false,
    snakeRed: false
  }
};

// Background music
let backgroundMusic = null;
let musicEnabled = true;

// SVG images for characters
const svgImages = {};

// Check if device is mobile by user agent
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// Block mobile devices
function blockMobileDevices() {
  if (isMobile()) {
    // Stop all scripts and prevent any popups
    document.documentElement.innerHTML = '';
    
    document.documentElement.innerHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Haunt For Gold - Desktop Only</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          html, body {
            width: 100%;
            height: 100%;
            overflow: hidden;
            position: fixed;
          }
          
          body {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: linear-gradient(135deg, #0d0d0d, #1a0a2e, #16213e);
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            text-align: center;
            padding: 20px;
            position: relative;
          }
          
          .bg-effect {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at 50% 50%, rgba(0, 255, 65, 0.05) 0%, transparent 50%);
            pointer-events: none;
          }
          
          .content {
            background: linear-gradient(135deg, rgba(26, 10, 46, 0.9), rgba(22, 33, 62, 0.9));
            padding: 30px 20px;
            border-radius: 20px;
            max-width: 90%;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            border: 3px solid #00ff41;
            box-shadow: 0 0 30px rgba(0, 255, 65, 0.3), inset 0 0 30px rgba(0, 0, 0, 0.5);
            position: relative;
            z-index: 1;
          }
          
          .skull {
            font-size: 3rem;
            margin-bottom: 15px;
            filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
            animation: float 3s ease-in-out infinite;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          
          h1 {
            background: linear-gradient(135deg, #ffd700, #ffed4e);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-size: 2rem;
            font-weight: 800;
            margin-bottom: 10px;
            letter-spacing: 0.05em;
          }
          
          .subtitle {
            color: #00ff41;
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 20px;
            text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
          }
          
          .description {
            font-size: 1rem;
            line-height: 1.5;
            margin-bottom: 15px;
            color: #e0e0e0;
          }
          
          .note {
            font-size: 0.9rem;
            opacity: 0.8;
            margin-bottom: 20px;
            color: #cccccc;
          }
          
          .info-box {
            background: rgba(0, 255, 65, 0.1);
            border: 2px solid #00ff41;
            border-radius: 12px;
            padding: 15px;
            font-size: 0.85rem;
            text-align: left;
            color: #e0e0e0;
            margin-bottom: 15px;
          }
          
          .info-title {
            color: #ffd700;
            font-weight: 700;
            margin-bottom: 8px;
            font-size: 0.95rem;
          }
          
          ul {
            margin: 0;
            padding-left: 20px;
            line-height: 1.6;
          }
          
          .footer {
            margin-top: 15px;
            font-size: 0.8rem;
            color: #888888;
            font-style: italic;
          }
          
          @media (max-width: 400px) {
            .content {
              padding: 25px 15px;
            }
            h1 {
              font-size: 1.75rem;
            }
            .skull {
              font-size: 2.5rem;
            }
          }
        </style>
      </head>
      <body>
        <div class="bg-effect"></div>
        
        <div class="content">
          <div class="skull">💀</div>
          
          <h1>Haunt For Gold</h1>
          
          <div class="subtitle">🖥️ Desktop Only</div>
          
          <p class="description">
            This haunted multiplayer experience is designed for desktop computers with keyboard or controller support.
          </p>
          
          <p class="note">
            Please visit on a desktop or laptop to join the hunt for gold! 👻
          </p>
          
          <div class="info-box">
            <div class="info-title">⚡ Why Desktop Only?</div>
            <ul>
              <li>Fast-paced real-time multiplayer</li>
              <li>Keyboard/controller controls required</li>
              <li>Optimized for larger screens</li>
              <li>Best gaming experience</li>
            </ul>
          </div>
          
          <div class="footer">
            🎮 Supports keyboard, mouse, and game controllers
          </div>
        </div>
      </body>
      </html>
    `;

    // Stop all script execution
    throw new Error("Mobile device detected - site blocked");
  }
}

// Preload SVG images
function preloadSVGImages() {
  Object.keys(characterData).forEach((character) => {
    svgImages[character] = {};

    Object.keys(characterData[character].svgs).forEach((state) => {
      const svgString = characterData[character].svgs[state];
      const img = new Image();
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      img.src = url;
      svgImages[character][state] = img;
    });
  });
}

// Load textures
function loadTextures() {
  textures.grass.onload = () => { textures.loaded.grass = true; };
  textures.brick.onload = () => { textures.loaded.brick = true; };
  textures.coin.onload = () => { textures.loaded.coin = true; };
  textures.bomb.onload = () => { textures.loaded.bomb = true; };
  textures.snake.onload = () => { textures.loaded.snake = true; };
  textures.snakeRed.onload = () => { textures.loaded.snakeRed = true; };

  textures.grass.src = "assets/grass.png";
  textures.brick.src = "assets/brick.png";
  textures.coin.src = "assets/coin.png";
  textures.bomb.src = "assets/bomb.png";
  textures.snake.src = "assets/snake-r.png";
  textures.snakeRed.src = "assets/snake-re.png";
}

// Initialize background music
function initBackgroundMusic() {
  // Use the haunted house track for spooky atmosphere
  backgroundMusic = new Audio('/sounds/Haunted House.mpga');
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.3;

  backgroundMusic.addEventListener('error', () => {
    // Fallback to halloween music if haunted house fails
    backgroundMusic = new Audio('/sounds/halloween-background-music-405067.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;
    backgroundMusic.addEventListener('error', () => {
      musicEnabled = false;
    });
  });
}

// Play background music
function playBackgroundMusic() {
  // Use sound manager if available
  if (window.soundManager) {
    window.soundManager.playBackgroundMusic('haunted-house');
    return;
  }
  
  // Fallback to old method
  if (backgroundMusic && musicEnabled) {
    backgroundMusic.play().catch(() => {
      // Modern browsers require user interaction before playing audio
    });
  }
}

// Stop background music
function stopBackgroundMusic() {
  // Use sound manager if available
  if (window.soundManager) {
    window.soundManager.stopBackgroundMusic();
    return;
  }
  
  // Fallback to old method
  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
  }
}

// Toggle music on/off
function toggleMusic() {
  // Use sound manager if available
  if (window.soundManager) {
    const enabled = window.soundManager.toggleMusic();
    musicEnabled = enabled;
    return enabled;
  }
  
  // Fallback to old method
  if (backgroundMusic) {
    if (backgroundMusic.paused) {
      playBackgroundMusic();
    } else {
      backgroundMusic.pause();
    }
  }
}

// Initialize game
window.addEventListener("load", () => {
  // Block mobile devices first
  blockMobileDevices();

  // Set up canvas
  canvas = document.getElementById("gameCanvas");
  
  if (!canvas) {
    console.error("CANVAS NOT FOUND!");
    return;
  }
  
  ctx = canvas.getContext("2d", { alpha: true });
  ctx.imageSmoothingEnabled = false;

  // Set canvas dimensions
  canvas.width = 640;  // 20 tiles * 32px
  canvas.height = 480; // 15 tiles * 32px

  // Load game assets
  loadTextures();
  preloadSVGImages();
  initBackgroundMusic();

  // Set up UI event listeners
  setupUIEvents();
});

// Set up UI event listeners
function setupUIEvents() {
  // Multiplayer button
  const multiplayerBtn = document.getElementById("multiplayerBtn");
  if (multiplayerBtn) {
    console.log("Multiplayer button found, adding click handler");
    multiplayerBtn.addEventListener("click", () => {
      console.log("*** MULTIPLAYER BUTTON CLICKED ***");
      window.isPracticeMode = false;
      window.playerName = window.simpleAuth?.getName() || "Player";
      console.log("Player name:", window.playerName);
      console.log("Calling startGameDirectly...");
      startGameDirectly();
    });
  } else {
    console.error("Multiplayer button NOT found!");
  }

  // Practice mode button
  const practiceBtn = document.getElementById("practiceBtn");
  if (practiceBtn) {
    practiceBtn.addEventListener("click", () => {
      window.isPracticeMode = true;
      window.playerName = window.simpleAuth?.getName() || "Player";
      startGameDirectly();
    });
  }

  // Winner screen buttons
  document.getElementById("playAgainBtn").addEventListener("click", () => {
    restartGame();
  });

  document.getElementById("homeBtn").addEventListener("click", () => {
    returnToHome();
  });

  // Enter key in name input
  document.getElementById("playerName").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      submitName();
    }
  });

  // Music toggle button
  document.getElementById("musicToggle").addEventListener("click", () => {
    const enabled = toggleMusic();
    const button = document.getElementById("musicToggle");
    
    // Check sound manager first, then fallback
    const isMuted = window.soundManager ? !window.soundManager.musicEnabled : (backgroundMusic && backgroundMusic.paused);
    
    if (isMuted) {
      button.textContent = "🔇";
      button.classList.add("muted");
    } else {
      button.textContent = "🎵";
      button.classList.remove("muted");
    }
  });

  // Pause screen buttons
  const resumeBtn = document.getElementById("resumeBtn");
  const pauseHomeBtn = document.getElementById("pauseHomeBtn");

  if (resumeBtn) {
    resumeBtn.addEventListener("click", () => {
      resumeGame();
    });
  }

  if (pauseHomeBtn) {
    pauseHomeBtn.addEventListener("click", () => {
      resumeGame();
      returnToHome();
    });
  }

  // Global pause key handler (ESC)
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && gameStarted && !document.getElementById("winnerScreen").style.display.includes("flex")) {
      e.preventDefault();
      togglePause();
    }
  });

  // Keyboard navigation for menu buttons
  setupMenuKeyboardNavigation();
}

// Setup keyboard navigation for menu
function setupMenuKeyboardNavigation() {
  const menuButtons = [
    document.getElementById("multiplayerBtn"),
    document.getElementById("localMultiplayerBtn"),
    document.getElementById("practiceBtn")
  ].filter(btn => btn !== null);

  if (menuButtons.length === 0) return;

  let currentFocusIndex = 0;

  // Set initial focus
  const setFocus = (index) => {
    menuButtons.forEach((btn, i) => {
      if (i === index) {
        btn.classList.add('keyboard-focused');
        btn.style.outline = '3px solid #00ff41';
        btn.style.outlineOffset = '4px';
      } else {
        btn.classList.remove('keyboard-focused');
        btn.style.outline = '';
        btn.style.outlineOffset = '';
      }
    });
    currentFocusIndex = index;
  };

  // Handle keyboard navigation on home screen
  document.addEventListener("keydown", (e) => {
    // Only handle navigation when on home screen
    const homeScreen = document.getElementById("homeScreen");
    if (!homeScreen || homeScreen.style.display === "none") return;
    if (gameStarted) return;

    switch (e.key) {
      case "ArrowUp":
      case "w":
      case "W":
        e.preventDefault();
        currentFocusIndex = (currentFocusIndex - 1 + menuButtons.length) % menuButtons.length;
        setFocus(currentFocusIndex);
        break;
      
      case "ArrowDown":
      case "s":
      case "S":
        e.preventDefault();
        currentFocusIndex = (currentFocusIndex + 1) % menuButtons.length;
        setFocus(currentFocusIndex);
        break;
      
      case "Enter":
      case " ":
        e.preventDefault();
        menuButtons[currentFocusIndex]?.click();
        break;
    }
  });

  // Also handle gamepad navigation for menu
  let lastMenuGamepadCheck = 0;
  const menuGamepadPoll = () => {
    const homeScreen = document.getElementById("homeScreen");
    if (!homeScreen || homeScreen.style.display === "none" || gameStarted) {
      requestAnimationFrame(menuGamepadPoll);
      return;
    }

    const now = Date.now();
    if (now - lastMenuGamepadCheck < 200) {
      requestAnimationFrame(menuGamepadPoll);
      return;
    }

    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gamepad = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];

    if (gamepad) {
      const AXIS_THRESHOLD = 0.5;
      
      // D-pad up or left stick up
      if (gamepad.buttons[12]?.pressed || gamepad.axes[1] < -AXIS_THRESHOLD) {
        currentFocusIndex = (currentFocusIndex - 1 + menuButtons.length) % menuButtons.length;
        setFocus(currentFocusIndex);
        lastMenuGamepadCheck = now;
      }
      
      // D-pad down or left stick down
      if (gamepad.buttons[13]?.pressed || gamepad.axes[1] > AXIS_THRESHOLD) {
        currentFocusIndex = (currentFocusIndex + 1) % menuButtons.length;
        setFocus(currentFocusIndex);
        lastMenuGamepadCheck = now;
      }
      
      // A button (button 0) to select
      if (gamepad.buttons[0]?.pressed) {
        menuButtons[currentFocusIndex]?.click();
        lastMenuGamepadCheck = now;
      }
    }

    requestAnimationFrame(menuGamepadPoll);
  };

  requestAnimationFrame(menuGamepadPoll);

  // Set initial focus
  setFocus(0);

  // Cancel waiting button
  const cancelWaitingBtn = document.getElementById("cancelWaitingBtn");
  if (cancelWaitingBtn) {
    console.log("Cancel waiting button found, adding click handler");
    cancelWaitingBtn.addEventListener("click", () => {
      console.log("Cancel waiting button clicked");
      
      // Disconnect from multiplayer
      if (window.multiplayerMode && window.multiplayerMode.socket) {
        window.multiplayerMode.socket.disconnect();
        window.multiplayerMode = null;
      }
      
      // Hide waiting screen
      const waitingScreen = document.getElementById("waitingScreen");
      if (waitingScreen) {
        waitingScreen.style.display = "none";
        waitingScreen.style.cssText = "display: none !important;";
      }
      
      // Show home screen
      const homeScreen = document.getElementById("homeScreen");
      if (homeScreen) {
        homeScreen.style.display = "flex";
        homeScreen.style.visibility = "visible";
      }
      
      // Stop background music
      if (typeof stopBackgroundMusic === 'function') {
        stopBackgroundMusic();
      }
      
      console.log("Returned to home screen");
    });
  } else {
    console.error("Cancel waiting button NOT found!");
  }
}

// Show name dialog
function showNameDialog() {
  document.getElementById("nameDialog").style.display = "flex";
  document.getElementById("playerName").focus();
}

// Submit player name and start game
function submitName() {
  const nameInput = document.getElementById("playerName");
  playerName = nameInput.value.trim();
  window.playerName = playerName;

  if (playerName.length === 0) {
    alert("Please enter your name!");
    nameInput.focus();
    return;
  }

  // Hide name dialog
  document.getElementById("nameDialog").style.display = "none";
  document.getElementById("homeScreen").style.display = "none";

  // Start appropriate game mode
  if (window.isPracticeMode) {
    // Start practice mode
    window.startPracticeMode();
  } else {
    // Start multiplayer mode
    window.startMultiplayerMode(playerName);
  }
}

// Start game directly without name dialog
function startGameDirectly() {
  console.log("*** startGameDirectly called ***");
  console.log("isPracticeMode:", window.isPracticeMode);
  
  // Hide home screen
  const homeScreen = document.getElementById("homeScreen");
  if (homeScreen) {
    homeScreen.style.display = "none";
    console.log("Home screen hidden");
  } else {
    console.error("Home screen not found!");
  }

  // Start background music
  playBackgroundMusic();

  // Show music toggle button
  const musicToggle = document.getElementById("musicToggle");
  if (musicToggle) {
    musicToggle.style.display = "flex";
  }

  // Start appropriate game mode
  if (window.isPracticeMode) {
    console.log("Starting practice mode...");
    // Start practice mode
    if (typeof window.startPracticeMode === 'function') {
      window.startPracticeMode();
    } else {
      console.error("startPracticeMode function not found!");
    }
  } else {
    console.log("Starting multiplayer mode...");
    // Start multiplayer mode
    if (typeof window.startMultiplayerMode === 'function') {
      window.startMultiplayerMode(window.playerName);
    } else {
      console.error("startMultiplayerMode function not found!");
      // Fallback - show waiting screen directly
      const waitingScreen = document.getElementById("waitingScreen");
      if (waitingScreen) {
        waitingScreen.style.cssText = "display: flex !important;";
        console.log("Fallback: Showing waiting screen directly");
      }
    }
  }
}

// Forced fullscreen functions
function enterFullscreenMode() {
  const fullscreenToggle = document.getElementById('fullscreenToggle');
  const body = document.body;

  body.classList.add('fullscreen-mode');

  if (fullscreenToggle) {
    fullscreenToggle.style.display = 'none';
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  document.addEventListener('keydown', preventFullscreenExit);
}

function resizeCanvas() {
  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
  }
}

function resetCanvasSize() {
  const canvas = document.getElementById('gameCanvas');
  if (canvas) {
    canvas.style.width = '';
    canvas.style.height = '';
  }
}

function preventFullscreenExit(e) {
  if (e.key === 'Escape' && gameStarted) {
    e.preventDefault();
    e.stopPropagation();
  }
}

// Game loop (DEPRECATED - each mode now has its own render loop)
// This function is kept for backwards compatibility but should not be called
function gameLoop() {
  // No longer used - multiplayer mode, practice mode, and local multiplayer
  // all have their own dedicated render loops
  console.warn('gameLoop() called but is deprecated - each mode has its own render loop');
}

// Draw the game
function draw() {
  if (!gameStarted) {
    return;
  }

  // Use window.gameState as the primary source of truth
  const currentGameState = window.gameState || gameState;

  if (!currentGameState) {
    return;
  }

  // Use the new renderer if available
  if (window.gameRenderer && typeof window.gameRenderer.render === 'function') {
    window.gameRenderer.render(currentGameState);
  } else {
    // Initialize renderer if not available
    if (typeof GameRenderer !== 'undefined' && document.getElementById('gameCanvas')) {
      window.gameRenderer = new GameRenderer('gameCanvas');
      window.gameRenderer.render(currentGameState);
    } else {
      legacyDraw();
    }
  }
}

// Legacy draw function (fallback)
function legacyDraw() {
  if (!ctx) return;

  const currentGameState = window.gameState || gameState;
  if (!currentGameState) return;

  // Draw spooky gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#0d0d0d');
  gradient.addColorStop(0.5, '#1a0a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw grass with dark tint overlay
  if (textures.grass && textures.grass.complete) {
    ctx.globalAlpha = 0.4;
    drawPixelRect(0, 0, canvas.width, canvas.height, textures.grass);
    ctx.globalAlpha = 1.0;
  }

  // Draw grid
  ctx.strokeStyle = "rgba(34, 34, 34, 0.3)";
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += TILE_SIZE) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += TILE_SIZE) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  // Draw walls
  ctx.fillStyle = COLORS.WALL;
  for (let x = 0; x < currentGameState.mapWidth; x++) {
    for (let y = 0; y < currentGameState.mapHeight; y++) {
      if (x === 0 || x === currentGameState.mapWidth - 1 || y === 0 || y === currentGameState.mapHeight - 1) {
        drawPixelRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE, textures.brick);
      }
    }
  }

  // Draw coins
  currentGameState.coins.forEach((coin) => {
    if (!coin.collected) {
      const x = coin.x * TILE_SIZE;
      const y = coin.y * TILE_SIZE;

      if (coin.type === 'bomb') {
        drawPixelRect(x, y, TILE_SIZE, TILE_SIZE, textures.bomb);
      } else {
        drawPixelRect(x, y, TILE_SIZE, TILE_SIZE, textures.coin);
      }
    }
  });

  // Draw enemies
  currentGameState.enemies.forEach((enemy) => {
    const x = enemy.x * TILE_SIZE;
    const y = enemy.y * TILE_SIZE;

    // Use snake sprite if available, otherwise fallback to red rectangle
    if (textures.snake && textures.snake.complete) {
      drawPixelRect(x, y, TILE_SIZE, TILE_SIZE, textures.snake);
    } else {
      ctx.fillStyle = COLORS.ENEMY;
      ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
    }
  });

  // Draw players
  drawPlayers();
}

// Draw pixel rectangle with texture
function drawPixelRect(x, y, width, height, texture) {
  if (texture && texture.complete) {
    ctx.drawImage(texture, x, y, width, height);
  } else {
    ctx.fillRect(x, y, width, height);
  }
}

// Draw players
function drawPlayers() {
  const currentGameState = window.gameState || gameState;
  if (!currentGameState) return;

  Object.values(currentGameState.players).forEach((player) => {
    const x = player.x * TILE_SIZE;
    const y = player.y * TILE_SIZE;

    // Get the SVG for this character state
    const svgKey = `${player.direction}_${player.mood}`;
    const img = svgImages[player.character]?.[svgKey] || svgImages["Alex"]["right_happy"];

    // Draw the character
    if (img && img.complete) {
      ctx.drawImage(img, x, y, TILE_SIZE, TILE_SIZE);
    } else {
      // Fallback to colored rectangle
      ctx.fillStyle = player.color;
      ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
    }

    // Draw player name
    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(player.name, x + TILE_SIZE / 2, y - 5);

    // Draw score
    ctx.fillText(player.score || "0", x + TILE_SIZE / 2, y + TILE_SIZE + 15);
  });
}

// Update player count display
function updatePlayerCount() {
  const currentGameState = window.gameState || gameState;
  if (!currentGameState) return;

  const count = Object.keys(currentGameState.players).length;
  document.getElementById("playerCount").textContent = count;
}

// Update scoreboard
function updateScoreboard() {
  const currentGameState = window.gameState || gameState;
  if (!currentGameState) return;

  const scoreboard = document.getElementById("scoreboard");
  const players = Object.values(currentGameState.players);

  // Sort players by score
  players.sort((a, b) => (b.score || 0) - (a.score || 0));

  // Preserve timer element if it exists
  const existingTimer = document.getElementById('onlineGameTimer');
  let timerHTML = '';
  if (existingTimer) {
    timerHTML = existingTimer.outerHTML;
  }

  let html = "<h3>Scoreboard</h3>";
  
  // Add timer back if it existed
  if (timerHTML) {
    html += timerHTML;
  }
  
  players.forEach((player, index) => {
    const isMe = player.id === currentGameState.myId;
    const rank = index + 1;
    const isFirstPlace = index === 0;
    const classes = ['score-item'];
    if (isFirstPlace) classes.push('first-place');
    if (isMe) classes.push('current-player');

    html += `
      <div class="${classes.join(' ')}">
        <span class="rank">${rank}</span>
        <span class="player-name">${player.name}</span>
        <span class="score">${player.score || 0}</span>
      </div>
    `;
  });

  scoreboard.innerHTML = html;
}

// Show winner screen
function showWinnerScreen(data, showRematch = false) {
  gameStarted = false;

  const winnerScreen = document.getElementById("winnerScreen");
  const winnerTitle = document.getElementById("winnerTitle");
  const winnerMessage = document.getElementById("winnerMessage");
  const countdownTimer = document.getElementById("countdownTimer");
  const playAgainBtn = document.getElementById("playAgainBtn");
  const homeBtn = document.getElementById("homeBtn");

  // Determine if current player won
  const currentGameState = window.gameState || gameState;
  const isWinner = data.winnerId === currentGameState.myId;

  // Handle different win scenarios
  if (data.reason === 'opponent_left') {
    winnerTitle.textContent = "🏆 Victory! 🏆";
    winnerMessage.textContent = "Your opponent fled the battlefield!";
  } else if (data.reason === 'time_up' || data.reason === 'tie') {
    if (data.reason === 'tie') {
      winnerTitle.textContent = "👻 It's a Tie! 👻";
      winnerMessage.textContent = `Both players scored ${data.winnerScore} points!`;
    } else if (isWinner) {
      winnerTitle.textContent = "🏆 TIME'S UP - YOU WIN! 🏆";
      winnerMessage.textContent = `You won with ${data.winnerScore} points!`;
    } else {
      winnerTitle.textContent = "💀 TIME'S UP - DEFEATED 💀";
      winnerMessage.textContent = `${data.winnerName} won with ${data.winnerScore} points!`;
    }
  } else if (isWinner) {
    winnerTitle.textContent = "🏆 VICTORY! 🏆";
    winnerMessage.textContent = `Congratulations! You reached ${data.winnerScore} points!`;
  } else {
    winnerTitle.textContent = "💀 Defeated 💀";
    winnerMessage.textContent = `${data.winnerName} won with ${data.winnerScore} points!`;
  }

  // Show winner screen
  winnerScreen.style.display = "flex";

  // Hide countdown timer
  countdownTimer.style.display = "none";

  // Setup buttons based on game mode
  if (showRematch && window.multiplayerMode && !window.practiceMode && !window.isPracticeMode) {
    // Online multiplayer - show rematch option
    playAgainBtn.textContent = "👻 Request Rematch";
    playAgainBtn.disabled = false;
    playAgainBtn.onclick = () => {
      playAgainBtn.textContent = "⏳ Waiting for opponent...";
      playAgainBtn.disabled = true;
      window.multiplayerMode.requestRematch();
    };
    
    homeBtn.textContent = "💀 Leave Game";
    homeBtn.onclick = () => {
      window.multiplayerMode.leaveGame();
    };
  } else {
    // Practice mode or no rematch available
    playAgainBtn.textContent = "👻 Play Again";
    playAgainBtn.disabled = false;
    playAgainBtn.onclick = () => {
      winnerScreen.style.display = "none";
      document.getElementById("homeScreen").style.display = "flex";
      document.getElementById("gameCanvas").style.display = "none";
      document.getElementById("scoreboard").style.display = "none";
      exitFullscreenMode();
    };
    
    homeBtn.textContent = "💀 Return to Crypt";
    homeBtn.onclick = () => {
      winnerScreen.style.display = "none";
      document.getElementById("homeScreen").style.display = "flex";
      document.getElementById("gameCanvas").style.display = "none";
      document.getElementById("scoreboard").style.display = "none";
      exitFullscreenMode();
      
      if (window.multiplayerMode) {
        window.multiplayerMode.disconnect();
      }
    };
  }
}

// Show notification
function showNotification(title, message) {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.innerHTML = `
    <div class="notification-title">${title}</div>
    <div class="notification-message">${message}</div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      border-left: 4px solid #ffd700;
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
      max-width: 300px;
    }
    
    .notification-title {
      font-weight: bold;
      margin-bottom: 5px;
    }
    
    .notification-message {
      font-size: 0.9em;
      opacity: 0.9;
    }
    
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;

  document.head.appendChild(style);
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
    style.remove();
  }, 3000);
}

// Show explosion effect
function showExplosion(x, y) {
  if (window.gameRenderer) {
    window.gameRenderer.showExplosion(x, y);
  } else {
    // Fallback explosion effect
    const explosionX = x * TILE_SIZE;
    const explosionY = y * TILE_SIZE;

    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.arc(explosionX + TILE_SIZE / 2, explosionY + TILE_SIZE / 2, TILE_SIZE, 0, 2 * Math.PI);
    ctx.fill();

    setTimeout(() => {
      if (gameStarted) draw();
    }, 200);
  }
}

// Restart game
function restartGame() {
  const winnerScreen = document.getElementById("winnerScreen");
  winnerScreen.style.display = "none";

  if (window.isPracticeMode) {
    if (window.practiceMode && window.practiceMode.restart) {
      window.practiceMode.restart();
    } else {
      window.startPracticeMode();
    }
  } else {
    if (window.multiplayerMode && window.multiplayerMode.restart) {
      window.multiplayerMode.restart();
    } else {
      document.getElementById("waitingScreen").style.display = "flex";
      window.startMultiplayerMode(window.playerName);
    }
  }
}

// Return to home screen
function returnToHome() {
  console.log("Returning to home - cleaning up all game resources");
  
  const winnerScreen = document.getElementById("winnerScreen");
  winnerScreen.style.display = "none";

  // Hide all game elements
  document.getElementById("gameCanvas").style.display = "none";
  document.querySelector(".controls").style.display = "none";
  document.querySelector(".info").style.display = "none";
  document.getElementById("scoreboard").style.display = "none";
  document.getElementById("waitingScreen").style.display = "none";
  document.getElementById("nameDialog").style.display = "none";
  document.getElementById("musicToggle").style.display = "none";

  // Hide game container
  const gameContainer = document.querySelector(".game-container");
  if (gameContainer) {
    gameContainer.style.display = "none";
  }

  // Exit fullscreen mode
  exitFullscreenMode();

  // Reset game state flags
  gameStarted = false;
  window.gameStarted = false;
  window.isPracticeMode = false;
  window.practiceMode = false;
  window.isLocalMultiplayer = false;

  // Stop ALL game loops and timers
  // Practice mode cleanup
  if (window.practiceGameLoop) {
    cancelAnimationFrame(window.practiceGameLoop);
    window.practiceGameLoop = null;
  }
  if (window.practiceEnemyInterval) {
    clearInterval(window.practiceEnemyInterval);
    window.practiceEnemyInterval = null;
  }
  
  // Local multiplayer cleanup
  if (window.localRenderFrame) {
    cancelAnimationFrame(window.localRenderFrame);
    window.localRenderFrame = null;
  }
  if (window.localEnemyInterval) {
    clearInterval(window.localEnemyInterval);
    window.localEnemyInterval = null;
  }
  if (window.localTimerInterval) {
    clearInterval(window.localTimerInterval);
    window.localTimerInterval = null;
  }
  if (window.localGamepadPoll) {
    cancelAnimationFrame(window.localGamepadPoll);
    window.localGamepadPoll = null;
  }
  
  // Online multiplayer cleanup
  if (window.multiplayerMode) {
    if (window.multiplayerMode.renderFrameId) {
      cancelAnimationFrame(window.multiplayerMode.renderFrameId);
      window.multiplayerMode.renderFrameId = null;
    }
    if (window.multiplayerMode.disconnect) {
      window.multiplayerMode.disconnect();
    }
    // Reset multiplayer mode
    window.multiplayerMode.gameStarted = false;
  }

  // Reset game state
  gameState = {
    players: {},
    coins: [],
    enemies: [],
    witch: null,
    myId: null,
    mapWidth: 20,
    mapHeight: 15,
    winningScore: 500,
    difficultyLevel: 1
  };
  window.gameState = gameState;
  gameStateInitialized = false;
  
  // Clear local game state
  window.localGameState = null;
  window.localGameSettings = null;

  // Stop background music
  stopBackgroundMusic();

  // Show home screen with proper flex layout
  const homeScreen = document.getElementById("homeScreen");
  homeScreen.style.display = "flex";
  
  console.log("Home screen shown - all game resources cleaned up");
}

// Exit fullscreen mode helper
function exitFullscreenMode() {
  if (document.body.classList.contains('fullscreen-mode')) {
    document.body.classList.remove('fullscreen-mode');
    resetCanvasSize();
    window.removeEventListener('resize', resizeCanvas);
    document.removeEventListener('keydown', preventFullscreenExit);
  }
}

// Pause game functionality
function togglePause() {
  if (!gameStarted) return;

  if (gamePaused) {
    resumeGame();
  } else {
    pauseGame();
  }
}

function pauseGame() {
  if (!gameStarted || gamePaused) return;

  console.log("Pausing game");
  gamePaused = true;
  window.gamePaused = true;

  // Show pause screen
  const pauseScreen = document.getElementById("pauseScreen");
  if (pauseScreen) {
    pauseScreen.style.display = "flex";
  }

  // Pause background music
  if (window.soundManager) {
    window.soundManager.pauseBackgroundMusic();
  } else if (backgroundMusic && !backgroundMusic.paused) {
    backgroundMusic.pause();
  }

  // Notify game modes about pause
  if (window.practiceMode && window.practiceMode.pause) {
    window.practiceMode.pause();
  }
  if (window.multiplayerMode && window.multiplayerMode.pause) {
    window.multiplayerMode.pause();
  }
  if (window.localMultiplayerGame && window.localMultiplayerGame.pauseGame) {
    window.localMultiplayerGame.pauseGame();
  }
}

function resumeGame() {
  if (!gamePaused) return;

  console.log("Resuming game");
  gamePaused = false;
  window.gamePaused = false;

  // Hide pause screen
  const pauseScreen = document.getElementById("pauseScreen");
  if (pauseScreen) {
    pauseScreen.style.display = "none";
  }

  // Resume background music
  if (window.soundManager) {
    window.soundManager.resumeBackgroundMusic();
  } else if (backgroundMusic && musicEnabled) {
    backgroundMusic.play().catch(() => {});
  }

  // Notify game modes about resume
  if (window.practiceMode && window.practiceMode.resume) {
    window.practiceMode.resume();
  }
  if (window.multiplayerMode && window.multiplayerMode.resume) {
    window.multiplayerMode.resume();
  }
  if (window.localMultiplayerGame && window.localMultiplayerGame.resumeGame) {
    window.localMultiplayerGame.resumeGame();
  }
}

// Make pause functions globally accessible
window.togglePause = togglePause;
window.pauseGame = pauseGame;
window.resumeGame = resumeGame;

// Game core ready
