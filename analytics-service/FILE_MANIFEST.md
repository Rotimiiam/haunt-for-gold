# Analytics Service - File Manifest

This document lists all files in the analytics service and their purposes.

## Core Application Files

### Server & Configuration
- **server.js** - Main Express server with API endpoints and middleware
- **package.json** - NPM dependencies and scripts
- **.env.example** - Environment variable template
- **.gitignore** - Git ignore patterns

### Configuration
- **config/database.js** - Sequelize database configuration for SQLite

### Database Models
- **models/index.js** - Exports all models
- **models/VisitEvent.js** - Tracks individual visit events
- **models/GameModeEvent.js** - Tracks game sessions (start/end)
- **models/UserSession.js** - Aggregated user session data
- **models/PageViewEvent.js** - Tracks page navigation events

### API Routes
- **routes/analytics.js** - All API endpoints for tracking and querying analytics

## Client Integration

### JavaScript Client
- **client-library.js** - Browser-compatible JavaScript client for easy integration

## Documentation

### Main Documentation
- **OVERVIEW.md** - High-level overview and architecture
- **README.md** - Complete API documentation with examples
- **QUICK_START.md** - Quick start guide for getting up and running
- **INTEGRATION_GUIDE.md** - Detailed integration instructions
- **FILE_MANIFEST.md** - This file

## Examples & Testing

### Examples
- **examples/integration-example.html** - Interactive browser example
- **examples/test-api.sh** - Bash script to test all API endpoints

### Testing
- **test-structure.js** - Validates that all required files are present

## File Count Summary

- **JavaScript Files**: 9 (server, models, routes, client, tests)
- **Documentation Files**: 5 (markdown guides)
- **Configuration Files**: 3 (package.json, .env.example, .gitignore)
- **Example Files**: 2 (HTML + shell script)

**Total**: 19 files organized in a clean directory structure

## Dependencies

### Runtime Dependencies (package.json)
1. **express** (^5.1.0) - Web framework
2. **sequelize** (^6.37.7) - ORM for database operations
3. **sqlite3** (^5.1.7) - SQLite database driver
4. **dotenv** (^16.3.1) - Environment variable management
5. **cors** (^2.8.5) - CORS middleware

### Dev Dependencies
None - this is a production-ready service

## Database Files (Created at Runtime)

- **analytics.sqlite** - SQLite database (created on first run)
- **analytics.sqlite-journal** - SQLite journal file (temporary)
- **analytics.sqlite-shm** - Shared memory file (temporary)
- **analytics.sqlite-wal** - Write-ahead log file (temporary)

These files are created automatically when the service starts and are not included in version control.

## Installation Requirements

1. Node.js 18.x or higher
2. npm (comes with Node.js)
3. ~50MB disk space for dependencies
4. ~10MB disk space for database (grows with data)

## Directory Structure

```
analytics-service/
├── config/                      # Configuration files
│   └── database.js
├── models/                      # Database models
│   ├── index.js
│   ├── VisitEvent.js
│   ├── GameModeEvent.js
│   ├── UserSession.js
│   └── PageViewEvent.js
├── routes/                      # API routes
│   └── analytics.js
├── examples/                    # Examples and tests
│   ├── integration-example.html
│   └── test-api.sh
├── server.js                    # Main server
├── client-library.js            # Client integration library
├── package.json                 # NPM configuration
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── OVERVIEW.md                  # Architecture overview
├── README.md                    # API documentation
├── QUICK_START.md               # Quick start guide
├── INTEGRATION_GUIDE.md         # Integration instructions
├── FILE_MANIFEST.md             # This file
└── test-structure.js            # Structure validation script
```

## Next Steps After Installation

1. Run `npm install` to install dependencies
2. Copy `.env.example` to `.env` and configure
3. Run `npm start` to start the service
4. Test with `curl http://localhost:3002/health`
5. Try the examples in the `examples/` directory
6. Integrate with main application following INTEGRATION_GUIDE.md
