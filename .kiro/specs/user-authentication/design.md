# Design Document

## Overview

The user authentication system builds upon the existing Passport.js foundation to provide comprehensive account management for the Gold Grab game. The system will enhance the current authentication infrastructure with improved user registration, profile management, password recovery, and secure session handling while maintaining compatibility with the existing game statistics and OAuth integrations.

## Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Side   │    │   Server Side   │    │    Database     │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │Auth UI      │ │◄──►│ │Auth Routes  │ │◄──►│ │User Model   │ │
│ │Components   │ │    │ │(/api/auth)  │ │    │ │(MongoDB)    │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │Profile UI   │ │◄──►│ │Profile API  │ │◄──►│ │Sessions     │ │
│ │Components   │ │    │ │(/api/user)  │ │    │ │(MongoStore) │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │                 │
│ │Game Client  │ │◄──►│ │Socket Auth  │ │    │                 │
│ │Integration  │ │    │ │Middleware   │ │    │                 │
│ └─────────────┘ │    │ └─────────────┘ │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Authentication Flow

1. **Registration Flow**: User submits registration form → Server validates data → Password hashed → User created → Email verification sent
2. **Login Flow**: User submits credentials → Passport.js validates → Session created → User redirected to game
3. **OAuth Flow**: User clicks OAuth provider → Redirected to provider → Callback processed → User linked/created → Session established
4. **Password Reset Flow**: User requests reset → Email sent with token → User clicks link → New password set → Session invalidated

## Components and Interfaces

### Frontend Components

#### AuthModal Component
```javascript
class AuthModal {
  // Handles login/register modal display
  // Manages form validation and submission
  // Integrates with existing game UI
}
```

#### UserProfile Component
```javascript
class UserProfile {
  // Displays user statistics and preferences
  // Handles profile updates and password changes
  // Manages account deletion workflow
}
```

#### PasswordReset Component
```javascript
class PasswordReset {
  // Handles forgot password flow
  // Manages reset token validation
  // Provides new password form
}
```

### Backend API Endpoints

#### Authentication Routes (/api/auth)
- `POST /register` - User registration with validation
- `POST /login` - User login with Passport.js
- `POST /logout` - Session termination
- `GET /google` - Google OAuth initiation
- `GET /google/callback` - Google OAuth callback
- `POST /forgot-password` - Password reset request
- `POST /reset-password` - Password reset execution
- `GET /verify-email` - Email verification

#### User Management Routes (/api/user)
- `GET /profile` - Get user profile data
- `PUT /profile` - Update user profile
- `PUT /password` - Change password
- `DELETE /account` - Delete user account
- `GET /history` - Get game history
- `PUT /preferences` - Update user preferences

### Database Schema Enhancements

The existing User model will be enhanced with additional fields:

```javascript
// Additional fields for enhanced authentication
{
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String
}
```

## Data Models

### User Authentication State
```javascript
{
  isAuthenticated: boolean,
  user: {
    id: string,
    username: string,
    displayName: string,
    email: string,
    avatar: string,
    emailVerified: boolean,
    preferences: object,
    stats: object
  },
  sessionExpiry: timestamp
}
```

### Registration Request
```javascript
{
  username: string,      // 3-20 characters, alphanumeric + underscore
  email: string,         // Valid email format
  password: string,      // Min 6 characters, complexity requirements
  displayName: string,   // 1-30 characters
  acceptTerms: boolean   // Must be true
}
```

### Password Reset Token
```javascript
{
  userId: ObjectId,
  token: string,         // Cryptographically secure random token
  expires: Date,         // 1 hour expiry
  used: boolean          // Prevent token reuse
}
```

## Error Handling

### Client-Side Error Handling
- Form validation with real-time feedback
- Network error recovery with retry mechanisms
- User-friendly error messages for common scenarios
- Loading states during authentication operations

### Server-Side Error Handling
- Input validation with detailed error responses
- Rate limiting for authentication endpoints
- Account lockout after failed login attempts
- Secure error messages that don't reveal system details

### Common Error Scenarios
1. **Invalid Credentials**: Generic message to prevent username enumeration
2. **Account Locked**: Clear message with unlock timeframe
3. **Email Not Verified**: Prompt to resend verification email
4. **Password Reset Expired**: Clear instructions to request new reset
5. **Network Failures**: Retry mechanisms with exponential backoff

## Testing Strategy

### Unit Tests
- User model validation and methods
- Password hashing and comparison
- Token generation and validation
- Email verification logic
- OAuth integration functions

### Integration Tests
- Complete authentication flows
- API endpoint functionality
- Database operations
- Session management
- Email sending functionality

### End-to-End Tests
- User registration and login workflows
- Password reset complete flow
- OAuth provider integration
- Profile management operations
- Game integration with authentication

### Security Tests
- Password strength validation
- SQL injection prevention
- XSS protection
- CSRF token validation
- Session hijacking prevention
- Rate limiting effectiveness

### Performance Tests
- Authentication endpoint response times
- Database query optimization
- Session storage performance
- Concurrent user handling
- Memory usage during peak loads

## Security Considerations

### Password Security
- bcrypt hashing with salt rounds ≥ 12
- Password complexity requirements
- Prevention of common passwords
- Secure password reset tokens

### Session Security
- HttpOnly and Secure cookie flags
- Session rotation on privilege changes
- Automatic session expiry
- CSRF protection

### Data Protection
- Input sanitization and validation
- SQL injection prevention
- XSS protection headers
- Rate limiting on sensitive endpoints
- Account lockout mechanisms

### OAuth Security
- State parameter validation
- Secure callback URL handling
- Token storage best practices
- Provider-specific security measures