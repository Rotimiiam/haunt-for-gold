// Controller Settings UI - Button remapping interface
// Controller settings UI script loaded

/**
 * ControllerSettingsUI class - Provides UI for button remapping and testing
 */
class ControllerSettingsUI {
  constructor(controllerManager, inputMapper, configManager) {
    this.controllerManager = controllerManager;
    this.inputMapper = inputMapper;
    this.configManager = configManager;
    
    this.currentController = null;
    this.isRemapping = false;
    this.remappingButton = null;
    this.testMode = false;
    
    this.actionNames = {
      action: 'Primary Action',
      cancel: 'Cancel/Back',
      special: 'Special Ability',
      dash: 'Dash/Sprint',
      leftBumper: 'Left Bumper',
      rightBumper: 'Right Bumper',
      leftTrigger: 'Left Trigger',
      rightTrigger: 'Right Trigger',
      select: 'Select/Share',
      start: 'Start/Pause',
      leftStick: 'Left Stick Click',
      rightStick: 'Right Stick Click',
      dpadUp: 'D-Pad Up',
      dpadDown: 'D-Pad Down',
      dpadLeft: 'D-Pad Left',
      dpadRight: 'D-Pad Right'
    };
    
    console.log("ControllerSettingsUI initialized");
  }

  /**
   * Show controller settings modal
   */
  show(controllerIndex) {
    const controller = this.controllerManager.connectedControllers.get(controllerIndex);
    if (!controller) {
      console.error('Controller not found:', controllerIndex);
      return;
    }
    
    this.currentController = controller;
    this.createSettingsModal();
    this.updateSettingsDisplay();
  }

  /**
   * Create settings modal HTML
   */
  createSettingsModal() {
    // Remove existing modal if present
    const existing = document.getElementById('controllerSettingsModal');
    if (existing) {
      existing.remove();
    }
    
    const modal = document.createElement('div');
    modal.id = 'controllerSettingsModal';
    modal.className = 'controller-settings-modal';
    modal.innerHTML = `
      <div class="settings-content haunted-panel">
        <div class="settings-header">
          <h2 class="spooky-title">🎮 Controller Settings</h2>
          <button class="close-btn" onclick="window.controllerSettingsUI.hide()">✕</button>
        </div>
        
        <div class="controller-info">
          <p><strong>Controller:</strong> <span id="controllerName"></span></p>
          <p><strong>Type:</strong> <span id="controllerType"></span></p>
        </div>
        
        <div class="settings-tabs">
          <button class="tab-btn active" data-tab="mappings">Button Mappings</button>
          <button class="tab-btn" data-tab="advanced">Advanced</button>
          <button class="tab-btn" data-tab="test">Test</button>
        </div>
        
        <div class="settings-body">
          <!-- Button Mappings Tab -->
          <div class="tab-content active" id="mappingsTab">
            <div class="mappings-list" id="mappingsList"></div>
            <div class="mapping-actions">
              <button class="spooky-btn" onclick="window.controllerSettingsUI.resetToDefaults()">
                🔄 Reset to Defaults
              </button>
            </div>
          </div>
          
          <!-- Advanced Tab -->
          <div class="tab-content" id="advancedTab">
            <div class="setting-item">
              <label for="deadzoneSlider">Analog Stick Deadzone:</label>
              <input type="range" id="deadzoneSlider" min="0" max="50" value="15" step="1">
              <span id="deadzoneValue">0.15</span>
            </div>
            
            <div class="setting-item">
              <label for="vibrationToggle">
                <input type="checkbox" id="vibrationToggle" checked>
                Enable Vibration
              </label>
            </div>
            
            <div class="setting-actions">
              <button class="spooky-btn" onclick="window.controllerSettingsUI.exportConfig()">
                💾 Export Config
              </button>
              <button class="spooky-btn" onclick="window.controllerSettingsUI.importConfig()">
                📂 Import Config
              </button>
            </div>
          </div>
          
          <!-- Test Tab -->
          <div class="tab-content" id="testTab">
            <div class="test-instructions">
              <p>Press any button or move any stick to test your controller</p>
            </div>
            <div class="test-display">
              <div class="test-buttons" id="testButtons"></div>
              <div class="test-axes" id="testAxes"></div>
            </div>
            <div class="test-actions">
              <button class="spooky-btn" id="testModeBtn" onclick="window.controllerSettingsUI.toggleTestMode()">
                ▶️ Start Test
              </button>
            </div>
          </div>
        </div>
        
        <div class="settings-footer">
          <button class="spooky-btn orange" onclick="window.controllerSettingsUI.saveAndClose()">
            ✓ Save & Close
          </button>
          <button class="spooky-btn" onclick="window.controllerSettingsUI.hide()">
            Cancel
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add tab switching
    modal.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });
    
    // Add deadzone slider handler
    const deadzoneSlider = modal.querySelector('#deadzoneSlider');
    deadzoneSlider.addEventListener('input', (e) => {
      const value = e.target.value / 100;
      modal.querySelector('#deadzoneValue').textContent = value.toFixed(2);
    });
    
    // Add styles
    this.addStyles();
  }

  /**
   * Add CSS styles for settings modal
   */
  addStyles() {
    if (document.getElementById('controllerSettingsStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'controllerSettingsStyles';
    style.textContent = `
      .controller-settings-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s ease;
      }
      
      .settings-content {
        background: var(--midnight-purple, #1a0a2e);
        border: 3px solid var(--ghost-green, #00ff41);
        border-radius: 15px;
        padding: 30px;
        max-width: 700px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 0 30px rgba(0, 255, 65, 0.3);
      }
      
      .settings-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        border-bottom: 2px solid var(--ghost-green, #00ff41);
        padding-bottom: 15px;
      }
      
      .settings-header h2 {
        margin: 0;
        color: var(--ghost-green, #00ff41);
        font-size: 1.8rem;
      }
      
      .close-btn {
        background: none;
        border: none;
        color: var(--blood-red, #ff0000);
        font-size: 2rem;
        cursor: pointer;
        padding: 0;
        width: 40px;
        height: 40px;
        line-height: 1;
      }
      
      .close-btn:hover {
        color: #ff4444;
        transform: scale(1.1);
      }
      
      .controller-info {
        background: rgba(0, 255, 65, 0.1);
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 20px;
        color: var(--bone-white, #f0f0f0);
      }
      
      .controller-info p {
        margin: 5px 0;
      }
      
      .settings-tabs {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
        border-bottom: 2px solid var(--ghost-green, #00ff41);
      }
      
      .tab-btn {
        background: none;
        border: none;
        color: var(--bone-white, #f0f0f0);
        padding: 10px 20px;
        cursor: pointer;
        font-size: 1rem;
        border-bottom: 3px solid transparent;
        transition: all 0.3s ease;
      }
      
      .tab-btn:hover {
        color: var(--ghost-green, #00ff41);
      }
      
      .tab-btn.active {
        color: var(--ghost-green, #00ff41);
        border-bottom-color: var(--ghost-green, #00ff41);
      }
      
      .tab-content {
        display: none;
        min-height: 300px;
      }
      
      .tab-content.active {
        display: block;
      }
      
      .mappings-list {
        display: grid;
        gap: 10px;
        margin-bottom: 20px;
      }
      
      .mapping-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: rgba(0, 255, 65, 0.05);
        padding: 12px;
        border-radius: 8px;
        border: 1px solid rgba(0, 255, 65, 0.2);
      }
      
      .mapping-item:hover {
        background: rgba(0, 255, 65, 0.1);
        border-color: var(--ghost-green, #00ff41);
      }
      
      .mapping-label {
        color: var(--bone-white, #f0f0f0);
        font-weight: bold;
      }
      
      .mapping-value {
        color: var(--cursed-gold, #ffd700);
      }
      
      .remap-btn {
        background: var(--ghost-green, #00ff41);
        color: var(--midnight-purple, #1a0a2e);
        border: none;
        padding: 6px 15px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s ease;
      }
      
      .remap-btn:hover {
        background: #00cc33;
        transform: scale(1.05);
      }
      
      .remap-btn.remapping {
        background: var(--blood-red, #ff0000);
        color: white;
        animation: pulse 1s infinite;
      }
      
      .setting-item {
        margin-bottom: 20px;
        padding: 15px;
        background: rgba(0, 255, 65, 0.05);
        border-radius: 8px;
      }
      
      .setting-item label {
        display: block;
        color: var(--bone-white, #f0f0f0);
        margin-bottom: 10px;
        font-weight: bold;
      }
      
      .setting-item input[type="range"] {
        width: 70%;
        margin-right: 10px;
      }
      
      .setting-item input[type="checkbox"] {
        margin-right: 10px;
      }
      
      .test-display {
        background: rgba(0, 0, 0, 0.3);
        padding: 20px;
        border-radius: 8px;
        min-height: 200px;
        margin: 20px 0;
      }
      
      .test-buttons, .test-axes {
        margin-bottom: 15px;
      }
      
      .test-item {
        display: flex;
        justify-content: space-between;
        padding: 8px;
        margin: 5px 0;
        background: rgba(0, 255, 65, 0.1);
        border-radius: 5px;
        color: var(--bone-white, #f0f0f0);
      }
      
      .test-item.active {
        background: var(--ghost-green, #00ff41);
        color: var(--midnight-purple, #1a0a2e);
        font-weight: bold;
      }
      
      .settings-footer {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin-top: 25px;
        padding-top: 20px;
        border-top: 2px solid var(--ghost-green, #00ff41);
      }
      
      .mapping-actions, .setting-actions, .test-actions {
        display: flex;
        gap: 10px;
        justify-content: center;
        margin-top: 20px;
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    
    document.head.appendChild(style);
  }

  /**
   * Update settings display with current controller data
   */
  updateSettingsDisplay() {
    if (!this.currentController) return;
    
    const modal = document.getElementById('controllerSettingsModal');
    if (!modal) return;
    
    // Update controller info
    const controllerName = this.controllerManager.getControllerName(this.currentController.id);
    const controllerType = this.configManager.detectControllerType(this.currentController.gamepad);
    
    modal.querySelector('#controllerName').textContent = controllerName;
    modal.querySelector('#controllerType').textContent = controllerType.toUpperCase();
    
    // Update button mappings
    this.updateMappingsList();
    
    // Update advanced settings
    const config = this.configManager.getOrCreateConfiguration(this.currentController.gamepad);
    modal.querySelector('#deadzoneSlider').value = (config.deadzone * 100);
    modal.querySelector('#deadzoneValue').textContent = config.deadzone.toFixed(2);
    modal.querySelector('#vibrationToggle').checked = config.vibrationEnabled;
  }

  /**
   * Update mappings list display
   */
  updateMappingsList() {
    const mappingsList = document.getElementById('mappingsList');
    if (!mappingsList) return;
    
    const mapping = this.inputMapper.getButtonMapping(this.currentController.id);
    
    mappingsList.innerHTML = '';
    
    for (const [button, action] of Object.entries(mapping)) {
      const item = document.createElement('div');
      item.className = 'mapping-item';
      item.innerHTML = `
        <span class="mapping-label">${button}</span>
        <span class="mapping-value">${this.actionNames[action] || action}</span>
        <button class="remap-btn" onclick="window.controllerSettingsUI.startRemapping('${button}')">
          Remap
        </button>
      `;
      mappingsList.appendChild(item);
    }
  }

  /**
   * Switch between tabs
   */
  switchTab(tabName) {
    const modal = document.getElementById('controllerSettingsModal');
    if (!modal) return;
    
    // Update tab buttons
    modal.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Update tab content
    modal.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    
    const activeTab = modal.querySelector(`#${tabName}Tab`);
    if (activeTab) {
      activeTab.classList.add('active');
    }
    
    // Start test mode if switching to test tab
    if (tabName === 'test' && !this.testMode) {
      this.startTestMode();
    } else if (tabName !== 'test' && this.testMode) {
      this.stopTestMode();
    }
  }

  /**
   * Start button remapping
   */
  startRemapping(button) {
    this.isRemapping = true;
    this.remappingButton = button;
    
    // Update button appearance
    const mappingsList = document.getElementById('mappingsList');
    const buttons = mappingsList.querySelectorAll('.remap-btn');
    buttons.forEach(btn => {
      if (btn.textContent.includes('Remap') && btn.onclick.toString().includes(button)) {
        btn.textContent = 'Press any button...';
        btn.classList.add('remapping');
      } else {
        btn.disabled = true;
      }
    });
    
    // Listen for button press
    this.waitForButtonPress();
  }

  /**
   * Wait for button press during remapping
   */
  waitForButtonPress() {
    const checkInterval = setInterval(() => {
      if (!this.isRemapping) {
        clearInterval(checkInterval);
        return;
      }
      
      const state = this.controllerManager.getControllerState(this.currentController.index);
      if (!state) return;
      
      // Check for any button press
      for (const [buttonKey, buttonState] of Object.entries(state.buttons)) {
        if (buttonState.justPressed) {
          // Found a button press
          const currentMapping = this.inputMapper.getButtonMapping(this.currentController.id);
          const action = currentMapping[this.remappingButton];
          
          // Update mapping
          this.inputMapper.setButtonMapping(this.currentController.id, buttonKey, action);
          
          // Stop remapping
          this.isRemapping = false;
          this.remappingButton = null;
          clearInterval(checkInterval);
          
          // Update display
          this.updateMappingsList();
          
          console.log(`Remapped ${buttonKey} to ${action}`);
          break;
        }
      }
    }, 50);
  }

  /**
   * Reset to default mappings
   */
  resetToDefaults() {
    if (!this.currentController) return;
    
    if (confirm('Reset all button mappings to defaults?')) {
      this.configManager.resetToDefaults(this.currentController.gamepad);
      this.updateSettingsDisplay();
      console.log('Reset to default mappings');
    }
  }

  /**
   * Toggle test mode
   */
  toggleTestMode() {
    if (this.testMode) {
      this.stopTestMode();
    } else {
      this.startTestMode();
    }
  }

  /**
   * Start test mode
   */
  startTestMode() {
    this.testMode = true;
    
    const testModeBtn = document.getElementById('testModeBtn');
    if (testModeBtn) {
      testModeBtn.textContent = '⏸️ Stop Test';
    }
    
    this.testInterval = setInterval(() => {
      this.updateTestDisplay();
    }, 50);
  }

  /**
   * Stop test mode
   */
  stopTestMode() {
    this.testMode = false;
    
    const testModeBtn = document.getElementById('testModeBtn');
    if (testModeBtn) {
      testModeBtn.textContent = '▶️ Start Test';
    }
    
    if (this.testInterval) {
      clearInterval(this.testInterval);
      this.testInterval = null;
    }
  }

  /**
   * Update test display
   */
  updateTestDisplay() {
    if (!this.currentController) return;
    
    const state = this.controllerManager.getControllerState(this.currentController.index);
    if (!state) return;
    
    const testButtons = document.getElementById('testButtons');
    const testAxes = document.getElementById('testAxes');
    
    if (!testButtons || !testAxes) return;
    
    // Update buttons
    testButtons.innerHTML = '<h3 style="color: var(--ghost-green);">Buttons:</h3>';
    for (const [buttonKey, buttonState] of Object.entries(state.buttons)) {
      const item = document.createElement('div');
      item.className = 'test-item' + (buttonState.pressed ? ' active' : '');
      item.innerHTML = `
        <span>${buttonKey}</span>
        <span>${buttonState.pressed ? 'PRESSED' : 'Released'} (${buttonState.value.toFixed(2)})</span>
      `;
      testButtons.appendChild(item);
    }
    
    // Update axes
    testAxes.innerHTML = '<h3 style="color: var(--ghost-green);">Axes:</h3>';
    for (const [axisKey, axisState] of Object.entries(state.axes)) {
      const item = document.createElement('div');
      item.className = 'test-item' + (Math.abs(axisState.value) > 0.1 ? ' active' : '');
      item.innerHTML = `
        <span>${axisKey}</span>
        <span>${axisState.value.toFixed(2)}</span>
      `;
      testAxes.appendChild(item);
    }
  }

  /**
   * Export configuration
   */
  exportConfig() {
    if (!this.currentController) return;
    
    const config = this.configManager.exportConfiguration(this.currentController.id);
    if (!config) {
      alert('Failed to export configuration');
      return;
    }
    
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `controller-config-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    console.log('Exported configuration');
  }

  /**
   * Import configuration
   */
  importConfig() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          if (this.configManager.importConfiguration(data)) {
            this.updateSettingsDisplay();
            alert('Configuration imported successfully');
          } else {
            alert('Failed to import configuration');
          }
        } catch (error) {
          console.error('Error importing configuration:', error);
          alert('Invalid configuration file');
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  }

  /**
   * Save and close settings
   */
  saveAndClose() {
    if (!this.currentController) return;
    
    const modal = document.getElementById('controllerSettingsModal');
    if (!modal) return;
    
    // Get current settings
    const deadzone = parseFloat(modal.querySelector('#deadzoneSlider').value) / 100;
    const vibrationEnabled = modal.querySelector('#vibrationToggle').checked;
    
    // Update input mapper
    this.inputMapper.setDeadzone(deadzone);
    
    // Save configuration
    const config = {
      buttonMappings: this.inputMapper.getButtonMapping(this.currentController.id),
      axisMappings: this.inputMapper.getAxisMapping(this.currentController.id),
      deadzone: deadzone,
      vibrationEnabled: vibrationEnabled
    };
    
    this.configManager.saveConfiguration(this.currentController.id, config);
    
    console.log('Saved controller configuration');
    this.hide();
  }

  /**
   * Hide settings modal
   */
  hide() {
    this.stopTestMode();
    this.isRemapping = false;
    this.remappingButton = null;
    
    const modal = document.getElementById('controllerSettingsModal');
    if (modal) {
      modal.remove();
    }
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.ControllerSettingsUI = ControllerSettingsUI;
}

// Controller settings UI loaded
