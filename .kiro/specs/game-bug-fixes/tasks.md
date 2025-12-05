# Implementation Plan

- [x] 1. Fix coin respawn logic in practice mode
  - [x] 1.1 Update `checkCoinRespawn()` in practice-mode.js to only check coins, not bombs
    - Modify the filter to exclude bomb-type items: `coin.type !== 'bomb'`
    - _Requirements: 3.1, 3.2_
  - [ ]* 1.2 Write property test for coin respawn independence
    - **Property 1: Coin Respawn Independence from Bombs (Practice Mode)**
    - **Validates: Requirements 3.1, 3.2**

- [x] 2. Fix coin respawn logic on server
  - [x] 2.1 Update server.js coin respawn check to be independent of bombs
    - The server already has separate coins and bombs arrays, but verify the respawn logic
    - Ensure coins respawn when all coins collected, regardless of bomb state
    - _Requirements: 3.3, 3.4_
  - [ ]* 2.2 Write property test for server coin respawn
    - **Property 2: Coin Respawn Independence from Bombs (Server)**
    - **Validates: Requirements 3.3, 3.4**

- [x] 3. Fix practice mode background rendering
  - [x] 3.1 Ensure GameRenderer is initialized before practice mode starts
    - Add explicit renderer initialization in `PracticeMode.start()`
    - Verify `window.gameRenderer` exists before calling render
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  - [x] 3.2 Add fallback for missing grass texture
    - Ensure gradient background displays even if grass texture fails to load
    - _Requirements: 2.5_

- [x] 4. Fix multiplayer rendering
  - [x] 4.1 Ensure GameRenderer is initialized before multiplayer game starts
    - Add explicit renderer initialization in `MultiplayerMode.startGame()`
    - Verify render loop uses correct game state
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  - [x] 4.2 Verify game state is properly passed to renderer
    - Ensure `gameStateUpdate` events trigger proper re-renders
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

- [x] 5. Add game state serialization utilities
  - [x] 5.1 Create serializeGameState and parseGameState functions
    - Implement JSON serialization for debugging
    - _Requirements: 4.1, 4.2_
  - [ ]* 5.2 Write property test for round-trip serialization
    - **Property 4: Game State Round-Trip Serialization**
    - **Validates: Requirements 4.1, 4.2**

- [ ]* 6. Write property test for bomb count formula
  - **Property 3: Bomb Count Matches Difficulty Level**
  - **Validates: Requirements 3.5**

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Fix local multiplayer pause functionality
  - [x] 8.1 Fix witch (enemy) continuing to move when game is paused
    - Updated `startLocalGameLoop()` in local-multiplayer-setup.js
    - Added comprehensive pause state checks: `gameState.isPaused` and `window.localGameState.isPaused`
    - Enemies now properly stop moving when pause menu is shown
  - [x] 8.2 Fix Halloween decorations not appearing
    - Updated z-index from 9999 to 1 to prevent covering game elements
    - Increased opacity from 0.15 to 0.25 for better visibility
    - Added error handlers and load logging for debugging
    - Added removal of existing container to prevent duplicates
    - Decorations now properly display around the game area
