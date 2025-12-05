// Controller Integration - Integrates controller support with game modes
console.log("Controller integration script loaded");

/**
 * ControllerIntegration class - Integrates all controller components with game
 */
class ControllerIntegration {
  constructor() {
    this.controllerManager = null;
    this.inputMapper = null;
    this.configManager = null;
    this.uiAdapter = null;
    this.vibrationManager = null;
    this.priorityManager = null;
    this.settingsUI = null;
    
    this.initialized = false;
    this.gameMode = null;
    
    console.log("ControllerIntegration created");
  }

  /**
   * Initialize all controller systems
   */
  async init() {
    if (this.initialized) {
      console.log('Controller integration already initialized');
      return;
    }
    
    try {
      console.log('Initializing controller integration...');
      
      // Initialize core components
      this.controllerManager = new ControllerManager();
      this.inputMapper = new InputMapper();
      this.configManager = new ConfigurationManager();
      
      // Initialize UI and feedback components
      this.uiAdapter = new ControllerUIAdapter(this.controllerManager);
      this.vibrationManager = new VibrationManager(this.controllerManager);
      this.priorityManager = new InputPriorityManager(this.controllerManager, this.inputMapper);
      
      // Initialize settings UI
      this.settingsUI = new ControllerSettingsUI(
        this.controllerManager,
        this.inputMapper,
        this.configManager
      );
      
      // Start monitoring for controllers
      this.controllerManager.startMonitoring();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Load saved configurations
      this.loadConfigurations();
      
      // Make globally accessible
      window.controllerIntegration = this;
      window.controllerManager = this.controllerManager;
      window.controllerSettingsUI = this.settingsUI;
      
      this.initialized = true;
      console.log('Controller integration initialized successfully');
      
      return true;
    } catch (error) {
      console.error('Error initializing controller integration:', error);
      return false;
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for controller connections
    this.controllerManager.onControllerConnect((controller) => {
      console.log('Controller connected:', controller.id);
      
      // Load configuration for this controller
      const config = this.configManager.getOrCreateConfiguration(controller.gamepad);
      
      // Apply configuration to input mapper
      if (config.buttonMappings) {
        Object.entries(config.buttonMappings).forEach(([button, action]) => {
          this.inputMapper.setButtonMapping(controller.id, button, action);
        });
      }
      
      if (config.axisMappings) {
        Object.entries(config.axisMappings).forEach(([axis, action]) => {
          this.inputMapper.setAxisMapping(controller.id, axis, action);
        });
      }
      
      if (config.deadzone !== undefined) {
        this.inputMapper.setDeadzone(config.deadzone);
      }
      
      // Show notification
      const controllerName = this.controllerManager.getControllerName(controller.id);
      this.uiAdapter.showConnectedNotification(controller.index, controllerName);
      
      // Test vibration if enabled
      if (config.vibrationEnabled && this.vibrationManager.supportsVibration(controller.index)) {
        setTimeout(() => {
          this.vibrationManager.vibrateOnButtonPress(controller.index);
        }, 500);
      }
    });
    
    // Listen for controller disconnections
    this.controllerManager.onControllerDisconnect((controller) => {
      console.log('Controller disconnected:', controller.id);
      
      // Show notification
      this.uiAdapter.showDisconnectedNotification(controller.index);
      
      // Pause game if in active gameplay
      if (this.gameMode && this.isGameActive()) {
        this.pauseGame();
      }
    });
    
    // Listen for input method switches
    this.priorityManager.onControllerSwitch(() => {
      this.uiAdapter.updateButtonPrompts('controller');
    });
    
    this.priorityManager.onKeyboardSwitch(() => {
      this.uiAdapter.updateButtonPrompts('keyboard');
    });
  }

  /**
   * Load saved configurations
   */
  loadConfigurations() {
    const globalSettings = this.configManager.loadGlobalSettings();
    
    if (globalSettings.vibrationEnabled !== undefined) {
      if (globalSettings.vibrationEnabled) {
        this.vibrationManager.enable();
      } else {
        this.vibrationManager.disable();
      }
    }
    
    if (globalSettings.inputPriority) {
      this.priorityManager.setInputPriority(globalSettings.inputPriority);
    }
  }

  /**
   * Process controller input for game
   */
  processInput(playerId) {
    const controllerIndex = this.controllerManager.getControllerForPlayer(playerId);
    if (controllerIndex === null) return null;
    
    const state = this.controllerManager.getControllerState(controllerIndex);
    if (!state) return null;
    
    const controller = this.controllerManager.connectedControllers.get(controllerIndex);
    if (!controller) return null;
    
    // Process input through mapper
    const actions = this.inputMapper.processControllerInput(controller.id, state);
    
    return actions;
  }

  /**
   * Get movement input for player
   */
  getMovementInput(playerId) {
    const actions = this.processInput(playerId);
    if (!actions) return { x: 0, y: 0 };
    
    return actions.movement;
  }

  /**
   * Check if action button is pressed
   */
  isActionPressed(playerId, action) {
    const actions = this.processInput(playerId);
    if (!actions) return false;
    
    return actions.buttons[action]?.pressed || false;
  }

  /**
   * Check if action button was just pressed
   */
  isActionJustPressed(playerId, action) {
    const actions = this.processInput(playerId);
    if (!actions) return false;
    
    return actions.buttons[action]?.justPressed || false;
  }

  /**
   * Vibrate controller for player
   */
  vibrateForPlayer(playerId, pattern) {
    const controllerIndex = this.controllerManager.getControllerForPlayer(playerId);
    if (controllerIndex === null) return false;
    
    if (typeof pattern === 'string') {
      return this.vibrationManager.vibratePattern(controllerIndex, pattern);
    } else if (typeof pattern === 'object') {
      return this.vibrationManager.vibrateCustom(controllerIndex, pattern);
    } else {
      return this.vibrationManager.vibrate(controllerIndex, pattern);
    }
  }

  /**
   * Set game mode
   */
  setGameMode(mode) {
    this.gameMode = mode;
    console.log(`Game mode set to: ${mode}`);
  }

  /**
   * Check if game is active
   */
  isGameActive() {
    // Check if canvas is visible and game is running
    const canvas = document.getElementById('gameCanvas');
    const homeScreen = document.getElementById('homeScreen');
    
    if (!canvas || !homeScreen) return false;
    
    const canvasVisible = window.getComputedStyle(canvas).display !== 'none';
    const homeVisible = window.getComputedStyle(homeScreen).display !== 'none';
    
    return canvasVisible && !homeVisible;
  }

  /**
   * Pause game
   */
  pauseGame() {
    console.log('Pausing game due to controller disconnect');
    
    // Trigger pause based on game mode
    if (window.localGameState) {
      window.localGameState.isPaused = true;
    }
    
    if (window.practiceMode && window.practiceMode.gameStarted) {
      window.practiceMode.isPaused = true;
    }
    
    // Show pause overlay
    if (window.controllerNav) {
      window.controllerNav.showPauseMenu();
    }
  }

  /**
   * Integrate with practice mode
   */
  integratePracticeMode() {
    if (!window.practiceMode) {
      console.warn('Practice mode not found');
      return;
    }
    
    console.log('Integrating controller with practice mode');
    
    // Override practice mode input handling
    const originalHandleInput = window.practiceMode.handleInput;
    if (originalHandleInput) {
      window.practiceMode.handleInput = () => {
        // Check for controller input first
        const controllers = this.controllerManager.getAvailableControllers();
        if (controllers.length > 0 && this.priorityManager.shouldUseController()) {
          const movement = this.getMovementInput('practice');
          if (movement.x !== 0 || movement.y !== 0) {
            // Use controller movement
            return movement;
          }
        }
        
        // Fall back to keyboard
        return originalHandleInput.call(window.practiceMode);
      };
    }
  }

  /**
   * Integrate with local multiplayer
   */
  integrateLocalMultiplayer() {
    if (!window.localMultiplayerGame) {
      console.warn('Local multiplayer game not found');
      return;
    }
    
    console.log('Integrating controller with local multiplayer');
    
    // Local multiplayer already uses controllers through ControllerManager
    // Just ensure proper assignment
    const controllers = this.controllerManager.getAvailableControllers();
    controllers.forEach((controller, index) => {
      const playerId = `player${index + 1}`;
      this.controllerManager.assignControllerToPlayer(controller.index, playerId);
    });
  }

  /**
   * Integrate with online multiplayer
   */
  integrateOnlineMultiplayer() {
    console.log('Integrating controller with online multiplayer');
    
    // Online multiplayer can use controller for single player
    const controllers = this.controllerManager.getAvailableControllers();
    if (controllers.length > 0) {
      this.controllerManager.assignControllerToPlayer(controllers[0].index, 'online');
    }
  }

  /**
   * Handle game event with vibration
   */
  handleGameEvent(event, playerId = null) {
    if (!playerId) {
      // Vibrate all controllers
      const controllers = this.controllerManager.getAvailableControllers();
      controllers.forEach(controller => {
        this.handleGameEventForController(event, controller.index);
      });
    } else {
      // Vibrate specific player's controller
      const controllerIndex = this.controllerManager.getControllerForPlayer(playerId);
      if (controllerIndex !== null) {
        this.handleGameEventForController(event, controllerIndex);
      }
    }
  }

  /**
   * Handle game event for specific controller
   */
  handleGameEventForController(event, controllerIndex) {
    switch (event) {
      case 'coinCollect':
        this.vibrationManager.vibrateOnCoinCollect(controllerIndex);
        break;
      case 'enemyHit':
        this.vibrationManager.vibrateOnEnemyHit(controllerIndex);
        break;
      case 'bombHit':
        this.vibrationManager.vibrateOnBombHit(controllerIndex);
        break;
      case 'gameWin':
        this.vibrationManager.vibrateOnGameWin(controllerIndex);
        break;
      case 'gameLose':
        this.vibrationManager.vibrateOnGameLose(controllerIndex);
        break;
      case 'buttonPress':
        this.vibrationManager.vibrateOnButtonPress(controllerIndex);
        break;
      case 'menuNavigate':
        this.vibrationManager.vibrateOnMenuNavigate(controllerIndex);
        break;
      case 'error':
        this.vibrationManager.vibrateOnError(controllerIndex);
        break;
      default:
        console.warn(`Unknown game event: ${event}`);
    }
  }

  /**
   * Show controller settings
   */
  showSettings(controllerIndex = 0) {
    if (!this.settingsUI) {
      console.error('Settings UI not initialized');
      return;
    }
    
    this.settingsUI.show(controllerIndex);
  }

  /**
   * Get debug information
   */
  getDebugInfo() {
    return {
      initialized: this.initialized,
      gameMode: this.gameMode,
      controllerManager: this.controllerManager?.getDebugInfo(),
      inputMapper: this.inputMapper?.getDebugInfo(),
      vibrationManager: this.vibrationManager?.getDebugInfo(),
      priorityManager: this.priorityManager?.getDebugInfo()
    };
  }

  /**
   * Clean up
   */
  destroy() {
    if (this.controllerManager) {
      this.controllerManager.destroy();
    }
    
    if (this.uiAdapter) {
      this.uiAdapter.destroy();
    }
    
    this.initialized = false;
    console.log('Controller integration destroyed');
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.controllerIntegration = new ControllerIntegration();
    window.controllerIntegration.init();
  });
} else {
  // DOM already loaded
  window.controllerIntegration = new ControllerIntegration();
  window.controllerIntegration.init();
}

console.log("Controller integration loaded successfully");
