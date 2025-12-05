/**
 * User Profile Component
 * Displays user information, stats, and game history
 */

class UserProfile {
  constructor() {
    this.modalId = 'profileModal';
    this.isInitialized = false;
    this.activeTab = 'profile'; // 'profile', 'stats', or 'history'
    this.currentPage = 1;
    this.gamesPerPage = 5;
    
    // Bind methods
    this.init = this.init.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.switchTab = this.switchTab.bind(this);
    this.loadProfile = this.loadProfile.bind(this);
    this.loadStats = this.loadStats.bind(this);
    this.loadHistory = this.loadHistory.bind(this);
    this.handleProfileUpdate = this.handleProfileUpdate.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.showError = this.showError.bind(this);
    this.clearError = this.clearError.bind(this);
  }

  /**
   * Initialize the profile modal
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
    modal.className = 'profile-modal';
    modal.style.display = 'none';
    
    modal.innerHTML = `
      <div class="profile-modal-content">
        <div class="profile-modal-header">
          <div class="profile-tabs">
            <button id="profileTab" class="profile-tab active">Profile</button>
            <button id="statsTab" class="profile-tab">Stats</button>
            <button id="historyTab" class="profile-tab">Game History</button>
          </div>
          <button class="profile-close-btn">&times;</button>
        </div>
        
        <div class="profile-modal-body">
          <!-- Profile Tab -->
          <div id="profileTabContent" class="profile-tab-content">
            <div class="profile-header">
              <div class="profile-avatar">
                <img id="profileAvatar" src="/assets/default-avatar.png" alt="Avatar">
              </div>
              <div class="profile-info">
                <h2 id="profileDisplayName">User</h2>
                <p id="profileUsername">@username</p>
                <p id="profileStatus">Regular User</p>
              </div>
            </div>
            
            <div class="profile-error" id="profileError"></div>
            
            <form id="profileForm" class="profile-form">
              <div class="profile-input-group">
                <label for="profileDisplayNameInput">Display Name</label>
                <input type="text" id="profileDisplayNameInput" maxlength="30">
              </div>
              
              <div class="profile-preferences">
                <h3>Preferences</h3>
                
                <div class="profile-preference-item">
                  <label for="preferredCharacter">Preferred Character</label>
                  <select id="preferredCharacter">
                    <option value="Alex">Alex</option>
                    <option value="Bella">Bella</option>
                    <option value="Charlie">Charlie</option>
                    <option value="Daisy">Daisy</option>
                    <option value="Zoe">Zoe</option>
                    <option value="Leo">Leo</option>
                    <option value="Mia">Mia</option>
                    <option value="Noah">Noah</option>
                    <option value="Chloe">Chloe</option>
                    <option value="Sam">Sam</option>
                    <option value="Finn">Finn</option>
                    <option value="Grace">Grace</option>
                  </select>
                </div>
                
                <div class="profile-preference-item">
                  <label for="soundEnabled">Sound</label>
                  <label class="toggle-switch">
                    <input type="checkbox" id="soundEnabled">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                
                <div class="profile-preference-item">
                  <label for="notificationsEnabled">Notifications</label>
                  <label class="toggle-switch">
                    <input type="checkbox" id="notificationsEnabled">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                
                <div class="profile-preference-item">
                  <label for="themePreference">Theme</label>
                  <select id="themePreference">
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                </div>
              </div>
              
              <div class="profile-actions">
                <button type="submit" class="profile-btn primary">Save Changes</button>
                <button type="button" id="logoutBtn" class="profile-btn secondary">Logout</button>
              </div>
            </form>
          </div>
          
          <!-- Stats Tab -->
          <div id="statsTabContent" class="profile-tab-content" style="display: none;">
            <div class="stats-summary">
              <div class="stats-card">
                <div class="stats-value" id="statsTotalGames">0</div>
                <div class="stats-label">Games Played</div>
              </div>
              <div class="stats-card">
                <div class="stats-value" id="statsWins">0</div>
                <div class="stats-label">Wins</div>
              </div>
              <div class="stats-card">
                <div class="stats-value" id="statsWinRate">0%</div>
                <div class="stats-label">Win Rate</div>
              </div>
              <div class="stats-card">
                <div class="stats-value" id="statsHighScore">0</div>
                <div class="stats-label">High Score</div>
              </div>
            </div>
            
            <div class="stats-details">
              <div class="stats-section">
                <h3>Game Stats</h3>
                <div class="stats-row">
                  <div class="stats-label">Average Score</div>
                  <div class="stats-value" id="statsAvgScore">0</div>
                </div>
                <div class="stats-row">
                  <div class="stats-label">Total Score</div>
                  <div class="stats-value" id="statsTotalScore">0</div>
                </div>
                <div class="stats-row">
                  <div class="stats-label">Current Streak</div>
                  <div class="stats-value" id="statsCurrentStreak">0</div>
                </div>
                <div class="stats-row">
                  <div class="stats-label">Longest Streak</div>
                  <div class="stats-value" id="statsLongestStreak">0</div>
                </div>
              </div>
              
              <div class="stats-section">
                <h3>Collection Stats</h3>
                <div class="stats-row">
                  <div class="stats-label">Coins Collected</div>
                  <div class="stats-value" id="statsTotalCoins">0</div>
                </div>
                <div class="stats-row">
                  <div class="stats-label">Enemies Hit</div>
                  <div class="stats-value" id="statsTotalEnemies">0</div>
                </div>
                <div class="stats-row">
                  <div class="stats-label">Bombs Hit</div>
                  <div class="stats-value" id="statsTotalBombs">0</div>
                </div>
                <div class="stats-row">
                  <div class="stats-label">Total Play Time</div>
                  <div class="stats-value" id="statsTotalTime">0h 0m</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- History Tab -->
          <div id="historyTabContent" class="profile-tab-content" style="display: none;">
            <div class="history-list" id="gameHistoryList">
              <div class="history-loading">Loading game history...</div>
            </div>
            
            <div class="history-pagination">
              <button id="prevPageBtn" class="profile-btn secondary" disabled>Previous</button>
              <span id="paginationInfo">Page 1</span>
              <button id="nextPageBtn" class="profile-btn secondary" disabled>Next</button>
            </div>
          </div>
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
    document.querySelector(`#${this.modalId} .profile-close-btn`).addEventListener('click', this.hide);
    
    // Tab switching
    document.getElementById('profileTab').addEventListener('click', () => this.switchTab('profile'));
    document.getElementById('statsTab').addEventListener('click', () => this.switchTab('stats'));
    document.getElementById('historyTab').addEventListener('click', () => this.switchTab('history'));
    
    // Profile form submission
    document.getElementById('profileForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleProfileUpdate();
    });
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', this.handleLogout);
    
    // Pagination buttons
    document.getElementById('prevPageBtn').addEventListener('click', () => {
      this.currentPage--;
      this.loadHistory();
    });
    
    document.getElementById('nextPageBtn').addEventListener('click', () => {
      this.currentPage++;
      this.loadHistory();
    });
    
    // Close modal when clicking outside
    document.getElementById(this.modalId).addEventListener('click', (e) => {
      if (e.target === document.getElementById(this.modalId)) {
        this.hide();
      }
    });
  }

  /**
   * Switch between tabs
   * @param {string} tab - Tab name ('profile', 'stats', or 'history')
   */
  switchTab(tab) {
    this.activeTab = tab;
    this.clearError();
    
    // Update tab buttons
    document.getElementById('profileTab').classList.toggle('active', tab === 'profile');
    document.getElementById('statsTab').classList.toggle('active', tab === 'stats');
    document.getElementById('historyTab').classList.toggle('active', tab === 'history');
    
    // Show/hide tab content
    document.getElementById('profileTabContent').style.display = tab === 'profile' ? 'block' : 'none';
    document.getElementById('statsTabContent').style.display = tab === 'stats' ? 'block' : 'none';
    document.getElementById('historyTabContent').style.display = tab === 'history' ? 'block' : 'none';
    
    // Load tab data
    if (tab === 'profile') {
      this.loadProfile();
    } else if (tab === 'stats') {
      this.loadStats();
    } else if (tab === 'history') {
      this.loadHistory();
    }
  }

  /**
   * Show the profile modal
   * @param {string} tab - Initial tab to show
   */
  show(tab = 'profile') {
    this.init();
    this.switchTab(tab);
    document.getElementById(this.modalId).style.display = 'flex';
  }

  /**
   * Hide the profile modal
   */
  hide() {
    document.getElementById(this.modalId).style.display = 'none';
    this.clearError();
  }

  /**
   * Load and display user profile data
   */
  loadProfile() {
    const user = window.authManager.getCurrentUser();
    if (!user) return;
    
    // Set profile info
    document.getElementById('profileDisplayName').textContent = user.displayName;
    document.getElementById('profileUsername').textContent = `@${user.username}`;
    
    let statusText = user.isGuest ? 'Guest User' : 'Registered User';
    if (user.isGuest && user.guestExpiresAt) {
      const expiresAt = new Date(user.guestExpiresAt);
      const now = new Date();
      const hoursLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60));
      statusText += ` (Expires in ${hoursLeft}h)`;
    }
    document.getElementById('profileStatus').textContent = statusText;
    
    // Set avatar
    const avatarElement = document.getElementById('profileAvatar');
    avatarElement.src = user.avatar || '/assets/default-avatar.png';
    avatarElement.alt = user.displayName;
    
    // Set form values
    document.getElementById('profileDisplayNameInput').value = user.displayName;
    
    // Set preferences
    if (user.preferences) {
      document.getElementById('preferredCharacter').value = user.preferences.character || 'Alex';
      document.getElementById('soundEnabled').checked = user.preferences.soundEnabled !== false;
      document.getElementById('notificationsEnabled').checked = user.preferences.notificationsEnabled !== false;
      document.getElementById('themePreference').value = user.preferences.theme || 'dark';
    }
    
    // Disable form for guest users
    const isGuest = user.isGuest;
    document.getElementById('profileDisplayNameInput').disabled = isGuest;
    document.getElementById('preferredCharacter').disabled = isGuest;
    document.getElementById('soundEnabled').disabled = isGuest;
    document.getElementById('notificationsEnabled').disabled = isGuest;
    document.getElementById('themePreference').disabled = isGuest;
    
    // Show guest message if applicable
    if (isGuest) {
      this.showError('profile', 'Guest users cannot update their profile. <span class="register-link" onclick="window.userProfile.openRegisterModal()">Register</span> to unlock all features.');
    }
  }

  /**
   * Load and display user stats
   */
  loadStats() {
    const user = window.authManager.getCurrentUser();
    if (!user) return;
    
    const stats = user.stats || {};
    const winRate = user.winRate || 0;
    const avgScore = user.averageScore || 0;
    
    // Summary stats
    document.getElementById('statsTotalGames').textContent = stats.totalGames || 0;
    document.getElementById('statsWins').textContent = stats.wins || 0;
    document.getElementById('statsWinRate').textContent = `${winRate}%`;
    document.getElementById('statsHighScore').textContent = stats.highestScore || 0;
    
    // Game stats
    document.getElementById('statsAvgScore').textContent = avgScore;
    document.getElementById('statsTotalScore').textContent = stats.totalScore || 0;
    document.getElementById('statsCurrentStreak').textContent = stats.currentStreak || 0;
    document.getElementById('statsLongestStreak').textContent = stats.longestStreak || 0;
    
    // Collection stats
    document.getElementById('statsTotalCoins').textContent = stats.totalCoinsCollected || 0;
    document.getElementById('statsTotalEnemies').textContent = stats.totalEnemiesHit || 0;
    document.getElementById('statsTotalBombs').textContent = stats.totalBombsHit || 0;
    
    // Format play time
    const totalHours = Math.floor((stats.totalPlayTime || 0) / 3600);
    const totalMinutes = Math.floor(((stats.totalPlayTime || 0) % 3600) / 60);
    document.getElementById('statsTotalTime').textContent = `${totalHours}h ${totalMinutes}m`;
  }

  /**
   * Load and display game history
   */
  async loadHistory() {
    const historyList = document.getElementById('gameHistoryList');
    historyList.innerHTML = '<div class="history-loading">Loading game history...</div>';
    
    try {
      const result = await window.authManager.getGameHistory(this.currentPage, this.gamesPerPage);
      const { history, pagination } = result;
      
      // Update pagination controls
      document.getElementById('prevPageBtn').disabled = !pagination.hasPrev;
      document.getElementById('nextPageBtn').disabled = !pagination.hasNext;
      document.getElementById('paginationInfo').textContent = `Page ${pagination.currentPage} of ${pagination.totalPages}`;
      
      // Display history items
      if (history.length === 0) {
        historyList.innerHTML = '<div class="history-empty">No games played yet</div>';
        return;
      }
      
      historyList.innerHTML = '';
      history.forEach(game => {
        const date = new Date(game.playedAt);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString();
        
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${game.result === 'win' ? 'win' : 'lose'}`;
        
        historyItem.innerHTML = `
          <div class="history-item-header">
            <div class="history-item-mode">${game.gameMode === 'practice' ? 'Practice' : 'Multiplayer'}</div>
            <div class="history-item-date">${formattedDate} ${formattedTime}</div>
          </div>
          <div class="history-item-body">
            <div class="history-item-result">${game.result === 'win' ? 'Victory' : 'Defeat'}</div>
            <div class="history-item-score">Score: ${game.score}</div>
            ${game.opponent ? `<div class="history-item-opponent">vs ${game.opponent}</div>` : ''}
          </div>
          <div class="history-item-footer">
            <div class="history-item-stat">
              <span class="history-item-icon">🪙</span>
              <span>${game.coinsCollected || 0}</span>
            </div>
            <div class="history-item-stat">
              <span class="history-item-icon">👹</span>
              <span>${game.enemiesHit || 0}</span>
            </div>
            <div class="history-item-stat">
              <span class="history-item-icon">💣</span>
              <span>${game.bombsHit || 0}</span>
            </div>
            <div class="history-item-stat">
              <span class="history-item-icon">⏱️</span>
              <span>${Math.floor((game.duration || 0) / 60)}m ${(game.duration || 0) % 60}s</span>
            </div>
          </div>
        `;
        
        historyList.appendChild(historyItem);
      });
    } catch (error) {
      console.error('Error loading game history:', error);
      historyList.innerHTML = '<div class="history-error">Failed to load game history</div>';
    }
  }

  /**
   * Handle profile update form submission
   */
  async handleProfileUpdate() {
    this.clearError();
    
    const user = window.authManager.getCurrentUser();
    if (!user || user.isGuest) return;
    
    const displayName = document.getElementById('profileDisplayNameInput').value.trim();
    
    if (!displayName) {
      this.showError('profile', 'Display name cannot be empty');
      return;
    }
    
    const preferences = {
      character: document.getElementById('preferredCharacter').value,
      soundEnabled: document.getElementById('soundEnabled').checked,
      notificationsEnabled: document.getElementById('notificationsEnabled').checked,
      theme: document.getElementById('themePreference').value
    };
    
    try {
      await window.authManager.updateProfile({ displayName, preferences });
      this.showError('profile', 'Profile updated successfully!', 'success');
      
      // Update game preferences if needed
      if (window.onPreferencesUpdated) {
        window.onPreferencesUpdated(preferences);
      }
    } catch (error) {
      this.showError('profile', error.message || 'Failed to update profile');
    }
  }

  /**
   * Handle logout button click
   */
  async handleLogout() {
    try {
      await window.authManager.logout();
      this.hide();
      
      // Notify the game that logout occurred
      if (window.onAuthLogout) {
        window.onAuthLogout();
      }
    } catch (error) {
      this.showError('profile', error.message || 'Logout failed');
    }
  }

  /**
   * Show error or success message
   * @param {string} tab - Tab name
   * @param {string} message - Message to display
   * @param {string} type - Message type ('error' or 'success')
   */
  showError(tab, message, type = 'error') {
    const errorElement = document.getElementById('profileError');
    errorElement.innerHTML = message; // Use innerHTML to render HTML content
    errorElement.className = `profile-error ${type}`;
    errorElement.style.display = 'block';
  }

  /**
   * Clear error messages
   */
  clearError() {
    const errorElement = document.getElementById('profileError');
    errorElement.style.display = 'none';
  }

  /**
   * Open registration modal from profile
   */
  openRegisterModal() {
    // Hide profile modal
    this.hide();
    
    // Show auth modal with register tab
    if (window.authModal && typeof window.authModal.show === 'function') {
      window.authModal.show('register');
    }
  }
}

// Create and export singleton instance
const userProfile = new UserProfile();
window.userProfile = userProfile; // Make available globally

// Make available globally
console.log('User profile initialized and attached to window object');