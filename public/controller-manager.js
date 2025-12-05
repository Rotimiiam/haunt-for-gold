// Controller Detection and Management System
console.log("Controller manager script loaded");

/**
 * ControllerManager class - Handles gamepad detection and management using Gamepad API
 */
class ControllerManager {
  constructor() {
    this.connectedControllers = new Map();
    this.controllerStates = new Map();
    this.connectionListeners = [];
    this.disconnectionListeners = [];
    this.playerAssignments = new Map(); // Maps controller index to player ID
    this.isMonitoring = false;
    this.monitoringInterval = null;
    
    // Controller capability requirements
    this.requiredButtons = ['button0', 'button12', 'button13', 'button14', 'button15']; // A, D-pad
    this.requiredAxes = ['axis0', 'axis1']; // Left stick
    
    // Initialize gamepad event listeners
    this.initializeGamepadEvents();
    
    console.log("ControllerManager initialized");
  }

  /**
   * Initialize gamepad connection/disconnection events
   */
  initializeGamepadEvents() {
    // Modern browsers support gamepadconnected/gamepaddisconnected events
    if ('ongamepadconnected' in window) {
      window.addEventListener('gamepadconnected', (event) => {
        console.log('Gamepad connected:', event.gamepad);
        this.handleControllerConnect(event.gamepad);
      });

      window.addEventListener('gamepaddisconnected', (event) => {
        console.log('Gamepad disconnected:', event.gamepad);
        this.handleControllerDisconnect(event.gamepad);
      });
    } else {
      console.warn('Gamepad events not supported, using polling method');
    }
  }

  /**
   * Start monitoring for controller connections and state changes
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    
    // Initial detection
    this.detectControllers();
    
    // Set up polling for browsers that don't support gamepad events
    // or for continuous state monitoring
    this.monitoringInterval = setInterval(() => {
      this.detectControllers();
      this.updateControllerStates();
    }, 100); // Check every 100ms
    
    console.log("Controller monitoring started");
  }

  /**
   * Stop monitoring for controllers
   */
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    console.log("Controller monitoring stopped");
  }

  /**
   * Detect all connected controllers using Gamepad API
   */
  detectControllers() {
    if (!navigator.getGamepads) {
      console.warn("Gamepad API not supported in this browser");
      return [];
    }

    const gamepads = navigator.getGamepads();
    const currentControllers = new Set();

    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (gamepad) {
        currentControllers.add(i);
        
        // Check if this is a new controller
        if (!this.connectedControllers.has(i)) {
          this.handleControllerConnect(gamepad);
        } else {
          // Update existing controller info
          this.connectedControllers.set(i, {
            ...this.connectedControllers.get(i),
            gamepad: gamepad,
            lastSeen: Date.now()
          });
        }
      }
    }

    // Check for disconnected controllers
    for (const [index, controller] of this.connectedControllers) {
      if (!currentControllers.has(index)) {
        this.handleControllerDisconnect(controller.gamepad);
      }
    }

    return Array.from(this.connectedControllers.values());
  }

  /**
   * Handle controller connection
   */
  handleControllerConnect(gamepad) {
    const controllerInfo = {
      index: gamepad.index,
      id: gamepad.id,
      gamepad: gamepad,
      connected: true,
      connectedAt: Date.now(),
      lastSeen: Date.now(),
      capabilities: this.testControllerCapabilities(gamepad),
      isValid: false
    };

    // Test controller capabilities
    controllerInfo.isValid = this.validateController(controllerInfo.capabilities);
    
    this.connectedControllers.set(gamepad.index, controllerInfo);
    this.controllerStates.set(gamepad.index, this.getInitialControllerState());

    // Notify listeners
    this.notifyConnectionListeners(controllerInfo);

    console.log(`Controller connected: ${gamepad.id} (Index: ${gamepad.index})`);
    console.log('Controller capabilities:', controllerInfo.capabilities);
  }

  /**
   * Handle controller disconnection
   */
  handleControllerDisconnect(gamepad) {
    const controllerInfo = this.connectedControllers.get(gamepad.index);
    
    if (controllerInfo) {
      controllerInfo.connected = false;
      controllerInfo.disconnectedAt = Date.now();
      
      // Remove from connected controllers
      this.connectedControllers.delete(gamepad.index);
      this.controllerStates.delete(gamepad.index);
      
      // Remove player assignment if exists
      this.playerAssignments.delete(gamepad.index);
      
      // Notify listeners
      this.notifyDisconnectionListeners(controllerInfo);
      
      console.log(`Controller disconnected: ${gamepad.id} (Index: ${gamepad.index})`);
    }
  }

  /**
   * Test controller capabilities
   */
  testControllerCapabilities(gamepad) {
    const capabilities = {
      buttonCount: gamepad.buttons.length,
      axesCount: gamepad.axes.length,
      hasRequiredButtons: true,
      hasRequiredAxes: true,
      supportedButtons: [],
      supportedAxes: [],
      buttonMapping: {},
      axesMapping: {}
    };

    // Test buttons
    for (let i = 0; i < gamepad.buttons.length; i++) {
      capabilities.supportedButtons.push(`button${i}`);
      capabilities.buttonMapping[`button${i}`] = i;
    }

    // Test axes
    for (let i = 0; i < gamepad.axes.length; i++) {
      capabilities.supportedAxes.push(`axis${i}`);
      capabilities.axesMapping[`axis${i}`] = i;
    }

    // Check for required buttons (D-pad and action button)
    const requiredButtonIndices = [0, 12, 13, 14, 15]; // A, D-pad
    capabilities.hasRequiredButtons = requiredButtonIndices.every(index => 
      index < gamepad.buttons.length
    );

    // Check for required axes (left stick)
    capabilities.hasRequiredAxes = gamepad.axes.length >= 2;

    return capabilities;
  }

  /**
   * Validate if controller meets minimum requirements
   */
  validateController(capabilities) {
    // Must have at least basic buttons and axes
    const hasMinimumButtons = capabilities.buttonCount >= 4;
    const hasMinimumAxes = capabilities.axesCount >= 2;
    const hasRequiredInputs = capabilities.hasRequiredButtons && capabilities.hasRequiredAxes;

    return hasMinimumButtons && hasMinimumAxes && hasRequiredInputs;
  }

  /**
   * Get initial controller state
   */
  getInitialControllerState() {
    return {
      buttons: {},
      axes: {},
      lastUpdate: Date.now(),
      inputHistory: []
    };
  }

  /**
   * Update controller states
   */
  updateControllerStates() {
    if (!navigator.getGamepads) return;

    const gamepads = navigator.getGamepads();
    
    for (const [index, controllerInfo] of this.connectedControllers) {
      const gamepad = gamepads[index];
      if (!gamepad) continue;

      const currentState = this.controllerStates.get(index);
      const newState = {
        buttons: {},
        axes: {},
        lastUpdate: Date.now(),
        inputHistory: currentState.inputHistory || []
      };

      // Update button states
      for (let i = 0; i < gamepad.buttons.length; i++) {
        const button = gamepad.buttons[i];
        const buttonKey = `button${i}`;
        const wasPressed = currentState.buttons[buttonKey]?.pressed || false;
        const isPressed = button.pressed;

        newState.buttons[buttonKey] = {
          pressed: isPressed,
          value: button.value,
          justPressed: !wasPressed && isPressed,
          justReleased: wasPressed && !isPressed
        };

        // Record input history for just pressed buttons
        if (newState.buttons[buttonKey].justPressed) {
          newState.inputHistory.push({
            type: 'button',
            input: buttonKey,
            timestamp: Date.now()
          });
        }
      }

      // Update axes states
      for (let i = 0; i < gamepad.axes.length; i++) {
        const axisKey = `axis${i}`;
        const value = gamepad.axes[i];
        const deadzone = 0.1; // Ignore small movements
        
        newState.axes[axisKey] = {
          value: Math.abs(value) > deadzone ? value : 0,
          rawValue: value
        };
      }

      // Limit input history size
      if (newState.inputHistory.length > 50) {
        newState.inputHistory = newState.inputHistory.slice(-50);
      }

      this.controllerStates.set(index, newState);
    }
  }

  /**
   * Get available controllers for player assignment
   */
  getAvailableControllers() {
    return Array.from(this.connectedControllers.values())
      .filter(controller => controller.connected && controller.isValid)
      .map(controller => ({
        index: controller.index,
        id: controller.id,
        name: this.getControllerName(controller.id),
        capabilities: controller.capabilities,
        assignedToPlayer: this.getPlayerAssignment(controller.index)
      }));
  }

  /**
   * Get friendly controller name
   */
  getControllerName(controllerId) {
    // Common controller name mappings
    const nameMap = {
      'xbox': 'Xbox Controller',
      'playstation': 'PlayStation Controller',
      'ps4': 'PlayStation 4 Controller',
      'ps5': 'PlayStation 5 Controller',
      'switch': 'Nintendo Switch Pro Controller'
    };

    const lowerCaseId = controllerId.toLowerCase();
    
    for (const [key, name] of Object.entries(nameMap)) {
      if (lowerCaseId.includes(key)) {
        return name;
      }
    }

    // Return cleaned up version of the original ID
    return controllerId.replace(/\([^)]*\)/g, '').trim() || 'Generic Controller';
  }

  /**
   * Assign controller to player
   */
  assignControllerToPlayer(controllerIndex, playerId) {
    if (!this.connectedControllers.has(controllerIndex)) {
      throw new Error(`Controller ${controllerIndex} not found`);
    }

    const controller = this.connectedControllers.get(controllerIndex);
    if (!controller.isValid) {
      throw new Error(`Controller ${controllerIndex} does not meet requirements`);
    }

    // Remove any existing assignment for this controller
    this.playerAssignments.delete(controllerIndex);
    
    // Remove any existing assignment for this player
    for (const [index, assignedPlayerId] of this.playerAssignments) {
      if (assignedPlayerId === playerId) {
        this.playerAssignments.delete(index);
        break;
      }
    }

    // Create new assignment
    this.playerAssignments.set(controllerIndex, playerId);
    
    console.log(`Controller ${controllerIndex} assigned to player ${playerId}`);
    return true;
  }

  /**
   * Remove controller assignment
   */
  unassignController(controllerIndex) {
    const wasAssigned = this.playerAssignments.has(controllerIndex);
    this.playerAssignments.delete(controllerIndex);
    
    if (wasAssigned) {
      console.log(`Controller ${controllerIndex} unassigned`);
    }
    
    return wasAssigned;
  }

  /**
   * Get player assignment for controller
   */
  getPlayerAssignment(controllerIndex) {
    return this.playerAssignments.get(controllerIndex) || null;
  }

  /**
   * Get controller assignment for player
   */
  getControllerForPlayer(playerId) {
    for (const [controllerIndex, assignedPlayerId] of this.playerAssignments) {
      if (assignedPlayerId === playerId) {
        return controllerIndex;
      }
    }
    return null;
  }

  /**
   * Get controller state
   */
  getControllerState(controllerIndex) {
    return this.controllerStates.get(controllerIndex) || null;
  }

  /**
   * Check if controller button is pressed
   */
  isButtonPressed(controllerIndex, buttonKey) {
    const state = this.controllerStates.get(controllerIndex);
    return state?.buttons[buttonKey]?.pressed || false;
  }

  /**
   * Check if controller button was just pressed
   */
  isButtonJustPressed(controllerIndex, buttonKey) {
    const state = this.controllerStates.get(controllerIndex);
    return state?.buttons[buttonKey]?.justPressed || false;
  }

  /**
   * Get controller axis value
   */
  getAxisValue(controllerIndex, axisKey) {
    const state = this.controllerStates.get(controllerIndex);
    return state?.axes[axisKey]?.value || 0;
  }

  /**
   * Register connection listener
   */
  onControllerConnect(callback) {
    this.connectionListeners.push(callback);
  }

  /**
   * Register disconnection listener
   */
  onControllerDisconnect(callback) {
    this.disconnectionListeners.push(callback);
  }

  /**
   * Remove connection listener
   */
  removeConnectionListener(callback) {
    const index = this.connectionListeners.indexOf(callback);
    if (index > -1) {
      this.connectionListeners.splice(index, 1);
    }
  }

  /**
   * Remove disconnection listener
   */
  removeDisconnectionListener(callback) {
    const index = this.disconnectionListeners.indexOf(callback);
    if (index > -1) {
      this.disconnectionListeners.splice(index, 1);
    }
  }

  /**
   * Notify connection listeners
   */
  notifyConnectionListeners(controllerInfo) {
    this.connectionListeners.forEach(callback => {
      try {
        callback(controllerInfo);
      } catch (error) {
        console.error('Error in controller connection listener:', error);
      }
    });
  }

  /**
   * Notify disconnection listeners
   */
  notifyDisconnectionListeners(controllerInfo) {
    this.disconnectionListeners.forEach(callback => {
      try {
        callback(controllerInfo);
      } catch (error) {
        console.error('Error in controller disconnection listener:', error);
      }
    });
  }

  /**
   * Get controller count
   */
  getControllerCount() {
    return this.connectedControllers.size;
  }

  /**
   * Check if local multiplayer is available (2+ controllers)
   */
  isLocalMultiplayerAvailable() {
    const validControllers = this.getAvailableControllers().length;
    return validControllers >= 2;
  }

  /**
   * Get maximum supported players based on connected controllers
   */
  getMaxPlayers() {
    return Math.min(4, this.getAvailableControllers().length);
  }

  /**
   * Test controller input (for setup/calibration)
   */
  testControllerInput(controllerIndex, duration = 5000) {
    return new Promise((resolve) => {
      const controller = this.connectedControllers.get(controllerIndex);
      if (!controller) {
        resolve({ success: false, error: 'Controller not found' });
        return;
      }

      const testResults = {
        success: true,
        controllerIndex: controllerIndex,
        controllerId: controller.id,
        inputsDetected: [],
        startTime: Date.now(),
        duration: duration
      };

      const testInterval = setInterval(() => {
        const state = this.controllerStates.get(controllerIndex);
        if (!state) return;

        // Check for any button presses
        for (const [buttonKey, buttonState] of Object.entries(state.buttons)) {
          if (buttonState.justPressed) {
            testResults.inputsDetected.push({
              type: 'button',
              input: buttonKey,
              timestamp: Date.now()
            });
          }
        }

        // Check for significant axis movements
        for (const [axisKey, axisState] of Object.entries(state.axes)) {
          if (Math.abs(axisState.value) > 0.5) {
            testResults.inputsDetected.push({
              type: 'axis',
              input: axisKey,
              value: axisState.value,
              timestamp: Date.now()
            });
          }
        }
      }, 50);

      setTimeout(() => {
        clearInterval(testInterval);
        testResults.endTime = Date.now();
        resolve(testResults);
      }, duration);
    });
  }

  /**
   * Get debug information
   */
  getDebugInfo() {
    return {
      isMonitoring: this.isMonitoring,
      controllerCount: this.connectedControllers.size,
      connectedControllers: Array.from(this.connectedControllers.values()),
      playerAssignments: Object.fromEntries(this.playerAssignments),
      gamepadAPISupported: !!navigator.getGamepads,
      gamepadEventsSupported: 'ongamepadconnected' in window
    };
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.stopMonitoring();
    this.connectedControllers.clear();
    this.controllerStates.clear();
    this.playerAssignments.clear();
    this.connectionListeners = [];
    this.disconnectionListeners = [];
    
    console.log("ControllerManager destroyed");
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.ControllerManager = ControllerManager;
} else if (typeof global !== 'undefined') {
  global.ControllerManager = ControllerManager;
}

console.log("Controller manager loaded successfully");