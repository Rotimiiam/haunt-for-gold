// On-Screen Keyboard for Controller Input
// Allows players to input names using game controllers

class OnScreenKeyboard {
  constructor() {
    this.keys = [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
      ['Space', 'Done']
    ];
    
    this.currentRow = 0;
    this.currentCol = 0;
    this.inputValue = '';
    this.maxLength = 15;
    this.targetInput = null;
    this.onComplete = null;
    this.keyboardElement = null;
    this.isVisible = false;
  }

  show(targetInput, onComplete) {
    this.targetInput = targetInput;
    this.onComplete = onComplete;
    this.inputValue = targetInput.value || '';
    this.isVisible = true;
    
    // Block other controller input by setting a flag
    window.onScreenKeyboardActive = true;
    
    this.createKeyboard();
    this.setupControllerInput();
  }

  hide() {
    if (this.keyboardElement) {
      this.keyboardElement.remove();
      this.keyboardElement = null;
    }
    this.isVisible = false;
    
    // Re-enable other controller input
    window.onScreenKeyboardActive = false;
    
    this.removeControllerInput();
  }

  createKeyboard() {
    // Remove existing keyboard if any
    if (this.keyboardElement) {
      this.keyboardElement.remove();
    }

    const keyboard = document.createElement('div');
    keyboard.id = 'onScreenKeyboard';
    keyboard.style.cssText = `
      position: fixed;
      bottom: 50px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(26, 10, 46, 0.95);
      border: 3px solid var(--ghost-green);
      border-radius: 15px;
      padding: 20px;
      z-index: 10000;
      box-shadow: 0 0 30px rgba(0, 255, 65, 0.5);
    `;

    // Input display
    const inputDisplay = document.createElement('div');
    inputDisplay.id = 'keyboardInput';
    inputDisplay.style.cssText = `
      background: rgba(0, 0, 0, 0.5);
      border: 2px solid var(--ghost-green);
      border-radius: 8px;
      padding: 10px 15px;
      margin-bottom: 15px;
      color: var(--ghost-green);
      font-size: 1.2rem;
      text-align: center;
      min-width: 300px;
      min-height: 30px;
    `;
    inputDisplay.textContent = this.inputValue || '_';

    // Keys container
    const keysContainer = document.createElement('div');
    keysContainer.id = 'keyboardKeys';
    
    this.keys.forEach((row, rowIndex) => {
      const rowDiv = document.createElement('div');
      rowDiv.style.cssText = `
        display: flex;
        gap: 5px;
        margin-bottom: 5px;
        justify-content: center;
      `;
      
      row.forEach((key, colIndex) => {
        const keyBtn = document.createElement('div');
        keyBtn.className = 'keyboard-key';
        keyBtn.dataset.row = rowIndex;
        keyBtn.dataset.col = colIndex;
        keyBtn.textContent = key === 'Space' ? '___' : key;
        
        const isWide = key === 'Space' || key === 'Done';
        keyBtn.style.cssText = `
          background: rgba(0, 255, 65, 0.2);
          border: 2px solid rgba(0, 255, 65, 0.5);
          border-radius: 5px;
          padding: 10px;
          min-width: ${isWide ? '120px' : '40px'};
          text-align: center;
          color: var(--bone-white);
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        `;
        
        rowDiv.appendChild(keyBtn);
      });
      
      keysContainer.appendChild(rowDiv);
    });

    keyboard.appendChild(inputDisplay);
    keyboard.appendChild(keysContainer);
    
    // Instructions
    const instructions = document.createElement('div');
    instructions.style.cssText = `
      margin-top: 10px;
      text-align: center;
      color: #888;
      font-size: 0.8rem;
    `;
    instructions.textContent = '🎮 D-Pad: Navigate | A: Select | B: Back';
    keyboard.appendChild(instructions);

    document.body.appendChild(keyboard);
    this.keyboardElement = keyboard;
    
    this.updateSelection();
  }

  updateSelection() {
    const keys = this.keyboardElement.querySelectorAll('.keyboard-key');
    keys.forEach(key => {
      const row = parseInt(key.dataset.row);
      const col = parseInt(key.dataset.col);
      
      if (row === this.currentRow && col === this.currentCol) {
        key.style.background = 'var(--ghost-green)';
        key.style.color = '#000';
        key.style.borderColor = 'var(--ghost-green)';
        key.style.boxShadow = '0 0 15px var(--ghost-green)';
      } else {
        key.style.background = 'rgba(0, 255, 65, 0.2)';
        key.style.color = 'var(--bone-white)';
        key.style.borderColor = 'rgba(0, 255, 65, 0.5)';
        key.style.boxShadow = 'none';
      }
    });
  }

  updateInputDisplay() {
    const display = document.getElementById('keyboardInput');
    if (display) {
      display.textContent = this.inputValue || '_';
    }
  }

  setupControllerInput() {
    // Track timing for repeat
    this.buttonHoldTime = {};
    this.lastActionTime = {};
    const INITIAL_DELAY = 200; // ms before repeat starts
    const REPEAT_RATE = 100; // ms between repeats
    
    this.pollController = () => {
      if (!this.isVisible) return;

      const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gamepad = gamepads[0] || gamepads[1] || gamepads[2] || gamepads[3];
      
      if (!gamepad) {
        requestAnimationFrame(this.pollController);
        return;
      }

      const now = Date.now();

      // Track button states
      const upPressed = gamepad.buttons[12]?.pressed;
      const downPressed = gamepad.buttons[13]?.pressed;
      const leftPressed = gamepad.buttons[14]?.pressed;
      const rightPressed = gamepad.buttons[15]?.pressed;
      const aPressed = gamepad.buttons[0]?.pressed;
      const bPressed = gamepad.buttons[1]?.pressed;

      // Helper to check if action should fire (initial press or repeat)
      const shouldFire = (buttonName, isPressed, wasPressed) => {
        if (!isPressed) {
          delete this.buttonHoldTime[buttonName];
          delete this.lastActionTime[buttonName];
          return false;
        }
        
        // First press - fire immediately
        if (isPressed && !wasPressed) {
          this.buttonHoldTime[buttonName] = now;
          this.lastActionTime[buttonName] = now;
          return true;
        }
        
        // Button held - check for repeat
        if (isPressed && wasPressed) {
          const holdDuration = now - this.buttonHoldTime[buttonName];
          const timeSinceLastAction = now - this.lastActionTime[buttonName];
          
          // After initial delay, fire at repeat rate
          if (holdDuration > INITIAL_DELAY && timeSinceLastAction > REPEAT_RATE) {
            this.lastActionTime[buttonName] = now;
            return true;
          }
        }
        
        return false;
      };

      // D-pad navigation with repeat
      if (shouldFire('up', upPressed, this.lastDpadUp)) {
        this.currentRow = Math.max(0, this.currentRow - 1);
        this.currentCol = Math.min(this.currentCol, this.keys[this.currentRow].length - 1);
        this.updateSelection();
      }
      this.lastDpadUp = upPressed;

      if (shouldFire('down', downPressed, this.lastDpadDown)) {
        this.currentRow = Math.min(this.keys.length - 1, this.currentRow + 1);
        this.currentCol = Math.min(this.currentCol, this.keys[this.currentRow].length - 1);
        this.updateSelection();
      }
      this.lastDpadDown = downPressed;

      if (shouldFire('left', leftPressed, this.lastDpadLeft)) {
        this.currentCol = Math.max(0, this.currentCol - 1);
        this.updateSelection();
      }
      this.lastDpadLeft = leftPressed;

      if (shouldFire('right', rightPressed, this.lastDpadRight)) {
        this.currentCol = Math.min(this.keys[this.currentRow].length - 1, this.currentCol + 1);
        this.updateSelection();
      }
      this.lastDpadRight = rightPressed;

      // A button - select key (no repeat)
      if (aPressed && !this.lastAButton) {
        this.selectKey();
      }
      this.lastAButton = aPressed;

      // B button - backspace with repeat
      if (shouldFire('b', bPressed, this.lastBButton)) {
        this.backspace();
      }
      this.lastBButton = bPressed;

      requestAnimationFrame(this.pollController);
    };

    this.pollController();
  }

  removeControllerInput() {
    this.isVisible = false;
  }

  selectKey() {
    const key = this.keys[this.currentRow][this.currentCol];
    
    if (key === 'Done') {
      this.complete();
    } else if (key === '⌫') {
      this.backspace();
    } else if (key === 'Space') {
      if (this.inputValue.length < this.maxLength) {
        this.inputValue += ' ';
        this.updateInputDisplay();
      }
    } else {
      if (this.inputValue.length < this.maxLength) {
        // Only capitalize first letter, rest lowercase
        const char = this.inputValue.length === 0 ? key : key.toLowerCase();
        this.inputValue += char;
        this.updateInputDisplay();
      }
    }
  }

  backspace() {
    if (this.inputValue.length > 0) {
      this.inputValue = this.inputValue.slice(0, -1);
      this.updateInputDisplay();
    }
  }

  complete() {
    if (this.targetInput) {
      this.targetInput.value = this.inputValue;
    }
    
    if (this.onComplete) {
      this.onComplete(this.inputValue);
    }
    
    this.hide();
  }
}

// Initialize the flag as false
window.onScreenKeyboardActive = false;

// Create global instance
window.onScreenKeyboard = new OnScreenKeyboard();
