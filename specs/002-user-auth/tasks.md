# User Authentication System - Implementation Tasks

**Feature ID**: 002
**Status**: Ready for Implementation
**Last Updated**: 2026-02-10

## Summary

- **Total Tasks**: 42
- **Phases**: 6
- **Estimated Implementation**: Complete authentication system with email verification and password reset

## Implementation Strategy

### MVP Approach
Start with core authentication features first:
1. **Phase 1-2**: Setup and database foundation
2. **Phase 3**: User registration with email verification (P1 - MVP)
3. **Phase 4**: Login flow updates (P1 - MVP)
4. **Phase 5**: Password reset functionality (P1 - MVP)
5. **Phase 6**: Polish, testing, and cross-cutting concerns

### Incremental Delivery
Each phase produces a working increment that can be independently tested:
- After Phase 3: Users can register and verify email
- After Phase 4: Verified users can log in
- After Phase 5: Users can reset forgotten passwords

### Parallel Execution Opportunities
- Tasks marked with [P] can be executed in parallel
- Multiple form components can be built simultaneously
- API endpoints can be built in parallel after models are complete

---

## Phase 1: Setup & Configuration

**Goal**: Configure email service and set up project infrastructure

**Tasks**:
- [ ] T001 Choose and install email service dependency (Resend recommended) in physioai/package.json
- [ ] T002 Create email sending utility in physioai/lib/email.ts with sendVerificationEmail and sendPasswordResetEmail functions
- [ ] T003 Create token generation/validation utility in physioai/lib/tokens.ts with generateToken, hashToken, and verifyToken functions
- [ ] T004 Create rate limiting utility in physioai/lib/rate-limiter.ts with checkRateLimit and resetRateLimit functions
- [ ] T005 Add environment variables for email service to physioai/.env.local.example (EMAIL_SERVICE, EMAIL_FROM, EMAIL_API_KEY)
- [ ] T006 Create email template directory at physioai/templates/emails/ with verification-email.html and reset-password-email.html

**Parallel opportunities**: T001, T005, T006 can be done in parallel

---

## Phase 2: Foundational (Database Model)

**Goal**: Update User model with authentication fields and methods

**Tasks**:
- [ ] T007 Update IUser interface in physioai/types/models.ts to add emailVerified, verificationToken, verificationTokenExpires, resetPasswordToken, resetPasswordTokenExpires, lastLoginAt, failedLoginAttempts, and lockUntil fields
- [ ] T008 Update User schema in physioai/models/User.ts with new fields for email verification and password reset
- [ ] T009 Add indexes to User schema for verificationToken and resetPasswordToken in physioai/models/User.ts
- [ ] T010 Add methods to User schema: generateVerificationToken, generateResetToken, verifyEmail, isLocked, recordFailedLogin, resetFailedLoginAttempts in physioai/models/User.ts

**No parallel execution**: Tasks must be done sequentially as each builds on the previous

---

## Phase 3: User Story 1 - Registration & Email Verification

**Story Goal**: New users can register accounts and verify their email addresses

**Independent Test Criteria**:
- User can register with valid credentials
- Verification email is sent upon registration
- User cannot log in until email is verified
- Verification link works and marks account as verified
- Expired verification links show appropriate error
- Users can request new verification email

**Tasks**:
- [ ] T011 [P] [US1] Update register endpoint in physioai/app/api/auth/register/route.ts to create unverified accounts and send verification emails
- [ ] T012 [P] [US1] Create verify-email endpoint in physioai/app/api/auth/verify-email/route.ts to handle email verification via token
- [ ] T013 [US1] Create resend-verification endpoint in physioai/app/api/auth/resend-verification/route.ts to send new verification emails
- [ ] T014 [P] [US1] Create RegisterForm component in physioai/components/auth/RegisterForm.tsx with validation and error handling
- [ ] T015 [US1] Create verify-email page in physioai/app/(auth)/verify-email/page.tsx to handle verification link clicks
- [ ] T016 [US1] Create VerifyEmailAlert component in physioai/components/auth/VerifyEmailAlert.tsx for unverified users
- [ ] T017 [US1] Update register page in physioai/app/(auth)/register/page.tsx to use RegisterForm component
- [ ] T018 [US1] Add emailVerified validation to physioai/lib/validations.ts (verifyEmailSchema)

**Parallel opportunities**: T011, T012, T014 can be done in parallel after Phase 2 is complete

---

## Phase 4: User Story 2 - Login Flow Updates

**Story Goal**: Verified users can log in securely with proper account status checks

**Independent Test Criteria**:
- Verified users can log in with valid credentials
- Unverified users are prompted to verify email
- Rate limiting prevents brute force attacks
- Account lockout after failed login attempts
- Session expires after 30 days of inactivity

**Tasks**:
- [ ] T019 [P] [US2] Update NextAuth config in physioai/lib/auth.ts to check emailVerified status before allowing login
- [ ] T020 [P] [US2] Update NextAuth authorize function in physioai/lib/auth.ts to implement account lockout for failed attempts
- [ ] T021 [US2] Update NextAuth authorize function in physioai/lib/auth.ts to record successful login timestamp
- [ ] T022 [US2] Update NextAuth authorize function in physioai/lib/auth.ts to reset failed login attempts on success
- [ ] T023 [P] [US2] Create LoginForm component in physioai/components/auth/LoginForm.tsx with validation and error handling
- [ ] T024 [US2] Update login page in physioai/app/(auth)/login/page.tsx to use LoginForm and show verification prompt
- [ ] T025 [US2] Add rate limiting to login endpoint in physioai/lib/auth.ts (5 attempts per 15 minutes)

**Parallel opportunities**: T019, T023 can be done in parallel after Phase 3 is complete

---

## Phase 5: User Story 3 - Password Reset

**Story Goal**: Users can reset forgotten passwords via email

**Independent Test Criteria**:
- User can request password reset with email
- Reset email is sent with valid token
- Reset link expires after 1 hour
- Reset link is single-use only
- User can set new password via reset link
- Sessions are invalidated after password reset

**Tasks**:
- [ ] T026 [P] [US3] Create forgot-password endpoint in physioai/app/api/auth/forgot-password/route.ts to handle reset requests
- [ ] T027 [P] [US3] Create reset-password endpoint in physioai/app/api/auth/reset-password/route.ts to handle password updates
- [ ] T028 [US3] Create ForgotPasswordForm component in physioai/components/auth/ForgotPasswordForm.tsx with validation
- [ ] T029 [US3] Create ResetPasswordForm component in physioai/components/auth/ResetPasswordForm.tsx with validation
- [ ] T030 [US3] Create forgot-password page in physioai/app/(auth)/forgot-password/page.tsx to use ForgotPasswordForm
- [ ] T031 [US3] Create reset-password page in physioai/app/(auth)/reset-password/page.tsx to use ResetPasswordForm
- [ ] T032 [US3] Update reset-password endpoint to invalidate all user sessions after password reset in physioai/app/api/auth/reset-password/route.ts
- [ ] T033 [US3] Add resetPasswordSchema validation to physioai/lib/validations.ts

**Parallel opportunities**: T026, T027, T028, T029 can be done in parallel after Phase 2 is complete

---

## Phase 6: Polish & Cross-Cutting Concerns

**Goal**: Security hardening, error handling, and user experience improvements

**Tasks**:
- [ ] T034 Add comprehensive error handling and logging to all auth endpoints in physioai/app/api/auth/
- [ ] T035 Add success/error toast notifications to all auth forms using shadcn/ui toast in physioai/components/auth/
- [ ] T036 Add loading states to all auth forms during API calls in physioai/components/auth/
- [ ] T037 Implement rate limiting on registration endpoint (5 attempts per IP per hour) in physioai/app/api/auth/register/route.ts
- [ ] T038 Implement rate limiting on password reset endpoint (3 attempts per email per hour) in physioai/app/api/auth/forgot-password/route.ts
- [ ] T039 Implement rate limiting on resend verification endpoint (3 attempts per email per hour) in physioai/app/api/auth/resend-verification/route.ts
- [ ] T040 Add security headers to NextAuth config in physioai/lib/auth.ts
- [ ] T041 Add database migration script to set emailVerified=true for existing users in physioai/lib/migration.ts
- [ ] T042 Update middleware (when enabled) to protect dashboard routes and redirect unverified users in physioai/middleware.ts.disabled

**Parallel opportunities**: T034-T042 can mostly be done in parallel after previous phases are complete

---

## Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational - Database Model)
    ↓
    ├→ Phase 3 (US1: Registration & Email Verification)
    │       ↓
    └→ Phase 4 (US2: Login Flow Updates) ──┐
                                            │
Phase 2 ─→ Phase 5 (US3: Password Reset) ──┴→ Phase 6 (Polish)
```

### Story Dependencies
- **US2 (Login)** depends on **US1 (Registration)** - need verified accounts to test login
- **US3 (Password Reset)** is independent of US1 and US2 - can be developed in parallel
- **Phase 6 (Polish)** depends on all user stories being complete

## Task Count by User Story

| Phase | User Story | Task Count | Parallelizable |
|-------|------------|------------|----------------|
| 1 | Setup | 6 | 3 |
| 2 | Foundational | 4 | 0 |
| 3 | US1: Registration | 8 | 3 |
| 4 | US2: Login | 7 | 2 |
| 5 | US3: Password Reset | 8 | 4 |
| 6 | Polish | 9 | 9 |
| **Total** | | **42** | **21** |

## Suggested MVP Scope

For minimum viable product, implement:
1. **Phase 1**: Complete (setup)
2. **Phase 2**: Complete (database foundation)
3. **Phase 3**: Complete (registration with email verification)

This allows users to:
- Register new accounts
- Verify their email address
- Be prepared for login once Phase 4 is complete

## Notes

- All tasks follow the checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
- [P] marker indicates tasks that can be executed in parallel
- [US1], [US2], [US3] labels indicate which user story a task belongs to
- File paths are absolute within the physioai directory
- Tasks are ordered by execution dependencies within each phase
