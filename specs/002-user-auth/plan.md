# User Authentication System - Technical Plan

**Feature ID**: 002
**Status**: Draft
**Last Updated**: 2026-02-10

## Tech Stack

### Framework & Language
- **Runtime**: Node.js 18+
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.7
- **Package Manager**: pnpm

### Authentication
- **Library**: NextAuth.js v5 (Auth.js)
- **Strategy**: Credentials provider (email/password)
- **Session Management**: JWT with 30-day expiration

### Database & ORM
- **Database**: MongoDB
- **ODM**: Mongoose 8.9

### Security
- **Password Hashing**: bcryptjs (cost factor: 12)
- **Token Generation**: Cryptographically secure random tokens
- **Rate Limiting**: To be implemented (in-memory or Redis)

### Email Service
- **Transport**: Resend, SendGrid, or AWS SES (TBD - environment configurable)
- **Templates**: React Email or plain HTML templates

### Form Handling & Validation
- **Validation**: Zod schemas
- **Form Library**: React Hook Form with @hookform/resolvers

### UI Components
- **Styling**: Tailwind CSS
- **Component Library**: shadcn/ui (Radix UI primitives)

## Project Structure

```
physioai/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx           # Login page
│   │   ├── register/
│   │   │   └── page.tsx           # Registration page
│   │   ├── verify-email/
│   │   │   └── page.tsx           # Email verification page
│   │   ├── forgot-password/
│   │   │   └── page.tsx           # Forgot password request page
│   │   └── reset-password/
│   │       └── page.tsx           # Password reset page
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/
│   │       │   └── route.ts       # NextAuth handler (existing)
│   │       ├── register/
│   │       │   └── route.ts       # Registration endpoint (existing)
│   │       ├── verify-email/
│   │       │   └── route.ts       # Email verification endpoint
│   │       ├── resend-verification/
│   │       │   └── route.ts       # Resend verification endpoint
│   │       ├── forgot-password/
│   │       │   └── route.ts       # Password reset request endpoint
│   │       └── reset-password/
│   │           └── route.ts       # Password reset endpoint
│   └── (dashboard)/
│       └── ...                    # Protected routes
├── components/
│   └── auth/
│       ├── LoginForm.tsx          # Login form component
│       ├── RegisterForm.tsx       # Registration form component
│       ├── ForgotPasswordForm.tsx # Forgot password form
│       ├── ResetPasswordForm.tsx  # Reset password form
│       └── VerifyEmailAlert.tsx   # Verification prompt component
├── lib/
│   ├── auth.ts                    # NextAuth config (existing, to be updated)
│   ├── email.ts                   # Email sending utilities (new)
│   ├── tokens.ts                  # Token generation/validation (new)
│   └── rate-limiter.ts            # Rate limiting utilities (new)
├── models/
│   └── User.ts                    # User model (to be updated)
├── types/
│   └── models.ts                  # Type definitions (to be updated)
└── templates/
    └── emails/                    # Email templates
        ├── verification-email.html
        ├── reset-password-email.html
        └── resend-verification.html
```

## Libraries & Dependencies

### Existing Dependencies (Already Installed)
- `next`: ^16.1.6
- `next-auth`: 5.0.0-beta.30
- `bcryptjs`: ^2.4.3
- `mongoose`: ^8.9.2
- `zod`: ^3.24.1
- `react-hook-form`: ^7.54.2
- `@hookform/resolvers`: ^3.10.0
- `@radix-ui/react-*`: UI primitives

### New Dependencies Required
- Email service (TBD - one of):
  - `resend` for Resend
  - `@sendgrid/mail` for SendGrid
  - `@aws-sdk/client-ses` for AWS SES
- Rate limiting:
  - `upstash/ratelimit` or custom implementation
- Token generation (can use existing crypto utilities)

## Database Schema Changes

### User Model Updates

The existing User model needs the following fields added:

```typescript
interface IUser {
  // ... existing fields

  // New fields for email verification
  emailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;

  // New fields for password reset
  resetPasswordToken?: string;
  resetPasswordTokenExpires?: Date;

  // Tracking
  lastLoginAt?: Date;
  failedLoginAttempts: number;
  lockUntil?: Date;
}
```

**Indexes to add**:
- `verificationToken` (sparse, for quick lookups)
- `resetPasswordToken` (sparse, for quick lookups)
- `emailVerified` (for querying unverified users)

## API Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/auth/register` | POST | Create new user account | No |
| `/api/auth/verify-email` | GET/POST | Verify email with token | No |
| `/api/auth/resend-verification` | POST | Resend verification email | No |
| `/api/auth/forgot-password` | POST | Request password reset | No |
| `/api/auth/reset-password` | POST | Reset password with token | No |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth handler | No |

## Security Considerations

### Password Security
- Minimum 8 characters with letters and numbers
- Bcrypt hashing with cost factor 12
- No password length limits (to prevent DoS via hash flooding)

### Token Security
- Verification tokens: 32+ character random strings
- Reset tokens: 32+ character random strings
- Tokens stored hashed in database (single-use)
- Expiration: 24 hours for verification, 1 hour for reset

### Rate Limiting
- Registration: 5 attempts per IP per hour
- Login: 5 attempts per email per 15 minutes
- Password reset: 3 attempts per email per hour
- Resend verification: 3 attempts per email per hour
- Email verification: 10 attempts per IP per hour

### Session Security
- JWT sessions with 30-day max age
- Secure cookie flags (httpOnly, secure, sameSite)
- Session invalidation after password reset

## Email Templates

### Verification Email
- Subject: "Verify your email address"
- Content:
  - Welcome message
  - Verification button/link
  - Expiration notice (24 hours)
  - Support contact

### Password Reset Email
- Subject: "Reset your password"
- Content:
  - Reset button/link
  - Expiration notice (1 hour)
  - Security warning (didn't request this?)
  - Support contact

### Resend Verification Email
- Subject: "Verify your email address"
- Content: Same as initial verification email

## Implementation Notes

### Email Verification Flow
1. User registers → account created with `emailVerified: false`
2. Verification token generated and stored
3. Email sent with verification link
4. User clicks link → token validated → `emailVerified: true`
5. User can now log in

### Password Reset Flow
1. User requests reset → token generated and stored
2. Email sent with reset link
3. User clicks link → directed to reset page
4. User submits new password → token validated → password updated
5. All sessions invalidated
6. User can log in with new password

### Login Flow Updates
1. User submits credentials
2. Check if account is locked (too many failed attempts)
3. Check if email is verified
4. Verify password
5. Reset failed login attempts on success
6. Create session

## Migration Strategy

### Phase 1: Database Migration
- Add new fields to User model with default values
- Create indexes for new fields
- Existing users: Set `emailVerified: true` (grandfathered in)

### Phase 2: Backend Implementation
- Update User model with new fields and methods
- Implement email sending utilities
- Implement token utilities
- Create new API endpoints
- Update existing auth flow

### Phase 3: Frontend Implementation
- Create auth pages
- Create form components
- Add verification prompts
- Update error handling

### Phase 4: Testing & Polish
- End-to-end testing
- Security testing
- Email template testing
- Performance optimization

## Environment Variables

```bash
# Existing
MONGODB_URI=...
NEXTAUTH_URL=...
NEXTAUTH_SECRET=...

# New Required
EMAIL_SERVICE=resend|sendgrid|aws-ses
EMAIL_FROM=noreply@physioai.online
EMAIL_API_KEY=...

# Optional
RESEND_API_KEY=...
SENDGRID_API_KEY=...
AWS_SES_REGION=...
AWS_SES_ACCESS_KEY_ID=...
AWS_SES_SECRET_ACCESS_KEY=...

# Rate Limiting (optional)
RATE_LIMIT_REDIS_URL=...
```

## Open Questions

1. **Email Service Provider**: Which service to use? (Resend recommended for simplicity)
2. **Rate Limiting Storage**: In-memory (single instance) or Redis (distributed)?
3. **Token Storage**: Hash tokens in DB or store plaintext? (Hashing recommended)
4. **Existing Users**: Should all existing users be marked as verified? (Yes, recommended)
