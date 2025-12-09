# Building Haunt For Gold: A Journey Through Multiplayer Game Development

**A comprehensive chronicle of building a real-time multiplayer Halloween-themed game from scratch**

*By the Haunt For Gold Development Team*  
*December 4-7, 2025*

---

## Table of Contents

1. [Introduction](#introduction)
2. [Day 1: Foundation & Core Mechanics](#day-1-foundation--core-mechanics)
3. [Day 2: Multiplayer Magic](#day-2-multiplayer-magic)
4. [Day 3: Polish & Production](#day-3-polish--production)
5. [Day 4: Analytics & Insights](#day-4-analytics--insights)
6. [Technical Architecture](#technical-architecture)
7. [Lessons Learned](#lessons-learned)
8. [Conclusion](#conclusion)

---

## Introduction

Haunt For Gold is a real-time multiplayer pixel art game where players collect coins while avoiding enemies in a spooky Halloween-themed environment. What started as a simple concept evolved into a full-featured game supporting three distinct modes: online multiplayer, local multiplayer, and practice mode.

This article chronicles the 4-day development journey, from initial commit to production deployment, documenting the challenges, solutions, and architectural decisions that shaped the final product.

### Tech Stack

- **Backend**: Node.js, Express, Socket.IO
- **Frontend**: HTML5 Canvas, Vanilla JavaScript (ES6+)
- **Database**: SQLite with Sequelize ORM
- **Deployment**: GitHub Actions, PM2, Nginx
- **Analytics**: Custom analytics service

---

## Day 1: Foundation & Core Mechanics
**December 4-5, 2025**

### Initial Setup (Dec 4, 18:48 UTC)

The journey began with the initial commit, establishing the project structure and core dependencies. The foundation included:

- Express server setup with Socket.IO for real-time communication
- SQLite database with Sequelize for player data persistence
- Basic HTML5 Canvas rendering engine
- Cookie-based authentication system

### The Witch Enemy System (Dec 5, 12:16)

One of the first major features was the **Witch Enemy** - a special antagonist that would hunt players for a -30 point penalty. This required:

```javascript
class WitchEnemy {
  constructor(mapWidth, mapHeight) {
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.isActive = false;
    this.speed = 0.12; // Balanced for dodgeability
  }
  
  update(players) {
    // Chase nearest player logic
    // Collision detection
    // Cackle sound on catch
  }
}
```

**Key Decision**: The witch speed was carefully tuned through multiple iterations (0.08 → 0.12) to ensure she was challenging but not impossible to dodge.

### Spooky Theme Implementation (Dec 5, 14:50-18:38)

The Halloween aesthetic was crucial to the game's identity. We implemented:

- Dark purple/black gradient backgrounds
- Ghostly green (#00ff41) accent colors
- Pixel art sprites for characters and enemies
- Haunted house background music
- Fog overlay effects

### Practice Mode & AI (Dec 5, 17:52)

The practice mode introduced an AI opponent that:
- Pathfinds to nearest coins using Manhattan distance
- Avoids bombs intelligently
- Provides single-player training experience

**Challenge**: AI needed to avoid bombs while still being competitive. Solution was to filter bomb-type coins from targeting logic:

```javascript
findNearestCoin(player) {
  return coins.find(coin => 
    !coin.collected && coin.type !== 'bomb'
  );
}
```

### Console Log Cleanup (Dec 5, 18:19-18:38)

A series of commits focused on removing debug console logs - a crucial step for production readiness and performance optimization.

---

## Day 2: Multiplayer Magic
**December 5-6, 2025**

### Local Multiplayer Foundation (Dec 5, 20:09)

Local multiplayer required gamepad support for 2-4 players. Key features:

- **Gamepad API Integration**: Detecting Xbox/PlayStation controllers
- **On-screen Keyboard**: For entering player names with controllers
- **Controller Mapping**: D-pad, analog sticks, and button support

```javascript
setupGamepadControls() {
  const AXIS_THRESHOLD = 0.5;
  const pollGamepads = () => {
    const gamepads = navigator.getGamepads();
    gamepads.forEach((gamepad, index) => {
      // Map each gamepad to a player
      // Check D-pad (buttons 12-15)
      // Check analog sticks (axes 0-1)
      // Check R2 for speed boost
    });
  };
}
```

### GitHub Actions Deployment (Dec 5, 22:06)

Automated deployment was essential for rapid iteration:

```yaml
- name: Deploy to Server
  run: |
    ssh user@74.207.254.40 '
      cd /var/www/haunt-for-gold
      git pull
      npm install
      pm2 restart haunt-for-gold
    '
```

**Critical Addition**: Database preservation logic to prevent SQLite data loss on deployment.

### Canvas Visibility Crisis (Dec 5, 22:19)

A major bug emerged: the game canvas wasn't displaying in multiplayer modes. The fix required:

1. Aggressive CSS visibility settings
2. Script loading order corrections
3. Proper initialization timing

```javascript
// Ensure canvas is visible
canvas.style.display = "block";
canvas.style.visibility = "visible";
canvas.style.opacity = "1";
canvas.offsetHeight; // Force reflow
```

### Comprehensive Game Cleanup (Dec 5, 22:35)

Memory leaks were discovered when returning to the home screen. Solution:

```javascript
returnToHome() {
  // CRITICAL: Stop games BEFORE resetting flags
  if (window.practiceMode?.stop) {
    window.practiceMode.stop();
  }
  if (window.multiplayerMode?.disconnect) {
    window.multiplayerMode.disconnect();
  }
  
  // Then reset flags
  window.gameStarted = false;
  window.practiceMode = null;
  window.multiplayerMode = null;
}
```

### Online Multiplayer Connection Flow (Dec 5, 23:19-23:54)

The online multiplayer system faced race condition issues. The solution used a **pending player name pattern**:

```javascript
connect() {
  this.socket = io();
  this.setupSocketEvents();
  
  this.socket.on("connect", () => {
    // Auto-join if we have a pending name
    if (this.pendingPlayerName) {
      this.joinGame(this.pendingPlayerName);
      this.pendingPlayerName = null;
    }
  });
}
```

### 60-Second Game Timer (Dec 5, 23:43)

Online games needed time limits to prevent indefinite matches:

```javascript
socket.on("timeUpdate", (data) => {
  this.updateTimerDisplay(data.timeRemaining);
  
  if (data.timeRemaining === 10) {
    showNotification("⏰ 10 Seconds!", "Hurry up!");
  }
});
```

### Rematch Functionality (Dec 5, 23:54)

Players wanted to play again without re-queuing:

```javascript
requestRematch() {
  this.socket.emit("requestRematch");
  showNotification("Rematch Requested", "Waiting for opponent...");
}

socket.on("rematchStarting", () => {
  // Reset game state
  // Hide winner screen
  // Start new game
});
```

---

## Day 3: Polish & Production
**December 6, 2025**

### Controller Pause Support (Dec 6, 09:15)

ESC key and Start button (button 9) pause functionality:

```javascript
// Edge detection for pause button
let lastPauseButtonState = false;

const pauseButtonPressed = gamepad.buttons[9]?.pressed;
if (pauseButtonPressed && !lastPauseButtonState) {
  togglePause(); // Rising edge only
}
lastPauseButtonState = pauseButtonPressed;
```

### Keyboard Menu Navigation (Dec 6, 09:28)

Arrow keys and WASD for navigating menu buttons:

```javascript
setupMenuKeyboardNavigation() {
  const menuButtons = [
    multiplayerBtn,
    localMultiplayerBtn,
    practiceBtn
  ];
  
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") {
      currentIndex = (currentIndex + 1) % menuButtons.length;
      setFocus(currentIndex);
    }
  });
}
```

### Mobile Block Page (Dec 6, 09:38-09:56)

Desktop-only experience required blocking mobile devices:

```javascript
function blockMobileDevices() {
  if (isMobile()) {
    document.documentElement.innerHTML = `
      <!-- Spooky mobile block page -->
      <h1>Haunt For Gold</h1>
      <p>🖥️ Desktop Only</p>
      <p>This haunted multiplayer experience requires 
         keyboard or controller support.</p>
    `;
    throw new Error("Mobile device detected");
  }
}
```

**Optimization**: Moved detection to HTML `<head>` for immediate blocking before content loads.

### Pause Screen Refinement (Dec 6, 10:07-10:56)

Multiple iterations to perfect the pause experience:

1. Removed emoji buttons (cleaner design)
2. Consolidated to single `pauseScreen` element
3. Added Creepster font styling
4. Implemented arrow key navigation

### Practice Mode Click Fix (Dec 6, 10:32-10:56)

Users had to click 3 times to start practice mode. Root cause: multiple event listeners firing. Solution:

```javascript
let practiceButtonProcessing = false;

practiceBtn.addEventListener("click", (e) => {
  if (practiceButtonProcessing || gameStarted) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }
  
  practiceButtonProcessing = true;
  startGameDirectly();
  
  setTimeout(() => {
    practiceButtonProcessing = false;
  }, 1000);
}, true); // Capture phase
```

### Witch Speed Consistency (Dec 6, 11:09-12:16)

Witch moved at different speeds across modes. Fix: Move update to render loop (60fps) in all modes:

```javascript
// In render loop (60fps)
if (!window.gamePaused && this.witch) {
  this.witch.update(players);
  gameState.witch = this.witch.getState();
}
```

Final speed: **0.12** - balanced for dodgeability after player feedback.

### Complete Pause Implementation (Dec 6, 12:23)

Everything must pause when game is paused:

```javascript
// Practice mode AI
setInterval(() => {
  if (!this.gameStarted || window.gamePaused) return;
  // AI logic
}, 800);

// Multiplayer witch
if (!window.gamePaused && this.witch) {
  this.witch.update(players);
}

// Local multiplayer already had proper checks
```

---

## Day 4: Analytics & Insights
**December 7, 2025**

### Analytics Service Creation (Dec 7, 09:32)

A standalone analytics service was built to track game metrics:

```javascript
// Analytics Service Architecture
- Port 3002 (separate from main game on 3001)
- SQLite database for metrics storage
- RESTful API for tracking events
- Real-time dashboard with auto-refresh
```

### Deployment Integration (Dec 7, 13:15)

Added analytics to GitHub Actions workflow:

```yaml
- name: Deploy Analytics Service
  run: |
    cd analytics-service
    npm install
    pm2 restart haunt-analytics || pm2 start server.js --name haunt-analytics
```

### Spooky Analytics Dashboard (Dec 7, 13:26)

Created a themed dashboard matching the game aesthetic:

- Real-time stats (visits, games, completions)
- Game mode breakdown (pie chart)
- Completion rates
- Engagement metrics
- Peak usage times

### Analytics Integration (Dec 7, 13:42)

Integrated tracking into all game modes:

```javascript
// Track page views
gameAnalytics.trackPageView('/');

// Track game starts
gameAnalytics.trackGameStart('practice');

// Track game ends
gameAnalytics.trackGameEnd(true, score, 'win');

// Set user ID when name entered
gameAnalytics.setUserId(playerName);
```

**Important**: Analytics fail silently if service is down - never blocks gameplay.

### Witch Cackle Enhancement (Dec 7, 13:42)

Witch now cackles for 1 second before disappearing after catching a player:

```javascript
catchPlayer(player) {
  this.isActive = false;
  this.caughtPlayer = true;
  
  // Play cackle sound
  if (window.soundManager) {
    window.soundManager.playWitchCackle();
  }
  
  // Wait 1 second before disappearing
  setTimeout(() => {
    this.caughtPlayer = false;
  }, 1000);
}
```

### Database Preservation (Dec 7, 13:33)

Final critical fix: Preserve both game and analytics databases across deployments:

```yaml
- name: Backup Databases
  run: |
    timestamp=$(date +%Y%m%d_%H%M%S)
    cp database.sqlite "backups/database_${timestamp}.sqlite"
    cp analytics-service/analytics.sqlite "backups/analytics_${timestamp}.sqlite"
    # Keep only last 5 backups
    ls -t backups/*.sqlite | tail -n +6 | xargs rm -f
```

---

## Technical Architecture

### Game State Management

The game uses a **server-authoritative model** for online multiplayer:

```
Client                    Server
  |                         |
  |--- move(direction) ---->|
  |                         | (validate)
  |                         | (update state)
  |<-- gameStateUpdate -----|
  |                         |
  | (render new state)      |
```

**Benefits**:
- Prevents cheating
- Ensures synchronization
- Single source of truth

### Three Game Modes

1. **Practice Mode**: Single-player with AI opponent
   - Client-side game logic
   - AI pathfinding
   - Local state management

2. **Online Multiplayer**: Real-time PvP
   - Socket.IO communication
   - Server-authoritative state
   - 60-second time limit
   - Rematch functionality

3. **Local Multiplayer**: 2-4 players on one device
   - Gamepad API for controllers
   - Local state management
   - Split controller input

### Rendering Pipeline

```javascript
// 60fps render loop
function renderLoop() {
  if (!gamePaused) {
    // Update witch (client-side prediction)
    witch.update(players);
    
    // Render game state
    gameRenderer.render(gameState);
  }
  
  requestAnimationFrame(renderLoop);
}
```

### Controller Support

- **Xbox 360/One**: Full support
- **PlayStation 4/5**: Full support
- **Generic controllers**: Basic support

**Button Mapping**:
- D-pad / Left Stick: Movement
- R2 Trigger: Speed boost
- Start Button (9): Pause
- X Button (0): Select/Confirm

---

## Lessons Learned

### 1. Race Conditions in Async Code

**Problem**: Socket connection completing after join attempt.

**Solution**: Pending state pattern - store intent, execute when ready.

### 2. Memory Leaks in Game Loops

**Problem**: Intervals and animation frames continuing after game ends.

**Solution**: Explicit cleanup with stored IDs:

```javascript
stop() {
  if (this.gameLoopId) {
    cancelAnimationFrame(this.gameLoopId);
  }
  if (this.aiInterval) {
    clearInterval(this.aiInterval);
  }
}
```

### 3. Canvas Visibility Issues

**Problem**: CSS specificity and timing issues hiding canvas.

**Solution**: Aggressive inline styles + forced reflow:

```javascript
canvas.style.cssText = "display: block !important;";
canvas.offsetHeight; // Force reflow
```

### 4. Gamepad Button Edge Detection

**Problem**: Pause toggling multiple times per button press.

**Solution**: Track previous state, only trigger on rising edge:

```javascript
if (buttonPressed && !lastButtonState) {
  // Button just pressed
  togglePause();
}
lastButtonState = buttonPressed;
```

### 5. Database Preservation in CI/CD

**Problem**: Deployments wiping user data.

**Solution**: Exclude databases from deployment, add backup system.

### 6. Movement Speed Consistency

**Problem**: Witch moving at different speeds in different modes.

**Solution**: Move all updates to render loop (60fps) instead of intervals.

### 7. Analytics Without Blocking

**Problem**: Analytics failures shouldn't break gameplay.

**Solution**: Try-catch all analytics calls, fail silently:

```javascript
try {
  gameAnalytics.trackEvent(data);
} catch (e) {
  // Silent failure - game continues
}
```

---

## Conclusion

Building Haunt For Gold was an intensive 4-day journey that resulted in a polished, production-ready multiplayer game. The project demonstrates:

- **Rapid Prototyping**: From concept to deployment in 96 hours
- **Iterative Development**: Multiple refinements based on testing
- **Production Practices**: CI/CD, monitoring, database backups
- **User Experience**: Controller support, pause functionality, mobile blocking
- **Technical Excellence**: Memory management, race condition handling, state synchronization

### Final Statistics

- **Development Time**: 4 days (Dec 4-7, 2025)
- **Total Commits**: 47
- **Lines of Code**: ~8,000+
- **Game Modes**: 3 (Practice, Online, Local)
- **Supported Controllers**: Xbox, PlayStation, Generic
- **Deployment**: Automated via GitHub Actions
- **Monitoring**: Custom analytics dashboard

### What's Next?

Potential future enhancements:
- Tournament mode with brackets
- Power-ups and special abilities
- More enemy types
- Level progression system
- Leaderboard integration
- Spectator mode
- Mobile support (with touch controls)

---

## Acknowledgments

This game was built with passion, late-night debugging sessions, and a commitment to creating a fun, spooky multiplayer experience. Special thanks to the open-source community for the tools and libraries that made this possible.

**Play Haunt For Gold**: https://haunt.rotimi.name.ng  
**Analytics Dashboard**: https://dash.rotimi.name.ng

---

*Built with 👻 and ☕ by the Haunt For Gold Team*  
*December 2025*
