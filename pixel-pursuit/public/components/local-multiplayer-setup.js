// Local Multiplayer Setup Component
console.log("Local multiplayer setup component loaded");

/**
 * LocalMultiplayerSetup - Component for setting up local multiplayer games
 * Handles controller detection, player assignment, and game configuration
 */
class LocalMultiplayerSetup {
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.container = document.getElementById(containerId);
    
    if (!this.container) {
      throw new Error(`Container element with ID '${containerId}' not found`);
    }
    
    // Configuration options
    this.options = {
      maxPlayers: 4,
      minPlayers: 2,
      autoDetectControllers: true,
      showControllerTest: true,
      allowKeyboardFallback: true,
      ...options
    };
    
    // State management
    this.state = {
      currentStep: 'controller-detection', // controller-detection, player-setup, game-settings, ready
      availableControllers: [],
      playerAssignments: new Map(), // playerId -> controllerIndex
      playerConfigs: new Map(), // playerId -> playerConfig
      gameSettings: null,
      isReady: false
    };
    
    // Controller manager
    this.controllerManager = null;
    this.controllerUpdateInterval = null;
    
    // Event callbacks
    this.callbacks = {
      onReady: null,
      onCancel: null,
      onPlayerChange: null,
      onSettingsChange: null
    };
    
    // Initialize component
    this.initialize();
  }

  /**
   * Initialize the setup component
   */
  initialize() {
    console.log("Initializing LocalMultiplayerSetup component");
    
    // Initialize controller manager
    this.initializeControllerManager();
    
    // Create initial UI
    this.render();
    
    // Start controller monitoring
    this.startControllerMonitoring();
    
    console.log("LocalMultiplayerSetup component initialized");
  }

  /**
   * Initialize controller manager
   */
  initializeControllerManager() {
    if (window.ControllerManager) {
      this.controllerManager = new window.ControllerManager();
      
      // Set up controller event listeners
      this.controllerManager.onControllerConnect((controller) => {
        console.log("Controller connected:", controller);
        this.updateAvailableControllers();
        this.updateUI();
      });
      
      this.controllerManager.onControllerDisconnect((controller) => {
        console.log("Controller disconnected:", controller);
        this.updateAvailableControllers();
        this.updateUI();
      });
      
      this.controllerManager.startMonitoring();
    } else {
      console.warn("ControllerManager not available - controller features disabled");
    }
  }

  /**
   * Start monitoring controllers
   */
  startControllerMonitoring() {
    if (!this.controllerManager) return;
    
    // Initial controller detection
    this.updateAvailableControllers();
    
    // Set up periodic updates
    this.controllerUpdateInterval = setInterval(() => {
      this.updateAvailableControllers();
    }, 1000);
  }

  /**
   * Stop monitoring controllers
   */
  stopControllerMonitoring() {
    if (this.controllerUpdateInterval) {
      clearInterval(this.controllerUpdateInterval);
      this.controllerUpdateInterval = null;
    }
  }

  /**
   * Update available controllers list
   */
  updateAvailableControllers() {
    if (!this.controllerManager) {
      this.state.availableControllers = [];
      return;
    }
    
    const controllers = this.controllerManager.getAvailableControllers();
    this.state.availableControllers = controllers;
    
    // Update player count based on available controllers
    const maxPossiblePlayers = Math.min(this.options.maxPlayers, controllers.length);
    
    // If we have enough controllers and we're on the first step, auto-advance
    if (this.state.currentStep === 'controller-detection' && controllers.length >= this.options.minPlayers) {
      // Auto-assign controllers to players
      this.autoAssignControllers();
      this.state.currentStep = 'player-setup';
      this.updateUI();
    }
  }

  /**
   * Auto-assign controllers to players
   */
  autoAssignControllers() {
    const controllers = this.state.availableControllers;
    const playerCount = Math.min(this.options.maxPlayers, controllers.length);
    
    // Clear existing assignments
    this.state.playerAssignments.clear();
    this.state.playerConfigs.clear();
    
    // Assign controllers to players
    for (let i = 0; i < playerCount; i++) {
      const playerId = `player_${i + 1}`;
      const controller = controllers[i];
      
      if (controller) {
        this.state.playerAssignments.set(playerId, controller.index);
        
        // Create default player config
        const playerConfig = {
          id: playerId,
          name: `Player ${i + 1}`,
          controllerIndex: controller.index,
          controllerId: controller.id,
          controllerName: controller.name,
          character: window.PLAYER_CHARACTERS ? window.PLAYER_CHARACTERS[i] : `Character ${i + 1}`,
          color: window.PLAYER_COLORS ? window.PLAYER_COLORS[i] : `#${Math.floor(Math.random()*16777215).toString(16)}`,
          isReady: false
        };
        
        this.state.playerConfigs.set(playerId, playerConfig);
      }
    }
    
    console.log("Auto-assigned controllers:", this.state.playerAssignments);
  }

  /**
   * Render the setup UI
   */
  render() {
    const html = `
      <div class="local-multiplayer-setup">
        <div class="setup-header">
          <h2>Local Multiplayer Setup</h2>
          <div class="setup-progress">
            <div class="progress-step ${this.state.currentStep === 'controller-detection' ? 'active' : this.isStepCompleted('controller-detection') ? 'completed' : ''}">
              <span class="step-number">1</span>
              <span class="step-label">Controllers</span>
            </div>
            <div class="progress-step ${this.state.currentStep === 'player-setup' ? 'active' : this.isStepCompleted('player-setup') ? 'completed' : ''}">
              <span class="step-number">2</span>
              <span class="step-label">Players</span>
            </div>
            <div class="progress-step ${this.state.currentStep === 'game-settings' ? 'active' : this.isStepCompleted('game-settings') ? 'completed' : ''}">
              <span class="step-number">3</span>
              <span class="step-label">Settings</span>
            </div>
            <div class="progress-step ${this.state.currentStep === 'ready' ? 'active' : ''}">
              <span class="step-number">4</span>
              <span class="step-label">Ready</span>
            </div>
          </div>
        </div>
        
        <div class="setup-content">
          ${this.renderCurrentStep()}
        </div>
        
        <div class="setup-actions">
          ${this.renderActions()}
        </div>
      </div>
    `;
    
    this.container.innerHTML = html;
    this.attachEventListeners();
  }

  /**
   * Check if a step is completed
   */
  isStepCompleted(step) {
    const steps = ['controller-detection', 'player-setup', 'game-settings', 'ready'];
    const currentIndex = steps.indexOf(this.state.currentStep);
    const stepIndex = steps.indexOf(step);
    return stepIndex < currentIndex;
  }

  /**
   * Render the current step content
   */
  renderCurrentStep() {
    switch (this.state.currentStep) {
      case 'controller-detection':
        return this.renderControllerDetection();
      case 'player-setup':
        return this.renderPlayerSetup();
      case 'game-settings':
        return this.renderGameSettings();
      case 'ready':
        return this.renderReadyScreen();
      default:
        return '<div>Unknown step</div>';
    }
  }

  /**
   * Render controller detection step
   */
  renderControllerDetection() {
    const controllers = this.state.availableControllers;
    const hasEnoughControllers = controllers.length >= this.options.minPlayers;
    
    return `
      <div class="controller-detection">
        <h3>Controller Detection</h3>
        <p>Connect ${this.options.minPlayers} or more controllers to enable local multiplayer.</p>
        
        <div class="controller-status">
          <div class="status-indicator ${hasEnoughControllers ? 'success' : 'waiting'}">
            <span class="status-icon">${hasEnoughControllers ? '✓' : '⏳'}</span>
            <span class="status-text">
              ${controllers.length} of ${this.options.minPlayers} minimum controllers detected
            </span>
          </div>
        </div>
        
        <div class="controller-list">
          ${controllers.length === 0 ? 
            '<div class="no-controllers">No controllers detected. Please connect controllers and press buttons to activate them.</div>' :
            controllers.map((controller, index) => `
              <div class="controller-item">
                <div class="controller-icon">🎮</div>
                <div class="controller-info">
                  <div class="controller-name">${controller.name}</div>
                  <div class="controller-details">Index: ${controller.index} | ID: ${controller.id}</div>
                  <div class="controller-capabilities">
                    Buttons: ${controller.capabilities.buttonCount} | 
                    Axes: ${controller.capabilities.axesCount}
                    ${controller.capabilities.hasRequiredButtons && controller.capabilities.hasRequiredAxes ? 
                      '<span class="capability-ok">✓ Compatible</span>' : 
                      '<span class="capability-warning">⚠ Limited compatibility</span>'}
                  </div>
                </div>
                <div class="controller-actions">
                  <button class="test-controller-btn" onclick="localMultiplayerSetup.testController(${controller.index})">
                    Test Controller
                  </button>
                </div>
              </div>
            `).join('')
          }
        </div>
        
        ${this.options.allowKeyboardFallback ? `
          <div class="keyboard-fallback">
            <h4>Keyboard Fallback</h4>
            <p>If you don't have enough controllers, you can use keyboard controls for some players.</p>
            <div class="keyboard-schemes">
              <div class="keyboard-scheme">
                <strong>Player 1:</strong> WASD + Space
              </div>
              <div class="keyboard-scheme">
                <strong>Player 2:</strong> Arrow Keys + Enter
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Render player setup step
   */
  renderPlayerSetup() {
    const players = Array.from(this.state.playerConfigs.values());
    
    return `
      <div class="player-setup">
        <h3>Player Configuration</h3>
        <p>Configure each player's name, character, and test their controller.</p>
        
        <div class="player-count-selector">
          <label for="playerCountSelect">Number of Players:</label>
          <select id="playerCountSelect" onchange="localMultiplayerSetup.updatePlayerCount(this.value)">
            ${Array.from({length: this.options.maxPlayers - this.options.minPlayers + 1}, (_, i) => {
              const count = this.options.minPlayers + i;
              const available = count <= this.state.availableControllers.length;
              return `<option value="${count}" ${count === players.length ? 'selected' : ''} ${!available ? 'disabled' : ''}>
                ${count} Players ${!available ? '(Not enough controllers)' : ''}
              </option>`;
            }).join('')}
          </select>
        </div>
        
        <div class="players-grid">
          ${players.map((player, index) => this.renderPlayerCard(player, index)).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render individual player card
   */
  renderPlayerCard(player, index) {
    const controller = this.state.availableControllers.find(c => c.index === player.controllerIndex);
    
    return `
      <div class="player-card" data-player-id="${player.id}" style="border-color: ${player.color}">
        <div class="player-header">
          <h4>Player ${index + 1}</h4>
          <div class="player-status ${player.isReady ? 'ready' : 'not-ready'}">
            ${player.isReady ? '✓ Ready' : '⏳ Setup'}
          </div>
        </div>
        
        <div class="player-config">
          <div class="config-group">
            <label>Name:</label>
            <input type="text" 
                   value="${player.name}" 
                   onchange="localMultiplayerSetup.updatePlayerName('${player.id}', this.value)"
                   placeholder="Enter player name">
          </div>
          
          <div class="config-group">
            <label>Character:</label>
            <select onchange="localMultiplayerSetup.updatePlayerCharacter('${player.id}', this.value)">
              ${window.PLAYER_CHARACTERS ? window.PLAYER_CHARACTERS.map(char => 
                `<option value="${char}" ${char === player.character ? 'selected' : ''}>${char}</option>`
              ).join('') : `<option value="${player.character}">${player.character}</option>`}
            </select>
          </div>
          
          <div class="config-group">
            <label>Color:</label>
            <div class="color-selector">
              <input type="color" 
                     value="${player.color}" 
                     onchange="localMultiplayerSetup.updatePlayerColor('${player.id}', this.value)">
              <div class="color-preview" style="background-color: ${player.color}"></div>
            </div>
          </div>
        </div>
        
        <div class="controller-info">
          <div class="controller-assignment">
            <strong>Controller:</strong> ${controller ? controller.name : 'Not assigned'}
          </div>
          <div class="controller-actions">
            <button class="test-player-btn" 
                    onclick="localMultiplayerSetup.testPlayerController('${player.id}')"
                    ${!controller ? 'disabled' : ''}>
              Test Controller
            </button>
            <button class="reassign-controller-btn" 
                    onclick="localMultiplayerSetup.reassignController('${player.id}')">
              Reassign
            </button>
          </div>
        </div>
        
        <div class="player-actions">
          <button class="ready-toggle-btn ${player.isReady ? 'ready' : 'not-ready'}" 
                  onclick="localMultiplayerSetup.togglePlayerReady('${player.id}')">
            ${player.isReady ? 'Ready ✓' : 'Mark Ready'}
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Render game settings step
   */
  renderGameSettings() {
    const defaultSettings = {
      gameDuration: 300,
      winCondition: 'score',
      targetScore: 500,
      difficulty: 'medium',
      mapSize: 'medium',
      powerUpsEnabled: true,
      friendlyFire: false,
      respawnEnabled: false
    };
    
    const settings = this.state.gameSettings || defaultSettings;
    
    return `
      <div class="game-settings">
        <h3>Game Settings</h3>
        <p>Configure the game rules and difficulty.</p>
        
        <div class="settings-grid">
          <div class="setting-group">
            <label for="gameDuration">Game Duration (seconds):</label>
            <input type="number" 
                   id="gameDuration" 
                   value="${settings.gameDuration}" 
                   min="60" 
                   max="1800" 
                   step="30"
                   onchange="localMultiplayerSetup.updateGameSetting('gameDuration', parseInt(this.value))">
          </div>
          
          <div class="setting-group">
            <label for="winCondition">Win Condition:</label>
            <select id="winCondition" onchange="localMultiplayerSetup.updateGameSetting('winCondition', this.value)">
              <option value="score" ${settings.winCondition === 'score' ? 'selected' : ''}>Score Target</option>
              <option value="time" ${settings.winCondition === 'time' ? 'selected' : ''}>Time Limit</option>
              <option value="coins" ${settings.winCondition === 'coins' ? 'selected' : ''}>Coin Count</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label for="targetScore">Target Score:</label>
            <input type="number" 
                   id="targetScore" 
                   value="${settings.targetScore}" 
                   min="100" 
                   max="2000" 
                   step="50"
                   onchange="localMultiplayerSetup.updateGameSetting('targetScore', parseInt(this.value))">
          </div>
          
          <div class="setting-group">
            <label for="difficulty">Difficulty:</label>
            <select id="difficulty" onchange="localMultiplayerSetup.updateGameSetting('difficulty', this.value)">
              <option value="easy" ${settings.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
              <option value="medium" ${settings.difficulty === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="hard" ${settings.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label for="mapSize">Map Size:</label>
            <select id="mapSize" onchange="localMultiplayerSetup.updateGameSetting('mapSize', this.value)">
              <option value="small" ${settings.mapSize === 'small' ? 'selected' : ''}>Small</option>
              <option value="medium" ${settings.mapSize === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="large" ${settings.mapSize === 'large' ? 'selected' : ''}>Large</option>
            </select>
          </div>
        </div>
        
        <div class="settings-checkboxes">
          <label class="checkbox-label">
            <input type="checkbox" 
                   ${settings.powerUpsEnabled ? 'checked' : ''} 
                   onchange="localMultiplayerSetup.updateGameSetting('powerUpsEnabled', this.checked)">
            <span>Power-ups Enabled</span>
          </label>
          
          <label class="checkbox-label">
            <input type="checkbox" 
                   ${settings.friendlyFire ? 'checked' : ''} 
                   onchange="localMultiplayerSetup.updateGameSetting('friendlyFire', this.checked)">
            <span>Friendly Fire</span>
          </label>
          
          <label class="checkbox-label">
            <input type="checkbox" 
                   ${settings.respawnEnabled ? 'checked' : ''} 
                   onchange="localMultiplayerSetup.updateGameSetting('respawnEnabled', this.checked)">
            <span>Respawn Enabled</span>
          </label>
        </div>
        
        <div class="settings-preview">
          <h4>Game Preview</h4>
          <div class="preview-info">
            <div>Players: ${this.state.playerConfigs.size}</div>
            <div>Duration: ${Math.floor(settings.gameDuration / 60)}:${(settings.gameDuration % 60).toString().padStart(2, '0')}</div>
            <div>Win by: ${settings.winCondition === 'score' ? `${settings.targetScore} points` : 
                          settings.winCondition === 'time' ? 'Time limit' : 
                          `${settings.targetCoins || 50} coins`}</div>
            <div>Difficulty: ${settings.difficulty}</div>
            <div>Map: ${settings.mapSize}</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render ready screen
   */
  renderReadyScreen() {
    const players = Array.from(this.state.playerConfigs.values());
    const settings = this.state.gameSettings;
    
    return `
      <div class="ready-screen">
        <h3>Ready to Play!</h3>
        <p>All players are configured and ready to start the game.</p>
        
        <div class="game-summary">
          <div class="summary-section">
            <h4>Players (${players.length})</h4>
            <div class="players-summary">
              ${players.map(player => `
                <div class="player-summary" style="border-left-color: ${player.color}">
                  <span class="player-name">${player.name}</span>
                  <span class="player-character">${player.character}</span>
                  <span class="player-controller">${this.getControllerName(player.controllerIndex)}</span>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div class="summary-section">
            <h4>Game Settings</h4>
            <div class="settings-summary">
              <div>Duration: ${Math.floor(settings.gameDuration / 60)}:${(settings.gameDuration % 60).toString().padStart(2, '0')}</div>
              <div>Win Condition: ${settings.winCondition}</div>
              <div>Difficulty: ${settings.difficulty}</div>
              <div>Map Size: ${settings.mapSize}</div>
              <div>Features: ${[
                settings.powerUpsEnabled ? 'Power-ups' : null,
                settings.friendlyFire ? 'Friendly Fire' : null,
                settings.respawnEnabled ? 'Respawn' : null
              ].filter(Boolean).join(', ') || 'Standard'}</div>
            </div>
          </div>
        </div>
        
        <div class="final-instructions">
          <h4>Controls Reminder</h4>
          <div class="controls-grid">
            ${players.map((player, index) => `
              <div class="control-reminder">
                <strong>${player.name}:</strong>
                <div class="control-scheme">
                  ${this.getControlSchemeDescription(player.controllerIndex)}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render action buttons
   */
  renderActions() {
    const canGoNext = this.canProceedToNextStep();
    const canGoBack = this.canGoToPreviousStep();
    
    let nextButtonText = 'Next';
    let nextButtonAction = 'nextStep';
    
    if (this.state.currentStep === 'ready') {
      nextButtonText = 'Start Game';
      nextButtonAction = 'startGame';
    }
    
    return `
      <button class="setup-btn secondary" 
              onclick="localMultiplayerSetup.previousStep()" 
              ${!canGoBack ? 'disabled' : ''}>
        Back
      </button>
      
      <button class="setup-btn cancel" onclick="localMultiplayerSetup.cancel()">
        Cancel
      </button>
      
      <button class="setup-btn primary" 
              onclick="localMultiplayerSetup.${nextButtonAction}()" 
              ${!canGoNext ? 'disabled' : ''}>
        ${nextButtonText}
      </button>
    `;
  }

  /**
   * Update the UI without full re-render
   */
  updateUI() {
    // Only update if container exists and is visible
    if (!this.container || !this.container.offsetParent) return;
    
    // Re-render the component
    this.render();
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Make the setup instance globally accessible for onclick handlers
    window.localMultiplayerSetup = this;
  }

  // Public methods for UI interactions

  /**
   * Test a specific controller
   */
  async testController(controllerIndex) {
    if (!this.controllerManager) {
      alert('Controller manager not available');
      return;
    }
    
    console.log(`Testing controller ${controllerIndex}`);
    
    // Show testing modal
    this.showControllerTestModal(controllerIndex);
    
    try {
      const testResult = await this.controllerManager.testControllerInput(controllerIndex, 3000);
      this.showControllerTestResult(testResult);
    } catch (error) {
      console.error('Controller test failed:', error);
      alert('Controller test failed: ' + error.message);
    }
  }

  /**
   * Show controller test modal
   */
  showControllerTestModal(controllerIndex) {
    const controller = this.state.availableControllers.find(c => c.index === controllerIndex);
    const controllerName = controller ? controller.name : `Controller ${controllerIndex}`;
    
    const modal = document.createElement('div');
    modal.className = 'controller-test-modal';
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <h3>Testing ${controllerName}</h3>
          <p>Press any buttons or move sticks on your controller...</p>
          <div class="test-progress">
            <div class="progress-bar">
              <div class="progress-fill" style="width: 0%"></div>
            </div>
            <div class="test-timer">3 seconds remaining</div>
          </div>
          <div class="detected-inputs">
            <h4>Detected Inputs:</h4>
            <div class="input-list"></div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate progress bar
    let timeLeft = 3000;
    const interval = setInterval(() => {
      timeLeft -= 100;
      const progress = ((3000 - timeLeft) / 3000) * 100;
      const progressBar = modal.querySelector('.progress-fill');
      const timer = modal.querySelector('.test-timer');
      
      if (progressBar) progressBar.style.width = `${progress}%`;
      if (timer) timer.textContent = `${Math.ceil(timeLeft / 1000)} seconds remaining`;
      
      if (timeLeft <= 0) {
        clearInterval(interval);
      }
    }, 100);
    
    // Store modal reference for cleanup
    this.currentTestModal = modal;
  }

  /**
   * Show controller test result
   */
  showControllerTestResult(testResult) {
    if (this.currentTestModal) {
      document.body.removeChild(this.currentTestModal);
      this.currentTestModal = null;
    }
    
    const success = testResult.success && testResult.inputsDetected.length > 0;
    const message = success ? 
      `Controller test successful! Detected ${testResult.inputsDetected.length} inputs.` :
      'No inputs detected. Please check your controller connection.';
    
    alert(message);
  }

  /**
   * Update player count
   */
  updatePlayerCount(newCount) {
    const count = parseInt(newCount);
    const availableControllers = this.state.availableControllers.length;
    
    if (count > availableControllers) {
      alert(`Not enough controllers connected. You have ${availableControllers} controllers but need ${count}.`);
      return;
    }
    
    // Clear existing assignments
    this.state.playerAssignments.clear();
    this.state.playerConfigs.clear();
    
    // Create new player configs
    for (let i = 0; i < count; i++) {
      const playerId = `player_${i + 1}`;
      const controller = this.state.availableControllers[i];
      
      if (controller) {
        this.state.playerAssignments.set(playerId, controller.index);
        
        const playerConfig = {
          id: playerId,
          name: `Player ${i + 1}`,
          controllerIndex: controller.index,
          controllerId: controller.id,
          controllerName: controller.name,
          character: window.PLAYER_CHARACTERS ? window.PLAYER_CHARACTERS[i] : `Character ${i + 1}`,
          color: window.PLAYER_COLORS ? window.PLAYER_COLORS[i] : `#${Math.floor(Math.random()*16777215).toString(16)}`,
          isReady: false
        };
        
        this.state.playerConfigs.set(playerId, playerConfig);
      }
    }
    
    this.updateUI();
    this.triggerCallback('onPlayerChange');
  }

  /**
   * Update player name
   */
  updatePlayerName(playerId, newName) {
    const player = this.state.playerConfigs.get(playerId);
    if (player) {
      player.name = newName || `Player ${playerId.split('_')[1]}`;
      this.state.playerConfigs.set(playerId, player);
      this.triggerCallback('onPlayerChange');
    }
  }

  /**
   * Update player character
   */
  updatePlayerCharacter(playerId, newCharacter) {
    const player = this.state.playerConfigs.get(playerId);
    if (player) {
      player.character = newCharacter;
      this.state.playerConfigs.set(playerId, player);
      this.triggerCallback('onPlayerChange');
    }
  }

  /**
   * Update player color
   */
  updatePlayerColor(playerId, newColor) {
    const player = this.state.playerConfigs.get(playerId);
    if (player) {
      player.color = newColor;
      this.state.playerConfigs.set(playerId, player);
      this.updateUI();
      this.triggerCallback('onPlayerChange');
    }
  }

  /**
   * Test player controller
   */
  async testPlayerController(playerId) {
    const player = this.state.playerConfigs.get(playerId);
    if (player && player.controllerIndex !== undefined) {
      await this.testController(player.controllerIndex);
    }
  }

  /**
   * Reassign controller for player
   */
  reassignController(playerId) {
    // Show controller selection modal
    const availableControllers = this.state.availableControllers.filter(controller => 
      !Array.from(this.state.playerAssignments.values()).includes(controller.index) ||
      this.state.playerAssignments.get(playerId) === controller.index
    );
    
    if (availableControllers.length === 0) {
      alert('No available controllers to reassign');
      return;
    }
    
    const controllerOptions = availableControllers.map(controller => 
      `<option value="${controller.index}">${controller.name}</option>`
    ).join('');
    
    const modal = document.createElement('div');
    modal.className = 'reassign-modal';
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <h3>Reassign Controller</h3>
          <p>Select a new controller for this player:</p>
          <select id="controllerSelect">
            ${controllerOptions}
          </select>
          <div class="modal-actions">
            <button onclick="this.closest('.reassign-modal').remove()">Cancel</button>
            <button onclick="localMultiplayerSetup.confirmControllerReassignment('${playerId}', document.getElementById('controllerSelect').value); this.closest('.reassign-modal').remove()">Assign</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  /**
   * Confirm controller reassignment
   */
  confirmControllerReassignment(playerId, newControllerIndex) {
    const controllerIndex = parseInt(newControllerIndex);
    const controller = this.state.availableControllers.find(c => c.index === controllerIndex);
    
    if (controller) {
      // Update player assignment
      this.state.playerAssignments.set(playerId, controllerIndex);
      
      // Update player config
      const player = this.state.playerConfigs.get(playerId);
      if (player) {
        player.controllerIndex = controllerIndex;
        player.controllerId = controller.id;
        player.controllerName = controller.name;
        this.state.playerConfigs.set(playerId, player);
      }
      
      this.updateUI();
      this.triggerCallback('onPlayerChange');
    }
  }

  /**
   * Toggle player ready status
   */
  togglePlayerReady(playerId) {
    const player = this.state.playerConfigs.get(playerId);
    if (player) {
      player.isReady = !player.isReady;
      this.state.playerConfigs.set(playerId, player);
      this.updateUI();
      this.triggerCallback('onPlayerChange');
    }
  }

  /**
   * Update game setting
   */
  updateGameSetting(setting, value) {
    if (!this.state.gameSettings) {
      this.state.gameSettings = {};
    }
    
    this.state.gameSettings[setting] = value;
    this.triggerCallback('onSettingsChange');
  }

  /**
   * Navigation methods
   */
  nextStep() {
    const steps = ['controller-detection', 'player-setup', 'game-settings', 'ready'];
    const currentIndex = steps.indexOf(this.state.currentStep);
    
    if (currentIndex < steps.length - 1 && this.canProceedToNextStep()) {
      this.state.currentStep = steps[currentIndex + 1];
      
      // Initialize game settings when entering that step
      if (this.state.currentStep === 'game-settings' && !this.state.gameSettings) {
        this.state.gameSettings = {
          playerCount: this.state.playerConfigs.size,
          gameDuration: 300,
          winCondition: 'score',
          targetScore: 500,
          difficulty: 'medium',
          mapSize: 'medium',
          powerUpsEnabled: true,
          friendlyFire: false,
          respawnEnabled: false
        };
      }
      
      this.updateUI();
    }
  }

  previousStep() {
    const steps = ['controller-detection', 'player-setup', 'game-settings', 'ready'];
    const currentIndex = steps.indexOf(this.state.currentStep);
    
    if (currentIndex > 0) {
      this.state.currentStep = steps[currentIndex - 1];
      this.updateUI();
    }
  }

  /**
   * Check if can proceed to next step
   */
  canProceedToNextStep() {
    switch (this.state.currentStep) {
      case 'controller-detection':
        return this.state.availableControllers.length >= this.options.minPlayers;
      case 'player-setup':
        return Array.from(this.state.playerConfigs.values()).every(player => player.isReady);
      case 'game-settings':
        return this.state.gameSettings !== null;
      case 'ready':
        return true;
      default:
        return false;
    }
  }

  /**
   * Check if can go to previous step
   */
  canGoToPreviousStep() {
    return this.state.currentStep !== 'controller-detection';
  }

  /**
   * Start the game
   */
  startGame() {
    if (this.state.currentStep === 'ready' && this.state.isReady) {
      const gameConfig = this.getGameConfiguration();
      this.triggerCallback('onReady', gameConfig);
    }
  }

  /**
   * Cancel setup
   */
  cancel() {
    this.triggerCallback('onCancel');
  }

  /**
   * Get game configuration
   */
  getGameConfiguration() {
    const players = Array.from(this.state.playerConfigs.values());
    const controllerAssignments = {};
    
    players.forEach((player, index) => {
      controllerAssignments[index] = player.controllerIndex;
    });
    
    return {
      players: players.map(p => ({
        id: p.id,
        name: p.name,
        character: p.character,
        color: p.color,
        controllerIndex: p.controllerIndex
      })),
      playerNames: players.map(p => p.name),
      controllerAssignments: controllerAssignments,
      gameSettings: this.state.gameSettings,
      isReady: true
    };
  }

  /**
   * Helper methods
   */
  getControllerName(controllerIndex) {
    const controller = this.state.availableControllers.find(c => c.index === controllerIndex);
    return controller ? controller.name : `Controller ${controllerIndex}`;
  }

  getControlSchemeDescription(controllerIndex) {
    const controller = this.state.availableControllers.find(c => c.index === controllerIndex);
    if (controller) {
      return 'D-pad/Left stick + A button';
    }
    return 'Unknown controls';
  }

  /**
   * Event callback system
   */
  on(event, callback) {
    this.callbacks[event] = callback;
  }

  triggerCallback(event, data = null) {
    if (this.callbacks[event] && typeof this.callbacks[event] === 'function') {
      this.callbacks[event](data);
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    this.stopControllerMonitoring();
    
    if (this.controllerManager) {
      this.controllerManager.destroy();
      this.controllerManager = null;
    }
    
    if (this.currentTestModal) {
      document.body.removeChild(this.currentTestModal);
      this.currentTestModal = null;
    }
    
    // Clear global reference
    if (window.localMultiplayerSetup === this) {
      window.localMultiplayerSetup = null;
    }
    
    console.log("LocalMultiplayerSetup destroyed");
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.LocalMultiplayerSetup = LocalMultiplayerSetup;
} else if (typeof global !== 'undefined') {
  global.LocalMultiplayerSetup = LocalMultiplayerSetup;
}

console.log("Local multiplayer setup component loaded successfully");