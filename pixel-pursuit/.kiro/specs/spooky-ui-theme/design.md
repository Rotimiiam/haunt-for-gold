# Design Document

## Introduction

This document outlines the technical design for implementing the Haunt For Gold spooky UI theme. The design focuses on creating an immersive Halloween experience through CSS custom properties, canvas-based effects, and modular component architecture.

## Implementation Status: ✅ COMPLETE

## Design Overview

The spooky theme implementation uses a layered approach:
1. CSS Custom Properties for theming consistency
2. Canvas overlays for particle effects (fog, ghosts)
3. CSS animations for UI element effects
4. Audio manager for atmospheric sounds
5. Sprite system for Halloween-themed game elements

## Architecture

### Component Structure

```
public/
├── css/
│   ├── spooky-theme.css      # Main theme variables and base styles
│   ├── spooky-animations.css  # Keyframe animations
│   └── spooky-components.css  # Themed UI components
├── js/
│   ├── spooky-effects.js     # Particle systems and canvas effects
│   ├── spooky-audio.js       # Atmospheric sound manager
│   └── spooky-sprites.js     # Halloween sprite definitions
└── assets/
    ├── spooky/
    │   ├── background-haunted.png
    │   ├── sprites-halloween.png
    │   └── fog-overlay.png
    └── sounds/
        ├── ambient-haunted.mp3
        ├── coin-mystical.mp3
        └── bomb-ghostly.mp3
```

## Detailed Design

### 1. CSS Theme System

```css
:root {
  /* Spooky Color Palette */
  --spooky-black: #0d0d0d;
  --haunted-purple: #1a0a2e;
  --midnight-blue: #16213e;
  --ghost-green: #00ff41;
  --pumpkin-orange: #ff6b00;
  --blood-red: #8b0000;
  --cursed-gold: #ffd700;
  --bone-white: #e8e8e8;
  --fog-white: rgba(255, 255, 255, 0.1);
  
  /* Glow Effects */
  --ghost-glow: 0 0 20px rgba(0, 255, 65, 0.5);
  --pumpkin-glow: 0 0 15px rgba(255, 107, 0, 0.6);
  --blood-glow: 0 0 10px rgba(139, 0, 0, 0.5);
  
  /* Transitions */
  --spooky-transition: all 0.3s ease-in-out;
  --flicker-transition: opacity 0.1s ease-in-out;
}
```

### 2. Fog Particle System

The fog effect uses a canvas overlay with animated particles:

```javascript
class FogParticleSystem {
  constructor(canvas) {
    this.particles = [];
    this.maxParticles = 50;
  }
  
  createParticle() {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      size: Math.random() * 100 + 50,
      speedX: Math.random() * 0.5 - 0.25,
      opacity: Math.random() * 0.3
    };
  }
  
  update() {
    // Move particles, wrap around edges
    // Vary opacity for ethereal effect
  }
  
  render(ctx) {
    // Draw radial gradient circles for fog
  }
}
```

### 3. Spooky Button Component

```css
.spooky-btn {
  background: linear-gradient(180deg, var(--haunted-purple), var(--spooky-black));
  border: 2px solid var(--ghost-green);
  color: var(--bone-white);
  padding: 16px 32px;
  font-family: 'Creepster', cursive;
  text-shadow: var(--ghost-glow);
  box-shadow: var(--ghost-glow);
  clip-path: polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%);
  transition: var(--spooky-transition);
}

.spooky-btn:hover {
  background: linear-gradient(180deg, var(--midnight-blue), var(--haunted-purple));
  box-shadow: 0 0 30px rgba(0, 255, 65, 0.8);
  transform: scale(1.05);
}

.spooky-btn::before {
  content: '💀';
  margin-right: 8px;
}
```

### 4. Haunted Scoreboard

```css
.haunted-scoreboard {
  background: url('assets/spooky/parchment.png');
  background-size: cover;
  border: 3px solid var(--ancient-gold);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 
    inset 0 0 20px rgba(0, 0, 0, 0.5),
    var(--pumpkin-glow);
  position: relative;
}

.haunted-scoreboard::before {
  content: '🕯️';
  position: absolute;
  top: -15px;
  left: 10px;
  font-size: 24px;
  animation: flicker 2s infinite;
}

@keyframes flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
  75% { opacity: 0.9; }
}
```

### 5. Ghost Enemy Sprites

The sprite system defines Halloween-themed characters:

```javascript
const SPOOKY_SPRITES = {
  ghost: {
    frames: 4,
    width: 32,
    height: 32,
    animation: 'float'
  },
  skeleton: {
    frames: 6,
    width: 32,
    height: 48,
    animation: 'walk'
  },
  pumpkin: {
    frames: 2,
    width: 24,
    height: 24,
    animation: 'glow'
  },
  cursedCoin: {
    frames: 8,
    width: 16,
    height: 16,
    animation: 'spin'
  }
};
```

### 6. Audio Manager

```javascript
class SpookyAudioManager {
  constructor() {
    this.sounds = {
      ambient: new Audio('sounds/ambient-haunted.mp3'),
      coinCollect: new Audio('sounds/coin-mystical.mp3'),
      bombExplode: new Audio('sounds/bomb-ghostly.mp3'),
      victory: new Audio('sounds/victory-eerie.mp3')
    };
    this.sounds.ambient.loop = true;
  }
  
  playAmbient() {
    this.sounds.ambient.volume = 0.3;
    this.sounds.ambient.play();
  }
  
  playCoinCollect() {
    this.sounds.coinCollect.currentTime = 0;
    this.sounds.coinCollect.play();
  }
}
```

## Correctness Properties

### Property 1: Theme Consistency
- All UI elements MUST use CSS custom properties from the spooky theme
- No hardcoded colors outside the defined palette
- Verified by: CSS linting and visual inspection

### Property 2: Animation Performance
- All animations MUST run at 60fps on mid-range devices
- Particle systems MUST use requestAnimationFrame
- Verified by: Performance profiling, FPS monitoring

### Property 3: Accessibility Compliance
- All text MUST meet WCAG AA contrast ratio (4.5:1)
- Focus indicators MUST be visible on all interactive elements
- Verified by: Lighthouse accessibility audit

### Property 4: Responsive Behavior
- Theme MUST render correctly on screens 320px to 4K
- Touch targets MUST be minimum 44x44px on mobile
- Verified by: Cross-device testing

### Property 5: Reduced Motion Support
- Animations MUST respect prefers-reduced-motion media query
- Static alternatives MUST maintain spooky aesthetic
- Verified by: Testing with reduced motion enabled

## Dependencies

- Google Fonts: 'Creepster' for spooky titles
- Existing game canvas and rendering system
- Socket.IO for multiplayer sync of effects
