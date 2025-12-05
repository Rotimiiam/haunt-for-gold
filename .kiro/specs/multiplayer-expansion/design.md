# Multiplayer Expansion - Design Document

## Overview

This design expands Haunt For Gold's multiplayer capabilities to support 2-8 players with custom lobbies, configurable game rules, team-based modes, and balanced scaling. The system provides lobby management, host controls, dynamic game scaling, and spectator features while maintaining the spooky Halloween theme.

## Architecture

### Core Components

1. **Lobby Manager**
   - Creates and manages game lobbies
   - Generates unique lobby codes
   - Handles player joining and leaving
   - Manages lobby state and settings

2. **Host Controller**
   - Manages host privileges and actions
   - Handles host migration on disconnect
   - Controls game start and settings
   - Implements player kick functionality

3. **Game Scaler**
   - Scales map size based on player count
   - Adjusts coin and enemy spawning
   - Balances difficulty for player count
   - Manages resource distribution

4. **Team System**
   - Manages team formation and membership
   - Handles team scoring and victory
   - Implements friendly fire prevention
   - Provides team-specific UI features

5. **Spectator System**
   - Manages spectator mode for eliminated players
   - Provides spectator camera controls
   - Displays game state to spectators
   - Handles spectator chat

## Components and Interfaces

### LobbyManager

```javascript
class LobbyManager {
  constructor() {
    this.lobbies = new Map(); // lobby code -> lobby state
    this.playerLobbies = new Map(); // player ID -> lobby code
  }

  // Lobby creation
  createLobby(hostId, settings);
  generateLobbyCode();
  
  // Lobby joining
  joinLobby(playerId, lobbyCode);
  leaveLobby(playerId);
  
  // Lobby queries
  getLobby(lobbyCode);
  isLobbyFull(lobbyCode);
  getPlayerCount(lobbyCode);
  
  // Settings
  updateLobbySettings(lobbyCode, settings);
  getLobbySettings(lobbyCode);
}
```

### HostController

```javascript
class HostController {
  // Host actions
  kickPlayer(hostId, lobbyCode, targetPlayerId);
  updateSettings(hostId, lobbyCode, settings);
  startGame(hostId, lobbyCode);
  
  // Host management
  isHost(playerId, lobbyCode);
  transferHost(lobbyCode, newHostId);
  selectNewHost(lobbyCode);
  
  // Notifications
  notifySettingsChange(lobbyCode, settings);
  notifyPlayerKicked(lobbyCode, playerId);
}
```

### GameScaler

```javascript
class GameScaler {
  // Map scaling
  calculateMapSize(playerCount);
  generateScaledMap(playerCount);
  
  // Resource scaling
  calculateCoinCount(playerCount);
  calculateEnemyCount(playerCount);
  
  // Spawn distribution
  distributeSpawnPoints(playerCount);
  distributeResources(playerCount, mapSize);
  
  // Balance
  getScalingFactor(playerCount);
}
```

### TeamSystem

```javascript
class TeamSystem {
  constructor() {
    this.teams = new Map(); // team ID -> team state
    this.playerTeams = new Map(); // player ID -> team ID
  }

  // Team management
  createTeam(teamId, name);
  addPlayerToTeam(playerId, teamId);
  removePlayerFromTeam(playerId);
  
  // Team scoring
  addTeamScore(teamId, points);
  getTeamScore(teamId);
  getWinningTeam();
  
  // Team queries
  areTeammates(player1Id, player2Id);
  getTeamMembers(teamId);
  
  // Friendly fire
  shouldPreventDamage(attackerId, targetId);
}
```

### SpectatorSystem

```javascript
class SpectatorSystem {
  constructor() {
    this.spectators = new Set();
    this.spectatorTargets = new Map(); // spectator ID -> target player ID
  }

  // Spectator mode
  enterSpectatorMode(playerId);
  exitSpectatorMode(playerId);
  isSpectator(playerId);
  
  // Camera control
  setSpectatorTarget(spectatorId, targetPlayerId);
  cycleSpectatorTarget(spectatorId);
  
  // State updates
  sendGameStateToSpectators(gameState);
}
```

## Data Models

### Lobby

```javascript
{
  code: string,
  hostId: string,
  players: Array<{id: string, name: string, ready: boolean}>,
  settings: {
    maxPlayers: number, // 2-8
    winningScore: number,
    difficulty: number,
    bombsEnabled: boolean,
    teamMode: boolean
  },
  state: 'waiting' | 'starting' | 'in-progress',
  createdAt: number
}
```

### Team

```javascript
{
  id: string,
  name: string,
  color: string,
  members: Array<string>, // player IDs
  score: number,
  isActive: boolean
}
```

### GameSettings

```javascript
{
  maxPlayers: number,
  winningScore: number,
  difficulty: number,
  bombsEnabled: boolean,
  teamMode: boolean,
  mapSize: {width: number, height: number},
  coinCount: number,
  enemyCount: number
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Lobby creation with player count
*For any* lobby creation with specified max players (2-8), the lobby should be created with that player limit.
**Validates: Requirements 1.1**

### Property 2: Lobby settings persistence
*For any* lobby setting (winning score, difficulty, bombs), setting it during creation should store it correctly.
**Validates: Requirements 1.2, 1.3, 1.4**

### Property 3: Lobby code joining
*For any* valid lobby code, entering it should allow joining that specific lobby.
**Validates: Requirements 1.5, 2.1**

### Property 4: Settings visibility on join
*For any* player joining a lobby, they should receive the current game settings.
**Validates: Requirements 2.2**

### Property 5: Player list visibility
*For any* player joining a lobby, they should receive the list of current players.
**Validates: Requirements 2.3**

### Property 6: Full lobby rejection
*For any* lobby at max capacity, join attempts should be rejected with notification.
**Validates: Requirements 2.4**

### Property 7: Auto-start on all ready
*For any* lobby where all players are ready, the game should start automatically.
**Validates: Requirements 2.5**

### Property 8: Host kick functionality
*For any* host kick action, the target player should be removed from the lobby.
**Validates: Requirements 3.1**

### Property 9: Host settings modification
*For any* host settings change before game start, the settings should be updated.
**Validates: Requirements 3.2**

### Property 10: Host game start control
*For any* host start action, the game should begin.
**Validates: Requirements 3.3**

### Property 11: Host migration
*For any* host leaving the lobby, host privileges should transfer to another player.
**Validates: Requirements 3.4**

### Property 12: Settings change broadcast
*For any* settings change, all players in the lobby should be notified.
**Validates: Requirements 3.5**

### Property 13: Map size scaling
*For any* player count, the map size should scale appropriately.
**Validates: Requirements 4.1**

### Property 14: Coin count scaling
*For any* player count increase, coin count should increase proportionally.
**Validates: Requirements 4.2**

### Property 15: Enemy count scaling
*For any* player count increase, enemy count should scale to maintain challenge.
**Validates: Requirements 4.3**

### Property 16: Spectator mode activation
*For any* eliminated player, they should enter spectator mode.
**Validates: Requirements 4.5**

### Property 17: Team formation
*For any* team game, teams of 2-4 players should be formable.
**Validates: Requirements 5.1**

### Property 18: Team score sharing
*For any* team member earning points, the team's combined score should increase.
**Validates: Requirements 5.2**

### Property 19: Teammate visibility
*For any* team member, other teammates' positions should be clearly visible.
**Validates: Requirements 5.3**

### Property 20: Friendly fire prevention
*For any* attack between teammates, damage should be prevented.
**Validates: Requirements 5.4**

### Property 21: Team victory credit
*For any* team winning, all team members should be credited with victory.
**Validates: Requirements 5.5**

## Error Handling

### Lobby Code Errors
- Generate unique codes to prevent collisions
- Validate code format before lookup
- Handle expired or invalid codes gracefully
- Provide clear error messages

### Host Migration Errors
- Always ensure a host exists in active lobbies
- Handle simultaneous host disconnects
- Validate new host selection
- Notify all players of host changes

### Scaling Errors
- Validate player count is within bounds (2-8)
- Ensure map generation succeeds for all counts
- Handle resource allocation failures
- Fall back to default scaling if calculation fails

### Team Formation Errors
- Validate team sizes (2-4 players)
- Prevent unbalanced teams
- Handle team dissolution on player leave
- Ensure at least 2 teams exist in team mode

## Testing Strategy

### Unit Testing Framework
- Use existing test infrastructure
- Test each system in isolation
- Mock network and game state

### Property-Based Testing

We will use **fast-check** (JavaScript property-based testing library) to verify universal properties.

**Configuration**: Each property test should run a minimum of 100 iterations.

**Tagging**: Each property-based test must include a comment with format:
`// Feature: multiplayer-expansion, Property {number}: {property_text}`

## Implementation Notes

### Lobby Code Generation
- Use 6-character alphanumeric codes
- Exclude ambiguous characters (0/O, 1/I)
- Ensure uniqueness across active lobbies
- Expire codes after lobby closes

### Scaling Formulas
- Map size: base_size * (1 + (players - 2) * 0.3)
- Coin count: base_coins * players * 0.8
- Enemy count: base_enemies * (1 + (players - 2) * 0.4)

### Team Balance
- Auto-balance teams if possible
- Allow manual team selection
- Shuffle teams option
- Prevent team stacking

### Spooky Theme Integration
- Team colors: purple, green, orange, red
- Spectator UI: ghostly overlay
- Lobby UI: haunted mansion aesthetic
- Victory screen: team-specific celebrations

### Integration Points
- Extend existing multiplayer-mode.js
- Integrate with game-core.js for scaling
- Work with game-renderer.js for team visuals
- Coordinate with server.js for lobby management
