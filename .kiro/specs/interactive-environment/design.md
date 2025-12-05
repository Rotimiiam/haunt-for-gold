# Interactive Environment - Design Document

## Overview

This design adds interactive environmental elements to Haunt For Gold including fire, water, lava, ice, electricity, and dynamic terrain. These elements create strategic gameplay opportunities, add visual variety, and interact with each other to create complex scenarios. The system maintains the spooky Halloween theme while adding depth to the core gameplay.

## Architecture

### Core Components

1. **Terrain Manager**
   - Manages terrain grid and tile types
   - Handles terrain state changes
   - Tracks dynamic terrain elements
   - Provides terrain query interface

2. **Element System**
   - Manages fire, water, lava, ice, electricity elements
   - Handles element spreading and movement
   - Implements element lifecycle (spawn, active, expire)
   - Provides element interaction rules

3. **Interaction Engine**
   - Processes element-to-element interactions
   - Creates secondary effects (steam, electrified water)
   - Manages interaction priorities
   - Synchronizes interactions across multiplayer

4. **Player-Environment Collision**
   - Detects player contact with environmental elements
   - Applies element effects to players (damage, speed reduction)
   - Checks for immunity power-ups
   - Provides collision feedback

5. **Dynamic Terrain System**
   - Manages bridges, paths, and terrain changes
   - Implements conditional terrain triggers
   - Ensures terrain connectivity
   - Handles item relocation on terrain changes

## Components and Interfaces

### TerrainManager

```javascript
class TerrainManager {
  constructor(width, height) {
    this.grid = []; // 2D array of terrain tiles
    this.width = width;
    this.height = height;
    this.dynamicElements = new Map(); // position -> element
  }

  // Terrain queries
  getTile(x, y);
  setTile(x, y, type);
  isWalkable(x, y);
  getNeighbors(x, y);
  
  // Dynamic elements
  addElement(x, y, element);
  removeElement(x, y);
  getElement(x, y);
  
  // Pathfinding
  hasPath(start, end);
  findAlternativeRoute(blocked);
}
```

### ElementSystem

```javascript
class ElementSystem {
  constructor() {
    this.elements = new Map(); // element ID -> element state
    this.spreadRates = {
      fire: 0.5, // tiles per second
      lava: 0.2,
      water: 0.3
    };
  }

  // Element lifecycle
  spawnElement(type, position);
  removeElement(elementId);
  updateElements(deltaTime);
  
  // Spreading
  spreadFire(fireElement, deltaTime);
  flowLava(lavaElement, deltaTime);
  flowWater(waterElement, deltaTime);
  
  // State transitions
  coolLava(lavaElement, deltaTime);
  evaporateWater(waterElement);
  meltIce(iceElement);
  
  // Queries
  getElementsAt(position);
  getElementsInRadius(position, radius);
}
```

### InteractionEngine

```javascript
class InteractionEngine {
  constructor() {
    this.interactionRules = new Map(); // element pair -> interaction
    this.secondaryEffects = [];
  }

  // Interaction rules
  registerInteraction(element1, element2, effect);
  processInteractions(elements);
  
  // Specific interactions
  waterFireInteraction(water, fire); // creates steam
  iceFire Interaction(ice, fire); // melts to water
  electricityWaterInteraction(electricity, water); // creates hazard
  windFireInteraction(wind, fire); // directional spread
  
  // Secondary effects
  createSteam(position, duration);
  createElectrifiedWater(position, duration);
  updateSecondaryEffects(deltaTime);
  
  // Synchronization
  getInteractionState();
  applyInteractionState(state);
}
```

### PlayerEnvironmentCollision

```javascript
class PlayerEnvironmentCollision {
  constructor() {
    this.damageValues = {
      fire: 10,
      lava: 50,
      electricity: 20
    };
    this.speedModifiers = {
      water: 0.5,
      ice: 1.2
    };
  }

  // Collision detection
  checkCollisions(player, elements);
  isPlayerOnElement(player, elementType);
  
  // Effect application
  applyElementDamage(player, elementType);
  applySpeedModifier(player, elementType);
  removeSpeedModifier(player);
  
  // Immunity checking
  hasImmunity(player, elementType);
  checkPowerUpProtection(player, elementType);
}
```

### DynamicTerrainSystem

```javascript
class DynamicTerrainSystem {
  constructor() {
    this.bridges = new Map(); // bridge ID -> bridge state
    this.triggers = []; // condition -> terrain change
    this.changeWarnings = new Map(); // change ID -> warning time
  }

  // Bridges
  createBridge(id, position, condition);
  activateBridge(bridgeId);
  deactivateBridge(bridgeId);
  
  // Terrain changes
  registerTerrainTrigger(condition, change);
  checkTriggers(gameState);
  applyTerrainChange(change);
  
  // Warnings
  scheduleWarning(changeId, delay);
  showTerrainWarning(position, changeType);
  
  // Item relocation
  relocateItems(affectedArea);
  findSafePosition(item);
}
```

## Data Models

### Element

```javascript
{
  id: string,
  type: 'fire' | 'water' | 'lava' | 'ice' | 'electricity',
  position: {x: number, y: number},
  intensity: number, // 0-1
  spreadRadius: number,
  lifetime: number, // milliseconds, Infinity for permanent
  createdAt: number,
  sprite: string
}
```

### TerrainTile

```javascript
{
  x: number,
  y: number,
  type: 'grass' | 'wall' | 'bridge' | 'void',
  walkable: boolean,
  element: Element | null,
  properties: {
    slippery?: boolean,
    damaging?: boolean,
    speedModifier?: number
  }
}
```

### Interaction

```javascript
{
  element1Type: string,
  element2Type: string,
  result: 'extinguish' | 'transform' | 'createEffect',
  resultElement: string | null,
  secondaryEffect: {
    type: string,
    duration: number,
    properties: object
  } | null
}
```

### Bridge

```javascript
{
  id: string,
  tiles: Array<{x: number, y: number}>,
  isActive: boolean,
  condition: {
    type: 'score' | 'time' | 'event',
    value: any
  },
  toggleDuration: number // time to appear/disappear
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Fire damage application
*For any* player stepping on fire without immunity, they should take damage and lose points.
**Validates: Requirements 1.1**

### Property 2: Fire spreading
*For any* fire element, it should spread to adjacent walkable tiles over time.
**Validates: Requirements 1.2**

### Property 3: Fire immunity protection
*For any* player with fire immunity power-up, fire should not damage them.
**Validates: Requirements 1.3**

### Property 4: Water speed reduction
*For any* player in water, their movement speed should be exactly 50% of normal speed.
**Validates: Requirements 2.1**

### Property 5: Water fire protection
*For any* player in water, fire damage should be negated.
**Validates: Requirements 2.2**

### Property 6: Water extinguishes fire
*For any* water tile adjacent to fire, the fire should be extinguished.
**Validates: Requirements 2.3**

### Property 7: Electricity water interaction
*For any* electricity element touching water, an electrified water hazard area should be created.
**Validates: Requirements 2.4**

### Property 8: Water exit speed restoration
*For any* player exiting water, their movement speed should return to normal.
**Validates: Requirements 2.5**

### Property 9: Lava damage value
*For any* player touching lava, they should lose exactly 50 points.
**Validates: Requirements 3.1**

### Property 10: Lava flow rate
*For any* lava element, it should spread at the defined slow rate.
**Validates: Requirements 3.3**

### Property 11: Lava cooling
*For any* lava element, after its cooling duration, it should become safe terrain.
**Validates: Requirements 3.5**

### Property 12: Water fire steam creation
*For any* water meeting fire, steam should be created that obscures vision.
**Validates: Requirements 4.1**

### Property 13: Ice fire melting
*For any* ice meeting fire, the ice should transform into water.
**Validates: Requirements 4.2**

### Property 14: Electricity water hazard
*For any* electricity meeting water, an electrical hazard area should be created.
**Validates: Requirements 4.3**

### Property 15: Wind fire spreading
*For any* fire affected by wind, it should spread preferentially in the wind direction.
**Validates: Requirements 4.4**

### Property 16: Interaction synchronization
*For any* environmental interaction in multiplayer, all players should see the same effects.
**Validates: Requirements 4.5**

### Property 17: Bridge activation
*For any* bridge whose condition is met, the bridge should appear or disappear accordingly.
**Validates: Requirements 5.1**

### Property 18: Terrain path changes
*For any* environmental event, terrain accessibility should change as specified.
**Validates: Requirements 5.2**

### Property 19: Terrain change warnings
*For any* terrain change, players should receive advance warning.
**Validates: Requirements 5.3**

### Property 20: Alternative route existence
*For any* terrain configuration, there should always be at least one path between key areas.
**Validates: Requirements 5.4**

### Property 21: Item relocation
*For any* terrain change that affects item positions, items should relocate to safe positions.
**Validates: Requirements 5.5**

## Error Handling

### Element Collision Conflicts
- Use server-side validation for element placement in multiplayer
- Handle simultaneous element spawns with timestamps
- Prevent element stacking that causes performance issues
- Limit total active elements per area

### Interaction Processing Errors
- Process interactions in deterministic order
- Handle circular interactions (A affects B affects A)
- Prevent infinite interaction loops
- Log unexpected interaction results

### Terrain Connectivity Errors
- Validate terrain changes don't trap players
- Provide emergency teleport if player is trapped
- Ensure at least one path always exists
- Rollback terrain changes that break connectivity

### Synchronization Errors
- Retry failed element state syncs
- Use checksums to detect desync
- Provide resync mechanism
- Fall back to local simulation if sync fails

## Testing Strategy

### Unit Testing Framework
- Use existing test infrastructure
- Test each system in isolation
- Mock terrain grid and game state

### Unit Tests

1. **TerrainManager Tests**
   - Test tile get/set operations
   - Test walkability checks
   - Test pathfinding
   - Test element tracking

2. **ElementSystem Tests**
   - Test element spawning and removal
   - Test spreading algorithms
   - Test state transitions
   - Test element queries

3. **InteractionEngine Tests**
   - Test interaction rule registration
   - Test specific interactions (water+fire, ice+fire, etc.)
   - Test secondary effect creation
   - Test interaction processing order

4. **PlayerEnvironmentCollision Tests**
   - Test collision detection
   - Test damage application
   - Test speed modifiers
   - Test immunity checking

5. **DynamicTerrainSystem Tests**
   - Test bridge activation/deactivation
   - Test trigger checking
   - Test terrain change application
   - Test item relocation

### Property-Based Testing

We will use **fast-check** (JavaScript property-based testing library) to verify universal properties.

**Configuration**: Each property test should run a minimum of 100 iterations.

**Tagging**: Each property-based test must include a comment with format:
`// Feature: interactive-environment, Property {number}: {property_text}`

**Property Tests**:

1. **Property 1 Test**: Fire damage application
   - Generate random player positions on fire
   - Verify damage is applied
   - Tag: `// Feature: interactive-environment, Property 1: Fire damage application`

2. **Property 4 Test**: Water speed reduction
   - Generate random players in water
   - Verify speed is exactly 50%
   - Tag: `// Feature: interactive-environment, Property 4: Water speed reduction`

3. **Property 6 Test**: Water extinguishes fire
   - Generate fire adjacent to water
   - Verify fire is removed
   - Tag: `// Feature: interactive-environment, Property 6: Water extinguishes fire`

4. **Property 9 Test**: Lava damage value
   - Generate random players touching lava
   - Verify exactly 50 point loss
   - Tag: `// Feature: interactive-environment, Property 9: Lava damage value`

5. **Property 13 Test**: Ice fire melting
   - Generate ice meeting fire
   - Verify ice transforms to water
   - Tag: `// Feature: interactive-environment, Property 13: Ice fire melting`

6. **Property 20 Test**: Alternative route existence
   - Generate random terrain configurations
   - Verify path always exists
   - Tag: `// Feature: interactive-environment, Property 20: Alternative route existence`

### Integration Testing
- Test all elements together in gameplay
- Test complex interaction chains
- Test multiplayer synchronization
- Test performance with many active elements

### Manual Testing Checklist
- Verify all element visuals match spooky theme
- Test each element interaction
- Verify terrain changes are clear
- Test item relocation works correctly
- Verify warnings are visible and timely

## Implementation Notes

### Spooky Theme Integration
- Fire: ghostly green flames
- Water: murky swamp water
- Lava: bubbling cauldron liquid
- Ice: frozen spirit energy
- Electricity: purple lightning
- Steam: eerie fog
- Bridges: spectral platforms

### Performance Considerations
- Use spatial partitioning for element queries
- Limit element spreading calculations
- Batch terrain updates
- Use object pooling for elements
- Optimize collision checks

### Multiplayer Synchronization
- Server authoritative for element state
- Client prediction for element spreading
- Periodic full state sync
- Delta updates for efficiency

### Balance Considerations
- Fire damage: 10 points
- Lava damage: 50 points
- Electricity damage: 20 points
- Water speed: 50% reduction
- Fire spread rate: 0.5 tiles/second
- Lava spread rate: 0.2 tiles/second
- Lava cool time: 30 seconds

### Integration Points
- Integrate with game-core.js for updates
- Work with game-renderer.js for visuals
- Coordinate with collision-resolver.js
- Update multiplayer-mode.js for sync
- Integrate with power-up system for immunities
