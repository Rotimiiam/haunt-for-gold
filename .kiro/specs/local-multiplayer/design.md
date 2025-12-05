# Design Document

## Overview

The local multiplayer system enables 2-4 players to compete on a single device using shared screen gameplay. The design focuses on fair input handling, clear visual distinction between players, and seamless integration with the existing game mechanics. The system supports multiple input methods including keyboard, mouse, and touch controls while maintaining the core Gold Grab gameplay experience.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Side   │    │   Game Engine   │    │   Input System  │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │Local Multi  │ │◄──►│ │Game State   │ │◄──►│ │Keyboard     │ │
│ │UI Components│ │    │ │Manager      │ │    │ │Handler      │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │Player       │ │◄──►│ │Collision    │ │◄──►│ │Mouse/Touch  │ │
│ │Indicators   │ │    │ │Detection    │ │    │ │Handler      │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │Score        │ │◄──►│ │Local Player │ │◄──►│ │Input        │ │
│ │Display      │ │    │ │Manager      │ │    │ │Multiplexer  │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Controller Detection and Input Mapping

```
Controller Detection Priority:
1. Gamepad API controllers (Xbox, PlayStation, generic)
2. Keyboard (fallback for single player or testing)
3. Mouse (supplementary input)
4. Touch (mobile devices)

Input Assignment:
Player 1: First detected gamepad
Player 2: Second detected gamepad  
Player 3: Third detected gamepad
Player 4: Fourth detected gamepad

Fallback for development/testing:
Player 1: WASD keys + Space
Player 2: Arrow keys + Enter
Player 3: IJKL keys + U
Player 4: Mouse movement + Click
```

### Game State Management

```
LocalMultiplayerGame {
  players: LocalPlayer[],
  gameSettings: LocalGameSettings,
  inputManager: InputManager,
  collisionResolver: CollisionResolver,
  scoreTracker: ScoreTracker,
  gameTimer: GameTimer
}
```

## Components and Interfaces

### Frontend Components

#### ControllerDetection Component
```javascript
class ControllerDetection {
  // Gamepad API integration for controller detection
  // Real-time controller connection/disconnection monitoring
  // Controller capability testing and validation
  // Fallback input method detection
}
```

#### LocalMultiplayerSetup Component
```javascript
class LocalMultiplayerSetup {
  // Controller-based player count selection (2-4 players)
  // Automatic controller assignment and testing
  // Game settings configuration
  // Player name and character selection per controller
}
```

#### LocalGameView Component
```javascript
class LocalGameView {
  // Shared screen game display
  // Multiple player rendering
  // Real-time score display for all players
  // Game timer and status indicators
}
```

#### PlayerIndicator Component
```javascript
class PlayerIndicator {
  // Individual player visual identification
  // Score display and updates
  // Status indicators (active, eliminated, etc.)
  // Achievement notifications
}
```

#### LocalGameHUD Component
```javascript
class LocalGameHUD {
  // Multi-player score board
  // Game timer and round information
  // Control reminders for each player
  // Pause and settings access
}
```

### Core Game Classes

#### LocalPlayer Class
```javascript
class LocalPlayer {
  constructor(id, name, controls, color, character) {
    this.id = id;
    this.name = name;
    this.controls = controls;
    this.color = color;
    this.character = character;
    this.score = 0;
    this.position = { x: 0, y: 0 };
    this.isActive = true;
    this.stats = new PlayerStats();
  }
  
  handleInput(inputType, inputData) {
    // Process player-specific input
  }
  
  update(deltaTime) {
    // Update player state
  }
  
  render(context) {
    // Render player with unique visual indicators
  }
}
```

#### ControllerManager Class
```javascript
class ControllerManager {
  constructor() {
    this.connectedControllers = new Map();
    this.controllerStates = new Map();
    this.connectionListeners = [];
  }
  
  detectControllers() {
    // Use Gamepad API to detect connected controllers
  }
  
  onControllerConnect(callback) {
    // Register callback for controller connection events
  }
  
  onControllerDisconnect(callback) {
    // Register callback for controller disconnection events
  }
  
  getAvailableControllers() {
    // Return list of available controllers for player assignment
  }
}
```

#### InputManager Class
```javascript
class InputManager {
  constructor(controllerManager) {
    this.controllerManager = controllerManager;
    this.playerControllers = new Map();
    this.inputQueue = [];
    this.gamepadStates = new Map();
  }
  
  assignControllerToPlayer(playerId, controllerId) {
    // Assign specific controller to player
  }
  
  handleGamepadInput(controllerId, inputData) {
    // Route gamepad input to appropriate player
  }
  
  processInputQueue() {
    // Handle simultaneous inputs fairly
  }
}
```

#### CollisionResolver Class
```javascript
class CollisionResolver {
  resolvePlayerCollision(player1, player2) {
    // Handle player-to-player collisions
  }
  
  resolvePlayerCoinCollision(player, coin) {
    // Determine coin collection priority
  }
  
  resolvePlayerEnemyCollision(player, enemy) {
    // Handle enemy collision effects
  }
}
```

## Data Models

### Local Game Settings
```javascript
{
  playerCount: number,        // 2-4 players
  gameDuration: number,       // Game length in seconds
  winCondition: string,       // 'score', 'time', 'coins'
  targetScore: number,        // Winning score threshold
  difficulty: string,         // 'easy', 'medium', 'hard'
  mapSize: string,           // 'small', 'medium', 'large'
  powerUpsEnabled: boolean,   // Enable special power-ups
  friendlyFire: boolean,      // Allow player interference
  respawnEnabled: boolean,    // Allow respawning after elimination
  customRules: object        // Additional game modifications
}
```

### Control Schemes
```javascript
const CONTROL_SCHEMES = {
  player1: {
    up: 'KeyW',
    down: 'KeyS',
    left: 'KeyA',
    right: 'KeyD',
    action: 'Space'
  },
  player2: {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    action: 'Enter'
  },
  player3: {
    up: 'KeyI',
    down: 'KeyK',
    left: 'KeyJ',
    right: 'KeyL',
    action: 'KeyU'
  },
  player4: {
    type: 'mouse',
    movement: 'mouse',
    action: 'click'
  }
};
```

### Player Visual Configuration
```javascript
{
  playerId: string,
  name: string,
  character: string,          // Character sprite set
  primaryColor: string,       // Main player color
  secondaryColor: string,     // Accent color
  indicator: {
    shape: string,            // Circle, square, triangle, star
    size: number,
    borderColor: string,
    glowEffect: boolean
  },
  nameTag: {
    visible: boolean,
    position: string,         // 'above', 'below', 'side'
    fontSize: number,
    color: string
  }
}
```

## Error Handling

### Input Conflict Resolution
- Priority system for simultaneous inputs
- Input buffering for fair processing
- Conflict detection and resolution algorithms
- Graceful handling of input device disconnection

### Player Management
- Handling player dropout during gameplay
- Reconnection support for temporary disconnections
- Game state preservation when players leave
- Automatic game adjustment for remaining players

### Performance Optimization
- Efficient rendering for multiple players
- Input processing optimization
- Memory management for local game state
- Frame rate maintenance with multiple entities

## Testing Strategy

### Unit Tests
- Input manager functionality
- Collision detection accuracy
- Player state management
- Score calculation and tracking
- Control scheme validation

### Integration Tests
- Multi-player input handling
- Game state synchronization
- Visual rendering with multiple players
- Settings configuration and application
- Player join/leave scenarios

### End-to-End Tests
- Complete local multiplayer game sessions
- Different player count configurations
- Various control scheme combinations
- Game completion and scoring
- Settings persistence and loading

### Usability Tests
- Control responsiveness and fairness
- Visual clarity with multiple players
- Setup process ease of use
- Game balance and enjoyment
- Accessibility for different skill levels

## Performance Considerations

### Rendering Optimization
- Efficient sprite batching for multiple players
- Optimized collision detection algorithms
- Reduced draw calls through sprite atlasing
- Dynamic level-of-detail for distant players

### Input Processing
- Low-latency input handling
- Fair input queue processing
- Efficient event delegation
- Input prediction for smooth movement

### Memory Management
- Efficient player state storage
- Garbage collection optimization
- Resource pooling for game objects
- Memory leak prevention

## Accessibility Features

### Visual Accessibility
- High contrast mode support
- Colorblind-friendly player indicators
- Adjustable UI scaling
- Clear visual separation between players

### Input Accessibility
- Customizable control schemes
- One-handed control options
- Adjustable input sensitivity
- Alternative input method support

### Cognitive Accessibility
- Clear setup instructions
- Visual control reminders
- Simplified game mode options
- Pause and resume functionality