# Haunt For Gold - Analytics Service

A standalone analytics service for tracking user behavior, game metrics, and traffic data for the Haunt For Gold game.

## Features

- **Visit Tracking**: Track total application visits and unique sessions
- **Game Mode Tracking**: Monitor usage of practice, online, and local multiplayer modes
- **Session Management**: Track active user sessions and concurrent players
- **Completion Rates**: Analyze game completion rates per mode
- **Traffic Metrics**: Monitor page views, user engagement, and peak usage times
- **Real-time Monitoring**: Track metrics as games are played

## Installation

```bash
cd analytics-service
npm install
```

## Configuration

Create a `.env` file in the analytics-service directory:

```env
PORT=3002
NODE_ENV=development
DATABASE_PATH=./analytics.sqlite
```

## Running the Service

```bash
# Development mode
npm start

# Or with node directly
node server.js
```

The service will start on port 3002 (or the port specified in .env).

## API Endpoints

### Health Check
- `GET /health` - Check service status

### Event Tracking

#### Track Visit
```http
POST /api/analytics/visit
Content-Type: application/json

{
  "sessionId": "unique-session-id",
  "userId": "optional-user-id",
  "ipAddress": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "referrer": "https://example.com",
  "page": "home"
}
```

#### Track Game Start
```http
POST /api/analytics/game/start
Content-Type: application/json

{
  "sessionId": "unique-session-id",
  "userId": "optional-user-id",
  "gameMode": "practice|online|local",
  "gameId": "optional-game-id"
}
```

#### Track Game End
```http
POST /api/analytics/game/end
Content-Type: application/json

{
  "sessionId": "unique-session-id",
  "gameId": "optional-game-id",
  "completed": true,
  "score": 500,
  "result": "win|lose|tie|abandoned"
}
```

#### Track Page View
```http
POST /api/analytics/pageview
Content-Type: application/json

{
  "sessionId": "unique-session-id",
  "userId": "optional-user-id",
  "page": "game",
  "path": "/game.html",
  "timeOnPage": 120
}
```

#### End Session
```http
POST /api/analytics/session/end
Content-Type: application/json

{
  "sessionId": "unique-session-id"
}
```

### Analytics Queries

#### Total Visits
```http
GET /api/analytics/visits/total?startDate=2024-01-01&endDate=2024-12-31
```

#### Game Mode Statistics
```http
GET /api/analytics/games/modes?startDate=2024-01-01&endDate=2024-12-31
```

Response:
```json
{
  "practice": 150,
  "online": 300,
  "local": 50,
  "total": 500
}
```

#### Active Sessions
```http
GET /api/analytics/sessions/active
```

Response:
```json
{
  "activeSessions": 25,
  "concurrentPlayers": 8,
  "timestamp": "2024-12-07T09:00:00.000Z"
}
```

#### Game Completion Rates
```http
GET /api/analytics/games/completion?gameMode=online
```

Response:
```json
{
  "totalGames": 300,
  "completedGames": 270,
  "completionRate": 90.00,
  "byMode": {
    "practice": { "total": 150, "completed": 140, "completionRate": "93.33" },
    "online": { "total": 300, "completed": 270, "completionRate": "90.00" },
    "local": { "total": 50, "completed": 45, "completionRate": "90.00" }
  }
}
```

#### Page View Statistics
```http
GET /api/analytics/pageviews?page=home
```

#### Engagement Metrics
```http
GET /api/analytics/engagement
```

Response:
```json
{
  "averageSessionDuration": 420,
  "averagePageViewsPerSession": "3.50",
  "averageGamesPerSession": "1.80",
  "totalSessions": 200
}
```

#### Peak Usage Times
```http
GET /api/analytics/peak-usage
```

Response:
```json
{
  "byHour": [
    { "hour": "14", "count": 150 },
    { "hour": "20", "count": 140 }
  ],
  "byDay": [
    { "day": "Saturday", "count": 500 },
    { "day": "Sunday", "count": 450 }
  ],
  "peakHour": "14",
  "peakDay": "Saturday"
}
```

#### Comprehensive Dashboard
```http
GET /api/analytics/dashboard?startDate=2024-01-01&endDate=2024-12-31
```

Response:
```json
{
  "traffic": {
    "totalVisits": 1500,
    "uniqueSessions": 800,
    "activeSessions": 25,
    "concurrentPlayers": 8
  },
  "games": {
    "byMode": {
      "practice": 150,
      "online": 300,
      "local": 50,
      "total": 500
    },
    "completion": {
      "total": 500,
      "completed": 455,
      "rate": 91.00
    }
  },
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-12-31"
  },
  "timestamp": "2024-12-07T09:00:00.000Z"
}
```

## Database Schema

The service uses SQLite with the following tables:

- **VisitEvents**: Individual visit records
- **GameModeEvents**: Game session records with mode, duration, and results
- **UserSessions**: Aggregated session data
- **PageViewEvents**: Page navigation tracking

## Integration with Main Application

See `client-library.js` for a JavaScript client library that can be included in the main application to track events.

Example usage:
```javascript
// Initialize analytics client
const analytics = new AnalyticsClient('http://localhost:3002');

// Track a visit
await analytics.trackVisit('home');

// Start a game
await analytics.trackGameStart('online', 'game-id-123');

// End a game
await analytics.trackGameEnd('game-id-123', true, 500, 'win');

// Track page view
await analytics.trackPageView('game', '/game.html', 120);
```

## Architecture

The analytics service is:
- **Separate from the main application**: Runs on its own port (3002)
- **Independent database**: Uses its own SQLite database
- **RESTful API**: Provides HTTP endpoints for event tracking and data retrieval
- **Real-time capable**: Can track events as they happen
- **Persistent storage**: All data is stored in SQLite for long-term analysis

## Development

The service follows the same coding conventions as the main application:
- ES6+ JavaScript
- Async/await for asynchronous operations
- Sequelize ORM for database operations
- Express.js for API routing
- Proper error handling and logging
