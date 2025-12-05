# Multiplayer Expansion - Implementation Plan

- [ ] 1. Create Lobby Manager core
  - Implement LobbyManager class
  - Add lobby creation with unique code generation
  - Implement lobby storage and retrieval
  - Create player-to-lobby mapping
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 1.1 Write property test for lobby creation with player count
  - **Property 1: Lobby creation with player count**
  - **Validates: Requirements 1.1**

- [ ]* 1.2 Write property test for lobby settings persistence
  - **Property 2: Lobby settings persistence**
  - **Validates: Requirements 1.2, 1.3, 1.4**

- [ ] 2. Implement lobby joining system
  - Add lobby code validation and lookup
  - Implement player join functionality
  - Add capacity checking
  - Create join rejection for full lobbies
  - _Requirements: 1.5, 2.1, 2.4_

- [ ]* 2.1 Write property test for lobby code joining
  - **Property 3: Lobby code joining**
  - **Validates: Requirements 1.5, 2.1**

- [ ]* 2.2 Write property test for full lobby rejection
  - **Property 6: Full lobby rejection**
  - **Validates: Requirements 2.4**

- [ ] 3. Add lobby state synchronization
  - Implement settings broadcast to joining players
  - Add player list synchronization
  - Create real-time lobby updates
  - _Requirements: 2.2, 2.3_

- [ ]* 3.1 Write property test for settings visibility on join
  - **Property 4: Settings visibility on join**
  - **Validates: Requirements 2.2**

- [ ]* 3.2 Write property test for player list visibility
  - **Property 5: Player list visibility**
  - **Validates: Requirements 2.3**

- [ ] 4. Implement ready system and auto-start
  - Add player ready state tracking
  - Implement all-ready detection
  - Create automatic game start trigger
  - _Requirements: 2.5_

- [ ]* 4.1 Write property test for auto-start on all ready
  - **Property 7: Auto-start on all ready**
  - **Validates: Requirements 2.5**

- [ ] 5. Create Host Controller
  - Implement HostController class
  - Add host privilege checking
  - Create host action validation
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 6. Implement host kick functionality
  - Add kick player action
  - Remove kicked player from lobby
  - Broadcast kick notification
  - _Requirements: 3.1_

- [ ]* 6.1 Write property test for host kick functionality
  - **Property 8: Host kick functionality**
  - **Validates: Requirements 3.1**

- [ ] 7. Add host settings control
  - Implement settings modification by host
  - Add validation for settings changes
  - Prevent settings changes after game start
  - _Requirements: 3.2_

- [ ]* 7.1 Write property test for host settings modification
  - **Property 9: Host settings modification**
  - **Validates: Requirements 3.2**

- [ ] 8. Implement host game start control
  - Add host start game action
  - Validate all players ready (optional)
  - Trigger game initialization
  - _Requirements: 3.3_

- [ ]* 8.1 Write property test for host game start control
  - **Property 10: Host game start control**
  - **Validates: Requirements 3.3**

- [ ] 9. Add host migration system
  - Detect host disconnect
  - Select new host from remaining players
  - Transfer host privileges
  - Notify all players of new host
  - _Requirements: 3.4_

- [ ]* 9.1 Write property test for host migration
  - **Property 11: Host migration**
  - **Validates: Requirements 3.4**

- [ ] 10. Implement settings change notifications
  - Broadcast settings updates to all players
  - Create settings change UI notifications
  - _Requirements: 3.5_

- [ ]* 10.1 Write property test for settings change broadcast
  - **Property 12: Settings change broadcast**
  - **Validates: Requirements 3.5**

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Create Game Scaler
  - Implement GameScaler class
  - Add scaling formulas for map, coins, enemies
  - Create resource distribution algorithms
  - _Requirements: 4.1, 4.2, 4.3_

- [ ]* 12.1 Write property test for map size scaling
  - **Property 13: Map size scaling**
  - **Validates: Requirements 4.1**

- [ ]* 12.2 Write property test for coin count scaling
  - **Property 14: Coin count scaling**
  - **Validates: Requirements 4.2**

- [ ]* 12.3 Write property test for enemy count scaling
  - **Property 15: Enemy count scaling**
  - **Validates: Requirements 4.3**

- [ ] 13. Implement map scaling
  - Calculate map size based on player count
  - Generate larger maps for more players
  - Distribute spawn points appropriately
  - _Requirements: 4.1_

- [ ] 14. Add resource scaling
  - Scale coin spawning with player count
  - Scale enemy spawning with player count
  - Balance resource distribution
  - _Requirements: 4.2, 4.3_

- [ ] 15. Create Spectator System
  - Implement SpectatorSystem class
  - Add spectator mode activation for eliminated players
  - Create spectator camera controls
  - Implement spectator target cycling
  - _Requirements: 4.5_

- [ ]* 15.1 Write property test for spectator mode activation
  - **Property 16: Spectator mode activation**
  - **Validates: Requirements 4.5**

- [ ] 16. Add spectator UI
  - Create spectator overlay with spooky theme
  - Display game state to spectators
  - Add spectator controls UI
  - Show "SPECTATING" indicator
  - _Requirements: 4.5_

- [ ] 17. Create Team System core
  - Implement TeamSystem class
  - Add team creation and management
  - Create player-to-team mapping
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ]* 17.1 Write property test for team formation
  - **Property 17: Team formation**
  - **Validates: Requirements 5.1**

- [ ] 18. Implement team formation
  - Add team creation in lobby
  - Allow players to join teams (2-4 per team)
  - Implement team balancing
  - Create team selection UI
  - _Requirements: 5.1_

- [ ] 19. Add team scoring system
  - Implement combined team score
  - Update team score when members earn points
  - Display team scores in UI
  - _Requirements: 5.2_

- [ ]* 19.1 Write property test for team score sharing
  - **Property 18: Team score sharing**
  - **Validates: Requirements 5.2**

- [ ] 20. Implement teammate visibility
  - Add teammate position highlighting
  - Create team-colored indicators
  - Enhance teammate visibility in UI
  - _Requirements: 5.3_

- [ ]* 20.1 Write property test for teammate visibility
  - **Property 19: Teammate visibility**
  - **Validates: Requirements 5.3**

- [ ] 21. Add friendly fire prevention
  - Check team membership before applying damage
  - Prevent teammate damage
  - Allow teammate collision but no harm
  - _Requirements: 5.4_

- [ ]* 21.1 Write property test for friendly fire prevention
  - **Property 20: Friendly fire prevention**
  - **Validates: Requirements 5.4**

- [ ] 22. Implement team victory system
  - Detect team victory condition
  - Credit all team members with win
  - Display team victory screen
  - Update team member statistics
  - _Requirements: 5.5_

- [ ]* 22.1 Write property test for team victory credit
  - **Property 21: Team victory credit**
  - **Validates: Requirements 5.5**

- [ ] 23. Create lobby UI
  - Design lobby screen with spooky theme
  - Add lobby creation form
  - Create lobby join interface
  - Display lobby settings and player list
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.2, 2.3_

- [ ] 24. Add host controls UI
  - Create host-only controls panel
  - Add kick player buttons
  - Implement settings modification UI
  - Add start game button
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 25. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 26. Integrate with server
  - Update server.js to handle lobbies
  - Add Socket.IO events for lobby actions
  - Implement server-side lobby management
  - Add lobby persistence (optional)
  - _Requirements: All requirements_

- [ ] 27. Integrate with game core
  - Update game-core.js for scaled games
  - Integrate team system with game logic
  - Add spectator mode to game loop
  - Handle 2-8 player games
  - _Requirements: All requirements_

- [ ] 28. Add multiplayer synchronization
  - Sync lobby state across all clients
  - Broadcast game events to all players and spectators
  - Handle player disconnects gracefully
  - Implement reconnection support
  - _Requirements: All requirements_

- [ ]* 28.1 Write integration tests for multiplayer sync
  - Test lobby sync across clients
  - Test game state sync with 8 players
  - Test team sync
  - Test spectator sync
  - _Requirements: All requirements_

- [ ] 29. Create spooky-themed assets
  - Design team color schemes (purple, green, orange, red)
  - Create lobby UI with haunted mansion aesthetic
  - Design spectator overlay with ghostly theme
  - Create team victory animations
  - _Requirements: All requirements (visual aspects)_

- [ ] 30. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 31. Balance and polish
  - Tune scaling formulas
  - Test with various player counts (2-8)
  - Balance team gameplay
  - Test spectator experience
  - _Requirements: All requirements_

- [ ]* 31.1 Write integration tests for complete multiplayer expansion
  - Test full lobby flow with 8 players
  - Test team mode with 4v4
  - Test host migration scenarios
  - Test spectator mode
  - _Requirements: All requirements_
