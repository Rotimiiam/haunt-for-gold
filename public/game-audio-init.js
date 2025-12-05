// Game Audio Initialization
// Game audio init script loaded

(function() {
  'use strict';

  // Wait for sound manager to be ready
  function initAudio() {
    if (!window.soundManager) {
      setTimeout(initAudio, 100);
      return;
    }

    console.log('Initializing game audio...');

    // Start background music on home screen
    const startHomeMusic = () => {
      const homeScreen = document.getElementById('homeScreen');
      if (homeScreen && window.getComputedStyle(homeScreen).display !== 'none') {
        window.soundManager.playBackgroundMusic('halloween-music', true);
        console.log('Home screen music started');
      }
    };

    // Start music on first user interaction (required by browsers)
    const startOnInteraction = () => {
      startHomeMusic();
      document.removeEventListener('click', startOnInteraction);
      document.removeEventListener('keydown', startOnInteraction);
      document.removeEventListener('gamepadconnected', startOnInteraction);
    };

    document.addEventListener('click', startOnInteraction, { once: true });
    document.addEventListener('keydown', startOnInteraction, { once: true });
    window.addEventListener('gamepadconnected', startOnInteraction, { once: true });

    // Try to start immediately (may be blocked by browser)
    startHomeMusic();

    // Switch music when game starts
    const originalStartGame = window.startGame;
    if (originalStartGame) {
      window.startGame = function(...args) {
        // Switch to in-game music
        window.soundManager.playBackgroundMusic('haunted-house', true);
        console.log('In-game music started');
        return originalStartGame.apply(this, args);
      };
    }

    // Add music toggle button
    addMusicToggleButton();
  }

  /**
   * Add music toggle button to UI
   */
  function addMusicToggleButton() {
    // Check if button already exists
    if (document.getElementById('musicToggleBtn')) return;

    const button = document.createElement('button');
    button.id = 'musicToggleBtn';
    button.className = 'audio-toggle-btn';
    button.innerHTML = window.soundManager.musicEnabled ? '🔊' : '🔇';
    button.title = 'Toggle Music';
    
    button.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: rgba(26, 10, 46, 0.9);
      border: 2px solid var(--ghost-green, #00ff41);
      color: var(--ghost-green, #00ff41);
      font-size: 1.5rem;
      cursor: pointer;
      z-index: 9998;
      transition: all 0.3s ease;
      box-shadow: 0 0 15px rgba(0, 255, 65, 0.3);
    `;

    button.addEventListener('mouseenter', () => {
      button.style.transform = 'scale(1.1)';
      button.style.boxShadow = '0 0 25px rgba(0, 255, 65, 0.5)';
    });

    button.addEventListener('mouseleave', () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 0 15px rgba(0, 255, 65, 0.3)';
    });

    button.addEventListener('click', () => {
      const enabled = window.soundManager.toggleMusic();
      button.innerHTML = enabled ? '🔊' : '🔇';
      button.title = enabled ? 'Mute Music' : 'Unmute Music';
      
      // Visual feedback
      button.style.transform = 'scale(0.9)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 100);
    });

    document.body.appendChild(button);
    console.log('Music toggle button added');
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAudio);
  } else {
    initAudio();
  }

})();

// Game audio init loaded
