// Vibration Manager - Handles controller haptic feedback
// Vibration manager script loaded

/**
 * VibrationManager class - Manages controller vibration/haptic feedback
 */
class VibrationManager {
  constructor(controllerManager) {
    this.controllerManager = controllerManager;
    this.vibrationEnabled = true;
    this.activeVibrations = new Map();
    
    // Vibration patterns for different events
    this.patterns = {
      coinCollect: {
        duration: 100,
        weakMagnitude: 0.3,
        strongMagnitude: 0.1
      },
      enemyHit: {
        duration: 200,
        weakMagnitude: 0.5,
        strongMagnitude: 0.7
      },
      bombHit: {
        duration: 300,
        weakMagnitude: 0.8,
        strongMagnitude: 1.0
      },
      gameWin: {
        duration: 500,
        weakMagnitude: 0.6,
        strongMagnitude: 0.4
      },
      gameLose: {
        duration: 400,
        weakMagnitude: 0.7,
        strongMagnitude: 0.8
      },
      buttonPress: {
        duration: 50,
        weakMagnitude: 0.2,
        strongMagnitude: 0.0
      },
      menuNavigate: {
        duration: 30,
        weakMagnitude: 0.15,
        strongMagnitude: 0.0
      },
      error: {
        duration: 150,
        weakMagnitude: 0.4,
        strongMagnitude: 0.6
      }
    };
    
    // VibrationManager initialized
  }

  /**
   * Check if controller supports vibration
   */
  supportsVibration(controllerIndex) {
    if (!navigator.getGamepads) return false;
    
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[controllerIndex];
    
    if (!gamepad) return false;
    
    return gamepad.vibrationActuator && 
           typeof gamepad.vibrationActuator.playEffect === 'function';
  }

  /**
   * Vibrate controller with custom parameters
   */
  vibrate(controllerIndex, intensity = 0.5, duration = 100) {
    if (!this.vibrationEnabled) return false;
    if (!this.supportsVibration(controllerIndex)) return false;
    
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[controllerIndex];
    
    if (!gamepad || !gamepad.vibrationActuator) return false;
    
    try {
      // Clamp intensity between 0 and 1
      const clampedIntensity = Math.max(0, Math.min(1, intensity));
      
      gamepad.vibrationActuator.playEffect("dual-rumble", {
        startDelay: 0,
        duration: duration,
        weakMagnitude: clampedIntensity * 0.7,
        strongMagnitude: clampedIntensity * 0.5
      });
      
      // Track active vibration
      this.activeVibrations.set(controllerIndex, {
        startTime: Date.now(),
        duration: duration
      });
      
      // Auto-cleanup
      setTimeout(() => {
        this.activeVibrations.delete(controllerIndex);
      }, duration);
      
      return true;
    } catch (error) {
      console.error('Vibration error:', error);
      return false;
    }
  }

  /**
   * Vibrate with predefined pattern
   */
  vibratePattern(controllerIndex, patternName) {
    const pattern = this.patterns[patternName];
    if (!pattern) {
      console.warn(`Unknown vibration pattern: ${patternName}`);
      return false;
    }
    
    return this.vibrateCustom(controllerIndex, pattern);
  }

  /**
   * Vibrate with custom pattern
   */
  vibrateCustom(controllerIndex, pattern) {
    if (!this.vibrationEnabled) return false;
    if (!this.supportsVibration(controllerIndex)) return false;
    
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[controllerIndex];
    
    if (!gamepad || !gamepad.vibrationActuator) return false;
    
    try {
      gamepad.vibrationActuator.playEffect("dual-rumble", {
        startDelay: pattern.startDelay || 0,
        duration: pattern.duration || 100,
        weakMagnitude: pattern.weakMagnitude || 0.5,
        strongMagnitude: pattern.strongMagnitude || 0.5
      });
      
      // Track active vibration
      this.activeVibrations.set(controllerIndex, {
        startTime: Date.now(),
        duration: pattern.duration || 100
      });
      
      return true;
    } catch (error) {
      console.error('Vibration error:', error);
      return false;
    }
  }

  /**
   * Stop vibration for controller
   */
  stopVibration(controllerIndex) {
    if (!this.supportsVibration(controllerIndex)) return false;
    
    const gamepads = navigator.getGamepads();
    const gamepad = gamepads[controllerIndex];
    
    if (!gamepad || !gamepad.vibrationActuator) return false;
    
    try {
      gamepad.vibrationActuator.reset();
      this.activeVibrations.delete(controllerIndex);
      return true;
    } catch (error) {
      console.error('Error stopping vibration:', error);
      return false;
    }
  }

  /**
   * Stop all vibrations
   */
  stopAllVibrations() {
    const controllers = this.controllerManager.getAvailableControllers();
    
    controllers.forEach(controller => {
      this.stopVibration(controller.index);
    });
  }

  /**
   * Vibrate on coin collect
   */
  vibrateOnCoinCollect(controllerIndex) {
    return this.vibratePattern(controllerIndex, 'coinCollect');
  }

  /**
   * Vibrate on enemy hit
   */
  vibrateOnEnemyHit(controllerIndex) {
    return this.vibratePattern(controllerIndex, 'enemyHit');
  }

  /**
   * Vibrate on bomb hit
   */
  vibrateOnBombHit(controllerIndex) {
    return this.vibratePattern(controllerIndex, 'bombHit');
  }

  /**
   * Vibrate on game win
   */
  vibrateOnGameWin(controllerIndex) {
    return this.vibratePattern(controllerIndex, 'gameWin');
  }

  /**
   * Vibrate on game lose
   */
  vibrateOnGameLose(controllerIndex) {
    return this.vibratePattern(controllerIndex, 'gameLose');
  }

  /**
   * Vibrate on game end (win or lose)
   */
  vibrateOnGameEnd(controllerIndex, won = true) {
    if (won) {
      // Victory pattern - multiple short pulses
      this.vibrateSequence(controllerIndex, [
        { duration: 100, weakMagnitude: 0.5, strongMagnitude: 0.3 },
        { duration: 0, delay: 100 },
        { duration: 100, weakMagnitude: 0.5, strongMagnitude: 0.3 },
        { duration: 0, delay: 100 },
        { duration: 200, weakMagnitude: 0.7, strongMagnitude: 0.5 }
      ]);
    } else {
      // Defeat pattern - long declining pulse
      return this.vibratePattern(controllerIndex, 'gameLose');
    }
  }

  /**
   * Vibrate on button press
   */
  vibrateOnButtonPress(controllerIndex) {
    return this.vibratePattern(controllerIndex, 'buttonPress');
  }

  /**
   * Vibrate on menu navigation
   */
  vibrateOnMenuNavigate(controllerIndex) {
    return this.vibratePattern(controllerIndex, 'menuNavigate');
  }

  /**
   * Vibrate on error
   */
  vibrateOnError(controllerIndex) {
    return this.vibratePattern(controllerIndex, 'error');
  }

  /**
   * Vibrate sequence of patterns
   */
  async vibrateSequence(controllerIndex, sequence) {
    if (!this.vibrationEnabled) return false;
    if (!this.supportsVibration(controllerIndex)) return false;
    
    for (const pattern of sequence) {
      if (pattern.delay) {
        await new Promise(resolve => setTimeout(resolve, pattern.delay));
      } else {
        await this.vibrateCustom(controllerIndex, pattern);
        await new Promise(resolve => setTimeout(resolve, pattern.duration || 100));
      }
    }
    
    return true;
  }

  /**
   * Create custom vibration pattern
   */
  createPattern(name, pattern) {
    this.patterns[name] = pattern;
  }

  /**
   * Get vibration pattern
   */
  getPattern(name) {
    return this.patterns[name] || null;
  }

  /**
   * Enable vibration
   */
  enable() {
    this.vibrationEnabled = true;
    // Vibration enabled
  }

  /**
   * Disable vibration
   */
  disable() {
    this.vibrationEnabled = false;
    this.stopAllVibrations();
  }

  /**
   * Toggle vibration
   */
  toggle() {
    this.vibrationEnabled = !this.vibrationEnabled;
    
    if (!this.vibrationEnabled) {
      this.stopAllVibrations();
    }
    
    return this.vibrationEnabled;
  }

  /**
   * Check if vibration is enabled
   */
  isEnabled() {
    return this.vibrationEnabled;
  }

  /**
   * Check if controller is currently vibrating
   */
  isVibrating(controllerIndex) {
    const vibration = this.activeVibrations.get(controllerIndex);
    if (!vibration) return false;
    
    const elapsed = Date.now() - vibration.startTime;
    return elapsed < vibration.duration;
  }

  /**
   * Get all controllers that support vibration
   */
  getVibrationCapableControllers() {
    const controllers = this.controllerManager.getAvailableControllers();
    return controllers.filter(controller => this.supportsVibration(controller.index));
  }

  /**
   * Test vibration for controller
   */
  testVibration(controllerIndex, duration = 500) {
    if (!this.supportsVibration(controllerIndex)) {
      return false;
    }
    
    // Test pattern - increasing intensity
    this.vibrateSequence(controllerIndex, [
      { duration: 100, weakMagnitude: 0.2, strongMagnitude: 0.1 },
      { delay: 50 },
      { duration: 100, weakMagnitude: 0.4, strongMagnitude: 0.2 },
      { delay: 50 },
      { duration: 100, weakMagnitude: 0.6, strongMagnitude: 0.4 },
      { delay: 50 },
      { duration: 100, weakMagnitude: 0.8, strongMagnitude: 0.6 }
    ]);
    
    return true;
  }

  /**
   * Get debug information
   */
  getDebugInfo() {
    const controllers = this.controllerManager.getAvailableControllers();
    const vibrationSupport = {};
    
    controllers.forEach(controller => {
      vibrationSupport[controller.index] = this.supportsVibration(controller.index);
    });
    
    return {
      vibrationEnabled: this.vibrationEnabled,
      activeVibrations: Array.from(this.activeVibrations.keys()),
      vibrationSupport: vibrationSupport,
      patternCount: Object.keys(this.patterns).length,
      patterns: Object.keys(this.patterns)
    };
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.VibrationManager = VibrationManager;
}

// Vibration manager loaded
