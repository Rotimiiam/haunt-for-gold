// Sound Manager - Handles all game audio
// Sound manager script loaded

/**
 * SoundManager class - Manages background music and sound effects
 */
class SoundManager {
  constructor() {
    this.sounds = {};
    this.backgroundMusic = null;
    this.currentTrack = null;
    this.musicEnabled = true;
    this.sfxEnabled = true;
    this.musicVolume = 0.3;
    this.sfxVolume = 0.5;
    
    // Load settings from localStorage
    this.loadSettings();
    
    console.log("SoundManager initialized");
  }

  /**
   * Load sound settings from localStorage
   */
  loadSettings() {
    const settings = localStorage.getItem('sound_settings');
    if (settings) {
      try {
        const parsed = JSON.parse(settings);
        this.musicEnabled = parsed.musicEnabled !== undefined ? parsed.musicEnabled : true;
        this.sfxEnabled = parsed.sfxEnabled !== undefined ? parsed.sfxEnabled : true;
        this.musicVolume = parsed.musicVolume !== undefined ? parsed.musicVolume : 0.3;
        this.sfxVolume = parsed.sfxVolume !== undefined ? parsed.sfxVolume : 0.5;
      } catch (error) {
        console.error('Error loading sound settings:', error);
      }
    }
  }

  /**
   * Save sound settings to localStorage
   */
  saveSettings() {
    const settings = {
      musicEnabled: this.musicEnabled,
      sfxEnabled: this.sfxEnabled,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume
    };
    localStorage.setItem('sound_settings', JSON.stringify(settings));
  }

  /**
   * Preload a sound
   */
  preloadSound(name, path) {
    if (this.sounds[name]) return;
    
    const audio = new Audio(path);
    audio.preload = 'auto';
    this.sounds[name] = audio;
    
    console.log(`Preloaded sound: ${name}`);
  }

  /**
   * Preload all game sounds
   */
  preloadAllSounds() {
    // Background music
    this.preloadSound('halloween-music', '/sounds/halloween-background-music-405067.mp3');
    this.preloadSound('haunted-house', '/sounds/Haunted House.mpga');
    this.preloadSound('8bit-music', '/sounds/the-return-of-the-8-bit-era-301292.mp3');
    
    // Sound effects
    this.preloadSound('witch-cackle', '/sounds/witch-cackle.mp4a');
    this.preloadSound('explosion', '/sounds/zapsplat_explosion_short_airy_large_002_92191.mp3');
    
    console.log('All sounds preloaded');
  }

  /**
   * Play background music
   */
  playBackgroundMusic(trackName = 'halloween-music', loop = true) {
    if (!this.musicEnabled) return;
    
    // Stop current music if playing
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
    }
    
    // Get the track
    const track = this.sounds[trackName];
    if (!track) {
      console.warn(`Background music track not found: ${trackName}`);
      return;
    }
    
    this.backgroundMusic = track;
    this.currentTrack = trackName;
    this.backgroundMusic.loop = loop;
    this.backgroundMusic.volume = this.musicVolume;
    
    // Play with error handling
    const playPromise = this.backgroundMusic.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log(`Playing background music: ${trackName}`);
        })
        .catch(error => {
          console.warn('Background music autoplay prevented:', error);
          // Add click listener to start music on user interaction
          this.addAutoplayFallback();
        });
    }
  }

  /**
   * Add fallback for autoplay restrictions
   */
  addAutoplayFallback() {
    const startMusic = () => {
      if (this.backgroundMusic && this.musicEnabled) {
        this.backgroundMusic.play().catch(e => console.warn('Music play failed:', e));
      }
      // Remove listeners after first interaction
      document.removeEventListener('click', startMusic);
      document.removeEventListener('keydown', startMusic);
    };
    
    document.addEventListener('click', startMusic, { once: true });
    document.addEventListener('keydown', startMusic, { once: true });
  }

  /**
   * Stop background music
   */
  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
      console.log('Background music stopped');
    }
  }

  /**
   * Pause background music
   */
  pauseBackgroundMusic() {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      console.log('Background music paused');
    }
  }

  /**
   * Resume background music
   */
  resumeBackgroundMusic() {
    if (this.backgroundMusic && this.musicEnabled) {
      this.backgroundMusic.play().catch(e => console.warn('Resume failed:', e));
      console.log('Background music resumed');
    }
  }

  /**
   * Play sound effect
   */
  playSoundEffect(soundName, volume = null) {
    if (!this.sfxEnabled) return;
    
    const sound = this.sounds[soundName];
    if (!sound) {
      console.warn(`Sound effect not found: ${soundName}`);
      return;
    }
    
    // Clone the audio to allow overlapping sounds
    const soundClone = sound.cloneNode();
    soundClone.volume = volume !== null ? volume : this.sfxVolume;
    
    soundClone.play().catch(error => {
      console.warn(`Failed to play sound effect ${soundName}:`, error);
    });
    
    // Clean up after playing
    soundClone.addEventListener('ended', () => {
      soundClone.remove();
    });
  }

  /**
   * Play witch cackle
   */
  playWitchCackle() {
    this.playSoundEffect('witch-cackle', this.sfxVolume * 1.2);
  }

  /**
   * Play explosion
   */
  playExplosion() {
    this.playSoundEffect('explosion');
  }

  /**
   * Set music volume
   */
  setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.musicVolume;
    }
    this.saveSettings();
  }

  /**
   * Set sound effects volume
   */
  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  /**
   * Toggle music on/off
   */
  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    
    if (this.musicEnabled) {
      this.resumeBackgroundMusic();
    } else {
      this.pauseBackgroundMusic();
    }
    
    this.saveSettings();
    return this.musicEnabled;
  }

  /**
   * Toggle sound effects on/off
   */
  toggleSFX() {
    this.sfxEnabled = !this.sfxEnabled;
    this.saveSettings();
    return this.sfxEnabled;
  }

  /**
   * Enable music
   */
  enableMusic() {
    this.musicEnabled = true;
    this.resumeBackgroundMusic();
    this.saveSettings();
  }

  /**
   * Disable music
   */
  disableMusic() {
    this.musicEnabled = false;
    this.pauseBackgroundMusic();
    this.saveSettings();
  }

  /**
   * Enable sound effects
   */
  enableSFX() {
    this.sfxEnabled = true;
    this.saveSettings();
  }

  /**
   * Disable sound effects
   */
  disableSFX() {
    this.sfxEnabled = false;
    this.saveSettings();
  }

  /**
   * Get current settings
   */
  getSettings() {
    return {
      musicEnabled: this.musicEnabled,
      sfxEnabled: this.sfxEnabled,
      musicVolume: this.musicVolume,
      sfxVolume: this.sfxVolume,
      currentTrack: this.currentTrack
    };
  }

  /**
   * Clean up
   */
  destroy() {
    this.stopBackgroundMusic();
    Object.values(this.sounds).forEach(sound => {
      sound.pause();
      sound.src = '';
    });
    this.sounds = {};
    console.log('SoundManager destroyed');
  }
}

// Create global instance
if (typeof window !== 'undefined') {
  window.SoundManager = SoundManager;
  window.soundManager = new SoundManager();
  
  // Preload sounds when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.soundManager.preloadAllSounds();
    });
  } else {
    window.soundManager.preloadAllSounds();
  }
}

// Sound manager loaded
