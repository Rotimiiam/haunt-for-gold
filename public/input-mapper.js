// Input Mapper - Maps controller inputs to game actions
console.log("Input mapper script loaded");

/**
 * InputMapper class - Handles button and axis mapping for controllers
 */
class InputMapper {
  constructor() {
    this.buttonMappings = new Map(); // controllerId -> button mappings
    this.axisMappings = new Map(); // controllerId -> axis mappings
    this.deadzone = 0.15; // Default deadzone for analog sticks
    this.inputPriority = 'auto'; // 'controller' | 'keyboard' | 'auto'
    this.lastInputMethod = null;
    
    // Default button mappings for standard gamepad
    this.defaultButtonMapping = {
      button0: 'action',      // A/X - Primary action
      button1: 'cancel',      // B/Circle - Cancel/Back
      button2: 'special',     // X/Square - Special ability
      button3: 'dash',        // Y/Triangle - Dash/Sprint
      button4: 'leftBumper',  // LB/L1
      button5: 'rightBumper', // RB/R1
      button6: 'leftTrigger', // LT/L2
      button7: 'rightTrigger',// RT/R2
      button8: 'select',      // Select/Share
      button9: 'start',       // Start/Options - Pause
      button10: 'leftStick',  // L3
      button11: 'rightStick', // R3
      button12: 'dpadUp',     // D-pad Up
      button13: 'dpadDown',   // D-pad Down
      button14: 'dpadLeft',   // D-pad Left
      button15: 'dpadRight'   // D-pad Right
    };
    
    // Default axis mappings
    this.defaultAxisMapping = {
      axis0: 'moveX',         // Left stick X
      axis1: 'moveY',         // Left stick Y
      axis2: 'lookX',         // Right stick X
      axis3: 'lookY'          // Right stick Y
    };
    
    console.log("InputMapper initialized");
  }

  /**
   * Set button mapping for a controller
   */
  setButtonMapping(controllerId, button, action) {
    if (!this.buttonMappings.has(controllerId)) {
      this.buttonMappings.set(controllerId, {});
    }
    
    const mappings = this.buttonMappings.get(controllerId);
    mappings[button] = action;
    
    console.log(`Mapped ${button} to ${action} for controller ${controllerId}`);
  }

  /**
   * Set axis mapping for a controller
   */
  setAxisMapping(controllerId, axis, action) {
    if (!this.axisMappings.has(controllerId)) {
      this.axisMappings.set(controllerId, {});
    }
    
    const mappings = this.axisMappings.get(controllerId);
    mappings[axis] = action;
    
    console.log(`Mapped ${axis} to ${action} for controller ${controllerId}`);
  }

  /**
   * Get button mapping for a controller
   */
  getButtonMapping(controllerId) {
    if (!this.buttonMappings.has(controllerId)) {
      // Return default mapping
      return { ...this.defaultButtonMapping };
    }
    return { ...this.buttonMappings.get(controllerId) };
  }

  /**
   * Get axis mapping for a controller
   */
  getAxisMapping(controllerId) {
    if (!this.axisMappings.has(controllerId)) {
      // Return default mapping
      return { ...this.defaultAxisMapping };
    }
    return { ...this.axisMappings.get(controllerId) };
  }

  /**
   * Get complete mapping for a controller
   */
  getMapping(controllerId) {
    return {
      buttons: this.getButtonMapping(controllerId),
      axes: this.getAxisMapping(controllerId),
      deadzone: this.deadzone
    };
  }

  /**
   * Reset controller to default mappings
   */
  resetToDefaults(controllerId) {
    this.buttonMappings.set(controllerId, { ...this.defaultButtonMapping });
    this.axisMappings.set(controllerId, { ...this.defaultAxisMapping });
    console.log(`Reset controller ${controllerId} to default mappings`);
  }

  /**
   * Process controller input and return game actions
   */
  processControllerInput(controllerId, controllerState) {
    if (!controllerState) return null;
    
    const buttonMapping = this.getButtonMapping(controllerId);
    const axisMapping = this.getAxisMapping(controllerId);
    
    const actions = {
      buttons: {},
      movement: { x: 0, y: 0 },
      look: { x: 0, y: 0 },
      timestamp: Date.now()
    };

    // Process button inputs
    if (controllerState.buttons) {
      for (const [buttonKey, buttonState] of Object.entries(controllerState.buttons)) {
        const action = buttonMapping[buttonKey];
        if (action && buttonState.pressed) {
          actions.buttons[action] = {
            pressed: buttonState.pressed,
            value: buttonState.value,
            justPressed: buttonState.justPressed,
            justReleased: buttonState.justReleased
          };
        }
      }
    }

    // Process axis inputs
    if (controllerState.axes) {
      const moveX = this.getAxisValue(controllerState.axes, 'axis0');
      const moveY = this.getAxisValue(controllerState.axes, 'axis1');
      const lookX = this.getAxisValue(controllerState.axes, 'axis2');
      const lookY = this.getAxisValue(controllerState.axes, 'axis3');
      
      actions.movement = this.getMovementFromAnalog(moveX, moveY);
      actions.look = { x: lookX, y: lookY };
    }

    // Check D-pad for movement
    const dpadMovement = this.getMovementFromDPad(controllerState.buttons, buttonMapping);
    if (dpadMovement.x !== 0 || dpadMovement.y !== 0) {
      // D-pad overrides analog stick
      actions.movement = dpadMovement;
    }

    // Mark that controller input was used
    this.lastInputMethod = 'controller';
    
    return actions;
  }

  /**
   * Get axis value with deadzone applied
   */
  getAxisValue(axes, axisKey) {
    const axisState = axes[axisKey];
    if (!axisState) return 0;
    
    const value = axisState.value || 0;
    return Math.abs(value) > this.deadzone ? value : 0;
  }

  /**
   * Get movement vector from analog stick
   */
  getMovementFromAnalog(xAxis, yAxis) {
    // Apply deadzone
    const x = Math.abs(xAxis) > this.deadzone ? xAxis : 0;
    const y = Math.abs(yAxis) > this.deadzone ? yAxis : 0;
    
    // Normalize if magnitude > 1
    const magnitude = Math.sqrt(x * x + y * y);
    if (magnitude > 1) {
      return {
        x: x / magnitude,
        y: y / magnitude
      };
    }
    
    return { x, y };
  }

  /**
   * Get movement vector from D-pad
   */
  getMovementFromDPad(buttons, buttonMapping) {
    if (!buttons) return { x: 0, y: 0 };
    
    let x = 0;
    let y = 0;
    
    // Find D-pad buttons
    const dpadUp = Object.keys(buttonMapping).find(key => buttonMapping[key] === 'dpadUp');
    const dpadDown = Object.keys(buttonMapping).find(key => buttonMapping[key] === 'dpadDown');
    const dpadLeft = Object.keys(buttonMapping).find(key => buttonMapping[key] === 'dpadLeft');
    const dpadRight = Object.keys(buttonMapping).find(key => buttonMapping[key] === 'dpadRight');
    
    if (dpadUp && buttons[dpadUp]?.pressed) y -= 1;
    if (dpadDown && buttons[dpadDown]?.pressed) y += 1;
    if (dpadLeft && buttons[dpadLeft]?.pressed) x -= 1;
    if (dpadRight && buttons[dpadRight]?.pressed) x += 1;
    
    // Normalize diagonal movement
    if (x !== 0 && y !== 0) {
      const magnitude = Math.sqrt(2);
      x /= magnitude;
      y /= magnitude;
    }
    
    return { x, y };
  }

  /**
   * Set deadzone for analog sticks
   */
  setDeadzone(value) {
    this.deadzone = Math.max(0, Math.min(1, value));
    console.log(`Deadzone set to ${this.deadzone}`);
  }

  /**
   * Get current deadzone
   */
  getDeadzone() {
    return this.deadzone;
  }

  /**
   * Set input priority
   */
  setInputPriority(method) {
    if (['controller', 'keyboard', 'auto'].includes(method)) {
      this.inputPriority = method;
      console.log(`Input priority set to ${method}`);
    } else {
      console.warn(`Invalid input priority: ${method}`);
    }
  }

  /**
   * Check if controller input should be used
   */
  shouldUseControllerInput() {
    if (this.inputPriority === 'controller') return true;
    if (this.inputPriority === 'keyboard') return false;
    
    // Auto mode - use last input method
    return this.lastInputMethod === 'controller';
  }

  /**
   * Mark keyboard input as used
   */
  markKeyboardInput() {
    this.lastInputMethod = 'keyboard';
  }

  /**
   * Mark controller input as used
   */
  markControllerInput() {
    this.lastInputMethod = 'controller';
  }

  /**
   * Get last input method
   */
  getLastInputMethod() {
    return this.lastInputMethod;
  }

  /**
   * Get action name for button
   */
  getActionForButton(controllerId, buttonKey) {
    const mapping = this.getButtonMapping(controllerId);
    return mapping[buttonKey] || null;
  }

  /**
   * Get button for action
   */
  getButtonForAction(controllerId, action) {
    const mapping = this.getButtonMapping(controllerId);
    for (const [button, mappedAction] of Object.entries(mapping)) {
      if (mappedAction === action) {
        return button;
      }
    }
    return null;
  }

  /**
   * Check if action is pressed
   */
  isActionPressed(controllerId, action, controllerState) {
    const button = this.getButtonForAction(controllerId, action);
    if (!button || !controllerState?.buttons) return false;
    
    return controllerState.buttons[button]?.pressed || false;
  }

  /**
   * Check if action was just pressed
   */
  isActionJustPressed(controllerId, action, controllerState) {
    const button = this.getButtonForAction(controllerId, action);
    if (!button || !controllerState?.buttons) return false;
    
    return controllerState.buttons[button]?.justPressed || false;
  }

  /**
   * Export mappings for a controller
   */
  exportMappings(controllerId) {
    return {
      controllerId: controllerId,
      buttons: this.getButtonMapping(controllerId),
      axes: this.getAxisMapping(controllerId),
      deadzone: this.deadzone,
      exportedAt: Date.now()
    };
  }

  /**
   * Import mappings for a controller
   */
  importMappings(data) {
    if (!data.controllerId) {
      console.error('Invalid mapping data: missing controllerId');
      return false;
    }
    
    if (data.buttons) {
      this.buttonMappings.set(data.controllerId, { ...data.buttons });
    }
    
    if (data.axes) {
      this.axisMappings.set(data.controllerId, { ...data.axes });
    }
    
    if (data.deadzone !== undefined) {
      this.deadzone = data.deadzone;
    }
    
    console.log(`Imported mappings for controller ${data.controllerId}`);
    return true;
  }

  /**
   * Clear all mappings
   */
  clearAllMappings() {
    this.buttonMappings.clear();
    this.axisMappings.clear();
    console.log('Cleared all controller mappings');
  }

  /**
   * Get debug information
   */
  getDebugInfo() {
    return {
      deadzone: this.deadzone,
      inputPriority: this.inputPriority,
      lastInputMethod: this.lastInputMethod,
      controllerCount: this.buttonMappings.size,
      controllers: Array.from(this.buttonMappings.keys())
    };
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.InputMapper = InputMapper;
} else if (typeof global !== 'undefined') {
  global.InputMapper = InputMapper;
}

console.log("Input mapper loaded successfully");
