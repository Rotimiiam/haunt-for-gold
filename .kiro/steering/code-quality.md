---
inclusion: fileMatch
fileMatchPattern: "*.js"
---

# JavaScript Code Quality Standards

## General Guidelines
- Always use `const` for variables that won't be reassigned, `let` otherwise
- Never use `var`
- Use arrow functions for callbacks
- Prefer template literals over string concatenation
- Use destructuring where appropriate

## Error Handling
- Always wrap async operations in try/catch
- Provide meaningful error messages
- Log errors with context for debugging
- Never swallow errors silently

## Game-Specific Patterns
- Use requestAnimationFrame for game loops
- Implement proper cleanup for event listeners
- Use object pooling for frequently created/destroyed objects
- Keep game state centralized and predictable

## Socket.IO Best Practices
- Validate all incoming data
- Use rooms for game sessions
- Implement reconnection handling
- Clean up listeners on disconnect

## Performance
- Minimize DOM manipulation during gameplay
- Use canvas efficiently (batch draws, avoid unnecessary clears)
- Debounce/throttle input handlers where appropriate
- Profile and optimize hot paths

## Accessibility
- Ensure keyboard navigation works
- Provide visual alternatives to audio cues
- Support reduced motion preferences
- Maintain sufficient color contrast
