---
inclusion: fileMatch
fileMatchPattern: "*.css,*.html,public/**"
---

# Spooky Halloween Theme Guidelines

## Color Palette
When working on UI/styling, use these haunted colors:

```css
:root {
  /* Primary Colors */
  --spooky-black: #0d0d0d;
  --haunted-purple: #1a0a2e;
  --midnight-blue: #16213e;
  --ghost-green: #00ff41;
  --pumpkin-orange: #ff6b00;
  --blood-red: #8b0000;
  
  /* Accent Colors */
  --ethereal-glow: rgba(0, 255, 65, 0.3);
  --fog-white: rgba(255, 255, 255, 0.1);
  --bone-white: #e8e8e8;
  --tombstone-gray: #4a4a4a;
  
  /* Gold (for coins) */
  --cursed-gold: #ffd700;
  --ancient-gold: #b8860b;
}
```

## Typography
- Use pixel/retro fonts for game elements
- Creepy/gothic fonts for titles
- Ensure readability with glow effects on dark backgrounds

## Visual Effects
- Add subtle fog/mist overlays
- Use glowing borders on interactive elements
- Implement flickering animations for lights
- Add particle effects for ghostly trails

## UI Components Style
- Buttons: Dark with glowing borders, hover effects with eerie glow
- Cards/Panels: Semi-transparent dark backgrounds with subtle borders
- Icons: Pixel art style with Halloween themes (skulls, ghosts, bats)
- Notifications: Slide in with ghostly fade effects

## Animation Guidelines
- Use subtle floating animations for ghosts
- Implement screen shake for bomb hits
- Add pulsing glow effects for important elements
- Keep animations smooth (60fps target)
