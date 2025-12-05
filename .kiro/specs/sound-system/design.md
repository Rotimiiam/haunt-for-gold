# Sound System - Design Document

## Overview

This design implements a comprehensive audio system for Haunt For Gold with background music, sound effects, and user controls. The system provides immersive spooky-themed audio, smooth transitions, and persistent user preferences while maintaining performance and browser compatibility.

## Architecture

### Core Components

1. **Audio Manager**
   - Manages all audio playback
   - Handles audio loading and caching
   - Controls volume levels
   - Manages audio lifecycle

2. **Music Controller**
   - Plays background music tracks
   - Handles music transitions
   - Implements seamless looping
   - Manages music themes per game mode

3. **Sound Effects Controller**
   - Plays one-shot sound effects
   - Manages sound effect pooling
   - Prevents sound overlap issues
   - Handles spatial audio (optional)

4. **Settings Manager**
   - Stores audio preferences
   - Persists settings to localStorage
   - Applies volume changes
   - Manages mute states

## Components and Interfaces

### AudioManager

```javascript
class AudioManager {
  constructor() {
    this.audioContext = null;
    this.sounds = new Map(); // sound ID -> audio buffer
    this.musicVolume = 0.7;
    this.sfxVolume = 0.8;
    this.masterMute = false;
  }

  // Initialization
  initialize();
  loadAudio(id, url);
  preloadAllAudio();
  
  // Playback control
  play(soundId, options);
  stop(soundId);
  pause(soundId);
  resume(soundId);
  
  // Volume control
  setMusicVolume(volume);
  setSFXVolume(volume);
  setMasterMute(muted);
  
  // Cleanup
  cleanup();
}
```

### MusicController

```javascript
class MusicController {
  constructor(audioManager) {
    this.audioManager = audioManager;
    this.currentTrack = null;
    this.tracks = {
      menu: 'menu-theme.mp3',
      practice: 'practice-theme.mp3',
      multiplayer: 'multiplayer-theme.mp3',
      waiting: 'waiting-theme.mp3',
      leaderboard: 'ambient-theme.mp3'
    };
  }

  // Music playback
  playTrack(trackName);
  stopCurrentTrack();
  fadeOut(duration);
  fadeIn(duration);
  
  // Transitions
  transitionTo(newTrack, fadeTime);
  crossfade(newTrack, duration);
  
  // Looping
  enableLoop(trackName);
  onTrackEnd(callback);
}
```

### SoundEffectsController

```javascript
class SoundEffectsController {
  constructor(audioManager) {
    this.audioManager = audioManager;
    this.activeSounds = new Set();
    this.soundPool = new Map(); // sound ID -> pool of instances
  }

  // Sound effects
  playCoinCollect();
  playExplosion();
  playDamage();
  playMovement();
  playLevelUp();
  playVictory();
  playDefeat();
  
  // Pooling
  createSoundPool(soundId, poolSize);
  getAvailableSound(soundId);
  returnSoundToPool(soundId, instance);
  
  // Control
  stopAllSounds();
}
```

### SettingsManager

```javascript
class SettingsManager {
  // Settings persistence
  saveSettings(settings);
  loadSettings();
  
  // Volume settings
  getMusicVolume();
  getSFXVolume();
  getMasterMute();
  
  // Apply settings
  applySettings(audioManager);
}
```

## Data Models

### AudioSettings

```javascript
{
  musicVolume: number, // 0-1
  sfxVolume: number, // 0-1
  musicMuted: boolean,
  sfxMuted: boolean,
  masterMuted: boolean
}
```

### SoundEffect

```javascript
{
  id: string,
  url: string,
  volume: number,
  loop: boolean,
  poolSize: number
}
```

### MusicTrack

```javascript
{
  id: string,
  url: string,
  loop: boolean,
  fadeInDuration: number,
  fadeOutDuration: number
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Auto-play on game start
*For any* game start, background music should begin playing automatically.
**Validates: Requirements 1.1**

### Property 2: Music looping
*For any* music track that reaches its end, it should restart seamlessly.
**Validates: Requirements 1.4**

### Property 3: Sound effect triggering
*For any* game action (coin collect, bomb hit, etc.), the corresponding sound effect should play.
**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7**

### Property 4: Music mute toggle
*For any* music toggle action, music should be muted or unmuted accordingly.
**Validates: Requirements 3.1**

### Property 5: Volume change responsiveness
*For any* volume slider adjustment, audio levels should change immediately.
**Validates: Requirements 3.3**

### Property 6: Settings persistence
*For any* audio settings saved, loading them should restore the same settings.
**Validates: Requirements 3.4**

### Property 7: Master mute
*For any* master mute activation, no sounds should play until unmuted.
**Validates: Requirements 3.5**

### Property 8: Mode-specific music
*For any* game mode, the appropriate music track for that mode should play.
**Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5**

## Error Handling

### Audio Loading Errors
- Gracefully handle missing audio files
- Continue game without audio if loading fails
- Log audio errors for debugging
- Provide fallback silent mode

### Browser Compatibility
- Handle browsers without Web Audio API
- Fall back to HTML5 Audio if needed
- Handle autoplay restrictions
- Require user interaction for first sound

### Playback Errors
- Handle audio context suspension
- Resume audio context on user interaction
- Prevent multiple simultaneous plays of same sound
- Handle audio buffer exhaustion

## Testing Strategy

### Unit Testing Framework
- Use existing test infrastructure
- Mock Web Audio API for testing
- Test audio manager in isolation

### Property-Based Testing

We will use **fast-check** (JavaScript property-based testing library) to verify universal properties.

**Configuration**: Each property test should run a minimum of 100 iterations.

**Tagging**: Each property-based test must include a comment with format:
`// Feature: sound-system, Property {number}: {property_text}`

## Implementation Notes

### Spooky Theme Audio
- Menu music: eerie organ melody
- Game music: upbeat spooky chase theme
- Coin collect: mystical chime
- Explosion: ghostly boom
- Damage: spectral hit
- Victory: triumphant haunted fanfare
- Defeat: melancholic ghost wail

### Performance Considerations
- Preload all audio on game load
- Use audio sprite sheets for small sounds
- Limit simultaneous sound effects
- Use object pooling for repeated sounds
- Compress audio files appropriately

### Browser Compatibility
- Support Web Audio API (modern browsers)
- Fall back to HTML5 Audio (older browsers)
- Handle iOS audio restrictions
- Implement user gesture requirement

### Audio File Formats
- Primary: MP3 (broad compatibility)
- Fallback: OGG (Firefox, Chrome)
- Compression: Balance quality vs file size
- Bitrate: 128kbps for music, 64kbps for SFX

### Integration Points
- Integrate with game-core.js for event triggers
- Work with UI for volume controls
- Coordinate with game-lifecycle-manager for cleanup
- Update settings UI for audio controls
