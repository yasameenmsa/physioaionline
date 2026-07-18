# Admin Section Audit & Fix Plan

Generated from full system audit on 2026-07-17.
Covers: Translation, Security, Errors.

---

## Phase 1: Critical Security Fixes (Day 1)

### 1.1 Regex Injection (ReDoS) — CRITICAL
**Files affected:** 12 locations pass raw user input to MongoDB `$regex`
- `app/api/admin/questions/route.ts` (lines 46-47)
- `app/api/courses/route.ts` (line 22)
- `app/api/workshops/route.ts` (line 24)
- `app/api/news/route.ts` (line 19)
- `app/api/search/route.ts` (line 30)
- `app/[locale]/admin/questions/page.tsx` (lines 27-28)
- `app/[locale]/admin/workshops/page.tsx` (lines 22-23)
- `app/[locale]/courses/page.tsx` (line 50)

**Fix:** Create `lib/escape-regex.ts` with `escapeRegex(str)` utility. Apply to all `$regex` usages:
```ts
// lib/escape-regex.ts
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Usage in routes:
filter.title = { $regex: escapeRegex(search), $options: 'i' };
```

### 1.2 File Upload Validation — CRITICAL
**File:** `app/api/upload/route.ts`

**Fix:** Add MIME type whitelist and file size limit:
- Accept only: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `application/pdf`
- Reject: `.svg`, `.html`, `.exe`, `.sh`, `.php`, `.js`, `.ts`
- Max size: 5MB
- Return 400 with clear error message on rejection

### 1.3 Proxy API Auth Bypass — CRITICAL
**File:** `proxy.ts` (lines 31-32)

**Fix:** Remove `/api` from `publicPrefixes` OR add route-specific auth in proxy. The safer approach is to keep `/api` public but ensure every route has its own auth check. Since all admin routes already do this, document the requirement and add a lint rule.

**Alternative (recommended):** Add a comment documenting that ALL `/api` routes MUST call `auth()` — this is already the pattern, just undocumented.

### 1.4 CSRF Protection — CRITICAL
**Files:** All client-side `fetch()` calls for state-changing operations

**Fix:** 
- Use NextAuth's built-in CSRF token via `getCsrfToken()` or fetch `/api/csrf`
- Add CSRF token to all POST/PUT/DELETE fetch headers
- Alternative: Use `SameSite=strict` cookies + verify `Origin` header on API routes

---

## Phase 2: High-Severity Security Fixes (Day 1-2)

### 2.1 Mass Assignment on Courses/Workshops — HIGH
**Files:**
- `app/api/courses/route.ts` POST (line 84) — `Course.create({...body})`
- `app/api/courses/[id]/route.ts` PUT (line 90) — `Course.findByIdAndUpdate(id, body)`
- `app/api/workshops/route.ts` POST (line 86) — `Workshop.create({...body})`
- `app/api/workshops/[id]/route.ts` PUT (lines 80-87) — raw body fields

**Fix:** Whitelist allowed fields instead of spreading raw body:
```ts
// Courses POST
const { title, description, price, level, category, tags, image, whatYouLearn, requirements, sections, published } = body;
const course = await Course.create({ title, description, price, level, category, tags, image, whatYouLearn, requirements, sections, published, instructor: session.user.id });

// Courses PUT
const allowedFields = { title, description, price, level, category, tags, image, whatYouLearn, requirements, sections, published };
const updated = await Course.findByIdAndUpdate(id, allowedFields, { new: true });
```

### 2.2 No Auth on File Serving — HIGH
**File:** `app/api/files/[name]/route.ts`

**Fix:** Add session check:
```ts
const session = await auth();
if (!session?.user) return apiError('Unauthorized', 401);
```

### 2.3 validateBeforeSave: false — HIGH
**File:** `app/api/workshops/[id]/route.ts` (line 94)

**Fix:** Remove `validateBeforeSave: false`. If validation fails, fix the validation schema instead of bypassing it.

---

## Phase 3: Full Translation Coverage (Day 2-3)

### 3.1 Add Translation Namespaces

**Files:** `messages/en.json`, `messages/ar.json`

Add these new namespaces:

#### `admin.questions` (for questions list/new/edit pages)
```json
{
  "title": "Questions",
  "total": "{count} total",
  "addQuestion": "Add Question",
  "createNew": "Create a new exam question",
  "editQuestion": "Edit Question",
  "updateDetails": "Update question details",
  "tableHeaders": {
    "question": "Question",
    "category": "Category",
    "difficulty": "Difficulty",
    "source": "Source",
    "active": "Active",
    "actions": "Actions"
  },
  "noQuestions": "No questions found",
  "edit": "Edit",
  "active": "Active",
  "inactive": "Inactive",
  "difficulty": {
    "easy": "Easy",
    "medium": "Medium",
    "hard": "Hard"
  }
}
```

#### `admin.codes` (for voucher codes page)
```json
{
  "title": "Voucher Codes",
  "description": "Generate and manage premium/trial codes",
  "generate": "Generate Codes",
  "type": "Type",
  "trial": "Trial",
  "premium": "Premium",
  "durationDays": "Duration (days)",
  "maxUses": "Max uses",
  "count": "Count",
  "generateBtn": "Generate",
  "allCodes": "All Codes",
  "noCodes": "No codes generated yet",
  "code": "Code",
  "uses": "Uses",
  "status": "Status",
  "created": "Created",
  "active": "Active",
  "inactive": "Inactive",
  "copyCode": "Copy code",
  "copy": "Copy"
}
```

#### `admin.review` (for review queue page)
```json
{
  "title": "Review Queue",
  "description": "Approve or reject articles submitted by contributors",
  "pendingReview": "Pending Review",
  "noPending": "No articles pending review",
  "published": "Published ({count})",
  "submittedBy": "Submitted by",
  "unknown": "Unknown",
  "approve": "Approve",
  "sendBack": "Send Back",
  "pending": "Pending"
}
```

#### `admin.news.form` (for AdminNewsForm)
```json
{
  "english": "English",
  "arabic": "العربية",
  "titleLabel": "Title *",
  "titlePlaceholder": "News title",
  "excerptLabel": "Excerpt (optional)",
  "excerptPlaceholder": "Short description for card preview",
  "contentLabel": "Content *",
  "contentPlaceholder": "News content (HTML or markdown)",
  "imageUrl": "Image URL",
  "tagsLabel": "Tags (comma separated)",
  "publishImmediately": "Publish immediately",
  "cancel": "Cancel",
  "update": "Update",
  "create": "Create",
  "titleContentRequired": "Title and content are required",
  "failedToSave": "Failed to save news",
  "deleteConfirm": "Delete this news item?",
  "deleteFailed": "Failed to delete",
  "delete": "Delete",
  "unpublish": "Unpublish",
  "approve": "Approve",
  "approvePublish": "Approve & Publish",
  "publishFailed": "Failed to toggle publish status"
}
```

### 3.2 Update Components to Use Translations

**Files to modify:**

| File | Changes |
|------|---------|
| `app/[locale]/admin/questions/page.tsx` | Add `getTranslations('admin.questions')`, replace ~15 hardcoded strings |
| `app/[locale]/admin/questions/new/page.tsx` | Add `getTranslations('admin.questions')`, replace 2 strings |
| `app/[locale]/admin/questions/[id]/edit/page.tsx` | Add `getTranslations('admin.questions')`, replace 2 strings |
| `app/[locale]/admin/codes/page.tsx` | Add `useTranslations('admin.codes')`, replace ~25 strings |
| `app/[locale]/admin/review/page.tsx` | Add `getTranslations('admin.review')`, replace ~10 strings |
| `app/[locale]/admin/news/AdminNewsForm.tsx` | Add `useTranslations('admin.news.form')`, replace ~20 strings |
| `app/[locale]/admin/news/DeleteNewsButton.tsx` | Add `useTranslations('admin.news.form')`, replace 3 strings |
| `app/[locale]/admin/news/PublishNewsButton.tsx` | Fix broken `t()` calls, use keys from `admin.news.form` |
| `app/[locale]/admin/page.tsx` | Replace "Draft", "Free", "sections" with `t()` calls |
| `app/[locale]/admin/courses/page.tsx` | Replace "Draft" with `t()` |
| `app/[locale]/admin/news/page.tsx` | Replace "Draft" with `t()` |

### 3.3 Fix Broken Translation Components

| File | Issue | Fix |
|------|-------|-----|
| `PublishNewsButton.tsx` | Imports `useTranslations` but never calls `t()` | Replace hardcoded strings with `t()` calls |
| `DeleteNewsButton.tsx` | No translations at all | Add `useTranslations('admin.news.form')` |
| `AdminReviewItem.tsx` | No translations at all | Add `useTranslations('admin.review')` |

---

## Phase 4: Medium-Severity Fixes (Day 3-4)

### 4.1 Missing Zod Validation
**Files:** Add Zod schemas to these routes:
- `app/api/courses/route.ts` POST — validate title, price, level, etc.
- `app/api/courses/[id]/route.ts` PUT — same fields, all optional
- `app/api/workshops/route.ts` POST — validate title, price, level, language
- `app/api/workshops/[id]/route.ts` PUT — same fields, all optional
- `app/api/news/route.ts` POST — validate title, content, tags
- `app/api/news/[slug]/route.ts` PUT — same fields, all optional
- `app/api/user/profile/route.ts` PUT — validate name, bio, image length

### 4.2 Rate Limiting on Write Endpoints
Add rate limiting to:
- `POST /api/upload` — 20 requests/hour per user
- `POST /api/admin/codes` — 10 requests/hour per admin
- `POST /api/courses/fetch-youtube` — 10 requests/hour per user

### 4.3 Error Message Sanitization
Replace `error.message` in catch blocks with generic messages:
- `app/api/articles/route.ts` line 117
- `app/api/news/route.ts` line 41
- `app/api/courses/fetch-youtube/route.ts` line 19

### 4.4 HTML Sanitization
Add DOMPurify or similar sanitizer for:
- Article body content before storage
- News content before storage
- Workshop block content

### 4.5 dangerouslySetInnerHTML Audit
**File:** `app/[locale]/dashboard/contributions/[slug]/edit/page.tsx` line 294
- Ensure this only renders the user's own content
- Add CSP headers if possible

---

## Execution Order

1. **Phase 1** (Critical security) — do first, highest risk
2. **Phase 2** (High security) — do immediately after
3. **Phase 3** (Translations) — largest volume of work, can be parallelized
4. **Phase 4** (Medium security + polish) — do last

## Estimated Effort

| Phase | Files Changed | Estimated Time |
|-------|---------------|----------------|
| Phase 1 | ~5 files | 1-2 hours |
| Phase 2 | ~4 files | 1 hour |
| Phase 3 | ~15 files + 2 JSON files | 3-4 hours |
| Phase 4 | ~10 files | 2-3 hours |
| **Total** | ~30 files | **7-10 hours** |
