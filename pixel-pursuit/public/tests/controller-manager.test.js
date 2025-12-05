// Controller Manager Tests
console.log("Loading controller manager tests");

/**
 * Mock Gamepad API for testing
 */
class MockGamepad {
  constructor(index, id, buttons = 16, axes = 4) {
    this.index = index;
    this.id = id;
    this.connected = true;
    this.timestamp = Date.now();
    this.mapping = 'standard';
    
    // Create mock buttons
    this.buttons = [];
    for (let i = 0; i < buttons; i++) {
      this.buttons.push({
        pressed: false,
        touched: false,
        value: 0
      });
    }
    
    // Create mock axes
    this.axes = [];
    for (let i = 0; i < axes; i++) {
      this.axes.push(0);
    }
  }
  
  pressButton(index, value = 1) {
    if (this.buttons[index]) {
      this.buttons[index].pressed = true;
      this.buttons[index].value = value;
    }
  }
  
  releaseButton(index) {
    if (this.buttons[index]) {
      this.buttons[index].pressed = false;
      this.buttons[index].value = 0;
    }
  }
  
  setAxis(index, value) {
    if (this.axes[index] !== undefined) {
      this.axes[index] = value;
    }
  }
}

/**
 * Mock navigator.getGamepads for testing
 */
function setupGamepadMock() {
  const mockGamepads = [];
  
  // Mock the navigator.getGamepads function
  navigator.getGamepads = function() {
    return mockGamepads;
  };
  
  return {
    addGamepad: (gamepad) => {
      mockGamepads[gamepad.index] = gamepad;
      
      // Trigger gamepadconnected event if supported
      if ('ongamepadconnected' in window) {
        const event = new Event('gamepadconnected');
        event.gamepad = gamepad;
        window.dispatchEvent(event);
      }
    },
    
    removeGamepad: (index) => {
      const gamepad = mockGamepads[index];
      if (gamepad) {
        mockGamepads[index] = null;
        
        // Trigger gamepaddisconnected event if supported
        if ('ongamepaddisconnected' in window) {
          const event = new Event('gamepaddisconnected');
          event.gamepad = gamepad;
          window.dispatchEvent(event);
        }
      }
    },
    
    getGamepad: (index) => mockGamepads[index],
    
    clear: () => {
      mockGamepads.length = 0;
    }
  };
}

/**
 * Test Suite for ControllerManager
 */
const ControllerManagerTests = {
  
  /**
   * Test controller detection
   */
  testControllerDetection: function() {
    console.log("Testing controller detection...");
    
    const mock = setupGamepadMock();
    const manager = new ControllerManager();
    
    // Test initial state
    assert(manager.getControllerCount() === 0, "Initial controller count should be 0");
    assert(!manager.isLocalMultiplayerAvailable(), "Local multiplayer should not be available initially");
    
    // Add a controller
    const gamepad1 = new MockGamepad(0, "Xbox Controller");
    mock.addGamepad(gamepad1);
    
    manager.detectControllers();
    
    assert(manager.getControllerCount() === 1, "Should detect 1 controller");
    assert(!manager.isLocalMultiplayerAvailable(), "Local multiplayer should not be available with 1 controller");
    
    // Add second controller
    const gamepad2 = new MockGamepad(1, "PlayStation Controller");
    mock.addGamepad(gamepad2);
    
    manager.detectControllers();
    
    assert(manager.getControllerCount() === 2, "Should detect 2 controllers");
    assert(manager.isLocalMultiplayerAvailable(), "Local multiplayer should be available with 2 controllers");
    assert(manager.getMaxPlayers() === 2, "Max players should be 2");
    
    // Test controller removal
    mock.removeGamepad(0);
    manager.detectControllers();
    
    assert(manager.getControllerCount() === 1, "Should have 1 controller after removal");
    assert(!manager.isLocalMultiplayerAvailable(), "Local multiplayer should not be available after removal");
    
    manager.destroy();
    mock.clear();
    console.log("✓ Controller detection tests passed");
  },
  
  /**
   * Test controller capabilities
   */
  testControllerCapabilities: function() {
    console.log("Testing controller capabilities...");
    
    const mock = setupGamepadMock();
    const manager = new ControllerManager();
    
    // Test valid controller
    const validGamepad = new MockGamepad(0, "Xbox Controller", 16, 4);
    mock.addGamepad(validGamepad);
    manager.detectControllers();
    
    const controllers = manager.getAvailableControllers();
    assert(controllers.length === 1, "Should have 1 available controller");
    
    const controller = controllers[0];
    assert(controller.capabilities.buttonCount === 16, "Should have 16 buttons");
    assert(controller.capabilities.axesCount === 4, "Should have 4 axes");
    assert(controller.capabilities.hasRequiredButtons, "Should have required buttons");
    assert(controller.capabilities.hasRequiredAxes, "Should have required axes");
    
    // Test invalid controller (too few buttons)
    mock.clear();
    const invalidGamepad = new MockGamepad(1, "Invalid Controller", 2, 1);
    mock.addGamepad(invalidGamepad);
    manager.detectControllers();
    
    const invalidControllers = manager.getAvailableControllers();
    assert(invalidControllers.length === 0, "Should have 0 available controllers for invalid gamepad");
    
    manager.destroy();
    mock.clear();
    console.log("✓ Controller capabilities tests passed");
  },
  
  /**
   * Test controller assignment
   */
  testControllerAssignment: function() {
    console.log("Testing controller assignment...");
    
    const mock = setupGamepadMock();
    const manager = new ControllerManager();
    
    // Add controllers
    const gamepad1 = new MockGamepad(0, "Xbox Controller");
    const gamepad2 = new MockGamepad(1, "PlayStation Controller");
    mock.addGamepad(gamepad1);
    mock.addGamepad(gamepad2);
    
    manager.detectControllers();
    
    // Test assignment
    assert(manager.assignControllerToPlayer(0, "player1"), "Should assign controller 0 to player1");
    assert(manager.getPlayerAssignment(0) === "player1", "Controller 0 should be assigned to player1");
    assert(manager.getControllerForPlayer("player1") === 0, "Player1 should have controller 0");
    
    // Test reassignment
    assert(manager.assignControllerToPlayer(1, "player1"), "Should reassign player1 to controller 1");
    assert(manager.getPlayerAssignment(0) === null, "Controller 0 should no longer be assigned");
    assert(manager.getPlayerAssignment(1) === "player1", "Controller 1 should be assigned to player1");
    
    // Test multiple assignments
    assert(manager.assignControllerToPlayer(0, "player2"), "Should assign controller 0 to player2");
    assert(manager.getPlayerAssignment(0) === "player2", "Controller 0 should be assigned to player2");
    assert(manager.getPlayerAssignment(1) === "player1", "Controller 1 should still be assigned to player1");
    
    // Test unassignment
    assert(manager.unassignController(0), "Should unassign controller 0");
    assert(manager.getPlayerAssignment(0) === null, "Controller 0 should not be assigned");
    assert(manager.getControllerForPlayer("player2") === null, "Player2 should not have a controller");
    
    manager.destroy();
    mock.clear();
    console.log("✓ Controller assignment tests passed");
  },
  
  /**
   * Test controller state management
   */
  testControllerState: function() {
    console.log("Testing controller state management...");
    
    const mock = setupGamepadMock();
    const manager = new ControllerManager();
    
    const gamepad = new MockGamepad(0, "Test Controller");
    mock.addGamepad(gamepad);
    manager.detectControllers();
    manager.startMonitoring();
    
    // Wait a bit for initial state
    setTimeout(() => {
      // Test button press
      gamepad.pressButton(0); // A button
      manager.updateControllerStates();
      
      assert(manager.isButtonPressed(0, "button0"), "Button 0 should be pressed");
      
      // Test button release
      gamepad.releaseButton(0);
      manager.updateControllerStates();
      
      assert(!manager.isButtonPressed(0, "button0"), "Button 0 should not be pressed");
      
      // Test axis movement
      gamepad.setAxis(0, 0.8);
      manager.updateControllerStates();
      
      const axisValue = manager.getAxisValue(0, "axis0");
      assert(Math.abs(axisValue - 0.8) < 0.1, "Axis 0 should have value ~0.8");
      
      // Test deadzone
      gamepad.setAxis(0, 0.05);
      manager.updateControllerStates();
      
      const smallAxisValue = manager.getAxisValue(0, "axis0");
      assert(smallAxisValue === 0, "Small axis values should be filtered by deadzone");
      
      manager.destroy();
      mock.clear();
      console.log("✓ Controller state tests passed");
    }, 150);
  },
  
  /**
   * Test controller input testing
   */
  testControllerInputTesting: async function() {
    console.log("Testing controller input testing...");
    
    const mock = setupGamepadMock();
    const manager = new ControllerManager();
    
    const gamepad = new MockGamepad(0, "Test Controller");
    mock.addGamepad(gamepad);
    manager.detectControllers();
    manager.startMonitoring();
    
    // Start input test
    const testPromise = manager.testControllerInput(0, 1000);
    
    // Simulate some inputs during test
    setTimeout(() => {
      gamepad.pressButton(0);
      manager.updateControllerStates();
    }, 200);
    
    setTimeout(() => {
      gamepad.setAxis(0, 0.9);
      manager.updateControllerStates();
    }, 400);
    
    const results = await testPromise;
    
    assert(results.success, "Input test should succeed");
    assert(results.inputsDetected.length > 0, "Should detect some inputs");
    assert(results.controllerIndex === 0, "Should test correct controller");
    
    manager.destroy();
    mock.clear();
    console.log("✓ Controller input testing tests passed");
  },
  
  /**
   * Test event listeners
   */
  testEventListeners: function() {
    console.log("Testing event listeners...");
    
    const mock = setupGamepadMock();
    const manager = new ControllerManager();
    
    let connectCalled = false;
    let disconnectCalled = false;
    let connectedController = null;
    let disconnectedController = null;
    
    // Register listeners
    manager.onControllerConnect((controller) => {
      connectCalled = true;
      connectedController = controller;
    });
    
    manager.onControllerDisconnect((controller) => {
      disconnectCalled = true;
      disconnectedController = controller;
    });
    
    // Add controller
    const gamepad = new MockGamepad(0, "Test Controller");
    mock.addGamepad(gamepad);
    manager.detectControllers();
    
    assert(connectCalled, "Connect listener should be called");
    assert(connectedController !== null, "Connected controller should be provided");
    assert(connectedController.index === 0, "Connected controller should have correct index");
    
    // Remove controller
    mock.removeGamepad(0);
    manager.detectControllers();
    
    assert(disconnectCalled, "Disconnect listener should be called");
    assert(disconnectedController !== null, "Disconnected controller should be provided");
    
    manager.destroy();
    mock.clear();
    console.log("✓ Event listeners tests passed");
  },
  
  /**
   * Test error handling
   */
  testErrorHandling: function() {
    console.log("Testing error handling...");
    
    const mock = setupGamepadMock();
    const manager = new ControllerManager();
    
    // Test assignment to non-existent controller
    try {
      manager.assignControllerToPlayer(99, "player1");
      assert(false, "Should throw error for non-existent controller");
    } catch (error) {
      assert(error.message.includes("not found"), "Should throw 'not found' error");
    }
    
    // Test invalid controller assignment
    const invalidGamepad = new MockGamepad(0, "Invalid Controller", 2, 1);
    mock.addGamepad(invalidGamepad);
    manager.detectControllers();
    
    try {
      manager.assignControllerToPlayer(0, "player1");
      assert(false, "Should throw error for invalid controller");
    } catch (error) {
      assert(error.message.includes("does not meet requirements"), "Should throw requirements error");
    }
    
    // Test state access for non-existent controller
    const state = manager.getControllerState(99);
    assert(state === null, "Should return null for non-existent controller state");
    
    const buttonPressed = manager.isButtonPressed(99, "button0");
    assert(buttonPressed === false, "Should return false for non-existent controller button");
    
    manager.destroy();
    mock.clear();
    console.log("✓ Error handling tests passed");
  },
  
  /**
   * Test monitoring lifecycle
   */
  testMonitoringLifecycle: function() {
    console.log("Testing monitoring lifecycle...");
    
    const manager = new ControllerManager();
    
    assert(!manager.isMonitoring, "Should not be monitoring initially");
    
    manager.startMonitoring();
    assert(manager.isMonitoring, "Should be monitoring after start");
    
    // Test double start (should not cause issues)
    manager.startMonitoring();
    assert(manager.isMonitoring, "Should still be monitoring after double start");
    
    manager.stopMonitoring();
    assert(!manager.isMonitoring, "Should not be monitoring after stop");
    
    // Test double stop (should not cause issues)
    manager.stopMonitoring();
    assert(!manager.isMonitoring, "Should still not be monitoring after double stop");
    
    manager.destroy();
    console.log("✓ Monitoring lifecycle tests passed");
  },
  
  /**
   * Run all tests
   */
  runAllTests: async function() {
    console.log("Running ControllerManager tests...");
    
    try {
      this.testControllerDetection();
      this.testControllerCapabilities();
      this.testControllerAssignment();
      this.testControllerState();
      await this.testControllerInputTesting();
      this.testEventListeners();
      this.testErrorHandling();
      this.testMonitoringLifecycle();
      
      console.log("✅ All ControllerManager tests passed!");
      return true;
    } catch (error) {
      console.error("❌ ControllerManager test failed:", error);
      return false;
    }
  }
};

/**
 * Simple assertion function
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// Export tests
if (typeof window !== 'undefined') {
  window.ControllerManagerTests = ControllerManagerTests;
} else if (typeof global !== 'undefined') {
  global.ControllerManagerTests = ControllerManagerTests;
}

console.log("Controller manager tests loaded");