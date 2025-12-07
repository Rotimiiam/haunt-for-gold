# Analytics Service - Quick Reference Card

## 🚀 Quick Start

```bash
cd analytics-service
npm install
cp .env.example .env
npm start
```

Service starts on: **http://localhost:3002**

## 📊 Track Events

### Track a Visit
```javascript
POST /api/analytics/visit
{
  "sessionId": "unique-session-id",
  "page": "home"
}
```

### Start a Game
```javascript
POST /api/analytics/game/start
{
  "sessionId": "session-id",
  "gameMode": "practice|online|local",
  "gameId": "game-123"
}
```

### End a Game
```javascript
POST /api/analytics/game/end
{
  "sessionId": "session-id",
  "gameId": "game-123",
  "completed": true,
  "score": 500,
  "result": "win|lose|tie"
}
```

## 📈 Query Analytics

### Get Dashboard (Everything)
```bash
curl http://localhost:3002/api/analytics/dashboard
```

### Get Game Mode Stats
```bash
curl http://localhost:3002/api/analytics/games/modes
```

### Get Active Sessions
```bash
curl http://localhost:3002/api/analytics/sessions/active
```

### Get Completion Rates
```bash
curl http://localhost:3002/api/analytics/games/completion
```

## 🔧 Client Library Usage

```html
<script src="/analytics-client.js"></script>
<script>
  const analytics = new AnalyticsClient('http://localhost:3002');
  
  // Track visit
  analytics.trackVisit('home');
  
  // Start game
  analytics.trackGameStart('practice');
  
  // End game
  analytics.trackGameEnd(null, true, 500, 'win');
  
  // Get stats
  const stats = await analytics.getDashboard();
</script>
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `server.js` | Main server |
| `routes/analytics.js` | All endpoints |
| `client-library.js` | Browser client |
| `models/*.js` | Database schema |
| `README.md` | Full API docs |
| `INTEGRATION_GUIDE.md` | How to integrate |

## 🧪 Test the Service

```bash
# Test all endpoints
./examples/test-api.sh

# Validate structure
node test-structure.js

# Health check
curl http://localhost:3002/health
```

## 📊 Metrics Tracked

✅ Total visits  
✅ Game mode usage (practice, online, local)  
✅ Active sessions  
✅ Concurrent players  
✅ Completion rates  
✅ Page views  
✅ Engagement duration  
✅ Peak usage times  

## 🌐 All Endpoints

```
POST /api/analytics/visit
POST /api/analytics/game/start
POST /api/analytics/game/end
POST /api/analytics/pageview
POST /api/analytics/session/end

GET  /api/analytics/visits/total
GET  /api/analytics/games/modes
GET  /api/analytics/sessions/active
GET  /api/analytics/games/completion
GET  /api/analytics/pageviews
GET  /api/analytics/engagement
GET  /api/analytics/peak-usage
GET  /api/analytics/dashboard
GET  /health
```

## 🔍 Query with Date Range

Add `?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` to any GET endpoint:

```bash
curl "http://localhost:3002/api/analytics/dashboard?startDate=2024-01-01&endDate=2024-12-31"
```

## 💡 Common Tasks

### Track a Practice Game
```javascript
await analytics.trackGameStart('practice');
// ... play game ...
await analytics.trackGameEnd(null, true, 500, 'win');
```

### Track an Online Game
```javascript
await analytics.trackGameStart('online', roomId);
// ... play game ...
await analytics.trackGameEnd(roomId, true, score, result);
```

### Get Today's Stats
```javascript
const today = new Date().toISOString().split('T')[0];
const stats = await analytics.getDashboard(today, today);
```

## 🐛 Troubleshooting

**Service won't start:**
- Check port 3002 is available
- Run `npm install` first

**CORS errors:**
- Service has CORS enabled by default
- Check the analytics URL is correct

**No data showing:**
- Verify service is running: `curl http://localhost:3002/health`
- Check browser console for errors
- View service logs

## 📚 Full Documentation

- **OVERVIEW.md** - Architecture & design
- **README.md** - Complete API reference
- **QUICK_START.md** - Getting started guide
- **INTEGRATION_GUIDE.md** - Integration steps
- **examples/** - Working examples

## 🎯 Integration Checklist

- [ ] Service running on port 3002
- [ ] Dependencies installed (`npm install`)
- [ ] Copy `client-library.js` to main app public folder
- [ ] Initialize client in HTML: `new AnalyticsClient('http://localhost:3002')`
- [ ] Track visits on page load
- [ ] Track game starts in game code
- [ ] Track game ends with results
- [ ] Test with dashboard endpoint

## 🚢 Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Configure specific CORS origins in `server.js`
3. Use process manager (PM2 recommended)
4. Set up database backups
5. Monitor with health endpoint
6. Consider PostgreSQL for high traffic

---

**Need Help?** Check the full documentation in the analytics-service folder!
