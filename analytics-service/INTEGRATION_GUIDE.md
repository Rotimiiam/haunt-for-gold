# Integration Guide: Analytics Service with Main Application

This guide explains how to integrate the analytics service with the main Haunt For Gold game application.

## Step 1: Start the Analytics Service

First, ensure the analytics service is running:

```bash
cd analytics-service
npm install
npm start
```

The service will start on port 3002 by default.

## Step 2: Include the Client Library

Add the analytics client library to your HTML pages:

```html
<!-- In public/index.html -->
<script src="/analytics-client.js"></script>
```

Copy the client library to the public directory:

```bash
cp analytics-service/client-library.js public/analytics-client.js
```

## Step 3: Initialize Analytics in Your Application

### In index.html (Home Page)

Add this script after including the client library:

```html
<script>
  // Initialize analytics client
  const analyticsClient = new AnalyticsClient('http://localhost:3002');
  window.analyticsClient = analyticsClient;

  // Track initial visit
  analyticsClient.trackVisit('home');

  // Track page views
  let pageStartTime = Date.now();
  window.addEventListener('beforeunload', () => {
    const timeOnPage = Math.floor((Date.now() - pageStartTime) / 1000);
    analyticsClient.trackPageView('home', '/', timeOnPage);
  });
</script>
```

### In practice-mode.js

Add analytics tracking for practice mode games:

```javascript
// At the start of a practice game
async function startPracticeGame() {
  // ... existing code ...
  
  if (window.analyticsClient) {
    await window.analyticsClient.trackGameStart('practice');
  }
  
  // ... rest of game start code ...
}

// When the game ends
async function endPracticeGame(completed, score, result) {
  // ... existing code ...
  
  if (window.analyticsClient) {
    await window.analyticsClient.trackGameEnd(
      null, // gameId
      completed,
      score,
      result
    );
  }
  
  // ... rest of game end code ...
}
```

### In multiplayer-mode.js (Online)

Add analytics tracking for online multiplayer:

```javascript
// When joining an online game
socket.on("gameReady", async (gameData) => {
  // ... existing code ...
  
  if (window.analyticsClient) {
    await window.analyticsClient.trackGameStart('online', gameData.roomId);
  }
  
  // ... rest of game ready code ...
});

// When the game ends
socket.on("gameWon", async (winData) => {
  // ... existing code ...
  
  if (window.analyticsClient) {
    const myPlayerId = socket.id;
    const won = winData.winnerId === myPlayerId;
    
    await window.analyticsClient.trackGameEnd(
      playerRoom?.id,
      true, // completed
      myScore,
      won ? 'win' : 'lose'
    );
  }
  
  // ... rest of game won code ...
});
```

### In local-multiplayer-game.js

Add analytics tracking for local multiplayer:

```javascript
// At the start of local multiplayer game
function startLocalGame() {
  // ... existing code ...
  
  if (window.analyticsClient) {
    window.analyticsClient.trackGameStart('local');
  }
  
  // ... rest of game start code ...
}

// When the game ends
function endLocalGame(winnerIndex) {
  // ... existing code ...
  
  if (window.analyticsClient) {
    window.analyticsClient.trackGameEnd(
      null,
      true,
      players[winnerIndex].score,
      'win' // From winner's perspective
    );
  }
  
  // ... rest of game end code ...
}
```

## Step 4: Server-Side Integration (Optional)

You can also track events from the server side for more accurate data:

### In server.js

```javascript
const axios = require('axios');

const ANALYTICS_URL = process.env.ANALYTICS_URL || 'http://localhost:3002';

// Helper function to track server-side events
async function trackAnalyticsEvent(endpoint, data) {
  try {
    await axios.post(`${ANALYTICS_URL}/api/analytics${endpoint}`, data);
  } catch (error) {
    console.warn('Analytics tracking failed:', error.message);
  }
}

// Track when a game starts
socket.on("joinGame", async (playerName) => {
  // ... existing code ...
  
  // Track game start on server
  await trackAnalyticsEvent('/game/start', {
    sessionId: socket.id,
    userId: socket.userId,
    gameMode: 'online',
    gameId: room.id
  });
});

// Track when a game ends
socket.on("disconnect", async () => {
  // ... existing code ...
  
  if (playerRoom) {
    const player = playerRoom.players[socket.id];
    if (player) {
      await trackAnalyticsEvent('/game/end', {
        sessionId: socket.id,
        gameId: playerRoom.id,
        completed: false,
        score: player.score,
        result: 'abandoned'
      });
    }
  }
});
```

## Step 5: Create an Analytics Dashboard (Optional)

Create a simple dashboard page to view analytics:

### public/analytics-dashboard.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Analytics Dashboard - Haunt For Gold</title>
  <link rel="stylesheet" href="/css/spooky-theme.css">
  <style>
    .dashboard {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    .metric-card {
      background: var(--haunted-purple);
      border: 2px solid var(--ghost-green);
      border-radius: 8px;
      padding: 20px;
      margin: 10px;
      box-shadow: 0 0 20px var(--ethereal-glow);
    }
    .metric-value {
      font-size: 2.5em;
      color: var(--ghost-green);
      font-weight: bold;
    }
    .metric-label {
      color: var(--bone-white);
      font-size: 1.2em;
    }
  </style>
</head>
<body>
  <div class="dashboard">
    <h1>Analytics Dashboard</h1>
    
    <div id="metrics-container">
      <!-- Metrics will be loaded here -->
    </div>
  </div>

  <script src="/analytics-client.js"></script>
  <script>
    const analytics = new AnalyticsClient('http://localhost:3002');
    
    async function loadDashboard() {
      const data = await analytics.getDashboard();
      
      if (!data) {
        document.getElementById('metrics-container').innerHTML = 
          '<p>Failed to load analytics data</p>';
        return;
      }
      
      const html = `
        <div class="metric-card">
          <div class="metric-value">${data.traffic.totalVisits}</div>
          <div class="metric-label">Total Visits</div>
        </div>
        
        <div class="metric-card">
          <div class="metric-value">${data.traffic.uniqueSessions}</div>
          <div class="metric-label">Unique Sessions</div>
        </div>
        
        <div class="metric-card">
          <div class="metric-value">${data.traffic.activeSessions}</div>
          <div class="metric-label">Active Sessions</div>
        </div>
        
        <div class="metric-card">
          <div class="metric-value">${data.traffic.concurrentPlayers}</div>
          <div class="metric-label">Concurrent Players</div>
        </div>
        
        <div class="metric-card">
          <div class="metric-value">${data.games.byMode.practice}</div>
          <div class="metric-label">Practice Games</div>
        </div>
        
        <div class="metric-card">
          <div class="metric-value">${data.games.byMode.online}</div>
          <div class="metric-label">Online Games</div>
        </div>
        
        <div class="metric-card">
          <div class="metric-value">${data.games.byMode.local}</div>
          <div class="metric-label">Local Games</div>
        </div>
        
        <div class="metric-card">
          <div class="metric-value">${data.games.completion.rate}%</div>
          <div class="metric-label">Completion Rate</div>
        </div>
      `;
      
      document.getElementById('metrics-container').innerHTML = html;
    }
    
    loadDashboard();
    // Refresh every 30 seconds
    setInterval(loadDashboard, 30000);
  </script>
</body>
</html>
```

## Step 6: Environment Configuration

Update your `.env` file in the main application:

```env
ANALYTICS_URL=http://localhost:3002
```

For production:

```env
ANALYTICS_URL=https://your-analytics-service.com
```

## Step 7: CORS Configuration

The analytics service already has CORS enabled, but ensure it's configured for your production domain:

In `analytics-service/server.js`, you can configure specific origins:

```javascript
app.use(cors({
  origin: ['http://localhost:3001', 'https://your-production-domain.com'],
  credentials: true
}));
```

## Testing the Integration

1. Start the analytics service:
   ```bash
   cd analytics-service
   npm start
   ```

2. Start the main application:
   ```bash
   cd ..
   npm start
   ```

3. Visit the application and interact with it

4. Check analytics data:
   ```bash
   curl http://localhost:3002/api/analytics/dashboard
   ```

## Monitoring in Production

For production deployment:

1. Deploy the analytics service separately (e.g., separate container/server)
2. Use environment variables for the analytics service URL
3. Set up monitoring/alerting for the analytics service
4. Consider using a process manager like PM2
5. Implement rate limiting if needed
6. Set up database backups for the analytics SQLite database

## Example PM2 Configuration

Create `ecosystem.config.js` in the analytics-service directory:

```javascript
module.exports = {
  apps: [{
    name: 'analytics-service',
    script: './server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    }
  }]
};
```

Start with:
```bash
pm2 start ecosystem.config.js
```

## Troubleshooting

### Analytics not being tracked
- Verify the analytics service is running
- Check browser console for CORS errors
- Verify the ANALYTICS_URL is correct
- Check analytics service logs for errors

### Slow performance
- Analytics calls are asynchronous and shouldn't block the main application
- Consider implementing request queuing/batching
- Monitor analytics service resource usage

### Data not appearing
- Check that events are being sent (browser network tab)
- Verify database is being created (analytics.sqlite)
- Check analytics service logs for database errors
