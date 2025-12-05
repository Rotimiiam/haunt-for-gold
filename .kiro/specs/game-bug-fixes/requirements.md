# Requirements Document

## Introduction

This document specifies the requirements for fixing three critical bugs in Haunt For Gold:
1. Online multiplayer rendering issues where the game doesn't display properly
2. Gray background appearing in practice mode instead of the spooky themed background
3. Coin respawn logic being incorrectly tied to bomb collection status

## Glossary

- **Game_Renderer**: The GameRenderer class responsible for drawing all game elements on the HTML5 canvas
- **Practice_Mode**: Single-player mode where the player competes against an AI opponent
- **Online_Multiplayer**: Two-player mode where players compete over Socket.IO connections
- **Coin**: Collectible item worth +10 points
- **Bomb**: Hazard item that deducts -20 points when touched
- **Game_State**: Object containing all current game data (players, coins, bombs, enemies, map dimensions)

## Requirements

### Requirement 1

**User Story:** As a player, I want the online multiplayer game to render correctly, so that I can see all game elements and play against my opponent.

#### Acceptance Criteria

1. WHEN a multiplayer game starts THEN the Game_Renderer SHALL display the spooky themed background with fog effects
2. WHEN the server sends a gameStateUpdate event THEN the Game_Renderer SHALL render all players at their correct positions
3. WHEN the server sends a gameStateUpdate event THEN the Game_Renderer SHALL render all uncollected coins with golden glow effects
4. WHEN the server sends a gameStateUpdate event THEN the Game_Renderer SHALL render all unexploded bombs with danger glow effects
5. WHEN the server sends a gameStateUpdate event THEN the Game_Renderer SHALL render all enemies with ghostly floating animation

### Requirement 2

**User Story:** As a player, I want the practice mode to display the spooky Halloween background, so that I have a consistent visual experience across all game modes.

#### Acceptance Criteria

1. WHEN practice mode starts THEN the Game_Renderer SHALL display the dark gradient background with purple tones
2. WHEN practice mode is running THEN the Game_Renderer SHALL display fog particle effects moving across the screen
3. WHEN practice mode is running THEN the Game_Renderer SHALL display flickering ambient torch lights in the corners
4. WHEN practice mode is running THEN the Game_Renderer SHALL display the haunted wall textures with cobweb decorations
5. WHEN the grass texture fails to load THEN the Game_Renderer SHALL display the gradient background without errors

### Requirement 3

**User Story:** As a player, I want coins to respawn when all coins are collected, regardless of remaining bombs, so that gameplay continues smoothly without waiting for bombs to be hit.

#### Acceptance Criteria

1. WHEN all coins are collected in practice mode THEN the Practice_Mode SHALL generate new coins immediately
2. WHEN all coins are collected in practice mode THEN the Practice_Mode SHALL NOT require bombs to be collected before respawning coins
3. WHEN all coins are collected in online multiplayer THEN the server SHALL generate new coins immediately
4. WHEN all coins are collected in online multiplayer THEN the server SHALL NOT require bombs to be exploded before respawning coins
5. WHEN coins respawn THEN the system SHALL also regenerate bombs based on the current difficulty level

### Requirement 4

**User Story:** As a developer, I want a pretty printer for the game state, so that I can debug rendering issues by inspecting serialized state.

#### Acceptance Criteria

1. WHEN the game state is serialized THEN the serializer SHALL output valid JSON containing all game elements
2. WHEN the serialized game state is parsed THEN the parser SHALL reconstruct an equivalent game state object
