/**
 * Simple Name-Based Authentication
 * Stores player name in a cookie - no accounts needed
 * Names must be unique globally (checked via server)
 */

class SimpleAuth {
  constructor() {
    this.cookieName = 'haunt_for_gold_player';
    this.cookieExpireDays = 365; // 1 year
    this.playerName = null;
    this.playerId = null;
    
    this.init();
  }

  /**
   * Initialize - check for existing cookie
   */
  init() {
    const savedData = this.getCookie();
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        this.playerName = data.name;
        this.playerId = data.id;
      } catch (e) {
        // No valid saved player data found
      }
    }
  }

  /**
   * Check if player has a saved name
   */
  hasName() {
    return this.playerName !== null && this.playerName.trim() !== '';
  }

  /**
   * Get the current player name
   */
  getName() {
    return this.playerName;
  }

  /**
   * Get the player ID
   */
  getId() {
    return this.playerId;
  }

  /**
   * Check if name is available (unique)
   */
  async checkNameAvailable(name) {
    try {
      const response = await fetch('/api/check-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      });
      const data = await response.json();
      return data.available;
    } catch (e) {
      // If server check fails, allow the name (offline mode)
      console.warn('Could not check name availability:', e);
      return true;
    }
  }

  /**
   * Register name with server
   */
  async registerName(name) {
    try {
      const response = await fetch('/api/register-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: name.trim(),
          id: this.playerId
        })
      });
      return await response.json();
    } catch (e) {
      console.warn('Could not register name with server:', e);
      return { success: true }; // Allow offline
    }
  }

  /**
   * Set and save the player name
   */
  async setName(name) {
    if (!name || name.trim() === '') {
      throw new Error('Name cannot be empty');
    }
    
    name = name.trim().substring(0, 20); // Max 20 characters
    
    // Generate a unique ID if we don't have one
    if (!this.playerId) {
      this.playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    this.playerName = name;
    
    // Save to cookie
    const data = JSON.stringify({
      name: this.playerName,
      id: this.playerId,
      savedAt: Date.now()
    });
    
    this.setCookie(data);
    
    // Register with server
    await this.registerName(name);
    
    return this.playerName;
  }

  /**
   * Clear the saved name
   */
  clearName() {
    this.playerName = null;
    this.playerId = null;
    this.deleteCookie();
  }

  /**
   * Get player display data
   */
  getPlayerData() {
    return {
      name: this.playerName || 'Ghost',
      id: this.playerId || 'unknown',
      isGuest: !this.hasName()
    };
  }

  /**
   * Set cookie
   */
  setCookie(value) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (this.cookieExpireDays * 24 * 60 * 60 * 1000));
    document.cookie = `${this.cookieName}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  }

  /**
   * Get cookie
   */
  getCookie() {
    const name = this.cookieName + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');
    
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length);
      }
    }
    return null;
  }

  /**
   * Delete cookie
   */
  deleteCookie() {
    document.cookie = `${this.cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }
}

// Create global instance
window.simpleAuth = new SimpleAuth();

/**
 * Show name prompt modal
 */
function showNamePrompt(callback, forceShow = false) {
  // Check if name already exists and not forcing
  if (window.simpleAuth.hasName() && !forceShow) {
    if (callback) callback(window.simpleAuth.getName());
    return;
  }

  // Remove existing modal if any
  const existingModal = document.getElementById('namePromptModal');
  if (existingModal) existingModal.remove();

  // Create modal
  const modal = document.createElement('div');
  modal.id = 'namePromptModal';
  modal.className = 'modal-overlay';
  modal.style.display = 'flex';
  modal.innerHTML = `
    <div class="dialog-content haunted-panel glow" style="max-width: 400px;">
      <h2 class="spooky-title" style="font-size: 1.8rem; margin-bottom: 20px;">👻 Enter Your Name 👻</h2>
      <p style="color: #b8b8b8; margin-bottom: 20px;">What shall the spirits call you?</p>
      <input type="text" id="namePromptInput" class="spectral-input" 
             placeholder="Your haunted name..." maxlength="20" 
             value="${window.simpleAuth.getName() || ''}"
             style="width: 100%; margin-bottom: 10px; text-align: center; font-size: 1.2rem;">
      <div id="nameError" style="color: #ff6b6b; font-size: 0.9rem; margin-bottom: 15px; display: none;"></div>
      <button id="namePromptSubmit" class="spooky-btn gold" style="width: 100%;">
        🎃 Enter the Realm 🎃
      </button>
      <p style="color: #666; font-size: 0.8rem; margin-top: 15px;">
        Names must be unique - choose wisely!
      </p>
    </div>
  `;

  document.body.appendChild(modal);

  const input = document.getElementById('namePromptInput');
  const submitBtn = document.getElementById('namePromptSubmit');
  const errorDiv = document.getElementById('nameError');

  // Focus input
  setTimeout(() => {
    input.focus();
    input.select();
  }, 100);

  // Handle submit
  const handleSubmit = async () => {
    const name = input.value.trim();
    
    if (name.length < 2) {
      errorDiv.textContent = 'Name must be at least 2 characters!';
      errorDiv.style.display = 'block';
      input.style.borderColor = '#ff0000';
      return;
    }

    if (name.length > 20) {
      errorDiv.textContent = 'Name must be 20 characters or less!';
      errorDiv.style.display = 'block';
      input.style.borderColor = '#ff0000';
      return;
    }

    // Check if name is available
    submitBtn.textContent = '🔮 Checking...';
    submitBtn.disabled = true;

    const isAvailable = await window.simpleAuth.checkNameAvailable(name);
    
    if (!isAvailable && name !== window.simpleAuth.getName()) {
      errorDiv.textContent = 'This name is already taken! Choose another.';
      errorDiv.style.display = 'block';
      input.style.borderColor = '#ff0000';
      submitBtn.textContent = '🎃 Enter the Realm 🎃';
      submitBtn.disabled = false;
      return;
    }

    try {
      await window.simpleAuth.setName(name);
      modal.remove();
      
      // Update UI
      updatePlayerDisplay();
      
      if (callback) callback(name);
    } catch (e) {
      errorDiv.textContent = 'Error saving name. Try again!';
      errorDiv.style.display = 'block';
      submitBtn.textContent = '🎃 Enter the Realm 🎃';
      submitBtn.disabled = false;
    }
  };

  submitBtn.addEventListener('click', handleSubmit);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSubmit();
  });
  
  // Clear error on input
  input.addEventListener('input', () => {
    errorDiv.style.display = 'none';
    input.style.borderColor = '';
  });
}

/**
 * Update player name display in UI
 */
function updatePlayerDisplay() {
  const playerData = window.simpleAuth.getPlayerData();
  
  // Update player name display
  const playerNameDisplay = document.getElementById('playerNameDisplay');
  const playerNameText = document.getElementById('playerNameText');
  
  if (playerData.name && !playerData.isGuest) {
    // Show player name display - just the name
    if (playerNameDisplay) {
      playerNameDisplay.style.display = 'flex';
      playerNameDisplay.style.alignItems = 'center';
    }
    if (playerNameText) {
      playerNameText.textContent = playerData.name;
    }
    
    // Update global player name
    window.playerName = playerData.name;
  }
}

/**
 * Initialize simple auth on page load
 */
document.addEventListener('DOMContentLoaded', () => {
  // Check if we need to prompt for name
  if (!window.simpleAuth.hasName()) {
    // Show name prompt after a short delay
    setTimeout(() => showNamePrompt(), 500);
  } else {
    // Update display with saved name
    updatePlayerDisplay();
  }
  
  // Make the player name available globally
  window.playerName = window.simpleAuth.getName() || 'Ghost';
});

// Simple auth system loaded
