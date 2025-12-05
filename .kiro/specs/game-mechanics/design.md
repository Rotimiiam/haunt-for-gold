# Game Mechanics Enhancement - Design Document

## Overview

This design adds advanced gameplay mechanics to Haunt For Gold including dynamic environment changes, weapon systems, power-ups, and special abilities. These enhancements add strategic depth and variety to the core coin-collection gameplay, making each session more engaging and unpredictable while maintaining the spooky Halloween theme.

## Architecture

### Core Components

1. **Environment Manager**
   - Manages dynamic map layout changes
   - Controls environmental hazards spawning
   - Handles weather effects (rain, fog)
   - Synchronizes environment state across multiplayer

2. **Weapon System**
   - Manages weapon power-up spawning and collection
   - Handles weapon activation and effects
   - Tracks weapon duration and expiration
   - Provides weapon visual indicators

3. **Power-Up System**
   - Spawns and manages temporary power-ups
   - Implements speed boost, shield, coin magnet, bomb defuser
   - Tracks power-up durations and effects
   - Displays power-up timers

4. **Special Ability System**
   - Manages energy accumulation for abilities
   - Handles ability activation and cooldowns
   - Implements character-specific abilities
   - Provides UI feedback for ability status

5. **Effect Manager**
   - Applies and removes temporary effects on players
   - Manages effect stacking and conflicts
   - Synchronizes effects across multiplayer
   - Provides visual feedback for active effects

6. **Witch Enemy System**
   - Manages witch spawning and despawning
   - Implements AI for chasing closest player
   - Handles witch-player collision and effects
   - Controls witch spawn/despawn cycles

## Components and Interfaces

### EnvironmentManager

```javascript
class EnvironmentManager {
  constructor(gameState) {
    this.currentDifficulty = 1;
    this.scoreThresholds = [100, 250, 500, 1000];
    this.activeHazards = [];
    this.weatherEffects = [];
    this.mapLayout = null;
  }

  // Difficulty and layout
  updateDifficulty(score);
  generateRandomLayout(difficulty);
  applyLayoutChange();
  
  // Hazards
  spawnHazard(type, position);
  updateHazards(deltaTime);
  removeHazard(hazardId);
  
  // Weather
  activateWeather(type); // 'rain' | 'fog'
  updateWeather(deltaTime);
  deactivateWeather();
  
  // Synchronization
  getEnvironmentState();
  applyEnvironmentState(state);
  notifyEnvironmentChange(changeType);
}
```

### WeaponSystem

```javascript
class WeaponSystem {
  constructor() {
    this.weaponTypes = new Map(); // weapon type -> properties
    this.activeWeapons = new Map(); // player ID -> weapon state
    this.spawnPoints = [];
  }

  // Weapon types
  registerWeaponType(type, properties);
  getWeaponProperties(type);
  
  // Spawning
  spawnWeaponPowerUp(position);
  collectWeapon(playerId, weaponType);
  
  // Usage
  useWeapon(playerId, target);
  applyWeaponEffect(weaponType, target);
  
  // Lifecycle
  updateWeapons(deltaTime);
  expireWeapon(playerId);
  
  // Visual
  getWeaponIndicator(weaponType);
}
```

### PowerUpSystem

```javascript
class PowerUpSystem {
  constructor() {
    this.powerUpTypes = {
      speedBoost: { duration: 10000, effect: 'speed', multiplier: 1.5 },
      shield: { duration: Infinity, effect: 'shield', charges: 1 },
      coinMagnet: { duration: 15000, effect: 'magnet', radius: 100 },
      bombDefuser: { duration: 15000, effect: 'bombImmune' }
    };
    this.activePowerUps = new Map(); // player ID -> active power-ups
  }

  // Spawning
  spawnPowerUp(type, position);
  collectPowerUp(playerId, type);
  
  // Effects
  applyPowerUpEffect(playerId, type);
  removePowerUpEffect(playerId, type);
  
  // Updates
  updatePowerUps(deltaTime);
  
  // Queries
  hasPowerUp(playerId, type);
  getRemainingDuration(playerId, type);
}
```

### SpecialAbilitySystem

```javascript
class SpecialAbilitySystem {
  constructor() {
    this.characterAbilities = new Map(); // character type -> ability
    this.playerEnergy = new Map(); // player ID -> energy level
    this.cooldowns = new Map(); // player ID -> cooldown remaining
    this.energyPerCoin = 10;
    this.energyThreshold = 100;
  }

  // Energy management
  addEnergy(playerId, amount);
  getEnergy(playerId);
  canUseAbility(playerId);
  
  // Abilities
  registerAbility(characterType, ability);
  useAbility(playerId, characterType);
  applyAbilityEffect(playerId, ability, targets);
  
  // Cooldowns
  startCooldown(playerId, duration);
  updateCooldowns(deltaTime);
  isOnCooldown(playerId);
  
  // UI
  getAbilityStatus(playerId);
}
```

### EffectManager

```javascript
class EffectManager {
  constructor() {
    this.activeEffects = new Map(); // player ID -> effect list
  }

  // Effect application
  applyEffect(playerId, effect);
  removeEffect(playerId, effectId);
  clearAllEffects(playerId);
  
  // Effect queries
  hasEffect(playerId, effectType);
  getEffectMultiplier(playerId, stat);
  
  // Updates
  updateEffects(deltaTime);
  
  // Visual feedback
  getActiveEffectIndicators(playerId);
  notifyEffectApplied(playerId, effect);
}
```

### WitchEnemySystem

```javascript
class WitchEnemySystem {
  constructor() {
    this.witch = null;
    this.isActive = false;
    this.activeDuration = 30000; // 30 seconds
    this.cooldownDuration = 20000; // 20 seconds
    this.spawnTimer = 0;
    this.speed = 2.5;
  }

  // Lifecycle
  spawnWitch(position);
  despawnWitch();
  respawnWitch();
  
  // AI
  findClosestPlayer(players);
  chasePlayer(targetPlayer, deltaTime);
  updateWitchPosition(deltaTime);
  
  // Collision
  checkPlayerCollision(players);
  applyWitchEffect(playerId); // stun or point loss
  
  // State
  isWitchActive();
  getWitchState();
  updateWitchTimer(deltaTime);
}
```

## Data Models

### WeaponType

```javascript
{
  id: string,
  name: string,
  duration: number, // milliseconds
  effect: 'stun' | 'slow' | 'freeze' | 'damage',
  effectValue: number,
  cooldown: number,
  visualIndicator: string, // icon/sprite
  spookyTheme: string // 'witch-wand' | 'ghost-trap' | 'pumpkin-bomb'
}
```

### PowerUp

```javascript
{
  id: string,
  type: 'speedBoost' | 'shield' | 'coinMagnet' | 'bombDefuser',
  position: {x: number, y: number},
  duration: number,
  effect: string,
  value: number,
  sprite: string
}
```

### SpecialAbility

```javascript
{
  id: string,
  name: string,
  characterType: string,
  energyCost: number,
  cooldown: number,
  effect: 'teleport' | 'invisibility' | 'speedBurst' | 'coinDouble',
  duration: number,
  areaOfEffect: number | null
}
```

### EnvironmentState

```javascript
{
  difficulty: number,
  layout: {
    walls: Array<{x, y, width, height}>,
    spawnPoints: Array<{x, y}>,
    hazards: Array<{type, x, y}>
  },
  weather: {
    type: 'rain' | 'fog' | null,
    intensity: number
  },
  activeHazards: Array<Hazard>
}
```

### Effect

```javascript
{
  id: string,
  type: string,
  startTime: number,
  duration: number,
  stat: 'speed' | 'defense' | 'coinValue',
  modifier: number,
  source: 'powerUp' | 'weapon' | 'ability'
}
```

### WitchEnemy

```javascript
{
  id: string,
  position: {x: number, y: number},
  velocity: {x: number, y: number},
  speed: number,
  targetPlayerId: string | null,
  isActive: boolean,
  spawnTime: number,
  despawnTime: number,
  sprite: string, // witch sprite
  catchRadius: number
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Map layout randomness
*For any* difficulty level, generating multiple map layouts should produce different layouts with appropriate complexity for that difficulty.
**Validates: Requirements 1.1**

### Property 2: Hazard spawning at thresholds
*For any* score that crosses a threshold, environmental hazards should spawn.
**Validates: Requirements 1.2**

### Property 3: Weather effect activation
*For any* game progression that triggers weather, the weather effect should be activated and visible.
**Validates: Requirements 1.3**

### Property 4: Environment synchronization
*For any* environmental change in multiplayer, all players should receive and apply the same environment state.
**Validates: Requirements 1.4**

### Property 5: Environment change notification
*For any* environment change, a visual notification should be displayed to all players.
**Validates: Requirements 1.5**

### Property 6: Weapon collection and duration
*For any* weapon power-up collected, the player should have access to that weapon for exactly its specified duration.
**Validates: Requirements 2.1**

### Property 7: Weapon effect application
*For any* weapon use, the weapon's effect should be applied to the target according to the weapon type's properties.
**Validates: Requirements 2.2**

### Property 8: Weapon expiration cleanup
*For any* weapon that expires, the player's state should return to normal (no weapon active).
**Validates: Requirements 2.3**

### Property 9: Weapon uniqueness
*For any* set of weapon types, each should have distinct effect types and durations.
**Validates: Requirements 2.4**

### Property 10: Weapon visual indicator
*For any* player with an active weapon, a visual indicator should be displayed on their character.
**Validates: Requirements 2.5**

### Property 11: Speed boost effect
*For any* speed boost collected, the player's movement speed should increase by the multiplier for exactly 10 seconds.
**Validates: Requirements 3.1**

### Property 12: Shield protection
*For any* player with a shield, the first enemy hit should be blocked and subsequent hits should cause damage.
**Validates: Requirements 3.2**

### Property 13: Coin magnet attraction
*For any* player with coin magnet active, coins within the magnet radius should move toward the player.
**Validates: Requirements 3.3**

### Property 14: Bomb defuser immunity
*For any* player with bomb defuser active, bomb damage should be negated for 15 seconds.
**Validates: Requirements 3.4**

### Property 15: Power-up timer display
*For any* active power-up with a duration, a timer should be displayed showing the remaining time.
**Validates: Requirements 3.5**

### Property 16: Energy-based ability activation
*For any* player who accumulates enough energy, they should be able to activate their special ability.
**Validates: Requirements 4.1**

### Property 17: Ability cooldown enforcement
*For any* special ability used, it should not be usable again until the cooldown period expires.
**Validates: Requirements 4.2**

### Property 18: Character ability uniqueness
*For any* set of character types, each should have a unique special ability with distinct properties.
**Validates: Requirements 4.3**

### Property 19: Ability readiness UI
*For any* player whose special ability is ready (energy sufficient and not on cooldown), the UI should indicate availability.
**Validates: Requirements 4.4**

### Property 20: Ability effect feedback
*For any* player affected by another player's special ability, they should receive visual feedback.
**Validates: Requirements 4.5**

### Property 21: Witch spawning
*For any* game start, a witch should spawn at a random location on the map.
**Validates: Requirements 5.1**

### Property 22: Witch chasing behavior
*For any* active witch and set of players, the witch should move toward the closest player.
**Validates: Requirements 5.2**

### Property 23: Witch catch effect
*For any* witch-player collision, the player should lose points or be stunned.
**Validates: Requirements 5.3**

### Property 24: Witch despawn cycle
*For any* witch that has been active for its duration, it should despawn and then respawn after the cooldown period.
**Validates: Requirements 5.4, 5.5**

## Error Handling

### Environment Synchronization Errors
- If environment state fails to sync, retry up to 3 times
- Fall back to local environment generation if sync fails
- Log synchronization errors for debugging
- Don't block gameplay on sync failures

### Weapon/Power-Up Collection Conflicts
- Use server-side validation for multiplayer collection
- Implement first-come-first-served for contested pickups
- Handle race conditions with timestamps
- Provide clear feedback when pickup fails

### Effect Stacking Issues
- Define clear rules for effect stacking (some stack, some don't)
- Prevent conflicting effects (e.g., freeze + speed boost)
- Handle effect removal gracefully
- Maintain effect priority system

### Ability Activation Errors
- Validate energy and cooldown before activation
- Handle network delays in multiplayer
- Provide clear feedback for failed activations
- Don't consume energy if activation fails

## Testing Strategy

### Unit Testing Framework
- Use existing test infrastructure
- Test each system in isolation
- Mock game state and player data

### Unit Tests

1. **EnvironmentManager Tests**
   - Test layout generation
   - Test hazard spawning
   - Test weather activation
   - Test state synchronization

2. **WeaponSystem Tests**
   - Test weapon registration
   - Test collection and activation
   - Test effect application
   - Test expiration

3. **PowerUpSystem Tests**
   - Test power-up spawning
   - Test effect application
   - Test duration tracking
   - Test multiple simultaneous power-ups

4. **SpecialAbilitySystem Tests**
   - Test energy accumulation
   - Test ability activation
   - Test cooldown management
   - Test character-specific abilities

5. **EffectManager Tests**
   - Test effect application and removal
   - Test effect stacking
   - Test stat modification
   - Test visual feedback

### Property-Based Testing

We will use **fast-check** (JavaScript property-based testing library) to verify universal properties.

**Configuration**: Each property test should run a minimum of 100 iterations.

**Tagging**: Each property-based test must include a comment with format:
`// Feature: game-mechanics, Property {number}: {property_text}`

**Property Tests**:

1. **Property 1 Test**: Map layout randomness
   - Generate multiple layouts at same difficulty
   - Verify they differ
   - Tag: `// Feature: game-mechanics, Property 1: Map layout randomness`

2. **Property 6 Test**: Weapon collection and duration
   - Generate random weapon collections
   - Verify duration is exact
   - Tag: `// Feature: game-mechanics, Property 6: Weapon collection and duration`

3. **Property 8 Test**: Weapon expiration cleanup
   - Collect weapon, wait for expiration
   - Verify state is clean
   - Tag: `// Feature: game-mechanics, Property 8: Weapon expiration cleanup`

4. **Property 11 Test**: Speed boost effect
   - Collect speed boost
   - Verify speed increase and 10s duration
   - Tag: `// Feature: game-mechanics, Property 11: Speed boost effect`

5. **Property 12 Test**: Shield protection
   - Collect shield, take hits
   - Verify first blocked, second damages
   - Tag: `// Feature: game-mechanics, Property 12: Shield protection`

6. **Property 17 Test**: Ability cooldown enforcement
   - Use ability, try to reuse
   - Verify cooldown prevents reuse
   - Tag: `// Feature: game-mechanics, Property 17: Ability cooldown enforcement`

### Integration Testing
- Test all systems together in gameplay
- Test multiplayer synchronization
- Test effect combinations
- Test rapid power-up collection

### Manual Testing Checklist
- Verify spooky theme consistency for all new elements
- Test all weapon types
- Test all power-ups
- Test special abilities for each character
- Verify visual feedback is clear
- Test environment changes feel natural

## Implementation Notes

### Spooky Theme Integration
- Weapons: witch wand, ghost trap, pumpkin bomb, skeleton key
- Power-ups: glowing potions, mystical auras, haunted shields
- Hazards: moving tombstones, ghost walls, cursed zones
- Weather: eerie fog, blood rain, floating spirits

### Performance Considerations
- Limit active hazards to prevent lag
- Optimize particle effects for weather
- Use object pooling for power-ups and weapons
- Batch environment updates

### Multiplayer Synchronization
- Environment changes broadcast to all clients
- Server authoritative for power-up collection
- Client prediction for ability activation
- Rollback on desync

### Balance Considerations
- Weapon duration: 15-30 seconds
- Power-up spawn rate: 1 every 20-30 seconds
- Special ability cooldown: 45-60 seconds
- Energy gain: 10 per coin, 100 threshold

### Integration Points
- Integrate with game-core.js for game loop
- Work with game-renderer.js for visual effects
- Coordinate with multiplayer-mode.js for sync
- Update collision-resolver.js for new hazards
