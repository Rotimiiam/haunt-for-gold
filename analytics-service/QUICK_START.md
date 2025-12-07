# Quick Start Guide - Analytics Service

## Prerequisites
- Node.js 18.x or higher
- npm

## Installation

1. **Navigate to the analytics service directory:**
   ```bash
   cd analytics-service
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Start the service:**
   ```bash
   npm start
   ```

The service will start on port 3002 (configurable via `.env`).

## Quick Test

Once the service is running, test it:

```bash
# Check health
curl http://localhost:3002/health

# Track a visit
curl -X POST http://localhost:3002/api/analytics/visit \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-session-123",
    "page": "home"
  }'

# Get dashboard data
curl http://localhost:3002/api/analytics/dashboard
```

## What's Included

### Core Files
- `server.js` - Express server with analytics API
- `package.json` - Dependencies and scripts
- `.env.example` - Environment configuration template

### Models (Database Schema)
- `models/VisitEvent.js` - Track page visits
- `models/GameModeEvent.js` - Track game sessions
- `models/UserSession.js` - Track user sessions
- `models/PageViewEvent.js` - Track page views

### API Routes
- `routes/analytics.js` - All analytics endpoints

### Documentation
- `README.md` - Complete API documentation
- `INTEGRATION_GUIDE.md` - How to integrate with main app
- `QUICK_START.md` - This file

### Client Library
- `client-library.js` - JavaScript client for easy integration

## Next Steps

1. **For development:**
   - Keep the service running in a separate terminal
   - Use `http://localhost:3002` as the analytics URL
   - See logs in the terminal for debugging

2. **Integrate with main application:**
   - Copy `client-library.js` to the main app's public directory
   - Follow the INTEGRATION_GUIDE.md for detailed steps
   - Track events from your game code

3. **View analytics:**
   - Use the API endpoints to query data
   - Create a custom dashboard (see INTEGRATION_GUIDE.md)
   - Monitor real-time metrics

## Common Commands

```bash
# Start the service
npm start

# Check structure
node test-structure.js

# View logs (if using PM2)
pm2 logs analytics-service

# Stop service (if using PM2)
pm2 stop analytics-service
```

## Troubleshooting

**Port already in use:**
```bash
# Change port in .env file
PORT=3003
```

**Database errors:**
```bash
# Delete and recreate database
rm analytics.sqlite
npm start
```

**CORS errors:**
- Ensure CORS is configured in server.js
- Check that the main app is using the correct analytics URL

## Architecture

```
analytics-service/
├── config/           # Database configuration
├── models/           # Sequelize models (database schema)
├── routes/           # Express routes (API endpoints)
├── server.js         # Main server file
├── client-library.js # Client integration library
└── analytics.sqlite  # SQLite database (created on first run)
```

## Environment Variables

- `PORT` - Server port (default: 3002)
- `NODE_ENV` - Environment (development/production)
- `DATABASE_PATH` - SQLite database file path

## Security Notes

- The service accepts data from any origin by default (CORS enabled)
- For production, configure specific allowed origins
- Validate all input data before storing
- Consider rate limiting for public endpoints
- Implement authentication for analytics query endpoints if needed

## Performance Tips

- Analytics tracking is non-blocking (fire-and-forget)
- Database uses SQLite - consider PostgreSQL for high traffic
- Implement request queuing/batching for high volume
- Monitor database size and implement data retention policies
