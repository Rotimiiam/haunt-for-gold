# Controller Support - Design Document

## Overview

This design implements comprehensive gamepad and controller support for Haunt For Gold using the Gamepad API. The system provides automatic controller detection, customizable button mapping, multi-controller support, and seamless integration with existing keyboard controls. The design ensures players can use Xbox, PlayStation, and generic controllers for a comfortable gaming experience.

## Architecture

### Core Components

1. **Controller Manager** (`controller-manager.js`)
   - Detects and manages connected controllers
   - Polls controller state each frame
   - Handles controller connection/disconnection events
   - Manages controller-to-player mapping

2. **Input Mapper**
   - Maps controller inputs to game actions
   - Supports customizable button layouts
   - Handles analog stick and D-pad input
   - Manages input priority (controller vs keyboard)

3. **Configuration Manager**
   - Stores and retrieves controller settings
   - Persists configurations to localStorage
   - Manages per-controller settings
   - Provides default mappings for common controllers

4. **UI Adapter**
   - Updates button prompts based on active input method
   - Shows controller status indicators
   - Displays battery warnings
   - Provides visual feedback for controller input

5. **Vibration Manager**
   - Triggers haptic feedback for game events
   - Manages vibration intensity and duration
   - Handles controllers without vibration support

## Components and Interfaces

### ControllerManager

```javascript
class ControllerManager {
  constructor() {
    this.controllers = new Map(); // gamepad index -> controller state
    this.playerAssignments = new Map(); // player ID -> gamepad index
    this.isPolling = false;
  }

  // Detection and lifecycle
  initialize();
  startPolling();
  stopPolling();
  
  // Controller management
  getConnectedControllers();
  getControllerForPlayer(playerId);
  assignControllerToPlayer(gamepadIndex, playerId);
  
  // State reading
  pollControllers();
  getControllerState(gamepadIndex);
  
  // Event handling
  onControllerConnected(event);
  onControllerDisconnected(event);
}
```

### InputMapper

```javascript
class InputMapper {
  constructor() {
    this.buttonMappings = new Map(); // button index -> action
    this.axisMappings = new Map(); // axis index -> action
    this.deadzone = 0.15;
  }

  // Mapping management
  setButtonMapping(button, action);
  setAxisMapping(axis, action);
  getMapping(controllerId);
  resetToDefaults();
  
  // Input processing
  processControllerInput(gamepadState);
  getMovementFromAnalog(xAxis, yAxis);
  getMovementFromDPad(buttons);
  
  // Priority handling
  shouldUseControllerInput();
  setInputPriority(method); // 'controller' | 'keyboard' | 'auto'
}
```

### ConfigurationManager

```javascript
class ConfigurationManager {
  // Persistence
  saveConfiguration(controllerId, config);
  loadConfiguration(controllerId);
  deleteConfiguration(controllerId);
  
  // Defaults
  getDefaultMapping(controllerType);
  detectControllerType(gamepad);
  
  // Multi-controller
  getAllConfigurations();
  exportConfiguration();
  importConfiguration(data);
}
```

### UIAdapter

```javascript
class UIAdapter {
  // Button prompts
  updateButtonPrompts(inputMethod);
  getButtonIcon(action, inputMethod);
  
  // Status display
  showControllerIcon(controllerId);
  hideControllerIcon(controllerId);
  updateBatteryStatus(controllerId, level);
  showLowBatteryWarning(controllerId);
  
  // Visual feedback
  showInputFeedback(action);
  highlightActiveController(controllerId);
  
  // Settings UI
  renderMappingInterface(controllerId);
  showTestingInterface();
}
```

### VibrationManager

```javascript
class VibrationManager {
  // Vibration control
  vibrate(controllerId, intensity, duration);
  stopVibration(controllerId);
  
  // Event-based vibration
  vibrateOnCoinCollect(controllerId);
  vibrateOnEnemyHit(controllerId);
  vibrateOnGameEnd(controllerId);
  
  // Capability checking
  supportsVibration(controllerId);
}
```

## Data Models

### ControllerState

```javascript
{
  gamepadIndex: number,
  id: string,
  connected: boolean,
  timestamp: number,
  buttons: Array<{pressed: boolean, value: number}>,
  axes: Array<number>,
  mapping: 'standard' | 'unknown',
  vibrationActuator: GamepadHapticActuator | null
}
```

### ControllerConfiguration

```javascript
{
  controllerId: string,
  playerName: string,
  buttonMappings: {
    [buttonIndex: number]: string // action name
  },
  axisMappings: {
    [axisIndex: number]: string // action name
  },
  deadzone: number,
  vibrationEnabled: boolean,
  lastModified: timestamp
}
```

### InputAction

```javascript
{
  type: 'movement' | 'ability' | 'menu' | 'pause',
  value: number | {x: number, y: number},
  source: 'controller' | 'keyboard',
  controllerId: string | null
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Controller detection
*For any* controller connection event, the system should detect and add the controller to the available controllers list.
**Validates: Requirements 1.1**

### Property 2: Movement input mapping
*For any* analog stick or D-pad input within valid ranges, the system should produce corresponding movement commands with correct direction and magnitude.
**Validates: Requirements 1.2**

### Property 3: Button action mapping
*For any* mapped button press, the system should trigger the corresponding game action.
**Validates: Requirements 1.3**

### Property 4: Menu navigation
*For any* controller navigation input (D-pad or stick), the menu system should update its selection state accordingly.
**Validates: Requirements 1.4**

### Property 5: Button remapping flexibility
*For any* button and any action, the player should be able to create a mapping between them and have it stored correctly.
**Validates: Requirements 2.2**

### Property 6: Configuration persistence
*For any* controller configuration, saving and then loading it should produce an equivalent configuration.
**Validates: Requirements 2.4**

### Property 7: Independent multi-controller settings
*For any* set of multiple controllers with different configurations, changing one controller's settings should not affect the others.
**Validates: Requirements 2.5**

### Property 8: Mixed input method support
*For any* combination of keyboard and controller inputs from different players, all inputs should be processed and produce their respective actions.
**Validates: Requirements 3.1**

### Property 9: Controller capability adaptation
*For any* controller with a specific set of capabilities (buttons, axes, vibration), the system should only use features that the controller supports.
**Validates: Requirements 3.3**

### Property 10: Input priority
*For any* simultaneous controller and keyboard input for the same action, the controller input should take priority.
**Validates: Requirements 3.4**

### Property 11: Button prompt adaptation
*For any* active controller, UI button prompts should display controller button icons instead of keyboard keys.
**Validates: Requirements 4.1**

### Property 12: Input visual feedback
*For any* detected controller input, the UI should provide visual confirmation of the action.
**Validates: Requirements 4.4**

### Property 13: Multi-controller status display
*For any* set of connected controllers, each should have its own distinct status indicator in the UI.
**Validates: Requirements 4.5**

### Property 14: Event-based vibration
*For any* game event that should trigger vibration (coin collect, enemy hit, etc.), the system should send vibration commands to controllers that support it.
**Validates: Requirements 5.1**

### Property 15: Analog trigger sensitivity
*For any* analog trigger input value, the system should process it with variable sensitivity based on the pressure applied.
**Validates: Requirements 5.2**

### Property 16: Additional button mapping
*For any* controller button (including non-standard buttons), the system should allow mapping it to game functions.
**Validates: Requirements 5.4**

## Error Handling

### Controller Disconnection
- Pause game immediately when active controller disconnects
- Show reconnection prompt with controller icon
- Resume game when same controller reconnects
- Allow switching to different controller or keyboard

### Unsupported Controllers
- Fall back to generic mapping for unknown controllers
- Log controller ID for future support
- Allow manual button mapping
- Provide clear feedback about limited support

### Configuration Errors
- Use default mapping if saved configuration is corrupted
- Validate configuration data before applying
- Provide reset to defaults option
- Log configuration errors for debugging

### Input Conflicts
- Implement clear priority rules (controller > keyboard when both active)
- Prevent multiple controllers controlling same player
- Handle rapid input method switching gracefully

### Vibration Errors
- Silently fail if vibration not supported
- Don't block gameplay on vibration errors
- Provide option to disable vibration

## Testing Strategy

### Unit Testing Framework
- Use existing test infrastructure
- Test each manager class in isolation
- Mock Gamepad API for consistent testing

### Unit Tests

1. **ControllerManager Tests**
   - Test controller detection and tracking
   - Test player assignment
   - Test polling lifecycle

2. **InputMapper Tests**
   - Test button mapping storage and retrieval
   - Test analog stick deadzone handling
   - Test D-pad input processing
   - Test input priority rules

3. **ConfigurationManager Tests**
   - Test save/load functionality
   - Test default mappings
   - Test multi-controller configuration isolation

4. **UIAdapter Tests**
   - Test button prompt updates
   - Test status indicator display
   - Test visual feedback triggers

5. **VibrationManager Tests**
   - Test vibration command generation
   - Test capability checking
   - Test event-based triggers

### Property-Based Testing

We will use **fast-check** (JavaScript property-based testing library) to verify universal properties.

**Configuration**: Each property test should run a minimum of 100 iterations.

**Tagging**: Each property-based test must include a comment with format:
`// Feature: controller-support, Property {number}: {property_text}`

**Property Tests**:

1. **Property 2 Test**: Movement input mapping
   - Generate random analog stick values
   - Verify movement commands have correct direction/magnitude
   - Tag: `// Feature: controller-support, Property 2: Movement input mapping`

2. **Property 3 Test**: Button action mapping
   - Generate random button mappings and presses
   - Verify correct actions are triggered
   - Tag: `// Feature: controller-support, Property 3: Button action mapping`

3. **Property 5 Test**: Button remapping flexibility
   - Generate random button-to-action assignments
   - Verify mappings are stored correctly
   - Tag: `// Feature: controller-support, Property 5: Button remapping flexibility`

4. **Property 6 Test**: Configuration persistence
   - Generate random configurations
   - Save and load, verify equivalence
   - Tag: `// Feature: controller-support, Property 6: Configuration persistence`

5. **Property 7 Test**: Independent multi-controller settings
   - Generate multiple controller configurations
   - Modify one, verify others unchanged
   - Tag: `// Feature: controller-support, Property 7: Independent multi-controller settings`

6. **Property 10 Test**: Input priority
   - Generate simultaneous controller and keyboard inputs
   - Verify controller takes priority
   - Tag: `// Feature: controller-support, Property 10: Input priority`

### Integration Testing
- Test controller with actual gameplay
- Test controller settings UI
- Test multi-controller local multiplayer
- Test controller disconnect/reconnect flow

### Manual Testing Checklist
- Test with Xbox controller
- Test with PlayStation controller
- Test with generic USB controller
- Test button remapping UI
- Test vibration feedback
- Test battery warning (if supported)
- Test controller navigation in all menus

## Implementation Notes

### Gamepad API Considerations
- Use `navigator.getGamepads()` for polling
- Listen to `gamepadconnected` and `gamepaddisconnected` events
- Handle browser differences (Chrome vs Firefox)
- Check for `standard` mapping support

### Performance
- Poll controllers at 60 FPS (once per frame)
- Minimize allocations in polling loop
- Cache controller state to detect changes
- Debounce button presses to prevent double-triggers

### Browser Compatibility
- Gamepad API supported in Chrome, Firefox, Edge, Safari
- Vibration support varies by browser
- Test on multiple browsers
- Provide fallbacks for unsupported features

### Integration with Existing Code
- Integrate with game-core.js for input processing
- Work with existing keyboard input system
- Coordinate with local-multiplayer-game.js
- Update UI components to show controller prompts

### Default Button Mappings

**Standard Gamepad (Xbox/PlayStation layout)**:
- Left Stick / D-Pad: Movement
- A / X: Sprint/Dash
- B / Circle: Special ability
- Start: Pause menu
- Select/Share: Open settings

### localStorage Schema

```javascript
{
  'controller_config_<controller_id>': {
    buttonMappings: {...},
    axisMappings: {...},
    deadzone: 0.15,
    vibrationEnabled: true,
    lastModified: timestamp
  }
}
```
