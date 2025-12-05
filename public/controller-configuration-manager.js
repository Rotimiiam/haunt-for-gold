// Controller Configuration Manager - Handles saving/loading controller settings
console.log("Controller configuration manager script loaded");

/**
 * ConfigurationManager class - Manages controller configurations and persistence
 */
class ConfigurationManager {
  constructor() {
    this.storagePrefix = 'controller_config_';
    this.globalSettingsKey = 'controller_global_settings';
    
    // Controller type detection patterns
    this.controllerTypes = {
      xbox: /xbox|xinput/i,
      playstation: /playstation|dualshock|dualsense|ps[345]/i,
      nintendo: /nintendo|switch|pro controller/i,
      generic: /.*/
    };
    
    // Default mappings for different controller types
    this.defaultMappings = {
      xbox: {
        buttons: {
          button0: 'action',      // A
          button1: 'cancel',      // B
          button2: 'special',     // X
          button3: 'dash',        // Y
          button4: 'leftBumper',  // LB
          button5: 'rightBumper', // RB
          button6: 'leftTrigger', // LT
          button7: 'rightTrigger',// RT
          button8: 'select',      // Back
          button9: 'start',       // Start
          button10: 'leftStick',  // LS
          button11: 'rightStick', // RS
          button12: 'dpadUp',
          button13: 'dpadDown',
          button14: 'dpadLeft',
          button15: 'dpadRight'
        },
        axes: {
          axis0: 'moveX',
          axis1: 'moveY',
          axis2: 'lookX',
          axis3: 'lookY'
        },
        deadzone: 0.15,
        vibrationEnabled: true
      },
      playstation: {
        buttons: {
          button0: 'action',      // X
          button1: 'cancel',      // Circle
          button2: 'special',     // Square
          button3: 'dash',        // Triangle
          button4: 'leftBumper',  // L1
          button5: 'rightBumper', // R1
          button6: 'leftTrigger', // L2
          button7: 'rightTrigger',// R2
          button8: 'select',      // Share
          button9: 'start',       // Options
          button10: 'leftStick',  // L3
          button11: 'rightStick', // R3
          button12: 'dpadUp',
          button13: 'dpadDown',
          button14: 'dpadLeft',
          button15: 'dpadRight'
        },
        axes: {
          axis0: 'moveX',
          axis1: 'moveY',
          axis2: 'lookX',
          axis3: 'lookY'
        },
        deadzone: 0.15,
        vibrationEnabled: true
      },
      nintendo: {
        buttons: {
          button0: 'cancel',      // B
          button1: 'action',      // A
          button2: 'dash',        // Y
          button3: 'special',     // X
          button4: 'leftBumper',  // L
          button5: 'rightBumper', // R
          button6: 'leftTrigger', // ZL
          button7: 'rightTrigger',// ZR
          button8: 'select',      // Minus
          button9: 'start',       // Plus
          button10: 'leftStick',  // LS
          button11: 'rightStick', // RS
          button12: 'dpadUp',
          button13: 'dpadDown',
          button14: 'dpadLeft',
          button15: 'dpadRight'
        },
        axes: {
          axis0: 'moveX',
          axis1: 'moveY',
          axis2: 'lookX',
          axis3: 'lookY'
        },
        deadzone: 0.15,
        vibrationEnabled: true
      },
      generic: {
        buttons: {
          button0: 'action',
          button1: 'cancel',
          button2: 'special',
          button3: 'dash',
          button12: 'dpadUp',
          button13: 'dpadDown',
          button14: 'dpadLeft',
          button15: 'dpadRight'
        },
        axes: {
          axis0: 'moveX',
          axis1: 'moveY'
        },
        deadzone: 0.2,
        vibrationEnabled: false
      }
    };
    
    console.log("ConfigurationManager initialized");
  }

  /**
   * Detect controller type from gamepad ID
   */
  detectControllerType(gamepad) {
    const id = gamepad.id.toLowerCase();
    
    for (const [type, pattern] of Object.entries(this.controllerTypes)) {
      if (type === 'generic') continue; // Check generic last
      if (pattern.test(id)) {
        console.log(`Detected controller type: ${type} (${gamepad.id})`);
        return type;
      }
    }
    
    console.log(`Using generic controller type for: ${gamepad.id}`);
    return 'generic';
  }

  /**
   * Get default mapping for controller type
   */
  getDefaultMapping(controllerType) {
    const mapping = this.defaultMappings[controllerType] || this.defaultMappings.generic;
    return JSON.parse(JSON.stringify(mapping)); // Deep clone
  }

  /**
   * Get default mapping for a gamepad
   */
  getDefaultMappingForGamepad(gamepad) {
    const type = this.detectControllerType(gamepad);
    return this.getDefaultMapping(type);
  }

  /**
   * Generate storage key for controller
   */
  getStorageKey(controllerId) {
    // Sanitize controller ID for use as storage key
    const sanitized = controllerId.replace(/[^a-zA-Z0-9]/g, '_');
    return `${this.storagePrefix}${sanitized}`;
  }

  /**
   * Save configuration for a controller
   */
  saveConfiguration(controllerId, config) {
    try {
      const key = this.getStorageKey(controllerId);
      const data = {
        controllerId: controllerId,
        buttonMappings: config.buttonMappings || config.buttons || {},
        axisMappings: config.axisMappings || config.axes || {},
        deadzone: config.deadzone !== undefined ? config.deadzone : 0.15,
        vibrationEnabled: config.vibrationEnabled !== undefined ? config.vibrationEnabled : true,
        lastModified: Date.now()
      };
      
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`Saved configuration for controller: ${controllerId}`);
      return true;
    } catch (error) {
      console.error('Error saving controller configuration:', error);
      return false;
    }
  }

  /**
   * Load configuration for a controller
   */
  loadConfiguration(controllerId) {
    try {
      const key = this.getStorageKey(controllerId);
      const data = localStorage.getItem(key);
      
      if (!data) {
        console.log(`No saved configuration for controller: ${controllerId}`);
        return null;
      }
      
      const config = JSON.parse(data);
      console.log(`Loaded configuration for controller: ${controllerId}`);
      return config;
    } catch (error) {
      console.error('Error loading controller configuration:', error);
      return null;
    }
  }

  /**
   * Delete configuration for a controller
   */
  deleteConfiguration(controllerId) {
    try {
      const key = this.getStorageKey(controllerId);
      localStorage.removeItem(key);
      console.log(`Deleted configuration for controller: ${controllerId}`);
      return true;
    } catch (error) {
      console.error('Error deleting controller configuration:', error);
      return false;
    }
  }

  /**
   * Get all saved configurations
   */
  getAllConfigurations() {
    const configs = [];
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storagePrefix)) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const config = JSON.parse(data);
              configs.push(config);
            } catch (e) {
              console.warn(`Failed to parse config for key: ${key}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error getting all configurations:', error);
    }
    
    return configs;
  }

  /**
   * Export configuration as JSON
   */
  exportConfiguration(controllerId) {
    const config = this.loadConfiguration(controllerId);
    if (!config) {
      return null;
    }
    
    return {
      version: '1.0',
      exportedAt: Date.now(),
      configuration: config
    };
  }

  /**
   * Import configuration from JSON
   */
  importConfiguration(data) {
    try {
      if (!data || !data.configuration) {
        console.error('Invalid configuration data');
        return false;
      }
      
      const config = data.configuration;
      if (!config.controllerId) {
        console.error('Configuration missing controllerId');
        return false;
      }
      
      return this.saveConfiguration(config.controllerId, config);
    } catch (error) {
      console.error('Error importing configuration:', error);
      return false;
    }
  }

  /**
   * Get or create configuration for a controller
   */
  getOrCreateConfiguration(gamepad) {
    // Try to load existing configuration
    let config = this.loadConfiguration(gamepad.id);
    
    if (!config) {
      // Create new configuration with defaults
      const defaultMapping = this.getDefaultMappingForGamepad(gamepad);
      config = {
        controllerId: gamepad.id,
        buttonMappings: defaultMapping.buttons,
        axisMappings: defaultMapping.axes,
        deadzone: defaultMapping.deadzone,
        vibrationEnabled: defaultMapping.vibrationEnabled,
        lastModified: Date.now()
      };
      
      // Save the new configuration
      this.saveConfiguration(gamepad.id, config);
    }
    
    return config;
  }

  /**
   * Update specific settings in a configuration
   */
  updateConfiguration(controllerId, updates) {
    const config = this.loadConfiguration(controllerId);
    if (!config) {
      console.error(`No configuration found for controller: ${controllerId}`);
      return false;
    }
    
    // Merge updates
    const updatedConfig = {
      ...config,
      ...updates,
      lastModified: Date.now()
    };
    
    return this.saveConfiguration(controllerId, updatedConfig);
  }

  /**
   * Reset configuration to defaults
   */
  resetToDefaults(gamepad) {
    const defaultMapping = this.getDefaultMappingForGamepad(gamepad);
    const config = {
      controllerId: gamepad.id,
      buttonMappings: defaultMapping.buttons,
      axisMappings: defaultMapping.axes,
      deadzone: defaultMapping.deadzone,
      vibrationEnabled: defaultMapping.vibrationEnabled,
      lastModified: Date.now()
    };
    
    return this.saveConfiguration(gamepad.id, config);
  }

  /**
   * Save global settings (not controller-specific)
   */
  saveGlobalSettings(settings) {
    try {
      const data = {
        ...settings,
        lastModified: Date.now()
      };
      
      localStorage.setItem(this.globalSettingsKey, JSON.stringify(data));
      console.log('Saved global controller settings');
      return true;
    } catch (error) {
      console.error('Error saving global settings:', error);
      return false;
    }
  }

  /**
   * Load global settings
   */
  loadGlobalSettings() {
    try {
      const data = localStorage.getItem(this.globalSettingsKey);
      if (!data) {
        return this.getDefaultGlobalSettings();
      }
      
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading global settings:', error);
      return this.getDefaultGlobalSettings();
    }
  }

  /**
   * Get default global settings
   */
  getDefaultGlobalSettings() {
    return {
      vibrationEnabled: true,
      navigationEnabled: true,
      autoDetect: true,
      inputPriority: 'auto' // 'controller' | 'keyboard' | 'auto'
    };
  }

  /**
   * Clear all controller configurations
   */
  clearAllConfigurations() {
    try {
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storagePrefix)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log(`Cleared ${keysToRemove.length} controller configurations`);
      return true;
    } catch (error) {
      console.error('Error clearing configurations:', error);
      return false;
    }
  }

  /**
   * Get configuration summary
   */
  getConfigurationSummary(controllerId) {
    const config = this.loadConfiguration(controllerId);
    if (!config) {
      return null;
    }
    
    return {
      controllerId: config.controllerId,
      buttonCount: Object.keys(config.buttonMappings || {}).length,
      axisCount: Object.keys(config.axisMappings || {}).length,
      deadzone: config.deadzone,
      vibrationEnabled: config.vibrationEnabled,
      lastModified: config.lastModified,
      lastModifiedDate: new Date(config.lastModified).toLocaleString()
    };
  }

  /**
   * Validate configuration
   */
  validateConfiguration(config) {
    if (!config) {
      return { valid: false, errors: ['Configuration is null or undefined'] };
    }
    
    const errors = [];
    
    if (!config.controllerId) {
      errors.push('Missing controllerId');
    }
    
    if (!config.buttonMappings || typeof config.buttonMappings !== 'object') {
      errors.push('Invalid or missing buttonMappings');
    }
    
    if (!config.axisMappings || typeof config.axisMappings !== 'object') {
      errors.push('Invalid or missing axisMappings');
    }
    
    if (config.deadzone !== undefined) {
      if (typeof config.deadzone !== 'number' || config.deadzone < 0 || config.deadzone > 1) {
        errors.push('Deadzone must be a number between 0 and 1');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Get debug information
   */
  getDebugInfo() {
    const configs = this.getAllConfigurations();
    const globalSettings = this.loadGlobalSettings();
    
    return {
      configurationCount: configs.length,
      configurations: configs.map(c => this.getConfigurationSummary(c.controllerId)),
      globalSettings: globalSettings,
      storageUsed: this.getStorageUsage()
    };
  }

  /**
   * Get storage usage for controller configurations
   */
  getStorageUsage() {
    let totalSize = 0;
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.storagePrefix)) {
          const value = localStorage.getItem(key);
          if (value) {
            totalSize += key.length + value.length;
          }
        }
      }
    } catch (error) {
      console.error('Error calculating storage usage:', error);
    }
    
    return {
      bytes: totalSize,
      kilobytes: (totalSize / 1024).toFixed(2),
      megabytes: (totalSize / 1024 / 1024).toFixed(4)
    };
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.ConfigurationManager = ConfigurationManager;
} else if (typeof global !== 'undefined') {
  global.ConfigurationManager = ConfigurationManager;
}

console.log("Controller configuration manager loaded successfully");
