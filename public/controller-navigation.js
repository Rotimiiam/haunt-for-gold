/**
 * Global Controller Navigation System
 * Provides gamepad support for menus and gameplay
 */

console.log('Controller navigation system loaded');

class ControllerNavigationSystem {
    constructor() {
        this.connectedControllers = [];
        this.lastButtonStates = {};
        this.currentFocusIndex = 0;
        this.focusableElements = [];
        this.isActive = false;
        this.lastAxisStates = {};

        this.init();
    }

    init() {
        if (!navigator.getGamepads) {
            console.log('Gamepad API not supported');
            return;
        }

        // Listen for controller events
        window.addEventListener('gamepadconnected', (e) => {
            console.log('Controller connected:', e.gamepad.id);
            this.updateControllers();
            this.updateFocusableElements();
        });

        window.addEventListener('gamepaddisconnected', (e) => {
            console.log('Controller disconnected:', e.gamepad.id);
            this.updateControllers();
        });

        // Start polling immediately
        this.startPolling();

        // Setup mutation observer to detect screen changes
        this.setupMutationObserver();

        // Enable navigation
        this.enable();

        // Check for already connected controllers on page load
        // Some browsers don't fire gamepadconnected for already-connected controllers
        setTimeout(() => {
            this.updateControllers();
            if (this.connectedControllers.length > 0) {
                console.log('Found pre-connected controllers on load');
                this.updateFocusableElements();
            }
        }, 100);

        // Also check after DOM is fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.updateControllers();
                this.updateFocusableElements();
            });
        } else {
            // DOM already loaded
            setTimeout(() => {
                this.updateControllers();
                this.updateFocusableElements();
            }, 500);
        }

        // Periodically refresh focusable elements and check for controllers
        setInterval(() => {
            if (this.isActive) {
                this.updateControllers();
                // Always update focusable elements to catch screen changes
                this.updateFocusableElements();
            }
        }, 500);

        // More aggressive initial controller detection
        // Some browsers require user interaction before detecting gamepads
        const detectOnInteraction = () => {
            this.updateControllers();
            if (this.connectedControllers.length > 0) {
                console.log('Controllers detected after interaction');
                this.updateFocusableElements();
            }
        };
        
        // Detect on any user interaction
        window.addEventListener('click', detectOnInteraction, { once: true });
        window.addEventListener('keydown', detectOnInteraction, { once: true });
        window.addEventListener('touchstart', detectOnInteraction, { once: true });
    }

    updateControllers() {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        this.connectedControllers = Array.from(gamepads).filter(gp => gp !== null);
        // Only log when there are controllers to avoid console spam
        if (this.connectedControllers.length > 0) {
            console.log(`Controllers active: ${this.connectedControllers.length}`);
        }
    }

    enable() {
        this.isActive = true;
        this.updateFocusableElements();
    }

    disable() {
        this.isActive = false;
    }

    // Check if a modal/overlay is currently open
    isModalOpen() {
        const localSetup = document.getElementById('localMultiplayerSetup');
        const winnerScreen = document.getElementById('winnerScreen');
        const waitingScreen = document.getElementById('waitingScreen');
        const nameDialog = document.getElementById('nameDialog');
        const cookieOverlay = document.getElementById('cookieConsentOverlay');
        
        return (localSetup && localSetup.style.display !== 'none') ||
               (winnerScreen && winnerScreen.style.display !== 'none') ||
               (waitingScreen && waitingScreen.style.display !== 'none') ||
               (nameDialog && nameDialog.style.display !== 'none') ||
               (cookieOverlay);
    }

    // Check if element is visible
    isElementDisplayed(element) {
        if (!element) return false;
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden';
    }

    // Get the currently active container for focusable elements
    getActiveContainer() {
        // Check overlays/modals first (highest priority)
        const pauseOverlay = document.getElementById('pauseOverlay');
        if (pauseOverlay && this.isElementDisplayed(pauseOverlay)) {
            return pauseOverlay;
        }

        const cookieOverlay = document.getElementById('cookieConsentOverlay');
        if (cookieOverlay && this.isElementDisplayed(cookieOverlay)) {
            return cookieOverlay;
        }
        
        const localSetup = document.getElementById('localMultiplayerSetup');
        if (localSetup && this.isElementDisplayed(localSetup)) {
            return localSetup;
        }
        
        const winnerScreen = document.getElementById('winnerScreen');
        if (winnerScreen && this.isElementDisplayed(winnerScreen)) {
            return winnerScreen;
        }
        
        const waitingScreen = document.getElementById('waitingScreen');
        if (waitingScreen && this.isElementDisplayed(waitingScreen)) {
            return waitingScreen;
        }
        
        const homeScreen = document.getElementById('homeScreen');
        if (homeScreen && this.isElementDisplayed(homeScreen)) {
            return homeScreen;
        }
        
        return document.body;
    }

    updateFocusableElements() {
        // Get the active container to limit focus scope
        const activeContainer = this.getActiveContainer();
        
        // Get all focusable elements on the page
        const selectors = [
            '#multiplayerBtn',            // Online multiplayer button
            '#localMultiplayerBtn',       // Local multiplayer button
            '#practiceBtn',               // Practice mode button
            '.spooky-btn',                // All spooky themed buttons
            '.join-btn.cadence-style',    // Main menu buttons (legacy)
            '.mode-btn',                  // Mode selection in multiplayer setup
            '.character-card',            // Character selection
            '.start-game-btn',            // Start game button
            'button.count-btn',           // Player count buttons
            '.close-btn',                 // Close button
            '#playAgainBtn',              // Play again button
            '#homeBtn',                   // Home button
            '.play-again-btn',            // Play again button (class)
            '.home-btn',                  // Home button (class)
            '.player-count-btn',          // Player count selection buttons
            '.setup-close-btn',           // Setup close button
            '#acceptCookies',             // Cookie accept button
            'select',                     // Dropdown selects
            'input[type="text"]',         // Text inputs
            'input[type="number"]',       // Number inputs
            'button:not(.control-btn):not(:disabled)'  // Other buttons except controls
        ];

        this.focusableElements = Array.from(
            activeContainer.querySelectorAll(selectors.join(','))
        ).filter(el => {
            // Only include visible elements and exclude system/hidden buttons
            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();

            // Exclude if hidden, not visible, or has no dimensions
            if (style.display === 'none' || style.visibility === 'hidden' || rect.width === 0 || rect.height === 0) {
                return false;
            }

            // Exclude control buttons (arrow keys on screen)
            if (el.classList.contains('control-btn')) {
                return false;
            }

            // Exclude music toggle and fullscreen buttons during menu
            if (el.id === 'musicToggle' || el.id === 'fullscreenToggle') {
                return false;
            }

            // Exclude buttons in hidden containers
            let parent = el.parentElement;
            while (parent && parent !== activeContainer) {
                const parentStyle = window.getComputedStyle(parent);
                if (parentStyle.display === 'none' || parentStyle.visibility === 'hidden') {
                    return false;
                }
                parent = parent.parentElement;
            }

            return true;
        });

        // Remove duplicates (same element matched by multiple selectors)
        this.focusableElements = [...new Set(this.focusableElements)];

        // Reset focus index if out of bounds
        if (this.currentFocusIndex >= this.focusableElements.length) {
            this.currentFocusIndex = 0;
        }

        // Auto-focus first element if we have elements
        if (this.focusableElements.length > 0 && this.isActive) {
            this.focusElement();
        }
    }

    // Setup mutation observer to detect screen changes
    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            // Debounce updates
            clearTimeout(this.updateTimeout);
            this.updateTimeout = setTimeout(() => {
                this.updateFocusableElements();
            }, 150);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    }


    startPolling() {
        const poll = () => {
            // Always check for controllers, even if not active
            // This is needed because browsers require a button press to detect gamepads
            const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
            const activeGamepads = Array.from(gamepads).filter(gp => gp !== null);
            
            // Update connected controllers list
            if (activeGamepads.length !== this.connectedControllers.length) {
                this.connectedControllers = activeGamepads;
                if (activeGamepads.length > 0) {
                    console.log('Controllers detected:', activeGamepads.length);
                    // Refresh focusable elements when controllers are detected
                    this.updateFocusableElements();
                }
            } else {
                this.connectedControllers = activeGamepads;
            }

            // Process controller input if active
            if (this.isActive && this.connectedControllers.length > 0) {
                for (let i = 0; i < this.connectedControllers.length; i++) {
                    const gp = this.connectedControllers[i];
                    if (!gp) continue;

                    this.handleController(gp, i);
                }
            }

            requestAnimationFrame(poll);
        };

        poll();
    }

    // Check if a game is currently active (not in menu)
    isGameActive() {
        const canvas = document.getElementById('gameCanvas');
        const homeScreen = document.getElementById('homeScreen');
        const localSetup = document.getElementById('localMultiplayerSetup');
        const winnerScreen = document.getElementById('winnerScreen');
        const pauseOverlay = document.getElementById('pauseOverlay');
        
        // Game is active if canvas is visible and we're not in a menu/setup screen
        const canvasVisible = this.isElementDisplayed(canvas);
        const homeVisible = this.isElementDisplayed(homeScreen);
        const setupVisible = this.isElementDisplayed(localSetup);
        const winnerVisible = this.isElementDisplayed(winnerScreen);
        const pauseVisible = this.isElementDisplayed(pauseOverlay);
        
        // Not active if any menu/overlay is showing
        return canvasVisible && !homeVisible && !setupVisible && !winnerVisible && !pauseVisible;
    }

    handleController(gp, index) {
        if (!this.lastButtonStates[index]) {
            this.lastButtonStates[index] = [];
        }
        if (!this.lastAxisStates[index]) {
            this.lastAxisStates[index] = [0, 0, 0, 0];
        }

        // Button mappings
        const buttons = {
            A: 0,        // Confirm
            B: 1,        // Back (only in menus)
            X: 2,
            Y: 3,
            LB: 4,
            RB: 5,
            LT: 6,
            RT: 7,
            BACK: 8,
            START: 9,    // Pause menu
            LS: 10,
            RS: 11,
            UP: 12,
            DOWN: 13,
            LEFT: 14,
            RIGHT: 15
        };

        const gameActive = this.isGameActive();

        // START button - Pause menu (only during gameplay)
        if (this.isButtonPressed(gp, buttons.START, index)) {
            if (gameActive) {
                this.handlePause();
            }
        }

        // Only handle menu navigation when NOT in active gameplay
        // (except for winner screen which needs button input)
        if (!gameActive) {
            // A button - Confirm/Select (menus only)
            if (this.isButtonPressed(gp, buttons.A, index)) {
                this.handleConfirm();
            }

            // B button - Back/Cancel (menus only)
            if (this.isButtonPressed(gp, buttons.B, index)) {
                this.handleBack();
            }

            // D-pad navigation (menus only)
            if (this.isButtonPressed(gp, buttons.UP, index)) {
                this.navigateUp();
            }
            if (this.isButtonPressed(gp, buttons.DOWN, index)) {
                this.navigateDown();
            }
            if (this.isButtonPressed(gp, buttons.LEFT, index)) {
                this.navigateLeft();
            }
            if (this.isButtonPressed(gp, buttons.RIGHT, index)) {
                this.navigateRight();
            }
        }

        // Analog stick navigation (with deadzone) - only in menus
        if (!gameActive) {
            const deadzone = 0.5;
            const leftStickX = gp.axes[0];
            const leftStickY = gp.axes[1];

            // Left stick up
            if (leftStickY < -deadzone && this.lastAxisStates[index][1] >= -deadzone) {
                this.navigateUp();
            }
            // Left stick down
            if (leftStickY > deadzone && this.lastAxisStates[index][1] <= deadzone) {
                this.navigateDown();
            }
            // Left stick left
            if (leftStickX < -deadzone && this.lastAxisStates[index][0] >= -deadzone) {
                this.navigateLeft();
            }
            // Left stick right
            if (leftStickX > deadzone && this.lastAxisStates[index][0] <= deadzone) {
                this.navigateRight();
            }
        }

        // Store states for next frame
        const leftStickX = gp.axes[0] || 0;
        const leftStickY = gp.axes[1] || 0;
        for (let j = 0; j < gp.buttons.length; j++) {
            this.lastButtonStates[index][j] = gp.buttons[j].pressed;
        }
        this.lastAxisStates[index] = [leftStickX, leftStickY, gp.axes[2] || 0, gp.axes[3] || 0];
    }

    // Handle pause button
    handlePause() {
        console.log('Pause button pressed');
        
        // Check if local multiplayer game
        if (window.isLocalMultiplayer && window.localGameState) {
            window.localGameState.isPaused = !window.localGameState.isPaused;
            if (window.localGameState.isPaused) {
                console.log('Showing pause menu for local multiplayer');
                this.showPauseMenu();
            } else {
                console.log('Hiding pause menu for local multiplayer');
                this.hidePauseMenu();
            }
            return;
        }
        
        // Check if practice mode
        if (window.practiceMode && window.practiceMode.gameStarted) {
            console.log('Pausing practice mode');
            // Toggle pause for practice mode - show pause menu
            if (!window.practiceMode.isPaused) {
                window.practiceMode.isPaused = true;
                this.showPauseMenu();
            } else {
                window.practiceMode.isPaused = false;
                this.hidePauseMenu();
            }
            return;
        }
        
        // Fallback - show pause menu anyway
        console.log('Showing pause menu (fallback)');
        this.showPauseMenu();
    }

    showPauseMenu() {
        console.log('showPauseMenu called');
        // Create pause overlay if it doesn't exist
        let pauseOverlay = document.getElementById('pauseOverlay');
        if (!pauseOverlay) {
            console.log('Creating new pause overlay');
            pauseOverlay = document.createElement('div');
            pauseOverlay.id = 'pauseOverlay';
            pauseOverlay.innerHTML = `
                <div class="pause-content haunted-panel" style="
                    background: rgba(26, 10, 46, 0.98);
                    border: 3px solid var(--ghost-green, #00ff41);
                    border-radius: 15px;
                    padding: 40px;
                    text-align: center;
                    box-shadow: 0 0 30px rgba(0, 255, 65, 0.5);
                    min-width: 400px;
                ">
                    <h2 class="spooky-title" style="font-size: 2.5rem; color: var(--ghost-green, #00ff41); margin-bottom: 20px;">⏸️ PAUSED ⏸️</h2>
                    <p style="color: var(--bone-white, #f0f0f0); margin: 20px 0; font-size: 1.2rem;">Press START to resume</p>
                    <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 30px;">
                        <button id="resumeBtn" class="spooky-btn orange" style="padding: 15px 30px; font-size: 1.1rem;">👻 Resume</button>
                        <button id="quitBtn" class="spooky-btn" style="padding: 15px 30px; font-size: 1.1rem;">💀 Quit to Menu</button>
                    </div>
                </div>
            `;
            pauseOverlay.style.cssText = `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                background: rgba(0, 0, 0, 0.9) !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                z-index: 99999 !important;
                pointer-events: auto !important;
            `;
            document.body.appendChild(pauseOverlay);
            console.log('Pause overlay appended to body');

            // Add button handlers
            document.getElementById('resumeBtn').addEventListener('click', () => {
                console.log('Resume button clicked');
                this.hidePauseMenu();
                if (window.localGameState) window.localGameState.isPaused = false;
                if (window.practiceMode) window.practiceMode.isPaused = false;
            });
            document.getElementById('quitBtn').addEventListener('click', () => {
                console.log('Quit button clicked');
                this.hidePauseMenu();
                if (typeof returnToHome === 'function') {
                    returnToHome();
                } else {
                    // Fallback - reload page
                    window.location.reload();
                }
            });
        }
        pauseOverlay.style.display = 'flex';
        console.log('Pause overlay display set to flex');
        this.updateFocusableElements();
    }

    hidePauseMenu() {
        console.log('hidePauseMenu called');
        const pauseOverlay = document.getElementById('pauseOverlay');
        if (pauseOverlay) {
            pauseOverlay.style.display = 'none';
            console.log('Pause overlay hidden');
        } else {
            console.log('Pause overlay not found');
        }
    }

    isButtonPressed(gp, buttonIndex, controllerIndex) {
        if (!gp.buttons[buttonIndex]) return false;

        const isPressed = gp.buttons[buttonIndex].pressed;
        const wasPressed = this.lastButtonStates[controllerIndex][buttonIndex];

        // Return true only on button down (not held)
        return isPressed && !wasPressed;
    }

    handleConfirm() {
        this.updateFocusableElements();

        // Click the focused element
        if (this.focusableElements.length > 0) {
            const element = this.focusableElements[this.currentFocusIndex];
            if (element) {
                // Vibrate on select
                this.vibrateOnSelect();
                
                // Special handling for select elements - open dropdown
                if (element.tagName === 'SELECT') {
                    element.focus();
                    // Simulate click to open dropdown
                    const event = new MouseEvent('mousedown', { bubbles: true });
                    element.dispatchEvent(event);
                    return;
                }
                
                element.click();
                console.log('Controller clicked:', element.textContent || element.id);
                
                // Update focusable elements after click (screen may have changed)
                setTimeout(() => {
                    this.currentFocusIndex = 0;
                    this.updateFocusableElements();
                }, 100);
            }
        }
    }

    // Change select option with left/right
    changeSelectOption(direction) {
        const element = this.focusableElements[this.currentFocusIndex];
        if (element && element.tagName === 'SELECT') {
            const currentIndex = element.selectedIndex;
            const optionCount = element.options.length;
            
            if (direction === 'next') {
                element.selectedIndex = (currentIndex + 1) % optionCount;
            } else {
                element.selectedIndex = (currentIndex - 1 + optionCount) % optionCount;
            }
            
            // Trigger change event
            element.dispatchEvent(new Event('change', { bubbles: true }));
            this.vibrateOnNavigate();
            return true;
        }
        return false;
    }

    handleBack() {
        // Vibrate on back
        this.vibrateOnNavigate();

        // Close local multiplayer setup
        const localSetup = document.getElementById('localMultiplayerSetup');
        if (localSetup && localSetup.style.display !== 'none') {
            localSetup.style.display = 'none';
            document.getElementById('homeScreen').style.display = 'flex';
            this.currentFocusIndex = 0;
            this.updateFocusableElements();
            return;
        }

        // Close any open modals
        const modal = document.getElementById('multiplayerSetupModal');
        if (modal && modal.style.display === 'flex') {
            if (typeof window.closeMultiplayerSetup === 'function') {
                window.closeMultiplayerSetup();
            }
            this.currentFocusIndex = 0;
            this.updateFocusableElements();
            return;
        }

        // Close winner screen and go home
        const winnerScreen = document.getElementById('winnerScreen');
        if (winnerScreen && winnerScreen.style.display !== 'none') {
            winnerScreen.style.display = 'none';
            document.getElementById('homeScreen').style.display = 'flex';
            document.getElementById('gameCanvas').style.display = 'none';
            document.getElementById('scoreboard').style.display = 'none';
            this.currentFocusIndex = 0;
            this.updateFocusableElements();
            return;
        }

        console.log('Controller back - no modal to close');
    }

    navigateUp() {
        this.updateFocusableElements();
        if (this.focusableElements.length === 0) return;

        this.currentFocusIndex = (this.currentFocusIndex - 1 + this.focusableElements.length) % this.focusableElements.length;
        this.focusElement();
    }

    navigateDown() {
        this.updateFocusableElements();
        if (this.focusableElements.length === 0) return;

        this.currentFocusIndex = (this.currentFocusIndex + 1) % this.focusableElements.length;
        this.focusElement();
    }

    navigateLeft() {
        // Special handling for select elements
        if (this.changeSelectOption('prev')) {
            return;
        }

        // Special handling for player count
        const decBtn = document.querySelector('.count-btn:first-of-type');
        if (decBtn && this.isElementVisible(decBtn)) {
            if (typeof window.decrementPlayers === 'function') {
                window.decrementPlayers();
            }
            return;
        }

        this.navigateUp();
    }

    navigateRight() {
        // Special handling for select elements
        if (this.changeSelectOption('next')) {
            return;
        }

        // Special handling for player count
        const incBtn = document.querySelector('.count-btn:last-of-type');
        if (incBtn && this.isElementVisible(incBtn)) {
            if (typeof window.incrementPlayers === 'function') {
                window.incrementPlayers();
            }
            return;
        }

        this.navigateDown();
    }

    focusElement() {
        // Remove previous focus from all elements
        document.querySelectorAll('.controller-focused').forEach(el => {
            el.style.outline = '';
            el.style.outlineOffset = '';
            el.style.boxShadow = el.dataset.originalBoxShadow || '';
            el.classList.remove('controller-focused');
        });

        // Add focus to current element
        const element = this.focusableElements[this.currentFocusIndex];
        if (element) {
            // Store original box shadow
            element.dataset.originalBoxShadow = element.style.boxShadow;
            
            // Apply spooky focus style
            element.style.outline = '3px solid var(--ghost-green, #00ff41)';
            element.style.outlineOffset = '4px';
            element.style.boxShadow = '0 0 20px var(--ghost-green, #00ff41), 0 0 40px rgba(0, 255, 65, 0.5)';
            element.classList.add('controller-focused');
            
            // Scroll element into view if needed
            this.scrollElementIntoView(element);
            
            // Vibrate controller for feedback
            this.vibrateOnNavigate();
        }
    }

    // Scroll element into view within its scrollable container
    scrollElementIntoView(element) {
        if (!element) return;

        // Find the scrollable parent container
        let scrollableParent = element.parentElement;
        while (scrollableParent) {
            const style = window.getComputedStyle(scrollableParent);
            const overflowY = style.overflowY;
            
            if (overflowY === 'auto' || overflowY === 'scroll') {
                break;
            }
            scrollableParent = scrollableParent.parentElement;
        }

        if (scrollableParent) {
            // Get element position relative to scrollable parent
            const elementRect = element.getBoundingClientRect();
            const parentRect = scrollableParent.getBoundingClientRect();
            
            // Check if element is above visible area
            if (elementRect.top < parentRect.top) {
                const scrollAmount = elementRect.top - parentRect.top - 20;
                scrollableParent.scrollTop += scrollAmount;
            }
            // Check if element is below visible area
            else if (elementRect.bottom > parentRect.bottom) {
                const scrollAmount = elementRect.bottom - parentRect.bottom + 20;
                scrollableParent.scrollTop += scrollAmount;
            }
        } else {
            // Fallback to native scrollIntoView for non-scrollable containers
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    // Light vibration when navigating menus
    vibrateOnNavigate() {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        const gamepad = gamepads[0];
        
        if (!gamepad?.vibrationActuator) return;

        try {
            gamepad.vibrationActuator.playEffect("dual-rumble", {
                startDelay: 0,
                duration: 30,
                weakMagnitude: 0.2,
                strongMagnitude: 0.0,
            });
        } catch (e) {
            // Vibration not supported
        }
    }

    // Stronger vibration when selecting
    vibrateOnSelect() {
        const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
        const gamepad = gamepads[0];
        
        if (!gamepad?.vibrationActuator) return;

        try {
            gamepad.vibrationActuator.playEffect("dual-rumble", {
                startDelay: 0,
                duration: 80,
                weakMagnitude: 0.4,
                strongMagnitude: 0.2,
            });
        } catch (e) {
            // Vibration not supported
        }
    }

    isElementVisible(element) {
        if (!element) return false;
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && style.visibility !== 'hidden' && element.offsetParent !== null;
    }

    getConnectedControllers() {
        return this.connectedControllers;
    }
}

// Initialize global controller navigation
const controllerNav = new ControllerNavigationSystem();

// Make it globally accessible
window.controllerNav = controllerNav;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ControllerNavigationSystem;
}
