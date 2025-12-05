// Core Game Functions - Shared between Practice and Multiplayer
console.log("Game core script loaded");

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
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background: linear-gradient(135deg, #1e3c72, #2a5298);
        color: white;
        font-family: Arial, sans-serif;
        text-align: center;
        padding: 20px;
        box-sizing: border-box;
      ">
        <div style="
          background: rgba(0, 0, 0, 0.3);
          padding: 40px;
          border-radius: 15px;
          max-width: 400px;
          width: 100%;
        ">
          <h1 style="
            color: #ffd700;
            font-size: 2.5rem;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
          ">🖥️ Desktop Only</h1>
          
          <p style="
            font-size: 1.2rem;
            line-height: 1.6;
            margin-bottom: 20px;
          ">
            Gold Grab is designed for desktop computers only.
          </p>
          
          <p style="
            font-size: 1rem;
            opacity: 0.8;
            margin-bottom: 30px;
          ">
            Please visit this site on a desktop or laptop computer to play the game.
          </p>
          
          <div style="
            background: rgba(255, 215, 0, 0.1);
            border: 1px solid #ffd700;
            border-radius: 8px;
            padding: 15px;
            font-size: 0.9rem;
          ">
            <strong>Why desktop only?</strong><br>
            This game requires keyboard controls and precise mouse interactions for the best gaming experience.
          </div>
        </div>
      </div>
    `;

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
  backgroundMusic = new Audio('assets/sounds/the-race-is-on-racing-soundtrack-videogame-instrumental-378331.mp3');
  backgroundMusic.loop = true;
  backgroundMusic.volume = 0.3; // Reduced volume (30%)

  // Handle audio loading errors gracefully
  backgroundMusic.addEventListener('error', (e) => {
    console.log('Background music failed to load:', e);
    musicEnabled = false;
  });

  backgroundMusic.addEventListener('canplaythrough', () => {
    console.log('Background music loaded successfully');
  });
}

// Play background music
function playBackgroundMusic() {
  if (backgroundMusic && musicEnabled) {
    backgroundMusic.play().catch(error => {
      console.log('Could not play background music:', error);
      // Modern browsers require user interaction before playing audio
    });
  }
}

// Stop background music
function stopBackgroundMusic() {
  if (backgroundMusic) {
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
  }
}

// Toggle music on/off
function toggleMusic() {
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
  ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  // Set canvas dimensions
  canvas.width = 640;  // 20 tiles * 32px
  canvas.height = 480; // 15 tiles * 32px

  console.log("Canvas initialized:", canvas.width, "x", canvas.height);

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
  document.getElementById("multiplayerBtn").addEventListener("click", () => {
    window.isPracticeMode = false;
    window.playerName = "Player"; // Default name
    startGameDirectly();
  });

  // Practice mode button
  document.getElementById("practiceBtn").addEventListener("click", () => {
    window.isPracticeMode = true;
    window.playerName = "Player"; // Default name
    startGameDirectly();
  });

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
    toggleMusic();
    const button = document.getElementById("musicToggle");
    if (backgroundMusic && backgroundMusic.paused) {
      button.textContent = "🔇";
      button.classList.add("muted");
    } else {
      button.textContent = "🎵";
      button.classList.remove("muted");
    }
  });
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
  // Hide home screen
  document.getElementById("homeScreen").style.display = "none";

  // Start background music
  playBackgroundMusic();

  // Show music toggle button
  document.getElementById("musicToggle").style.display = "flex";

  // Start appropriate game mode
  if (window.isPracticeMode) {
    // Start practice mode
    window.startPracticeMode();
  } else {
    // Start multiplayer mode
    window.startMultiplayerMode(window.playerName);
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

// Game loop (only used by multiplayer mode now)
function gameLoop() {
  if (gameStarted && !window.practiceMode && !window.isPracticeMode) {
    draw();
    requestAnimationFrame(gameLoop);
  } else {
    console.log("Game loop stopped - gameStarted:", gameStarted, "practiceMode:", window.practiceMode, "isPracticeMode:", window.isPracticeMode);
  }
}

// Draw the game
function draw() {
  if (!gameStarted) {
    console.log("Draw skipped - gameStarted:", gameStarted);
    return;
  }

  // Use window.gameState as the primary source of truth
  const currentGameState = window.gameState || gameState;

  if (!currentGameState) {
    console.log("No game state available for drawing");
    return;
  }

  // Use the new renderer if available
  if (window.gameRenderer) {
    window.gameRenderer.render(currentGameState);
  } else {
    console.log("Game renderer not available, falling back to legacy draw");
    legacyDraw();
  }
}

// Legacy draw function (fallback)
function legacyDraw() {
  if (!ctx) return;

  const currentGameState = window.gameState || gameState;
  if (!currentGameState) return;

  console.log("Drawing game frame (legacy)");

  // Clear canvas and draw grass background
  ctx.fillStyle = COLORS.BACKGROUND;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawPixelRect(0, 0, canvas.width, canvas.height, textures.grass);

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

  console.log("Drawing players, count:", Object.keys(currentGameState.players).length);
  console.log("Players data:", currentGameState.players);
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

  let html = "<h3>Scoreboard</h3>";
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
  const isWinner = data.winnerId === gameState.myId;
  const currentPlayer = gameState.players[gameState.myId];

  // Handle different win scenarios
  if (data.reason === 'opponent_left') {
    winnerTitle.textContent = "🏆 Victory! 🏆";
    winnerMessage.textContent = "Your opponent fled the battlefield!";
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
  if (showRematch && window.multiplayerMode && !window.practiceMode) {
    // Online multiplayer - show rematch option
    playAgainBtn.textContent = "👻 Request Rematch";
    playAgainBtn.onclick = () => {
      playAgainBtn.textContent = "⏳ Waiting...";
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
  console.log("Restarting game - practiceMode:", window.isPracticeMode);

  const winnerScreen = document.getElementById("winnerScreen");
  winnerScreen.style.display = "none";

  if (window.isPracticeMode) {
    console.log("Restarting practice mode");
    if (window.practiceMode && window.practiceMode.restart) {
      window.practiceMode.restart();
    } else {
      window.startPracticeMode();
    }
  } else {
    console.log("Restarting multiplayer mode");
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

  // Reset game state only when actually returning to home
  gameStarted = false;
  window.gameStarted = false;
  window.isPracticeMode = false;

  // Only reset gameState if we're actually returning to home
  gameState = {
    players: {},
    coins: [],
    enemies: [],
    myId: null,
    mapWidth: 20,
    mapHeight: 15,
    winningScore: 500,
    difficultyLevel: 1
  };
  window.gameState = gameState;
  gameStateInitialized = false;

  // Disconnect multiplayer if active
  if (window.multiplayerMode && window.multiplayerMode.disconnect) {
    window.multiplayerMode.disconnect();
  }

  // Stop background music
  stopBackgroundMusic();

  // Show home screen with proper flex layout
  const homeScreen = document.getElementById("homeScreen");
  homeScreen.style.display = "flex";
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

console.log("Game core ready");
