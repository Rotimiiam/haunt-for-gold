# Analytics Service - Overview

## What is this?

The Analytics Service is a standalone application that tracks and analyzes user behavior and game metrics for the Haunt For Gold game. It runs separately from the main game application and provides a RESTful API for collecting and querying analytics data.

## Key Features

✅ **Visit Tracking** - Track total application visits and unique sessions  
✅ **Game Mode Analytics** - Monitor usage of practice, online, and local multiplayer modes  
✅ **Session Management** - Track active user sessions and concurrent players  
✅ **Completion Rates** - Analyze game completion rates per mode  
✅ **Traffic Metrics** - Monitor page views, user engagement duration, and peak usage times  
✅ **Real-time Tracking** - Track metrics as games are played and users interact  
✅ **Persistent Storage** - All data stored in SQLite database  
✅ **Easy Integration** - JavaScript client library for simple integration  

## Architecture

```
┌─────────────────────────────────────────────────┐
│           Main Game Application                 │
│         (Node.js + Socket.IO)                   │
│              Port: 3001                         │
└──────────────────┬──────────────────────────────┘
                   │
                   │ HTTP API Calls
                   │ (Non-blocking)
                   ▼
┌─────────────────────────────────────────────────┐
│         Analytics Service                       │
│         (Express.js REST API)                   │
│              Port: 3002                         │
│                                                 │
│  ┌────────────────────────────────────────┐   │
│  │  API Routes                             │   │
│  │  - Track visits, games, page views     │   │
│  │  - Query analytics data                │   │
│  └────────────────────────────────────────┘   │
│                   │                            │
│                   ▼                            │
│  ┌────────────────────────────────────────┐   │
│  │  Database Models (Sequelize)           │   │
│  │  - VisitEvent                          │   │
│  │  - GameModeEvent                       │   │
│  │  - UserSession                         │   │
│  │  - PageViewEvent                       │   │
│  └────────────────────────────────────────┘   │
│                   │                            │
│                   ▼                            │
│  ┌────────────────────────────────────────┐   │
│  │  SQLite Database                       │   │
│  │  (analytics.sqlite)                    │   │
│  └────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

## Project Structure

```
analytics-service/
├── config/
│   └── database.js              # Database configuration
├── models/
│   ├── index.js                 # Model exports
│   ├── VisitEvent.js            # Visit tracking model
│   ├── GameModeEvent.js         # Game session model
│   ├── UserSession.js           # User session model
│   └── PageViewEvent.js         # Page view model
├── routes/
│   └── analytics.js             # All API endpoints
├── examples/
│   ├── integration-example.html # Interactive example
│   └── test-api.sh              # API test script
├── server.js                    # Main server
├── client-library.js            # JavaScript client
├── package.json                 # Dependencies
├── .env.example                 # Environment template
├── README.md                    # API documentation
├── INTEGRATION_GUIDE.md         # Integration instructions
├── QUICK_START.md               # Quick start guide
└── OVERVIEW.md                  # This file
```

## Metrics Tracked

### Traffic Metrics
- **Total Visits**: Number of times users visit the application
- **Unique Sessions**: Number of unique user sessions
- **Active Sessions**: Currently active user sessions (last 30 minutes)
- **Concurrent Players**: Players currently in games (last 5 minutes)
- **Page Views**: Individual page navigation events
- **Peak Usage Times**: Most popular hours and days

### Game Metrics
- **Games by Mode**: Count of practice, online, and local games
- **Game Duration**: How long games last
- **Completion Rate**: Percentage of games completed vs abandoned
- **Scores**: Player scores and results (win/lose/tie)
- **Player Engagement**: Games per session, session duration

### Session Metrics
- **Session Duration**: How long users stay on the site
- **Page Views per Session**: Average pages viewed
- **Games per Session**: Average games played per session

## API Endpoints

### Event Tracking (POST)
- `/api/analytics/visit` - Track a visit
- `/api/analytics/game/start` - Track game start
- `/api/analytics/game/end` - Track game end
- `/api/analytics/pageview` - Track page view
- `/api/analytics/session/end` - End a session

### Analytics Queries (GET)
- `/api/analytics/visits/total` - Get visit counts
- `/api/analytics/games/modes` - Get game mode statistics
- `/api/analytics/sessions/active` - Get active sessions
- `/api/analytics/games/completion` - Get completion rates
- `/api/analytics/pageviews` - Get page view statistics
- `/api/analytics/engagement` - Get engagement metrics
- `/api/analytics/peak-usage` - Get peak usage times
- `/api/analytics/dashboard` - Get comprehensive dashboard data

## Quick Start

1. **Install dependencies:**
   ```bash
   cd analytics-service
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env if needed
   ```

3. **Start the service:**
   ```bash
   npm start
   ```

4. **Test it:**
   ```bash
   curl http://localhost:3002/health
   ```

## Integration

### Option 1: Client-Side Integration (Recommended)

Include the client library in your HTML:

```html
<script src="/analytics-client.js"></script>
<script>
  const analytics = new AnalyticsClient('http://localhost:3002');
  
  // Track a visit
  analytics.trackVisit('home');
  
  // Start a game
  analytics.trackGameStart('practice');
  
  // End a game
  analytics.trackGameEnd(null, true, 500, 'win');
</script>
```

### Option 2: Server-Side Integration

Use HTTP requests from your Node.js server:

```javascript
const axios = require('axios');

await axios.post('http://localhost:3002/api/analytics/game/start', {
  sessionId: socket.id,
  gameMode: 'online',
  gameId: room.id
});
```

## Database Schema

### VisitEvent
- Records each visit to the application
- Fields: sessionId, userId, ipAddress, userAgent, referrer, page, timestamp

### GameModeEvent
- Records game sessions
- Fields: sessionId, userId, gameMode, gameId, startedAt, endedAt, duration, completed, score, result

### UserSession
- Aggregated session data
- Fields: sessionId, userId, startTime, lastActivityTime, endTime, duration, isActive, pageViews, gamesPlayed

### PageViewEvent
- Records page navigation
- Fields: sessionId, userId, page, path, timeOnPage, timestamp

## Use Cases

1. **Product Analytics**: Understand which game modes are most popular
2. **Performance Monitoring**: Track active users and concurrent players
3. **User Behavior**: Analyze session duration and engagement patterns
4. **Business Metrics**: Track completion rates and user retention
5. **Growth Tracking**: Monitor visit trends over time
6. **Optimization**: Identify peak usage times for scaling decisions

## Benefits

- **Separation of Concerns**: Analytics doesn't affect game performance
- **Independent Scaling**: Can scale analytics service independently
- **Data Ownership**: All data stored locally in your database
- **Flexible Querying**: Rich API for custom analytics queries
- **Real-time Updates**: Track events as they happen
- **Easy Integration**: Simple JavaScript client library
- **No External Dependencies**: No third-party analytics services needed

## Next Steps

1. Read [QUICK_START.md](QUICK_START.md) to get started
2. Review [README.md](README.md) for complete API documentation
3. Follow [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) to integrate with your app
4. Test with [examples/test-api.sh](examples/test-api.sh)
5. Try the interactive example at [examples/integration-example.html](examples/integration-example.html)

## Support

For questions or issues:
1. Check the documentation files in this directory
2. Review the example files in the `examples/` folder
3. Check server logs for error messages
4. Verify the service is running with `curl http://localhost:3002/health`

## Future Enhancements

Potential improvements for the future:
- Add data visualization dashboard
- Implement data export (CSV, JSON)
- Add data retention policies
- Implement request batching for high volume
- Add authentication for query endpoints
- Support for multiple game instances
- Integration with external analytics platforms
- Real-time websocket updates for dashboards
