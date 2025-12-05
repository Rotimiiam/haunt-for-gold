# Comprehensive Bug Fixes - Implementation Plan

- [x] 1. Create Game Lifecycle Manager


  - Implement centralized game lifecycle management system
  - Create resource tracking for timers, animation frames, and event listeners
  - Add methods for registering and cleaning up resources
  - _Requirements: AC-2.3, AC-3.2, AC-4.4, AC-6.1, AC-6.2, AC-6.4_

- [ ]* 1.1 Write property test for resource cleanup completeness
  - **Property 1: Resource cleanup completeness**
  - **Validates: Requirements AC-2.3, AC-3.2, AC-4.4, AC-6.1, AC-6.2, AC-6.4**




- [ ] 2. Implement Resource Cleanup System
  - Create ResourceCleanupSystem class with methods for clearing timers, animation frames
  - Add audio cleanup functionality
  - Add controller vibration and polling cleanup
  - Implement event listener cleanup
  - _Requirements: AC-6.1, AC-6.2, AC-6.4, AC-7.1, AC-7.2, AC-7.3, AC-8.1_


- [ ]* 2.1 Write property test for audio lifecycle management
  - **Property 5: Audio lifecycle management**
  - **Validates: Requirements AC-7.1, AC-7.2, AC-7.3**

- [x] 3. Fix Visual Theme Issues

  - Update background rendering to use spooky purple gradient
  - Ensure grass texture renders green inside game canvas
  - Apply spooky theme colors (purple/green) to all UI elements
  - Fix vignette overlay visibility
  - _Requirements: AC-1.1, AC-1.3, AC-1.4, AC-1.5_

- [ ]* 3.1 Write property test for visual theme consistency
  - **Property 2: Visual theme consistency**
  - **Validates: Requirements AC-1.1, AC-1.4**

- [x] 4. Fix Decoration Rendering


  - Ensure spooky decorations (fog, bats, trees, tombstones) are visible during gameplay
  - Fix z-index layering for decorations
  - Integrate decorations with game renderer
  - _Requirements: AC-1.2, AC-5.5_

- [ ]* 4.1 Write property test for decoration visibility
  - **Property 6: Decoration visibility during gameplay**
  - **Validates: Requirements AC-1.2**

- [x] 5. Implement Screen Transition Controller


  - Create ScreenTransitionController class
  - Add methods for showing/hiding home, game, waiting, and winner screens
  - Implement smooth transitions without flickering
  - Ensure proper z-index layering
  - _Requirements: AC-5.1, AC-5.2, AC-5.3, AC-5.4, AC-5.5_

- [ ]* 5.1 Write property test for screen visibility exclusivity
  - **Property 4: Screen visibility exclusivity**
  - **Validates: Requirements AC-5.1, AC-5.2, AC-5.3**

- [x] 6. Fix Local Multiplayer Lifecycle


  - Ensure game canvas displays when local multiplayer starts
  - Stop game completely when returning to home screen
  - Clear all intervals and animation frames on game end
  - Fix game container show/hide during transitions
  - _Requirements: AC-2.1, AC-2.2, AC-2.3, AC-2.4, AC-2.5_

- [ ]* 6.1 Write property test for game loop termination
  - **Property 3: Game loop termination**
  - **Validates: Requirements AC-2.2, AC-3.1, AC-4.1**

- [x] 7. Fix Online Multiplayer Lifecycle

  - Stop game when returning to home from online game
  - Clean up socket connections on disconnect
  - Fix rematch functionality to prevent memory leaks
  - Hide waiting screen when game starts
  - Fix winner screen display with spooky theme
  - _Requirements: AC-3.1, AC-3.2, AC-3.3, AC-3.4, AC-3.5_

- [x] 8. Fix Practice Mode Lifecycle

  - Stop game when returning to home from practice mode
  - Initialize game renderer before game starts
  - Fix background rendering with grass texture
  - Clear all game loops on exit
  - _Requirements: AC-4.1, AC-4.2, AC-4.3, AC-4.4_

- [ ]* 8.1 Write property test for canvas rendering initialization
  - **Property 7: Canvas rendering initialization**
  - **Validates: Requirements AC-2.1, AC-4.2**

- [x] 9. Integrate Lifecycle Manager with All Game Modes

  - Update practice-mode.js to use GameLifecycleManager
  - Update local-multiplayer-game.js to use GameLifecycleManager
  - Update multiplayer-mode.js to use GameLifecycleManager
  - Ensure consistent cleanup across all modes
  - _Requirements: AC-2.2, AC-3.1, AC-4.1_

- [x] 10. Fix Controller Support Issues


  - Stop controller vibration when game ends
  - Ensure controller navigation works on all screens
  - Handle controller disconnect gracefully
  - _Requirements: AC-8.1, AC-8.2, AC-8.3_

- [ ]* 10.1 Write unit tests for controller cleanup
  - Test controller vibration stops on game end
  - Test controller navigation on all screens
  - Test graceful disconnect handling
  - _Requirements: AC-8.1, AC-8.2, AC-8.3_

- [x] 11. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Integration Testing and Polish

  - Test complete game flow: home → game → home for all modes
  - Test rapid mode switching
  - Verify no console errors during gameplay
  - Verify smooth transitions and proper visual rendering
  - _Requirements: All acceptance criteria_

- [ ]* 12.1 Write integration tests for complete game lifecycle
  - Test home → practice → home flow
  - Test home → local multiplayer → home flow
  - Test home → online multiplayer → home flow
  - Test rapid mode switching
  - _Requirements: All acceptance criteria_

- [x] 13. Final Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.
