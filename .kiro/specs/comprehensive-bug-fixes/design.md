# Comprehensive Game Bug Fixes - Design Document

## Overview

This design addresses systematic bug fixes across all game modes (Practice, Local Multiplayer, Online Multiplayer) to ensure proper visual rendering, game lifecycle management, and resource cleanup. The fixes focus on three core areas: visual/theme consistency, game loop management, and proper cleanup on mode transitions.

## Architecture

### Core Components

1. **Game Lifecycle Manager** (`game-lifecycle-manager.js`)
   - Centralized control for game state transitions
   - Tracks all active timers, animation frames, and event listeners
   - Ensures proper cleanup on game end

2. **Visual Theme Manager**
   - Ensures spooky theme consistency across all screens
   - Manages background rendering and decorations
   - Controls z-index layering

3. **Resource Cleanup System**
   - Tracks and cleans up intervals, animation frames
   - Manages audio playback lifecycle
   - Handles controller vibration cleanup

4. **Screen Transition Controller**
   - Manages visibility of home, game, waiting, and winner screens
   - Ensures smooth transitions without flickering
   - Maintains proper element layering

## Components and Interfaces

### GameLifecycleManager

```javascript
class GameLifecycleManager {
  constructor() {
    this.activeTimers = new Set();
    this.activeAnimationFrames = new Set();
    this.activeEventListeners = [];
    this.currentGameMode = null;
  }

  // Track resources
  registerTimer(timerId);
  registerAnimationFrame(frameId);
  registerEventListener(element, event, handler);

  // Cleanup
  stopGame();
  cleanupAllResources();
  
  // State management
  startGame(mode);
  endGame();
  isGameActive();
}
```

### VisualThemeManager

```javascript
class VisualThemeManager {
  // Background rendering
  renderSpookyBackground(canvas, ctx);
  renderGrassTexture(canvas, ctx);
  
  // Decorations
  initializeDecorations();
  updateDecorations();
  cleanupDecorations();
  
  // Theme application
  applySpookyTheme(element);
  ensureThemeConsistency();
}
```

### ResourceCleanupSystem

```javascript
class ResourceCleanupSystem {
  // Timer management
  clearAllTimers();
  clearAllAnimationFrames();
  
  // Audio cleanup
  stopAllAudio();
  cleanupAudioResources();
  
  // Controller cleanup
  stopControllerVibration();
  cleanupControllerPolling();
  
  // Event listener cleanup
  removeAllEventListeners();
}
```

### ScreenTransitionController

```javascript
class ScreenTransitionController {
  // Screen visibility
  showHomeScreen();
  hideHomeScreen();
  showGameScreen();
  hideGameScreen();
  showWaitingScreen();
  hideWaitingScreen();
  showWinnerScreen();
  hideWinnerScreen();
  
  // Transitions
  transitionToGame(mode);
  transitionToHome();
  
  // Z-index management
  ensureProperLayering();
}
```

## Data Models

### GameState

```javascript
{
  mode: 'practice' | 'local' | 'online' | null,
  isActive: boolean,
  isPaused: boolean,
  resources: {
    timers: Set<number>,
    animationFrames: Set<number>,
    eventListeners: Array<{element, event, handler}>
  }
}
```

### VisualState

```javascript
{
  backgroundRendered: boolean,
  decorationsActive: boolean,
  themeApplied: boolean,
  currentScreen: 'home' | 'game' | 'waiting' | 'winner'
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Resource cleanup completeness
*For any* game session, when the game ends and returns to home, all tracked resources (timers, animation frames, event listeners) should be cleared and the resource tracking sets should be empty.
**Validates: Requirements AC-2.3, AC-3.2, AC-4.4, AC-6.1, AC-6.2, AC-6.4**

### Property 2: Visual theme consistency
*For any* screen or game mode, all visual elements should use the spooky theme colors (purple/green palette) and never show grey backgrounds except where intentionally designed.
**Validates: Requirements AC-1.1, AC-1.4**

### Property 3: Game loop termination
*For any* game mode, when transitioning back to home screen, the game loop should completely stop and no game logic should continue executing in the background.
**Validates: Requirements AC-2.2, AC-3.1, AC-4.1**

### Property 4: Screen visibility exclusivity
*For any* given time, only one primary screen (home, game, waiting, or winner) should be visible, ensuring no overlapping or conflicting displays.
**Validates: Requirements AC-5.1, AC-5.2, AC-5.3**

### Property 5: Audio lifecycle management
*For any* game session, when the game ends, all audio (background music and sound effects) should stop playing and audio resources should be properly released.
**Validates: Requirements AC-7.1, AC-7.2, AC-7.3**

### Property 6: Decoration visibility during gameplay
*For any* active game session, spooky decorations (fog, bats, trees, tombstones) should be visible and rendering on the canvas.
**Validates: Requirements AC-1.2**

### Property 7: Canvas rendering initialization
*For any* game mode start, the game canvas should be visible and the renderer should be fully initialized before game logic begins executing.
**Validates: Requirements AC-2.1, AC-4.2**

## Error Handling

### Resource Cleanup Errors
- If cleanup fails for any resource, log the error but continue cleaning up remaining resources
- Implement defensive cleanup that doesn't throw exceptions
- Track cleanup failures for debugging

### Visual Rendering Errors
- If background rendering fails, fall back to solid color background
- If decorations fail to load, continue game without them
- Log rendering errors to console for debugging

### State Transition Errors
- If screen transition fails, force reset to home screen
- Implement timeout-based fallbacks for stuck transitions
- Ensure game state is always recoverable

### Audio Errors
- If audio cleanup fails, mute all audio channels as fallback
- Handle missing audio files gracefully
- Don't block game functionality on audio errors

## Testing Strategy

### Unit Testing Framework
- Use existing test infrastructure from testing-framework spec
- Test each manager class in isolation
- Mock dependencies for focused testing

### Unit Tests

1. **GameLifecycleManager Tests**
   - Test resource registration and tracking
   - Test cleanup completeness
   - Test state transitions

2. **VisualThemeManager Tests**
   - Test background rendering
   - Test decoration initialization
   - Test theme application

3. **ResourceCleanupSystem Tests**
   - Test timer cleanup
   - Test animation frame cleanup
   - Test audio cleanup
   - Test event listener cleanup

4. **ScreenTransitionController Tests**
   - Test screen visibility toggling
   - Test transition sequences
   - Test z-index management

### Property-Based Testing

We will use **fast-check** (JavaScript property-based testing library) to verify universal properties.

**Configuration**: Each property test should run a minimum of 100 iterations.

**Tagging**: Each property-based test must include a comment with format:
`// Feature: comprehensive-bug-fixes, Property {number}: {property_text}`

**Property Tests**:

1. **Property 1 Test**: Resource cleanup completeness
   - Generate random game sessions with varying numbers of resources
   - Start and end game, verify all resources are cleaned up
   - Tag: `// Feature: comprehensive-bug-fixes, Property 1: Resource cleanup completeness`

2. **Property 2 Test**: Visual theme consistency
   - Generate random UI elements and screens
   - Apply theme and verify color palette compliance
   - Tag: `// Feature: comprehensive-bug-fixes, Property 2: Visual theme consistency`

3. **Property 3 Test**: Game loop termination
   - Generate random game modes and durations
   - End game and verify no background execution
   - Tag: `// Feature: comprehensive-bug-fixes, Property 3: Game loop termination`

4. **Property 4 Test**: Screen visibility exclusivity
   - Generate random screen transition sequences
   - Verify only one primary screen is visible at any time
   - Tag: `// Feature: comprehensive-bug-fixes, Property 4: Screen visibility exclusivity`

5. **Property 5 Test**: Audio lifecycle management
   - Generate random audio playback scenarios
   - End game and verify all audio is stopped
   - Tag: `// Feature: comprehensive-bug-fixes, Property 5: Audio lifecycle management`

### Integration Testing
- Test complete game flow: home → game → home
- Test all three game modes with full lifecycle
- Test rapid mode switching
- Test resource cleanup under stress

### Manual Testing Checklist
- Visual inspection of theme consistency
- Verify decorations are visible during gameplay
- Test all game modes for proper cleanup
- Verify smooth transitions without flickering
- Check for console errors during gameplay

## Implementation Notes

### Priority Order
1. Fix game lifecycle management (highest priority - affects all modes)
2. Fix visual theme issues (high visibility bugs)
3. Fix resource cleanup (prevents memory leaks)
4. Fix screen transitions (polish)

### Integration Points
- Integrate with existing game-core.js
- Work with game-renderer.js for visual fixes
- Coordinate with local-multiplayer-game.js
- Coordinate with multiplayer-mode.js
- Coordinate with practice-mode.js

### Performance Considerations
- Resource tracking should have minimal overhead
- Cleanup should be fast (< 100ms)
- Visual rendering should maintain 60 FPS
- No blocking operations during transitions

### Browser Compatibility
- Test on Chrome, Firefox, Safari, Edge
- Ensure canvas rendering works across browsers
- Verify audio API compatibility
- Test controller API support
