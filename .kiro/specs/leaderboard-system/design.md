# Design Document

## Overview

The leaderboard system provides comprehensive player rankings and statistics display for the Gold Grab game. It builds upon the existing User model's statistics tracking to create dynamic, filterable leaderboards with multiple ranking categories and time periods. The system emphasizes performance through caching strategies and efficient database queries while providing rich social features for player engagement.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Side   │    │   Server Side   │    │    Database     │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │Leaderboard  │ │◄──►│ │Leaderboard  │ │◄──►│ │User Stats   │ │
│ │Components   │ │    │ │API Routes   │ │    │ │Collection   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │Player       │ │◄──►│ │Ranking      │ │◄──►│ │Leaderboard  │ │
│ │Profile View │ │    │ │Calculator   │ │    │ │Cache (Redis)│ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │Social       │ │◄──►│ │Achievement  │ │◄──►│ │Game History │ │
│ │Sharing      │ │    │ │Tracker      │ │    │ │Collection   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

1. **Game Completion**: Game result → User stats update → Leaderboard cache invalidation → Background ranking recalculation
2. **Leaderboard Request**: Client request → Cache check → Database query (if needed) → Response with rankings
3. **Real-time Updates**: WebSocket connection → Live ranking updates → Client state synchronization

## Components and Interfaces

### Frontend Components

#### LeaderboardView Component
```javascript
class LeaderboardView {
  // Main leaderboard display with filtering options
  // Handles category and time period selection
  // Manages pagination for large datasets
  // Implements real-time updates via WebSocket
}
```

#### LeaderboardEntry Component
```javascript
class LeaderboardEntry {
  // Individual leaderboard row display
  // Shows rank, player info, and key statistics
  // Handles click events for detailed player view
  // Highlights current user's entry
}
```

#### PlayerStatsModal Component
```javascript
class PlayerStatsModal {
  // Detailed player statistics popup
  // Displays comprehensive performance metrics
  // Shows achievement badges and milestones
  // Includes sharing functionality
}
```

#### LeaderboardFilters Component
```javascript
class LeaderboardFilters {
  // Category and time period selection
  // Search functionality for finding specific players
  // Filter persistence across sessions
}
```

### Backend API Endpoints

#### Leaderboard Routes (/api/leaderboard)
- `GET /global` - Get global leaderboard with filters
- `GET /player/:id` - Get specific player's ranking and stats
- `GET /categories` - Get available leaderboard categories
- `GET /achievements/:playerId` - Get player achievements
- `POST /share` - Generate shareable achievement content

#### Real-time Updates
- WebSocket events for live leaderboard updates
- Efficient delta updates for ranking changes
- Player achievement notifications

### Database Schema

#### Leaderboard Cache Schema
```javascript
{
  category: String,           // 'highScore', 'wins', 'winRate', etc.
  timePeriod: String,        // 'weekly', 'monthly', 'allTime'
  rankings: [{
    userId: ObjectId,
    username: String,
    displayName: String,
    avatar: String,
    rank: Number,
    score: Number,
    stats: Object,
    lastUpdated: Date
  }],
  generatedAt: Date,
  expiresAt: Date
}
```

#### Achievement Schema
```javascript
{
  userId: ObjectId,
  achievements: [{
    type: String,              // 'topRank', 'winStreak', 'milestone'
    category: String,
    value: Number,
    achievedAt: Date,
    shared: Boolean
  }],
  notifications: [{
    type: String,
    message: String,
    read: Boolean,
    createdAt: Date
  }]
}
```

## Data Models

### Leaderboard Categories
```javascript
const LEADERBOARD_CATEGORIES = {
  highScore: {
    name: 'Highest Score',
    field: 'stats.highestScore',
    sortOrder: 'desc',
    displayFormat: 'number'
  },
  totalWins: {
    name: 'Total Wins',
    field: 'stats.wins',
    sortOrder: 'desc',
    displayFormat: 'number'
  },
  winRate: {
    name: 'Win Rate',
    field: 'winRate',
    sortOrder: 'desc',
    displayFormat: 'percentage',
    minimumGames: 10
  },
  currentStreak: {
    name: 'Current Streak',
    field: 'stats.currentStreak',
    sortOrder: 'desc',
    displayFormat: 'number'
  },
  longestStreak: {
    name: 'Longest Streak',
    field: 'stats.longestStreak',
    sortOrder: 'desc',
    displayFormat: 'number'
  },
  totalGames: {
    name: 'Games Played',
    field: 'stats.totalGames',
    sortOrder: 'desc',
    displayFormat: 'number'
  }
};
```

### Time Periods
```javascript
const TIME_PERIODS = {
  weekly: {
    name: 'This Week',
    startDate: () => getWeekStart(),
    resetSchedule: 'weekly'
  },
  monthly: {
    name: 'This Month',
    startDate: () => getMonthStart(),
    resetSchedule: 'monthly'
  },
  allTime: {
    name: 'All Time',
    startDate: null,
    resetSchedule: null
  }
};
```

### Ranking Response Format
```javascript
{
  category: string,
  timePeriod: string,
  totalPlayers: number,
  userRank: number | null,
  rankings: [{
    rank: number,
    userId: string,
    username: string,
    displayName: string,
    avatar: string,
    score: number,
    stats: {
      totalGames: number,
      wins: number,
      winRate: number,
      // ... other relevant stats
    },
    isCurrentUser: boolean
  }],
  lastUpdated: timestamp
}
```

## Error Handling

### Client-Side Error Handling
- Loading states during leaderboard fetches
- Graceful degradation when WebSocket connection fails
- Retry mechanisms for failed API requests
- User-friendly messages for empty leaderboards

### Server-Side Error Handling
- Database query timeout handling
- Cache invalidation error recovery
- Rate limiting for leaderboard requests
- Fallback to cached data when live calculation fails

### Performance Considerations
- Pagination for large leaderboards
- Efficient database indexing on ranking fields
- Background processing for ranking calculations
- CDN caching for static leaderboard assets

## Testing Strategy

### Unit Tests
- Ranking calculation algorithms
- Cache invalidation logic
- Achievement detection systems
- Time period calculation functions
- Database query optimization

### Integration Tests
- Complete leaderboard API functionality
- Real-time update mechanisms
- Cache synchronization
- Achievement notification system
- Social sharing functionality

### End-to-End Tests
- Full leaderboard viewing workflow
- Category and time period filtering
- Player detail view interactions
- Achievement sharing flows
- Mobile responsive behavior

### Performance Tests
- Leaderboard loading times under various data sizes
- Concurrent user access patterns
- Cache hit/miss ratios
- Database query performance
- WebSocket connection handling

### Load Tests
- High-traffic leaderboard access
- Simultaneous ranking updates
- Cache invalidation under load
- Database performance with large datasets
- Memory usage during peak periods

## Caching Strategy

### Multi-Level Caching
1. **Browser Cache**: Static leaderboard assets and images
2. **Application Cache**: Frequently accessed rankings in memory
3. **Redis Cache**: Pre-calculated leaderboard data with TTL
4. **Database Indexes**: Optimized queries for ranking calculations

### Cache Invalidation
- Immediate invalidation on game result submission
- Scheduled regeneration for time-based leaderboards
- Partial updates for individual player ranking changes
- Fallback to stale data during regeneration

### Cache Warming
- Pre-calculate popular leaderboard combinations
- Background processing during low-traffic periods
- Predictive caching based on user access patterns