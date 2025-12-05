// Game Lifecycle Manager
// Prevents multiple game instances from running simultaneously

(function() {
  'use strict';

  // Global game state tracker
  window.gameLifecycle = {
    activeGame: null,
    isGameRunning: false,
    
    // Start a new game
    startGame: function(gameType) {
      if (this.isGameRunning) {
        console.warn('Game already running, stopping previous game');
        this.stopGame();
      }
      
      this.activeGame = gameType;
      this.isGameRunning = true;
      console.log(`Game lifecycle: Started ${gameType} game`);
    },
    
    // Stop the current game
    stopGame: function() {
      if (this.isGameRunning) {
        console.log(`Game lifecycle: Stopping ${this.activeGame} game`);
        this.activeGame = null;
        this.isGameRunning = false;
      }
    },
    
    // Check if a game is running
    isActive: function() {
      return this.isGameRunning;
    },
    
    // Get the active game type
    getActiveGame: function() {
      return this.activeGame;
    }
  };

  // Game lifecycle manager loaded
})();
