// Controller UI Adapter - Updates UI based on controller state
console.log("Controller UI adapter script loaded");

/**
 * ControllerUIAdapter class - Adapts UI for controller input
 */
class ControllerUIAdapter {
  constructor(controllerManager) {
    this.controllerManager = controllerManager;
    this.activeInputMethod = 'keyboard';
    this.controllerIcons = new Map();
    
    // Button icon mappings
    this.buttonIcons = {
      xbox: {
        action: 'Ⓐ',
        cancel: 'Ⓑ',
        special: 'Ⓧ',
        dash: 'Ⓨ',
        start: '☰',
        select: '⧉',
        dpadUp: '↑',
        dpadDown: '↓',
        dpadLeft: '←',
        dpadRight: '→'
      },
      playstation: {
        action: '✕',
        cancel: '○',
        special: '□',
        dash: '△',
        start: 'OPTIONS',
        select: 'SHARE',
        dpadUp: '↑',
        dpadDown: '↓',
        dpadLeft: '←',
        dpadRight: '→'
      },
      generic: {
        action: '[A]',
        cancel: '[B]',
        special: '[X]',
        dash: '[Y]',
        start: '[START]',
        select: '[SELECT]',
        dpadUp: '↑',
        dpadDown: '↓',
        dpadLeft: '←',
        dpadRight: '→'
      }
    };
    
    this.init();
    console.log("ControllerUIAdapter initialized");
  }

  /**
   * Initialize UI adapter
   */
  init() {
    // Listen for controller connections
    this.controllerManager.onControllerConnect((controller) => {
      this.showControllerIcon(controller.index);
      this.updateButtonPrompts('controller');
    });
    
    this.controllerManager.onControllerDisconnect((controller) => {
      this.hideControllerIcon(controller.index);
      if (this.controllerManager.getControllerCount() === 0) {
        this.updateButtonPrompts('keyboard');
      }
    });
    
    // Create controller status container
    this.createStatusContainer();
  }

  /**
   * Create controller status container
   */
  createStatusContainer() {
    if (document.getElementById('controllerStatusContainer')) return;
    
    const container = document.createElement('div');
    container.id = 'controllerStatusContainer';
    container.style.cssText = `
      position: fixed;
      top: 60px;
      right: 10px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    
    document.body.appendChild(container);
  }

  /**
   * Show controller icon
   */
  showControllerIcon(controllerIndex) {
    const container = document.getElementById('controllerStatusContainer');
    if (!container) return;
    
    // Check if icon already exists
    if (this.controllerIcons.has(controllerIndex)) return;
    
    const controller = this.controllerManager.connectedControllers.get(controllerIndex);
    if (!controller) return;
    
    const icon = document.createElement('div');
    icon.id = `controllerIcon${controllerIndex}`;
    icon.className = 'controller-status-icon';
    icon.innerHTML = `
      <div class="controller-icon-content">
        <span class="controller-emoji">🎮</span>
        <span class="controller-number">${controllerIndex + 1}</span>
        <span class="battery-indicator" id="battery${controllerIndex}">🔋</span>
      </div>
    `;
    
    icon.style.cssText = `
      background: rgba(0, 255, 65, 0.2);
      border: 2px solid var(--ghost-green, #00ff41);
      border-radius: 10px;
      padding: 8px 12px;
      color: var(--ghost-green, #00ff41);
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 0 15px rgba(0, 255, 65, 0.3);
      animation: slideIn 0.3s ease;
    `;
    
    container.appendChild(icon);
    this.controllerIcons.set(controllerIndex, icon);
    
    // Add styles if not already added
    this.addStyles();
    
    console.log(`Showing controller icon for controller ${controllerIndex}`);
  }

  /**
   * Hide controller icon
   */
  hideControllerIcon(controllerIndex) {
    const icon = this.controllerIcons.get(controllerIndex);
    if (icon) {
      icon.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        icon.remove();
        this.controllerIcons.delete(controllerIndex);
      }, 300);
      
      console.log(`Hiding controller icon for controller ${controllerIndex}`);
    }
  }

  /**
   * Update battery status for controller
   */
  updateBatteryStatus(controllerIndex, level) {
    const batteryIndicator = document.getElementById(`battery${controllerIndex}`);
    if (!batteryIndicator) return;
    
    // Update battery icon based on level
    if (level > 0.75) {
      batteryIndicator.textContent = '🔋';
      batteryIndicator.style.color = 'var(--ghost-green, #00ff41)';
    } else if (level > 0.5) {
      batteryIndicator.textContent = '🔋';
      batteryIndicator.style.color = '#ffff00';
    } else if (level > 0.25) {
      batteryIndicator.textContent = '🪫';
      batteryIndicator.style.color = '#ff9900';
    } else {
      batteryIndicator.textContent = '🪫';
      batteryIndicator.style.color = '#ff0000';
      this.showLowBatteryWarning(controllerIndex);
    }
  }

  /**
   * Show low battery warning
   */
  showLowBatteryWarning(controllerIndex) {
    // Check if warning already shown recently
    const warningKey = `battery_warning_${controllerIndex}`;
    const lastWarning = sessionStorage.getItem(warningKey);
    const now = Date.now();
    
    if (lastWarning && (now - parseInt(lastWarning)) < 60000) {
      return; // Don't show warning more than once per minute
    }
    
    sessionStorage.setItem(warningKey, now.toString());
    
    // Show warning notification
    const warning = document.createElement('div');
    warning.className = 'battery-warning';
    warning.innerHTML = `
      <div class="warning-content">
        <span style="font-size: 2rem;">⚠️</span>
        <p>Controller ${controllerIndex + 1} battery low!</p>
      </div>
    `;
    
    warning.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 0, 0, 0.9);
      color: white;
      padding: 20px 30px;
      border-radius: 10px;
      border: 3px solid #ff0000;
      z-index: 10001;
      animation: pulse 0.5s ease;
      box-shadow: 0 0 30px rgba(255, 0, 0, 0.5);
    `;
    
    document.body.appendChild(warning);
    
    setTimeout(() => {
      warning.style.animation = 'fadeOut 0.5s ease';
      setTimeout(() => warning.remove(), 500);
    }, 3000);
  }

  /**
   * Update button prompts based on input method
   */
  updateButtonPrompts(inputMethod) {
    this.activeInputMethod = inputMethod;
    
    // Find all elements with button prompts
    const prompts = document.querySelectorAll('[data-action]');
    
    prompts.forEach(prompt => {
      const action = prompt.dataset.action;
      const icon = this.getButtonIcon(action, inputMethod);
      
      if (icon) {
        prompt.textContent = icon;
      }
    });
    
    console.log(`Updated button prompts for ${inputMethod}`);
  }

  /**
   * Get button icon for action and input method
   */
  getButtonIcon(action, inputMethod) {
    if (inputMethod === 'keyboard') {
      // Return keyboard key
      const keyboardMap = {
        action: 'SPACE',
        cancel: 'ESC',
        special: 'E',
        dash: 'SHIFT',
        start: 'ESC',
        select: 'TAB',
        dpadUp: '↑',
        dpadDown: '↓',
        dpadLeft: '←',
        dpadRight: '→'
      };
      return keyboardMap[action] || action.toUpperCase();
    } else {
      // Detect controller type
      const controllers = this.controllerManager.getAvailableControllers();
      if (controllers.length === 0) return null;
      
      const controllerId = controllers[0].id.toLowerCase();
      let controllerType = 'generic';
      
      if (controllerId.includes('xbox') || controllerId.includes('xinput')) {
        controllerType = 'xbox';
      } else if (controllerId.includes('playstation') || controllerId.includes('dualshock')) {
        controllerType = 'playstation';
      }
      
      return this.buttonIcons[controllerType][action] || this.buttonIcons.generic[action];
    }
  }

  /**
   * Show input feedback animation
   */
  showInputFeedback(action, position = null) {
    const feedback = document.createElement('div');
    feedback.className = 'input-feedback';
    feedback.textContent = this.getButtonIcon(action, this.activeInputMethod);
    
    // Position feedback
    if (position) {
      feedback.style.left = `${position.x}px`;
      feedback.style.top = `${position.y}px`;
    } else {
      feedback.style.left = '50%';
      feedback.style.top = '50%';
      feedback.style.transform = 'translate(-50%, -50%)';
    }
    
    feedback.style.cssText += `
      position: fixed;
      color: var(--ghost-green, #00ff41);
      font-size: 2rem;
      font-weight: bold;
      pointer-events: none;
      z-index: 10000;
      animation: feedbackPop 0.5s ease;
      text-shadow: 0 0 10px rgba(0, 255, 65, 0.8);
    `;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => feedback.remove(), 500);
  }

  /**
   * Highlight active controller
   */
  highlightActiveController(controllerIndex) {
    // Remove highlight from all controllers
    this.controllerIcons.forEach((icon, index) => {
      icon.style.borderColor = 'var(--ghost-green, #00ff41)';
      icon.style.boxShadow = '0 0 15px rgba(0, 255, 65, 0.3)';
    });
    
    // Highlight active controller
    const icon = this.controllerIcons.get(controllerIndex);
    if (icon) {
      icon.style.borderColor = 'var(--cursed-gold, #ffd700)';
      icon.style.boxShadow = '0 0 25px rgba(255, 215, 0, 0.6)';
      icon.style.animation = 'pulse 1s ease infinite';
    }
  }

  /**
   * Show controller disconnected notification
   */
  showDisconnectedNotification(controllerIndex) {
    const notification = document.createElement('div');
    notification.className = 'controller-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span style="font-size: 2rem;">⚠️</span>
        <h3>Controller Disconnected</h3>
        <p>Controller ${controllerIndex + 1} has been disconnected</p>
        <p style="font-size: 0.9rem; opacity: 0.8;">Please reconnect to continue</p>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(26, 10, 46, 0.95);
      border: 3px solid var(--blood-red, #ff0000);
      border-radius: 15px;
      padding: 30px;
      z-index: 10001;
      text-align: center;
      color: var(--bone-white, #f0f0f0);
      box-shadow: 0 0 30px rgba(255, 0, 0, 0.5);
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  /**
   * Show controller connected notification
   */
  showConnectedNotification(controllerIndex, controllerName) {
    const notification = document.createElement('div');
    notification.className = 'controller-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <span style="font-size: 2rem;">🎮</span>
        <h3>Controller Connected</h3>
        <p>${controllerName}</p>
        <p style="font-size: 0.9rem; opacity: 0.8;">Controller ${controllerIndex + 1} ready</p>
      </div>
    `;
    
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(26, 10, 46, 0.95);
      border: 3px solid var(--ghost-green, #00ff41);
      border-radius: 15px;
      padding: 30px;
      z-index: 10001;
      text-align: center;
      color: var(--bone-white, #f0f0f0);
      box-shadow: 0 0 30px rgba(0, 255, 65, 0.5);
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  /**
   * Add CSS styles
   */
  addStyles() {
    if (document.getElementById('controllerUIAdapterStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'controllerUIAdapterStyles';
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(100px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes slideOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(100px);
        }
      }
      
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.7;
          transform: scale(1.05);
        }
      }
      
      @keyframes feedbackPop {
        0% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.5);
        }
        50% {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1.2);
        }
        100% {
          opacity: 0;
          transform: translate(-50%, -50%) scale(1);
        }
      }
      
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
      
      .controller-icon-content {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .controller-emoji {
        font-size: 1.2rem;
      }
      
      .controller-number {
        font-weight: bold;
      }
      
      .battery-indicator {
        font-size: 1rem;
      }
      
      .notification-content h3 {
        margin: 10px 0;
        color: var(--ghost-green, #00ff41);
      }
      
      .notification-content p {
        margin: 5px 0;
      }
      
      .warning-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
      }
      
      .warning-content p {
        margin: 0;
        font-size: 1.2rem;
        font-weight: bold;
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Clean up
   */
  destroy() {
    this.controllerIcons.forEach(icon => icon.remove());
    this.controllerIcons.clear();
    
    const container = document.getElementById('controllerStatusContainer');
    if (container) container.remove();
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.ControllerUIAdapter = ControllerUIAdapter;
}

console.log("Controller UI adapter loaded successfully");
