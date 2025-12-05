// Input Priority Manager - Handles seamless switching between input methods
console.log("Input priority manager script loaded");

/**
 * InputPriorityManager class - Manages input priority and seamless switching
 */
class InputPriorityManager {
  constructor(controllerManager, inputMapper) {
    this.controllerManager = controllerManager;
    this.inputMapper = inputMapper;
    
    this.activeInputMethod = null;
    this.lastKeyboardInput = 0;
    this.lastControllerInput = 0;
    this.switchThreshold = 500; // ms - time before switching input methods
    
    this.keyboardListeners = [];
    this.controllerListeners = [];
    
    this.init();
    console.log("InputPriorityManager initialized");
  }

  /**
   * Initialize input detection
   */
  init() {
    // Listen for keyboard input
    window.addEventListener('keydown', () => this.onKeyboardInput());
    window.addEventListener('keyup', () => this.onKeyboardInput());
    
    // Listen for mouse input (counts as keyboard)
    window.addEventListener('mousedown', () => this.onKeyboardInput());
    window.addEventListener('mousemove', () => this.onKeyboardInput());
    
    // Poll for controller input
    this.startControllerPolling();
  }

  /**
   * Start polling for controller input
   */
  startControllerPolling() {
    const poll = () => {
      this.checkControllerInput();
      requestAnimationFrame(poll);
    };
    poll();
  }

  /**
   * Check for controller input
   */
  checkControllerInput() {
    const controllers = this.controllerManager.getAvailableControllers();
    
    for (const controller of controllers) {
      const state = this.controllerManager.getControllerState(controller.index);
      if (!state) continue;
      
      // Check for any button press
      for (const buttonState of Object.values(state.buttons)) {
        if (buttonState.pressed) {
          this.onControllerInput();
          return;
        }
      }
      
      // Check for significant axis movement
      for (const axisState of Object.values(state.axes)) {
        if (Math.abs(axisState.value) > 0.3) {
          this.onControllerInput();
          return;
        }
      }
    }
  }

  /**
   * Handle keyboard input detected
   */
  onKeyboardInput() {
    const now = Date.now();
    this.lastKeyboardInput = now;
    
    // Check if we should switch to keyboard
    if (this.activeInputMethod !== 'keyboard') {
      const timeSinceController = now - this.lastControllerInput;
      
      if (timeSinceController > this.switchThreshold || this.inputMapper.inputPriority === 'keyboard') {
        this.switchToKeyboard();
      }
    }
    
    // Mark keyboard input in mapper
    this.inputMapper.markKeyboardInput();
  }

  /**
   * Handle controller input detected
   */
  onControllerInput() {
    const now = Date.now();
    this.lastControllerInput = now;
    
    // Check if we should switch to controller
    if (this.activeInputMethod !== 'controller') {
      const timeSinceKeyboard = now - this.lastKeyboardInput;
      
      if (timeSinceKeyboard > this.switchThreshold || this.inputMapper.inputPriority === 'controller') {
        this.switchToController();
      }
    }
    
    // Mark controller input in mapper
    this.inputMapper.markControllerInput();
  }

  /**
   * Switch to keyboard input
   */
  switchToKeyboard() {
    if (this.activeInputMethod === 'keyboard') return;
    
    this.activeInputMethod = 'keyboard';
    console.log('Switched to keyboard input');
    
    // Notify listeners
    this.notifyKeyboardListeners();
    
    // Update UI if needed
    this.updateInputMethodUI();
  }

  /**
   * Switch to controller input
   */
  switchToController() {
    if (this.activeInputMethod === 'controller') return;
    
    this.activeInputMethod = 'controller';
    console.log('Switched to controller input');
    
    // Notify listeners
    this.notifyControllerListeners();
    
    // Update UI if needed
    this.updateInputMethodUI();
  }

  /**
   * Get active input method
   */
  getActiveInputMethod() {
    return this.activeInputMethod;
  }

  /**
   * Check if controller input should be used
   */
  shouldUseController() {
    // Check input mapper priority setting
    if (this.inputMapper.inputPriority === 'controller') return true;
    if (this.inputMapper.inputPriority === 'keyboard') return false;
    
    // Auto mode - use active input method
    return this.activeInputMethod === 'controller';
  }

  /**
   * Check if keyboard input should be used
   */
  shouldUseKeyboard() {
    return !this.shouldUseController();
  }

  /**
   * Handle simultaneous inputs (controller takes priority)
   */
  resolveSimultaneousInput(keyboardAction, controllerAction) {
    const now = Date.now();
    const keyboardRecent = (now - this.lastKeyboardInput) < 100;
    const controllerRecent = (now - this.lastControllerInput) < 100;
    
    // If both inputs are recent, controller takes priority
    if (keyboardRecent && controllerRecent) {
      console.log('Simultaneous input detected - using controller');
      return controllerAction;
    }
    
    // Use whichever was more recent
    if (this.lastControllerInput > this.lastKeyboardInput) {
      return controllerAction;
    } else {
      return keyboardAction;
    }
  }

  /**
   * Process mixed input from multiple sources
   */
  processMixedInput(inputs) {
    const result = {
      movement: { x: 0, y: 0 },
      actions: {},
      source: this.activeInputMethod
    };
    
    // Process each input source
    for (const input of inputs) {
      if (input.source === 'keyboard' && this.shouldUseKeyboard()) {
        // Merge keyboard input
        if (input.movement) {
          result.movement.x += input.movement.x;
          result.movement.y += input.movement.y;
        }
        if (input.actions) {
          Object.assign(result.actions, input.actions);
        }
      } else if (input.source === 'controller' && this.shouldUseController()) {
        // Controller input takes priority
        if (input.movement) {
          result.movement = input.movement;
        }
        if (input.actions) {
          Object.assign(result.actions, input.actions);
        }
      }
    }
    
    // Normalize movement if needed
    const magnitude = Math.sqrt(result.movement.x ** 2 + result.movement.y ** 2);
    if (magnitude > 1) {
      result.movement.x /= magnitude;
      result.movement.y /= magnitude;
    }
    
    return result;
  }

  /**
   * Update UI to show active input method
   */
  updateInputMethodUI() {
    // Update button prompts
    const prompts = document.querySelectorAll('[data-keyboard-prompt], [data-controller-prompt]');
    
    prompts.forEach(prompt => {
      if (this.activeInputMethod === 'keyboard') {
        const keyboardText = prompt.dataset.keyboardPrompt;
        if (keyboardText) {
          prompt.textContent = keyboardText;
        }
      } else if (this.activeInputMethod === 'controller') {
        const controllerText = prompt.dataset.controllerPrompt;
        if (controllerText) {
          prompt.textContent = controllerText;
        }
      }
    });
    
    // Update input method indicator if it exists
    const indicator = document.getElementById('inputMethodIndicator');
    if (indicator) {
      indicator.textContent = this.activeInputMethod === 'controller' ? '🎮' : '⌨️';
      indicator.title = `Active input: ${this.activeInputMethod}`;
    }
  }

  /**
   * Register listener for keyboard switch
   */
  onKeyboardSwitch(callback) {
    this.keyboardListeners.push(callback);
  }

  /**
   * Register listener for controller switch
   */
  onControllerSwitch(callback) {
    this.controllerListeners.push(callback);
  }

  /**
   * Notify keyboard listeners
   */
  notifyKeyboardListeners() {
    this.keyboardListeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in keyboard switch listener:', error);
      }
    });
  }

  /**
   * Notify controller listeners
   */
  notifyControllerListeners() {
    this.controllerListeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in controller switch listener:', error);
      }
    });
  }

  /**
   * Set input priority mode
   */
  setInputPriority(mode) {
    this.inputMapper.setInputPriority(mode);
    
    // Force switch if needed
    if (mode === 'controller') {
      this.switchToController();
    } else if (mode === 'keyboard') {
      this.switchToKeyboard();
    }
  }

  /**
   * Get input priority mode
   */
  getInputPriority() {
    return this.inputMapper.inputPriority;
  }

  /**
   * Set switch threshold
   */
  setSwitchThreshold(ms) {
    this.switchThreshold = Math.max(0, ms);
    console.log(`Switch threshold set to ${this.switchThreshold}ms`);
  }

  /**
   * Get debug information
   */
  getDebugInfo() {
    return {
      activeInputMethod: this.activeInputMethod,
      lastKeyboardInput: this.lastKeyboardInput,
      lastControllerInput: this.lastControllerInput,
      switchThreshold: this.switchThreshold,
      inputPriority: this.inputMapper.inputPriority,
      timeSinceKeyboard: Date.now() - this.lastKeyboardInput,
      timeSinceController: Date.now() - this.lastControllerInput
    };
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.InputPriorityManager = InputPriorityManager;
}

console.log("Input priority manager loaded successfully");
