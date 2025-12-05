# Haunt For Gold - Project Context

## Project Overview
Haunt For Gold is a multiplayer pixel art game where players collect coins while avoiding enemies in real-time action. The game features a spooky Halloween theme for the Costume Contest hackathon category.

## Tech Stack
- Backend: Node.js, Express, Socket.IO
- Frontend: HTML5 Canvas, Vanilla JavaScript
- Database: SQLite with Sequelize ORM (for player names and leaderboards)
- Authentication: Simple cookie-based name storage (no accounts)

## Design Theme: Haunted Gold Rush
The game uses a spooky Halloween aesthetic with:
- Dark purple/black color palette with ghostly green accents
- Pixel art ghosts, skeletons, and haunted elements
- Eerie animations and particle effects (fog, floating decorations)
- Glowing effects and fog overlays
- Side-by-side home screen layout (no scrolling)

## Code Style Guidelines
- Use ES6+ JavaScript features
- Follow consistent naming conventions (camelCase for variables/functions)
- Keep functions small and focused
- Add JSDoc comments for public functions
- Use semantic HTML5 elements
- CSS should use CSS custom properties for theming

## File Structure
- `/public` - Frontend assets and game code
  - `/public/css` - Spooky theme CSS files (spooky-theme.css, spooky-components.css, spooky-animations.css)
  - `/public/assets` - Images and sprites
  - `/public/sounds` - Audio files
- `/config` - Server configuration
- `/models` - Sequelize database models (User, PlayerName, GameHistory)
- `/routes` - Express API routes
- `server.js` - Main server entry point

## Key Game Features
- Real-time online multiplayer via Socket.IO with matchmaking queue
- Local multiplayer support (requires game controllers - 2-4 players)
- Practice mode for single player
- Cookie-based player identification with unique name validation
- Leaderboard system
- Gamepad API controller support

## Implemented Features
- ✅ Spooky Halloween UI theme with fog effects
- ✅ Cookie-based authentication with SQLite name storage
- ✅ Local multiplayer with controller detection
- ✅ Online multiplayer with first-come-first-serve matchmaking
- ✅ Rematch functionality for online games
- ✅ Side-by-side home screen layout
- ✅ Halloween decorations (floating ghosts, pumpkins, bats)
- ✅ Player statistics tracking
