// Quick validation script for LocalMultiplayerSetup component
console.log("Running LocalMultiplayerSetup validation...");

// Check if all required classes are available
const requiredClasses = [
    'LocalMultiplayerSetup',
    'LocalPlayer',
    'LocalGameSettings',
    'ControllerManager'
];

let allAvailable = true;
requiredClasses.forEach(className => {
    if (typeof window[className] === 'undefined') {
        console.error(`❌ ${className} is not available`);
        allAvailable = false;
    } else {
        console.log(`✅ ${className} is available`);
    }
});

if (!allAvailable) {
    console.error("❌ Some required classes are missing");
    process.exit(1);
}

// Test basic component creation
try {
    // Create a test container
    const testDiv = document.createElement('div');
    testDiv.id = 'validation-test-container';
    document.body.appendChild(testDiv);
    
    // Create setup component
    const setup = new LocalMultiplayerSetup('validation-test-container');
    
    // Verify basic properties
    if (setup.containerId === 'validation-test-container' &&
        setup.state.currentStep === 'controller-detection' &&
        Array.isArray(setup.state.availableControllers)) {
        console.log("✅ Component created successfully with correct initial state");
    } else {
        console.error("❌ Component state is incorrect");
    }
    
    // Test state management
    setup.updateGameSetting('difficulty', 'hard');
    if (setup.state.gameSettings && setup.state.gameSettings.difficulty === 'hard') {
        console.log("✅ State management works correctly");
    } else {
        console.error("❌ State management failed");
    }
    
    // Test callback system
    let callbackTriggered = false;
    setup.on('onPlayerChange', () => {
        callbackTriggered = true;
    });
    setup.triggerCallback('onPlayerChange');
    
    if (callbackTriggered) {
        console.log("✅ Callback system works correctly");
    } else {
        console.error("❌ Callback system failed");
    }
    
    // Cleanup
    setup.destroy();
    document.body.removeChild(testDiv);
    
    console.log("✅ LocalMultiplayerSetup component validation completed successfully!");
    
} catch (error) {
    console.error(`❌ Component validation failed: ${error.message}`);
    console.error(error.stack);
}

console.log("Validation complete.");