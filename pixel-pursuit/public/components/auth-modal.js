/**
 * Authentication Modal Component
 * Provides UI for login, registration, and guest access
 */

class AuthModal {
  constructor() {
    this.modalId = 'authModal';
    this.isInitialized = false;
    this.activeTab = 'login'; // 'login' or 'register'
    
    // Bind methods
    this.init = this.init.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
    this.handleRegister = this.handleRegister.bind(this);
    this.handleGuestLogin = this.handleGuestLogin.bind(this);
    this.switchTab = this.switchTab.bind(this);
    this.showError = this.showError.bind(this);
    this.clearError = this.clearError.bind(this);
  }

  /**
   * Initialize the auth modal
   */
  init() {
    if (this.isInitialized) return;
    
    // Create modal element if it doesn't exist
    if (!document.getElementById(this.modalId)) {
      this.createModal();
    }
    
    // Add event listeners
    this.addEventListeners();
    
    this.isInitialized = true;
  }

  /**
   * Create the modal HTML
   */
  createModal() {
    const modal = document.createElement('div');
    modal.id = this.modalId;
    modal.className = 'auth-modal';
    modal.style.display = 'none';
    
    modal.innerHTML = `
      <div class="auth-modal-content cadence-style-modal">
        <div class="auth-modal-header">
          <div class="auth-tabs">
            <button id="authModalLoginTab" class="auth-tab active">Login</button>
            <button id="authModalRegisterTab" class="auth-tab">Register</button>
          </div>
          <button class="auth-close-btn">&times;</button>
        </div>
        
        <div class="auth-modal-body">
          <!-- Login Form -->
          <form id="authModalLoginForm" class="auth-form">
            <div class="auth-error" id="authModalLoginError"></div>
            <div class="auth-input-group">
              <label for="authModalLoginUsername">Username or Email</label>
              <input type="text" id="authModalLoginUsername" required>
            </div>
            <div class="auth-input-group">
              <label for="authModalLoginPassword">Password</label>
              <input type="password" id="authModalLoginPassword" required>
            </div>
            <div class="auth-actions">
              <button type="submit" class="auth-btn primary cadence-btn">Login</button>
            </div>
            <div class="auth-divider">
              <span>or</span>
            </div>
            <div class="auth-oauth">
              <a href="/api/auth/google" class="oauth-btn google">
                <span class="oauth-icon">G</span>
                <span>Continue with Google</span>
              </a>
            </div>
            <div class="auth-divider">
              <span>or</span>
            </div>
            <div class="auth-guest">
              <button type="button" id="authModalGuestLoginBtn" class="auth-btn secondary cadence-btn">
                Continue as Guest
              </button>
            </div>
          </form>
          
          <!-- Register Form -->
          <form id="authModalRegisterForm" class="auth-form" style="display: none;">
            <div class="auth-error" id="authModalRegisterError"></div>
            <div class="auth-input-group">
              <label for="authModalRegisterUsername">Username</label>
              <input type="text" id="authModalRegisterUsername" required minlength="3" maxlength="20">
              <small>3-20 characters, letters and numbers only</small>
            </div>
            <div class="auth-input-group">
              <label for="authModalRegisterDisplayName">Display Name</label>
              <input type="text" id="authModalRegisterDisplayName" required maxlength="30">
            </div>
            <div class="auth-input-group">
              <label for="authModalRegisterEmail">Email</label>
              <input type="email" id="authModalRegisterEmail" required>
            </div>
            <div class="auth-input-group">
              <label for="authModalRegisterPassword">Password</label>
              <input type="password" id="authModalRegisterPassword" required minlength="6">
              <small>At least 6 characters</small>
            </div>
            <div class="auth-input-group">
              <label for="authModalRegisterConfirmPassword">Confirm Password</label>
              <input type="password" id="authModalRegisterConfirmPassword" required>
            </div>
            <div class="auth-actions">
              <button type="submit" class="auth-btn primary cadence-btn">Register</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  /**
   * Add event listeners to modal elements
   */
  addEventListeners() {
    // Close button
    document.querySelector(`#${this.modalId} .auth-close-btn`).addEventListener('click', this.hide);
    
    // Tab switching
    document.getElementById('authModalLoginTab').addEventListener('click', () => this.switchTab('login'));
    document.getElementById('authModalRegisterTab').addEventListener('click', () => this.switchTab('register'));
    
    // Form submissions
    document.getElementById('authModalLoginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });
    
    document.getElementById('authModalRegisterForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRegister();
    });
    
    // Guest login
    document.getElementById('authModalGuestLoginBtn').addEventListener('click', this.handleGuestLogin);
    
    // Close modal when clicking outside
    document.getElementById(this.modalId).addEventListener('click', (e) => {
      if (e.target === document.getElementById(this.modalId)) {
        this.hide();
      }
    });
  }

  /**
   * Switch between login and register tabs
   * @param {string} tab - Tab name ('login' or 'register')
   */
  switchTab(tab) {
    this.activeTab = tab;
    this.clearError();
    
    // Update tab buttons
    document.getElementById('authModalLoginTab').classList.toggle('active', tab === 'login');
    document.getElementById('authModalRegisterTab').classList.toggle('active', tab === 'register');
    
    // Show/hide forms
    document.getElementById('authModalLoginForm').style.display = tab === 'login' ? 'block' : 'none';
    document.getElementById('authModalRegisterForm').style.display = tab === 'register' ? 'block' : 'none';
  }

  /**
   * Show the auth modal
   * @param {string} tab - Initial tab to show ('login' or 'register')
   */
  show(tab = 'login') {
    this.init();
    this.switchTab(tab);
    document.getElementById(this.modalId).style.display = 'flex';
  }

  /**
   * Hide the auth modal
   */
  hide() {
    document.getElementById(this.modalId).style.display = 'none';
    this.clearError();
  }

  /**
   * Handle login form submission
   */
  async handleLogin() {
    this.clearError();
    
    const username = document.getElementById('authModalLoginUsername').value.trim();
    const password = document.getElementById('authModalLoginPassword').value;
    
    if (!username || !password) {
      this.showError('login', 'Please enter both username and password');
      return;
    }
    
    try {
      await window.authManager.login(username, password);
      this.hide();
      
      // Notify the game that login was successful
      if (window.onAuthSuccess) {
        window.onAuthSuccess();
      }
    } catch (error) {
      this.showError('login', error.message || 'Login failed');
    }
  }

  /**
   * Handle register form submission
   */
  async handleRegister() {
    this.clearError();
    
    const username = document.getElementById('authModalRegisterUsername').value.trim();
    const displayName = document.getElementById('authModalRegisterDisplayName').value.trim();
    const email = document.getElementById('authModalRegisterEmail').value.trim();
    const password = document.getElementById('authModalRegisterPassword').value;
    const confirmPassword = document.getElementById('authModalRegisterConfirmPassword').value;
    
    // Validation
    if (!username || !displayName || !password) {
      this.showError('register', 'Please fill in all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      this.showError('register', 'Passwords do not match');
      return;
    }
    
    if (username.length < 3 || username.length > 20) {
      this.showError('register', 'Username must be between 3 and 20 characters');
      return;
    }
    
    if (password.length < 6) {
      this.showError('register', 'Password must be at least 6 characters');
      return;
    }
    
    try {
      await window.authManager.register(username, password, displayName, email || null);
      this.hide();
      
      // Notify the game that registration was successful
      if (window.onAuthSuccess) {
        window.onAuthSuccess();
      }
    } catch (error) {
      this.showError('register', error.message || 'Registration failed');
    }
  }

  /**
   * Handle guest login
   */
  async handleGuestLogin() {
    this.clearError();
    
    try {
      await window.authManager.loginAsGuest();
      this.hide();
      
      // Notify the game that guest login was successful
      if (window.onAuthSuccess) {
        window.onAuthSuccess();
      }
      
      // Generate a random guest name
      const playerName = "Guest" + Math.floor(Math.random() * 1000);
      
      // Set the player name in the game
      if (typeof window.playerName !== 'undefined') {
        window.playerName = playerName;
      }
      
      // Hide home screen if it's visible
      const homeScreen = document.getElementById("homeScreen");
      if (homeScreen) {
        homeScreen.style.display = "none";
      }
      
      // Check if we're in practice mode
      if (typeof window.practiceMode !== 'undefined') {
        if (window.practiceMode) {
          // Start practice mode
          if (typeof window.startPracticeMode === 'function') {
            window.startPracticeMode();
          }
        } else {
          // Show waiting screen for multiplayer
          const waitingScreen = document.getElementById("waitingScreen");
          if (waitingScreen) {
            waitingScreen.style.display = "flex";
          }
          
          // Join game if the function exists
          if (typeof window.joinGame === 'function') {
            window.joinGame();
          }
        }
      }
    } catch (error) {
      this.showError('login', error.message || 'Guest login failed');
    }
  }

  /**
   * Show error message
   * @param {string} form - Form name ('login' or 'register')
   * @param {string} message - Error message
   */
  showError(form, message) {
    const errorElement = document.getElementById(`authModal${form.charAt(0).toUpperCase() + form.slice(1)}Error`);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  /**
   * Clear error messages
   */
  clearError() {
    const loginError = document.getElementById('authModalLoginError');
    const registerError = document.getElementById('authModalRegisterError');
    
    if (loginError) loginError.style.display = 'none';
    if (registerError) registerError.style.display = 'none';
  }
}

// Create and export singleton instance
const authModal = new AuthModal();

// Make available globally
window.authModal = authModal;
console.log('Auth modal initialized and attached to window object');

// Initialize the auth modal when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing auth modal');
  authModal.init();
  console.log('Auth modal initialization complete');
});