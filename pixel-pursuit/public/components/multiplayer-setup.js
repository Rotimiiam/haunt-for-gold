// Multiplayer Setup Modal JavaScript
console.log('Multiplayer setup script loaded');

// Inject HTML and CSS into the page
document.addEventListener('DOMContentLoaded', () => {
  // Inject modal HTML
  const modalHTML = `
    <div id="multiplayerSetupModal" class="modal" style="display: none;">
      <div class="modal-content multiplayer-setup">
        <button class="close-btn" onclick="closeMultiplayerSetup()">&times;</button>
        
        <h2>Multiplayer Setup</h2>
        
        <div class="mode-selection">
          <button id="localModeBtn" class="mode-btn active" onclick="selectMode('local')">
            <span class="mode-icon">🎮</span>
            <span class="mode-title">Local Multiplayer</span>
            <span class="mode-desc">2-10 players on same device</span>
          </button>
          <button id="onlineModeBtn" class="mode-btn" onclick="selectMode('online')">
            <span class="mode-icon">🌐</span>
            <span class="mode-title">Online Multiplayer</span>
            <span class="mode-desc">Play against others online</span>
          </button>
        </div>
        
        <div id="localSetup" class="setup-section">
          <div class="player-count-section">
            <label for="playerCount">Number of Players:</label>
            <div class="player-count-selector">
              <button onclick="decrementPlayers()" class="count-btn">-</button>
              <span id="playerCountDisplay">2</span>
              <button onclick="incrementPlayers()" class="count-btn">+</button>
            </div>
            <p class="winning-score-info">Winning Score: <span id="winningScoreDisplay">200</span> points</p>
            <p class="controller-info">🎮 Checking for controllers...</p>
          </div>
          
          <h3>Select Characters</h3>
          <div id="characterGrid" class="character-grid"></div>
          
          <button id="startLocalGameBtn" class="start-game-btn" onclick="startLocalGame()">
            Start Local Game
          </button>
        </div>
        
        <div id="onlineSetup" class="setup-section" style="display: none;">
          <p class="online-desc">Join an online game and compete against players from around the world!</p>
          <button id="startOnlineGameBtn" class="start-game-btn" onclick="startOnlineGame()">
            Join Online Game
          </button>
        </div>
      </div>
    </div>
  `;

  // Inject CSS - TV optimized with glassmorphism
  const style = document.createElement('style');
  style.textContent = `
    #multiplayerSetupModal.modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      padding: 20px;
    }
    
    .multiplayer-setup { 
      max-width: 1200px;
      width: 95%;
      height: 90vh;
      display: flex;
      flex-direction: column;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      padding: 30px;
      position: relative;
      overflow: hidden;
    }
    
    .multiplayer-setup h2 { 
      text-align: center;
      color: #ffd700;
      margin: 0 0 20px 0;
      font-size: 2rem;
      text-shadow: 0 2px 10px rgba(255, 215, 0, 0.5);
    }
    
    .multiplayer-setup h3 { 
      color: #ffd700;
      margin: 0 0 12px 0;
      font-size: 1.2rem;
      text-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
    }
    
    .close-btn {
      position: absolute;
      top: 15px;
      right: 15px;
      width: 35px;
      height: 35px;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      color: #fff;
      font-size: 20px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }
    
    .close-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: rotate(90deg);
    }
    
    .mode-selection { 
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }
    
    .mode-btn { 
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 15px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 215, 0, 0.3);
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .mode-btn:hover { 
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 215, 0, 0.6);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(255, 215, 0, 0.2);
    }
    
    .mode-btn.active { 
      background: rgba(255, 215, 0, 0.15);
      backdrop-filter: blur(15px);
      border-color: #ffd700;
      box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
    }
    
    .mode-icon { font-size: 40px; margin-bottom: 8px; }
    .mode-title { font-size: 16px; font-weight: bold; color: #fff; margin-bottom: 4px; }
    .mode-desc { font-size: 12px; color: rgba(255, 255, 255, 0.7); }
    
    .setup-section { 
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .player-count-section { 
      text-align: center;
      margin-bottom: 15px;
      padding: 15px;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .player-count-section label { 
      display: block;
      font-size: 14px;
      color: #ffd700;
      margin-bottom: 10px;
      font-weight: 600;
    }
    
    .player-count-selector { 
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      margin-bottom: 10px;
    }
    
    .count-btn { 
      width: 40px;
      height: 40px;
      font-size: 24px;
      background: rgba(255, 215, 0, 0.15);
      backdrop-filter: blur(10px);
      border: 2px solid #ffd700;
      border-radius: 50%;
      color: #ffd700;
      cursor: pointer;
      transition: all 0.3s ease;
      font-weight: bold;
    }
    
    .count-btn:hover { 
      background: rgba(255, 215, 0, 0.25);
      transform: scale(1.1);
      box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
    }
    
    #playerCountDisplay { 
      font-size: 36px;
      font-weight: bold;
      color: #ffd700;
      min-width: 60px;
      text-align: center;
      text-shadow: 0 2px 10px rgba(255, 215, 0, 0.5);
    }
    
    .winning-score-info { 
      color: rgba(255, 255, 255, 0.9);
      font-size: 13px;
      font-weight: 500;
      margin: 0 0 5px 0;
    }
    
    .controller-info {
      font-size: 12px;
      color: rgba(255, 215, 0, 0.8);
      margin: 0;
    }
    
    .character-grid { 
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
      gap: 10px;
      flex: 1;
      overflow-y: auto;
      padding: 10px;
      background: rgba(0, 0, 0, 0.2);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 15px;
    }
    
    .character-grid::-webkit-scrollbar { width: 6px; }
    .character-grid::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
    .character-grid::-webkit-scrollbar-thumb { background: rgba(255, 215, 0, 0.3); border-radius: 10px; }
    .character-grid::-webkit-scrollbar-thumb:hover { background: rgba(255, 215, 0, 0.5); }
    
    .character-card { 
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px;
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(10px);
      border: 2px solid transparent;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
    }
    
    .character-card:hover { 
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 215, 0, 0.5);
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(255, 215, 0, 0.2);
    }
    
    .character-card.selected { 
      background: rgba(255, 215, 0, 0.2);
      backdrop-filter: blur(15px);
      border-color: #ffd700;
      box-shadow: 0 4px 20px rgba(255, 215, 0, 0.4);
    }
    
    .character-card.disabled { opacity: 0.4; cursor: not-allowed; }
    .character-preview { width: 50px; height: 50px; margin-bottom: 6px; }
    .character-name { font-size: 11px; color: #fff; text-align: center; margin-bottom: 4px; font-weight: 600; }
    
    .player-badge { 
      font-size: 10px;
      padding: 2px 6px;
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #000;
      border-radius: 8px;
      font-weight: bold;
      box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
    }
    
    .start-game-btn { 
      width: 100%;
      padding: 14px;
      font-size: 16px;
      font-weight: bold;
      background: linear-gradient(135deg, #ffd700, #ffed4e);
      color: #000;
      border: none;
      border-radius: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .start-game-btn:hover { 
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5);
    }
    
    .start-game-btn:disabled { 
      opacity: 0.4;
      cursor: not-allowed;
      transform: none;
    }
    
    .online-desc { 
      text-align: center;
      color: rgba(255, 255, 255, 0.9);
      margin-bottom: 20px;
      font-size: 14px;
      line-height: 1.6;
    }
  `;

  document.head.appendChild(style);
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Initialize controller detection and navigation
  initControllerDetection();
  initControllerNavigation();
});

// Controller detection and management
let connectedControllers = [];
let controllerNavigationActive = false;

function initControllerDetection() {
  if (!navigator.getGamepads) {
    console.log('Gamepad API not supported');
    return;
  }

  window.addEventListener('gamepadconnected', handleControllerConnect);
  window.addEventListener('gamepaddisconnected', handleControllerDisconnect);

  updateControllerCount();
  setInterval(updateControllerCount, 1000);
}

function handleControllerConnect(e) {
  console.log('Controller connected:', e.gamepad.id);
  updateControllerCount();
}

function handleControllerDisconnect(e) {
  console.log('Controller disconnected:', e.gamepad.id);
  updateControllerCount();
}

function updateControllerCount() {
  const gamepads = navigator.getGamepads();
  connectedControllers = Array.from(gamepads).filter(gp => gp !== null);

  const count = connectedControllers.length;

  if (count > 0 && count <= 10) {
    playerCount = Math.max(2, count);
    updatePlayerCountDisplay();
  }

  const controllerInfo = document.querySelector('.controller-info');
  if (controllerInfo) {
    if (count > 0) {
      controllerInfo.textContent = `🎮 ${count} controller${count !== 1 ? 's' : ''} detected`;
    } else {
      controllerInfo.textContent = '🎮 No controllers detected';
    }
  }
}

// Remove local controller navigation - now handled by global system
function initControllerNavigation() {
  // Navigation now handled by window.controllerNav
  console.log('Using global controller navigation system');
}

// Multiplayer setup state
let selectedMode = 'local';
let playerCount = 2;
let selectedCharacters = {};

// Show multiplayer setup modal
function showMultiplayerSetup() {
  document.getElementById('multiplayerSetupModal').style.display = 'flex';
  controllerNavigationActive = true;
  updateControllerCount();
  populateCharacterGrid();
}

// Close multiplayer setup modal
function closeMultiplayerSetup() {
  document.getElementById('multiplayerSetupModal').style.display = 'none';
  controllerNavigationActive = false;
  resetSetup();
}

// Reset setup state
function resetSetup() {
  selectedMode = 'local';
  playerCount = 2;
  selectedCharacters = {};
  updatePlayerCountDisplay();
  populateCharacterGrid();
}

// Select mode (local or online)
function selectMode(mode) {
  selectedMode = mode;

  document.getElementById('localModeBtn').classList.toggle('active', mode === 'local');
  document.getElementById('onlineModeBtn').classList.toggle('active', mode === 'online');

  document.getElementById('localSetup').style.display = mode === 'local' ? 'block' : 'none';
  document.getElementById('onlineSetup').style.display = mode === 'online' ? 'block' : 'none';
}

// Increment player count
function incrementPlayers() {
  if (playerCount < 10) {
    playerCount++;
    updatePlayerCountDisplay();
    populateCharacterGrid();
  }
}

// Decrement player count
function decrementPlayers() {
  if (playerCount > 2) {
    playerCount--;
    Object.keys(selectedCharacters).forEach(playerIndex => {
      if (parseInt(playerIndex) >= playerCount) {
        delete selectedCharacters[playerIndex];
      }
    });
    updatePlayerCountDisplay();
    populateCharacterGrid();
  }
}

// Update player count display
function updatePlayerCountDisplay() {
  document.getElementById('playerCountDisplay').textContent = playerCount;
  document.getElementById('winningScoreDisplay').textContent = playerCount * 100;
}

// Populate character grid
function populateCharacterGrid() {
  const grid = document.getElementById('characterGrid');
  if (!grid) return;

  grid.innerHTML = '';

  if (typeof characterData === 'undefined') {
    console.error('characterData not loaded yet');
    return;
  }

  const characters = Object.keys(characterData);

  characters.forEach(charName => {
    const card = document.createElement('div');
    card.className = 'character-card';
    card.onclick = () => selectCharacter(charName, card);

    const assignedPlayer = Object.keys(selectedCharacters).find(
      playerIndex => selectedCharacters[playerIndex] === charName
    );

    if (assignedPlayer !== undefined) {
      card.classList.add('selected');
    }

    const preview = document.createElement('div');
    preview.className = 'character-preview';
    preview.innerHTML = characterData[charName].svgs.right_happy;
    card.appendChild(preview);

    const name = document.createElement('div');
    name.className = 'character-name';
    name.textContent = charName;
    card.appendChild(name);

    if (assignedPlayer !== undefined) {
      const badge = document.createElement('div');
      badge.className = 'player-badge';
      badge.textContent = `P${parseInt(assignedPlayer) + 1}`;
      card.appendChild(badge);
    }

    grid.appendChild(card);
  });
}

// Select character for next available player
function selectCharacter(charName, cardElement) {
  const assignedPlayer = Object.keys(selectedCharacters).find(
    playerIndex => selectedCharacters[playerIndex] === charName
  );

  if (assignedPlayer !== undefined) {
    delete selectedCharacters[assignedPlayer];
  } else {
    for (let i = 0; i < playerCount; i++) {
      if (!selectedCharacters[i]) {
        selectedCharacters[i] = charName;
        break;
      }
    }
  }

  populateCharacterGrid();
  updateStartButtonState();
}

// Update start button state
function updateStartButtonState() {
  const startBtn = document.getElementById('startLocalGameBtn');
  if (!startBtn) return;

  const allPlayersSelected = Object.keys(selectedCharacters).length === playerCount;
  startBtn.disabled = !allPlayersSelected;
}

// Start local game
function startLocalGame() {
  const allPlayersSelected = Object.keys(selectedCharacters).length === playerCount;

  if (!allPlayersSelected) {
    alert(`Please select characters for all ${playerCount} players!`);
    return;
  }

  closeMultiplayerSetup();

  if (typeof window.startLocalMultiplayer === 'function') {
    window.startLocalMultiplayer(playerCount, selectedCharacters, connectedControllers);
  } else {
    console.error('Local multiplayer mode not implemented yet');
    alert('Local multiplayer mode is coming soon!');
  }
}

// Start online game
function startOnlineGame() {
  closeMultiplayerSetup();

  if (typeof window.startMultiplayerMode === 'function') {
    const playerName = window.playerName || 'Player';
    window.startMultiplayerMode(playerName);
  } else {
    console.error('Online multiplayer mode not found');
  }
}

// Make functions globally accessible
window.showMultiplayerSetup = showMultiplayerSetup;
window.closeMultiplayerSetup = closeMultiplayerSetup;
window.selectMode = selectMode;
window.incrementPlayers = incrementPlayers;
window.decrementPlayers = decrementPlayers;
window.selectCharacter = selectCharacter;
window.startLocalGame = startLocalGame;
window.startOnlineGame = startOnlineGame;
window.connectedControllers = connectedControllers;
