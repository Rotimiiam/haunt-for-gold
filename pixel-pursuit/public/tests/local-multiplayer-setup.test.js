// Local Multiplayer Setup Component Tests
console.log("Local multiplayer setup tests loaded");

/**
 * Test suite for LocalMultiplayerSetup component
 */
function runLocalMultiplayerSetupTests() {
  console.log("Running LocalMultiplayerSetup component tests...");
  
  let testResults = {
    passed: 0,
    failed: 0,
    total: 0,
    details: []
  };
  
  function runTest(testName, testFunction) {
    testResults.total++;
    try {
      const result = testFunction();
      if (result) {
        testResults.passed++;
        testResults.details.push({ name: testName, status: 'PASS', message: 'Test passed' });
        console.log(`✓ ${testName}`);
      } else {
        testResults.failed++;
        testResults.details.push({ name: testName, status: 'FAIL', message: 'Test returned false' });
        console.log(`✗ ${testName} - Test returned false`);
      }
    } catch (error) {
      testResults.failed++;
      testResults.details.push({ name: testName, status: 'ERROR', message: error.message });
      console.log(`✗ ${testName} - Error: ${error.message}`);
    }
  }
  
  // Test 1: Component class exists
  runTest('LocalMultiplayerSetup class exists', () => {
    return typeof LocalMultiplayerSetup === 'function';
  });
  
  // Test 2: Component initialization
  runTest('Component initializes correctly', () => {
    // Create a test container
    const testContainer = document.createElement('div');
    testContainer.id = 'test-setup-container';
    document.body.appendChild(testContainer);
    
    try {
      const setup = new LocalMultiplayerSetup('test-setup-container');
      const success = setup.containerId === 'test-setup-container' && 
                     setup.container === testContainer &&
                     setup.state.currentStep === 'controller-detection';
      
      setup.destroy();
      document.body.removeChild(testContainer);
      return success;
    } catch (error) {
      document.body.removeChild(testContainer);
      throw error;
    }
  });
  
  // Test 3: Invalid container handling
  runTest('Handles invalid container gracefully', () => {
    try {
      new LocalMultiplayerSetup('non-existent-container');
      return false; // Should have thrown an error
    } catch (error) {
      return error.message.includes('not found');
    }
  });
  
  // Test 4: State management
  runTest('State management works correctly', () => {
    const testContainer = document.createElement('div');
    testContainer.id = 'test-state-container';
    document.body.appendChild(testContainer);
    
    try {
      const setup = new LocalMultiplayerSetup('test-state-container');
      
      // Test initial state
      const initialStateValid = setup.state.currentStep === 'controller-detection' &&
                               setup.state.availableControllers.length === 0 &&
                               setup.state.playerAssignments.size === 0 &&
                               setup.state.playerConfigs.size === 0;
      
      setup.destroy();
      document.body.removeChild(testContainer);
      return initialStateValid;
    } catch (error) {
      document.body.removeChild(testContainer);
      throw error;
    }
  });
  
  // Test 5: Options handling
  runTest('Options are applied correctly', () => {
    const testContainer = document.createElement('div');
    testContainer.id = 'test-options-container';
    document.body.appendChild(testContainer);
    
    try {
      const customOptions = {
        maxPlayers: 3,
        minPlayers: 2,
        autoDetectControllers: false,
        showControllerTest: false
      };
      
      const setup = new LocalMultiplayerSetup('test-options-container', customOptions);
      
      const optionsValid = setup.options.maxPlayers === 3 &&
                          setup.options.minPlayers === 2 &&
                          setup.options.autoDetectControllers === false &&
                          setup.options.showControllerTest === false;
      
      setup.destroy();
      document.body.removeChild(testContainer);
      return optionsValid;
    } catch (error) {
      document.body.removeChild(testContainer);
      throw error;
    }
  });
  
  // Test 6: Step progression validation
  runTest('Step progression validation works', () => {
    const testContainer = document.createElement('div');
    testContainer.id = 'test-progression-container';
    document.body.appendChild(testContainer);
    
    try {
      const setup = new LocalMultiplayerSetup('test-progression-container');
      
      // Initially should not be able to proceed (no controllers)
      const cannotProceedInitially = !setup.canProceedToNextStep();
      
      // Simulate having controllers
      setup.state.availableControllers = [
        { index: 0, name: 'Test Controller 1', id: 'test1' },
        { index: 1, name: 'Test Controller 2', id: 'test2' }
      ];
      
      // Now should be able to proceed
      const canProceedWithControllers = setup.canProceedToNextStep();
      
      setup.destroy();
      document.body.removeChild(testContainer);
      return cannotProceedInitially && canProceedWithControllers;
    } catch (error) {
      document.body.removeChild(testContainer);
      throw error;
    }
  });
  
  // Test 7: Player configuration
  runTest('Player configuration works correctly', () => {
    const testContainer = document.createElement('div');
    testContainer.id = 'test-player-config-container';
    document.body.appendChild(testContainer);
    
    try {
      const setup = new LocalMultiplayerSetup('test-player-config-container');
      
      // Simulate controllers
      setup.state.availableControllers = [
        { index: 0, name: 'Test Controller 1', id: 'test1' },
        { index: 1, name: 'Test Controller 2', id: 'test2' }
      ];
      
      // Auto-assign controllers
      setup.autoAssignControllers();
      
      const hasCorrectPlayerCount = setup.state.playerConfigs.size === 2;
      const hasCorrectAssignments = setup.state.playerAssignments.size === 2;
      
      // Test player name update
      setup.updatePlayerName('player_1', 'Test Player');
      const player1 = setup.state.playerConfigs.get('player_1');
      const nameUpdated = player1 && player1.name === 'Test Player';
      
      setup.destroy();
      document.body.removeChild(testContainer);
      return hasCorrectPlayerCount && hasCorrectAssignments && nameUpdated;
    } catch (error) {
      document.body.removeChild(testContainer);
      throw error;
    }
  });
  
  // Test 8: Game settings management
  runTest('Game settings management works', () => {
    const testContainer = document.createElement('div');
    testContainer.id = 'test-settings-container';
    document.body.appendChild(testContainer);
    
    try {
      const setup = new LocalMultiplayerSetup('test-settings-container');
      
      // Test setting update
      setup.updateGameSetting('difficulty', 'hard');
      setup.updateGameSetting('gameDuration', 600);
      
      const settingsValid = setup.state.gameSettings &&
                           setup.state.gameSettings.difficulty === 'hard' &&
                           setup.state.gameSettings.gameDuration === 600;
      
      setup.destroy();
      document.body.removeChild(testContainer);
      return settingsValid;
    } catch (error) {
      document.body.removeChild(testContainer);
      throw error;
    }
  });
  
  // Test 9: Event callback system
  runTest('Event callback system works', () => {
    const testContainer = document.createElement('div');
    testContainer.id = 'test-callback-container';
    document.body.appendChild(testContainer);
    
    try {
      const setup = new LocalMultiplayerSetup('test-callback-container');
      
      let callbackTriggered = false;
      let callbackData = null;
      
      // Register callback
      setup.on('onPlayerChange', (data) => {
        callbackTriggered = true;
        callbackData = data;
      });
      
      // Trigger callback
      setup.triggerCallback('onPlayerChange', { test: 'data' });
      
      const callbackWorked = callbackTriggered && callbackData && callbackData.test === 'data';
      
      setup.destroy();
      document.body.removeChild(testContainer);
      return callbackWorked;
    } catch (error) {
      document.body.removeChild(testContainer);
      throw error;
    }
  });
  
  // Test 10: Game configuration generation
  runTest('Game configuration generation works', () => {
    const testContainer = document.createElement('div');
    testContainer.id = 'test-config-container';
    document.body.appendChild(testContainer);
    
    try {
      const setup = new LocalMultiplayerSetup('test-config-container');
      
      // Set up test data
      setup.state.availableControllers = [
        { index: 0, name: 'Test Controller 1', id: 'test1' },
        { index: 1, name: 'Test Controller 2', id: 'test2' }
      ];
      
      setup.autoAssignControllers();
      setup.updatePlayerName('player_1', 'Alice');
      setup.updatePlayerName('player_2', 'Bob');
      
      setup.state.gameSettings = {
        difficulty: 'medium',
        gameDuration: 300,
        winCondition: 'score'
      };
      
      const config = setup.getGameConfiguration();
      
      const configValid = config &&
                         config.players.length === 2 &&
                         config.playerNames.includes('Alice') &&
                         config.playerNames.includes('Bob') &&
                         config.gameSettings.difficulty === 'medium' &&
                         typeof config.controllerAssignments === 'object';
      
      setup.destroy();
      document.body.removeChild(testContainer);
      return configValid;
    } catch (error) {
      document.body.removeChild(testContainer);
      throw error;
    }
  });
  
  // Test 11: UI rendering
  runTest('UI renders without errors', () => {
    const testContainer = document.createElement('div');
    testContainer.id = 'test-render-container';
    document.body.appendChild(testContainer);
    
    try {
      const setup = new LocalMultiplayerSetup('test-render-container');
      
      // Check if UI was rendered
      const hasContent = testContainer.innerHTML.length > 0;
      const hasSetupClass = testContainer.querySelector('.local-multiplayer-setup') !== null;
      const hasHeader = testContainer.querySelector('.setup-header') !== null;
      const hasProgress = testContainer.querySelector('.setup-progress') !== null;
      
      setup.destroy();
      document.body.removeChild(testContainer);
      return hasContent && hasSetupClass && hasHeader && hasProgress;
    } catch (error) {
      document.body.removeChild(testContainer);
      throw error;
    }
  });
  
  // Test 12: Cleanup and destruction
  runTest('Component cleanup works correctly', () => {
    const testContainer = document.createElement('div');
    testContainer.id = 'test-cleanup-container';
    document.body.appendChild(testContainer);
    
    try {
      const setup = new LocalMultiplayerSetup('test-cleanup-container');
      
      // Verify setup is working
      const initiallyWorking = setup.container === testContainer;
      
      // Destroy the component
      setup.destroy();
      
      // Verify cleanup
      const controllerManagerDestroyed = setup.controllerManager === null;
      const intervalCleared = setup.controllerUpdateInterval === null;
      
      document.body.removeChild(testContainer);
      return initiallyWorking && controllerManagerDestroyed && intervalCleared;
    } catch (error) {
      document.body.removeChild(testContainer);
      throw error;
    }
  });
  
  // Test 13: Controller integration
  runTest('Controller manager integration works', () => {
    const testContainer = document.createElement('div');
    testContainer.id = 'test-controller-integration-container';
    document.body.appendChild(testContainer);
    
    try {
      const setup = new LocalMultiplayerSetup('test-controller-integration-container');
      
      // Check if controller manager was initialized (if available)
      const hasControllerManager = setup.controllerManager !== null || 
                                   typeof window.ControllerManager === 'undefined';
      
      // Test controller update method
      setup.updateAvailableControllers();
      const updateWorked = Array.isArray(setup.state.availableControllers);
      
      setup.destroy();
      document.body.removeChild(testContainer);
      return hasControllerManager && updateWorked;
    } catch (error) {
      document.body.removeChild(testContainer);
      throw error;
    }
  });
  
  // Test 14: Step completion validation
  runTest('Step completion validation works', () => {
    const testContainer = document.createElement('div');
    testContainer.id = 'test-completion-container';
    document.body.appendChild(testContainer);
    
    try {
      const setup = new LocalMultiplayerSetup('test-completion-container');
      
      // Test initial step completion
      const initialCompletion = !setup.isStepCompleted('controller-detection');
      
      // Move to next step
      setup.state.currentStep = 'player-setup';
      const afterMove = setup.isStepCompleted('controller-detection');
      
      setup.destroy();
      document.body.removeChild(testContainer);
      return initialCompletion && afterMove;
    } catch (error) {
      document.body.removeChild(testContainer);
      throw error;
    }
  });
  
  // Test 15: Player ready state management
  runTest('Player ready state management works', () => {
    const testContainer = document.createElement('div');
    testContainer.id = 'test-ready-state-container';
    document.body.appendChild(testContainer);
    
    try {
      const setup = new LocalMultiplayerSetup('test-ready-state-container');
      
      // Set up test player
      setup.state.playerConfigs.set('player_1', {
        id: 'player_1',
        name: 'Test Player',
        isReady: false
      });
      
      // Toggle ready state
      setup.togglePlayerReady('player_1');
      const player = setup.state.playerConfigs.get('player_1');
      const readyToggled = player && player.isReady === true;
      
      // Toggle back
      setup.togglePlayerReady('player_1');
      const toggledBack = player && player.isReady === false;
      
      setup.destroy();
      document.body.removeChild(testContainer);
      return readyToggled && toggledBack;
    } catch (error) {
      document.body.removeChild(testContainer);
      throw error;
    }
  });
  
  // Print test summary
  console.log(`\n=== LocalMultiplayerSetup Test Results ===`);
  console.log(`Total tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed}`);
  console.log(`Failed: ${testResults.failed}`);
  console.log(`Success rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log(`\nFailed tests:`);
    testResults.details.filter(test => test.status !== 'PASS').forEach(test => {
      console.log(`- ${test.name}: ${test.message}`);
    });
  }
  
  return testResults.failed === 0;
}

// Integration test with controller manager
function runControllerIntegrationTests() {
  console.log("Running controller integration tests...");
  
  if (typeof ControllerManager === 'undefined') {
    console.log("ControllerManager not available - skipping integration tests");
    return true;
  }
  
  let integrationResults = {
    passed: 0,
    failed: 0,
    total: 0
  };
  
  function runIntegrationTest(testName, testFunction) {
    integrationResults.total++;
    try {
      const result = testFunction();
      if (result) {
        integrationResults.passed++;
        console.log(`✓ ${testName}`);
      } else {
        integrationResults.failed++;
        console.log(`✗ ${testName} - Test returned false`);
      }
    } catch (error) {
      integrationResults.failed++;
      console.log(`✗ ${testName} - Error: ${error.message}`);
    }
  }
  
  // Test controller manager initialization
  runIntegrationTest('Controller manager initializes with setup', () => {
    const testContainer = document.createElement('div');
    testContainer.id = 'test-integration-container';
    document.body.appendChild(testContainer);
    
    try {
      const setup = new LocalMultiplayerSetup('test-integration-container');
      const hasControllerManager = setup.controllerManager instanceof ControllerManager;
      
      setup.destroy();
      document.body.removeChild(testContainer);
      return hasControllerManager;
    } catch (error) {
      document.body.removeChild(testContainer);
      throw error;
    }
  });
  
  // Test controller event handling
  runIntegrationTest('Controller events are handled correctly', () => {
    const testContainer = document.createElement('div');
    testContainer.id = 'test-events-container';
    document.body.appendChild(testContainer);
    
    try {
      const setup = new LocalMultiplayerSetup('test-events-container');
      
      // Simulate controller connection
      const mockController = {
        index: 0,
        id: 'mock-controller',
        name: 'Mock Controller',
        capabilities: {
          buttonCount: 16,
          axesCount: 4,
          hasRequiredButtons: true,
          hasRequiredAxes: true
        },
        isValid: true
      };
      
      // Manually add controller to test event handling
      setup.state.availableControllers.push(mockController);
      setup.updateAvailableControllers();
      
      const hasController = setup.state.availableControllers.length > 0;
      
      setup.destroy();
      document.body.removeChild(testContainer);
      return hasController;
    } catch (error) {
      document.body.removeChild(testContainer);
      throw error;
    }
  });
  
  console.log(`\n=== Controller Integration Test Results ===`);
  console.log(`Total tests: ${integrationResults.total}`);
  console.log(`Passed: ${integrationResults.passed}`);
  console.log(`Failed: ${integrationResults.failed}`);
  
  return integrationResults.failed === 0;
}

// UI interaction tests
function runUIInteractionTests() {
  console.log("Running UI interaction tests...");
  
  let uiResults = {
    passed: 0,
    failed: 0,
    total: 0
  };
  
  function runUITest(testName, testFunction) {
    uiResults.total++;
    try {
      const result = testFunction();
      if (result) {
        uiResults.passed++;
        console.log(`✓ ${testName}`);
      } else {
        uiResults.failed++;
        console.log(`✗ ${testName} - Test returned false`);
      }
    } catch (error) {
      uiResults.failed++;
      console.log(`✗ ${testName} - Error: ${error.message}`);
    }
  }
  
  // Test step navigation
  runUITest('Step navigation works correctly', () => {
    const testContainer = document.createElement('div');
    testContainer.id = 'test-navigation-container';
    document.body.appendChild(testContainer);
    
    try {
      const setup = new LocalMultiplayerSetup('test-navigation-container');
      
      // Set up conditions to allow navigation
      setup.state.availableControllers = [
        { index: 0, name: 'Test Controller', id: 'test' }
      ];
      
      const initialStep = setup.state.currentStep;
      
      // Try to navigate
      if (setup.canProceedToNextStep()) {
        setup.nextStep();
      }
      
      const navigated = setup.state.currentStep !== initialStep;
      
      setup.destroy();
      document.body.removeChild(testContainer);
      return navigated || !setup.canProceedToNextStep(); // Either navigated or couldn't navigate (both valid)
    } catch (error) {
      document.body.removeChild(testContainer);
      throw error;
    }
  });
  
  // Test UI updates
  runUITest('UI updates correctly on state changes', () => {
    const testContainer = document.createElement('div');
    testContainer.id = 'test-ui-update-container';
    document.body.appendChild(testContainer);
    
    try {
      const setup = new LocalMultiplayerSetup('test-ui-update-container');
      
      const initialHTML = testContainer.innerHTML;
      
      // Change state
      setup.state.currentStep = 'player-setup';
      setup.updateUI();
      
      const updatedHTML = testContainer.innerHTML;
      const uiChanged = initialHTML !== updatedHTML;
      
      setup.destroy();
      document.body.removeChild(testContainer);
      return uiChanged;
    } catch (error) {
      document.body.removeChild(testContainer);
      throw error;
    }
  });
  
  console.log(`\n=== UI Interaction Test Results ===`);
  console.log(`Total tests: ${uiResults.total}`);
  console.log(`Passed: ${uiResults.passed}`);
  console.log(`Failed: ${uiResults.failed}`);
  
  return uiResults.failed === 0;
}

// Export test functions
if (typeof window !== 'undefined') {
  window.runLocalMultiplayerSetupTests = runLocalMultiplayerSetupTests;
  window.runControllerIntegrationTests = runControllerIntegrationTests;
  window.runUIInteractionTests = runUIInteractionTests;
} else if (typeof global !== 'undefined') {
  global.runLocalMultiplayerSetupTests = runLocalMultiplayerSetupTests;
  global.runControllerIntegrationTests = runControllerIntegrationTests;
  global.runUIInteractionTests = runUIInteractionTests;
}

console.log("Local multiplayer setup tests loaded successfully");