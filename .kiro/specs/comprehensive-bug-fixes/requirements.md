# Comprehensive Game Bug Fixes - Requirements

## Overview
Systematically fix all remaining bugs and issues across all game modes to ensure a polished, production-ready experience.

## Acceptance Criteria

### 1. Visual & Theme Issues
**AC-1.1:** Game background must show spooky purple gradient (not grey) in all game modes
**AC-1.2:** Spooky decorations (fog, bats, trees, tombstones) must be visible during gameplay
**AC-1.3:** Grass texture must render green inside the game canvas
**AC-1.4:** All UI elements must use spooky theme colors (purple/green, not grey)
**AC-1.5:** Vignette overlay must be visible but not block game content

### 2. Local Multiplayer Issues
**AC-2.1:** Game canvas must display when local multiplayer starts
**AC-2.2:** Game must completely stop when returning to home screen (no background loops)
**AC-2.3:** All intervals and animation frames must be cleared on game end
**AC-2.4:** Game container must show/hide properly during transitions
**AC-2.5:** Controllers must remain responsive throughout the game

### 3. Online Multiplayer Issues
**AC-3.1:** Game must stop running when returning to home from online game
**AC-3.2:** Socket connections must be properly cleaned up on disconnect
**AC-3.3:** Rematch functionality must work without memory leaks
**AC-3.4:** Waiting screen must hide when game starts
**AC-3.5:** Winner screen must display correctly with spooky theme

### 4. Practice Mode Issues
**AC-4.1:** Game must stop when returning to home from practice mode
**AC-4.2:** Game renderer must initialize before game starts
**AC-4.3:** Background must render correctly with grass texture
**AC-4.4:** All game loops must be cleared on exit

### 5. Screen Transitions
**AC-5.1:** Home screen must hide when any game mode starts
**AC-5.2:** Game container must show when game starts
**AC-5.3:** Winner/waiting screens must not show on home screen
**AC-5.4:** Transitions must be smooth without flickering
**AC-5.5:** Z-index layering must be correct (decorations < content < overlays)

### 6. Game Loop Management
**AC-6.1:** All setInterval timers must be tracked and cleared
**AC-6.2:** All requestAnimationFrame calls must be tracked and cancelled
**AC-6.3:** Game state must be reset when returning to home
**AC-6.4:** No memory leaks from uncleaned event listeners
**AC-6.5:** Gamepad polling must stop when game ends

### 7. Audio Management
**AC-7.1:** Background music must stop when returning to home
**AC-7.2:** Sound effects must not play after game ends
**AC-7.3:** Audio must be properly cleaned up to prevent memory leaks

### 8. Controller Support
**AC-8.1:** Controller vibration must stop when game ends
**AC-8.2:** Controller navigation must work on all screens
**AC-8.3:** Controller disconnect must be handled gracefully

## Non-Functional Requirements

### Performance
- Game must run at 60 FPS consistently
- No memory leaks from repeated game starts/stops
- Smooth transitions between screens

### User Experience
- All visual elements must be consistent with spooky theme
- No grey backgrounds or elements (except intentional design)
- Clear visual feedback for all actions
- Responsive to all input methods (keyboard, mouse, controller)

### Code Quality
- All game loops must be properly managed
- Event listeners must be cleaned up
- No console errors during normal gameplay
- Proper error handling for edge cases
