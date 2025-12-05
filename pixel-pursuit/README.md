# 👻 Haunt For Gold 🎃

A spooky multiplayer pixel art game where players collect cursed coins while escaping ghostly enemies in real-time haunted action!

**Hackathon Category: Costume Contest** - Featuring a haunting user interface with polished spooky design elements.

![Game Preview](public/assets/preview.png)

## 🎮 Features

- **Real-time Online Multiplayer** - Compete against other players via Socket.IO with matchmaking queue
- **Local Multiplayer** - Play with 2-4 friends on the same device using game controllers
- **Practice Mode** - Hone your skills against AI enemies
- **Haunted UI Theme** - Full Halloween aesthetic with fog effects, glowing elements, and spooky animations
- **Simple Player Identity** - Cookie-based name storage with unique name validation
- **Leaderboard System** - Track high scores and compete globally
- **Controller Support** - Full Gamepad API integration for local multiplayer
- **Responsive Design** - Side-by-side layout, works on desktop and mobile
- **Rematch System** - Challenge opponents to rematches after online games

## 🛠️ Tech Stack

- **Backend:** Node.js, Express, Socket.IO
- **Frontend:** HTML5 Canvas, Vanilla JavaScript
- **Database:** SQLite with Sequelize ORM
- **Authentication:** Cookie-based player name storage (no accounts needed)

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/haunted-gold-grab.git
   cd haunted-gold-grab
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file (copy from `.env.example`)
   ```bash
   cp .env.example .env
   ```

4. Start the server
   ```bash
   npm start
   ```

5. Open `http://localhost:3001` in your browser

## 🎯 Game Controls

### Online/Practice Mode
- **Arrow Keys / WASD** - Move your character
- **Touch Controls** - On-screen buttons for mobile

### Local Multiplayer (Requires Controllers)
- **Left Stick / D-Pad** - Move your character
- **A Button** - Confirm/Action
- **B Button** - Back/Cancel
- Connect 2-4 game controllers to enable local multiplayer

## 🎃 Spooky Theme Features

- Dark purple/black color palette with ghostly green accents
- Animated fog particle system with floating particles
- Glowing buttons and UI elements with hover effects
- Floating Halloween decorations (ghosts, pumpkins, bats, spiders)
- Screen shake effects on bomb hits
- Spectral score popups with animations
- Haunted scoreboard with flickering candles
- Victory/defeat animations with eerie effects
- Side-by-side home screen layout (no scrolling)
- Vignette overlay for atmospheric depth

## 🌐 Online Multiplayer

- **Matchmaking Queue** - First-come-first-serve pairing system
- **Real-time Gameplay** - Synchronized via Socket.IO
- **Rematch System** - Request rematches after games
- **Graceful Disconnection** - Handles player dropouts

## 🎮 Local Multiplayer

- **Controller Required** - Uses Gamepad API for input
- **2-4 Players** - Based on connected controllers
- **Player Colors** - Ghost Green, Pumpkin Orange, Blood Red, Cursed Gold
- **Setup Screen** - Controller detection and player assignment
- **Same Screen** - All players compete on one display

## 📁 Project Structure

```
├── .kiro/
│   ├── hooks/          # Agent hooks for development automation
│   ├── specs/          # Feature specifications
│   └── steering/       # Steering documents for Kiro
├── config/             # Server configuration
├── models/             # Sequelize database models
├── public/
│   ├── css/           # Stylesheets including spooky theme
│   ├── assets/        # Images and sprites
│   ├── sounds/        # Audio files
│   └── *.js           # Frontend game code
├── routes/            # Express API routes
└── server.js          # Main server entry point
```

## 🤖 Kiro Usage Documentation

This project extensively uses Kiro's features for development:

### Spec-Driven Development
Located in `.kiro/specs/`, we used structured specifications for:
- **spooky-ui-theme/** - ✅ Halloween theme (COMPLETE)
- **local-multiplayer/** - ✅ Controller-based local multiplayer (COMPLETE)
- **user-authentication/** - ✅ Cookie-based name system (COMPLETE)
- **leaderboard-system/** - Leaderboard feature spec
- **controller-support/** - Gamepad API integration
- **design-updates/** - UI/UX improvements
- And more feature specs...

Each spec follows the requirements → design → tasks workflow, enabling systematic feature development.

### Steering Documents
Located in `.kiro/steering/`:
- **project-context.md** - Project overview, tech stack, and implemented features
- **spooky-theme.md** - Halloween color palette and design guidelines (auto-applied to CSS/HTML files)
- **code-quality.md** - JavaScript coding standards (auto-applied to JS files)

These steering docs ensure consistent code style and theme adherence across all development.

### Agent Hooks
Located in `.kiro/hooks/hooks.json`:
- **Spooky Theme Validator** - Reminds to use theme variables when editing CSS
- **Game Code Quality Check** - Reviews game JS for performance best practices
- **Accessibility Check** - Ensures ARIA labels and keyboard navigation
- **Test Runner** - Auto-runs tests on save
- **Server Restart Reminder** - Notifies when server code changes

### Vibe Coding Highlights
- Generated the entire fog particle system through conversation
- Created comprehensive CSS animation library for spooky effects
- Built responsive haunted UI components with side-by-side layout
- Implemented screen shake and score popup effects
- Built controller detection and local multiplayer setup
- Created online matchmaking queue with rematch functionality
- Simplified auth from OAuth to cookie-based name storage

## 📜 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Credits

Built with ❤️ and 👻 using [Kiro](https://kiro.dev)
