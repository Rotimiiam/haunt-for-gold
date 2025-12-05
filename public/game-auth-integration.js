/**
 * Integrates the authentication system with the game
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('Game auth integration script loaded');

  // Initialize practiceMode to null (not set)
  window.practiceMode = null;

  // Make sure authManager exists
  if (!window.authManager) {
    console.error('Auth manager not found. Make sure auth.js is loaded before game-auth-integration.js');
    return;
  }

  // Get references to UI elements
  const multiplayerBtn = document.getElementById('multiplayerBtn');
  const practiceBtn = document.getElementById('practiceBtn');
  const accountButton = document.getElementById('accountButton');
  const userMenu = document.getElementById('userMenu');
  const userAvatar = document.getElementById('userAvatar');
  const userInitials = document.getElementById('userInitials');

  // Get references to auth section buttons
  const loginBtn = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const guestBtn = document.getElementById('guestBtn');
  const googleLoginBtn = document.getElementById('googleLoginBtn');
  const githubLoginBtn = document.getElementById('githubLoginBtn');

  // Initialize auth system
  window.authManager.init().then(updateUI);

  // Add auth state change listener
  window.authManager.addAuthListener(updateUI);

  // Update UI based on auth state
  function updateUI(user) {
    if (user) {
      // User is logged in
      const loginMenu = document.getElementById('loginMenu');
      if (loginMenu) loginMenu.style.display = 'none';

      if (userMenu) userMenu.style.display = 'flex';

      // Update avatar
      if (userAvatar && user.avatar) {
        userAvatar.innerHTML = `<img src="${user.avatar}" alt="${user.displayName}">`;
      } else if (userInitials) {
        userInitials.textContent = user.displayName.charAt(0).toUpperCase();
      }

      // Update tooltip
      if (userAvatar) {
        userAvatar.title = `${user.displayName} (Click to view profile)`;
      }

      // Update auth section if it exists
      const authSection = document.getElementById('authSection');
      if (authSection) {
        authSection.style.display = 'none';
      }

      // Show user profile section if it exists
      const userProfileSection = document.getElementById('userProfileSection');
      if (userProfileSection) {
        userProfileSection.style.display = 'block';

        // Update user profile info
        const profileDisplayName = document.getElementById('profileDisplayName');
        const profileUsername = document.getElementById('profileUsername');
        const profileAvatar = document.getElementById('profileAvatar');
        const profileGuestBadge = document.getElementById('profileGuestBadge');
        const profileGamesPlayed = document.getElementById('profileGamesPlayed');
        const profileWins = document.getElementById('profileWins');
        const profileHighScore = document.getElementById('profileHighScore');

        if (profileDisplayName) profileDisplayName.textContent = user.displayName;
        if (profileUsername) profileUsername.textContent = `@${user.username}`;
        if (profileAvatar) {
          if (user.avatar) {
            profileAvatar.src = user.avatar;
          } else {
            // Create default avatar with initials
            profileAvatar.src = '/assets/default-avatar.png';
          }
        }

        // Show guest badge if applicable
        if (profileGuestBadge) {
          profileGuestBadge.style.display = user.isGuest ? 'inline-block' : 'none';
        }

        // Update stats if available
        const stats = user.stats || {};
        if (profileGamesPlayed) profileGamesPlayed.textContent = stats.totalGames || 0;
        if (profileWins) profileWins.textContent = stats.wins || 0;
        if (profileHighScore) profileHighScore.textContent = stats.highestScore || 0;
      }
    } else {
      // User is not logged in
      const loginMenu = document.getElementById('loginMenu');
      if (loginMenu) loginMenu.style.display = 'flex';

      if (userMenu) userMenu.style.display = 'none';

      // Update auth section if it exists
      const authSection = document.getElementById('authSection');
      if (authSection) {
        authSection.style.display = 'block';
      }

      // Hide user profile section if it exists
      const userProfileSection = document.getElementById('userProfileSection');
      if (userProfileSection) {
        userProfileSection.style.display = 'none';
      }
    }
  }

  // Event listener for top-right account button
  if (accountButton) {
    accountButton.addEventListener('click', () => {
      // Check if authModal exists before calling show
      if (window.authModal && typeof window.authModal.show === 'function') {
        window.authModal.show('login');
      } else {
        console.error('Auth modal not found or not initialized');
        // Fallback to login prompt if authModal is not available
        if (window.loginPrompt && typeof window.loginPrompt.show === 'function') {
          window.loginPrompt.show();
        }
      }
    });
  }

  // Event listeners for user avatar
  if (userAvatar) {
    userAvatar.addEventListener('click', () => {
      if (window.userProfile && typeof window.userProfile.show === 'function') {
        window.userProfile.show('profile');
      }
    });
  }

  // Event listeners for auth section buttons
  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      if (window.authModal && typeof window.authModal.show === 'function') {
        window.authModal.show('login');
      }
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener('click', () => {
      if (window.authModal && typeof window.authModal.show === 'function') {
        window.authModal.show('register');
      }
    });
  }

  if (guestBtn) {
    guestBtn.addEventListener('click', async () => {
      try {
        await window.authManager.loginAsGuest();
        if (window.onAuthSuccess) {
          window.onAuthSuccess();
        }
      } catch (error) {
        console.error('Guest login failed:', error);
      }
    });
  }

  // Event listeners for profile section buttons
  const profileLogoutBtn = document.getElementById('profileLogoutBtn');
  const viewProfileBtn = document.getElementById('viewProfileBtn');
  const viewLeaderboardBtn = document.getElementById('viewLeaderboardBtn');

  if (profileLogoutBtn) {
    profileLogoutBtn.addEventListener('click', async () => {
      try {
        await window.authManager.logout();
        if (window.onAuthLogout) {
          window.onAuthLogout();
        }
      } catch (error) {
        console.error('Logout failed:', error);
      }
    });
  }

  if (viewProfileBtn) {
    viewProfileBtn.addEventListener('click', () => {
      if (window.userProfile && typeof window.userProfile.show === 'function') {
        window.userProfile.show('profile');
      }
    });
  }

  if (viewLeaderboardBtn) {
    viewLeaderboardBtn.addEventListener('click', async () => {
      try {
        // Show leaderboard modal or section
        // This is a placeholder for leaderboard functionality
        const leaderboard = await window.authManager.getLeaderboard('highScore', 10);
        console.log('Leaderboard:', leaderboard);
        // TODO: Implement leaderboard display
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      }
    });
  }

  // OAuth buttons
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/api/auth/google';
    });
  }

  if (githubLoginBtn) {
    githubLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = '/api/auth/github';
    });
  }

  // Override game start buttons to show login/register prompt
  if (multiplayerBtn) {
    multiplayerBtn.onclick = function () {
      // Set practice mode to false
      window.isPracticeMode = false;
      window.playerName = "Player"; // Default name

      // Check if user is already logged in (including as guest)
      if (window.authManager && window.authManager.isLoggedIn()) {
        // User is already authenticated, start game directly
        if (typeof window.showMultiplayerSetup === 'function') {
          window.showMultiplayerSetup();
        } else {
          console.error('Multiplayer setup modal not loaded');
        }
      } else {
        // User not authenticated, show auth modal
        if (window.authModal && typeof window.authModal.show === 'function') {
          window.authModal.show('login');
        } else {
          console.error('Auth modal not found');
          // Fallback to showing the login dialog directly
          const loginDialog = document.getElementById('loginDialog');
          if (loginDialog) {
            loginDialog.style.display = 'flex';
          }
        }
      }
    };
  }

  // Add auth modal to practice button as well
  if (practiceBtn) {
    practiceBtn.onclick = function () {
      // Set practice mode to true
      window.isPracticeMode = true;
      window.playerName = "Player"; // Default name

      // Check if user is already logged in (including as guest)
      if (window.authManager && window.authManager.isLoggedIn()) {
        // User is already authenticated, start game directly
        startGameDirectly();
      } else {
        // User not authenticated, show auth modal
        if (window.authModal && typeof window.authModal.show === 'function') {
          window.authModal.show('login');
        } else {
          console.error('Auth modal not found');
          // Fallback to showing the login dialog directly
          const loginDialog = document.getElementById('loginDialog');
          if (loginDialog) {
            loginDialog.style.display = 'flex';
          }
        }
      }
    };
  }

  // Save game results
  window.saveGameResult = function (gameData) {
    if (window.authManager && window.authManager.isLoggedIn()) {
      window.authManager.saveGameResult(gameData);
    }
  };

  // Auth callbacks
  window.onAuthSuccess = function () {
    // Refresh the page or update UI as needed
    updateUI(window.authManager.getCurrentUser());

    // Check if we need to continue with the game flow
    const user = window.authManager.getCurrentUser();
    if (user) {
      // Set player name from user data
      if (typeof window.playerName !== 'undefined') {
        window.playerName = user.displayName || user.username || "Player" + Math.floor(Math.random() * 1000);
      }

      // Only continue with game flow if practiceMode is explicitly set
      // This means the user clicked a game button and then authenticated
      if (typeof window.practiceMode !== 'undefined' && window.practiceMode !== null) {
        // Hide home screen and start game
        const homeScreen = document.getElementById("homeScreen");
        if (homeScreen) {
          homeScreen.style.display = "none";
        }

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

        // Reset practiceMode after use
        window.practiceMode = null;
      }
      // If practiceMode is not set, user just logged in/registered from home page
      // Keep them on the home page - no additional action needed
    }
  };

  window.onAuthLogout = function () {
    // Redirect to home or refresh
    window.location.href = '/';
  };

  window.onPreferencesUpdated = function (preferences) {
    // Update game preferences
    if (window.updateGamePreferences) {
      window.updateGamePreferences(preferences);
    }
  };
});