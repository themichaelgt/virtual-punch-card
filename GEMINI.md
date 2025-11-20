# GEMINI.md

This file provides guidance to Google Gemini when working with code in this repository.

## Project Overview

Virtual Punch Card is a Next.js 15 application that provides digital punch card/loyalty card functionality using NFC tags. Businesses can create campaigns, customers tap NFC tags to collect punches, and receive rewards upon completion.

## Development Commands

```bash
# Development
npm run dev         # Start dev server with Turbopack

# Build
npm run build       # Production build with Turbopack

# Production
npm start           # Start production server

# Linting
npm run lint        # Run ESLint
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 (App Router) with React 19
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Magic Links/OTP)
- **NFC Integration**: Web NFC API for tag reading

### Core User Flows

**1. Business Flow**
- Business signup → Create establishment → Order NFC tags → Register tags → Create campaigns → Assign tags to campaigns
- Validate customer rewards using reward codes

**2. Customer Flow**
- Tap NFC tag → Redirected to `/t/[token]` → Sign in with magic link → Punch recorded → View progress → Complete card → Receive reward code

**3. Admin Flow**
- View and manage tag orders → Fulfill orders → Ship orders → Generate activation codes for tags

### Database Architecture

**Key Tables & Relationships:**
- `users` - Customer accounts (Supabase Auth users)
- `establishments` - Business accounts (owned by users)
- `events` - Punch card campaigns (belong to establishments)
  - Contains `rules_json`: `{target_punches, cooldown_hours, max_punches_per_day, allow_repeat}`
- `tags` - Physical NFC tags (belong to events)
  - `token` - Unique NFC identifier (used in `/t/[token]` URLs)
  - `activation_code` - Used for business registration
  - `status` - 'inactive', 'active', etc.
- `cards` - User's progress on an event (user + event)
  - Tracks progress toward target_punches
- `punches` - Individual punch records (audit trail)
- `rewards` - Generated when card completes
- `orders` - Business orders for NFC tags

### Supabase Client Architecture

**Three distinct Supabase clients** (critical for security):

1. **Browser Client** (`createClientSupabase()` in `src/lib/supabase.ts`)
   - Used in client components
   - Uses public anon key
   - Has auth context from cookies

2. **Server Client** (`createServerSupabase()` in `src/lib/supabase-server.ts`)
   - Used in API routes for authenticated requests
   - Uses anon key with cookie-based session
   - Can access current user via `supabase.auth.getUser()`

3. **Service Client** (`createServiceSupabase()` in `src/lib/supabase.ts`)
   - Uses service role key (full admin access)
   - ONLY use server-side for privileged operations
   - Required for bypassing RLS policies

**When to use each client:**
- Use Browser Client for client-side React components
- Use Server Client to get authenticated user in API routes
- Use Service Client for database operations that need to bypass RLS (most API operations)

### Directory Structure

```
src/
├── app/
│   ├── api/                    # API routes
│   │   ├── punch/              # Core punch recording endpoint
│   │   ├── business/           # Business management APIs
│   │   ├── customer/           # Customer APIs
│   │   │   ├── cards/          # Fetch customer cards
│   │   │   └── rewards/        # Fetch customer rewards
│   │   └── admin/              # Admin operations
│   ├── business/               # Business dashboard pages
│   │   ├── dashboard/          # Main business interface (583 lines)
│   │   ├── login/              # Business auth
│   │   ├── complete-signup/    # Establishment creation
│   │   ├── tags/               # Tag management
│   │   ├── orders/             # View orders
│   │   └── validate-reward/    # Reward validation
│   ├── customer/               # Customer pages
│   │   └── dashboard/          # Customer dashboard (view cards & rewards)
│   ├── tap/                    # Customer tap interface
│   ├── t/[token]/              # NFC redirect handler
│   └── admin/                  # Admin pages
├── components/
│   ├── Modal.tsx               # Shared modal wrapper component
│   ├── ConfirmDialog.tsx       # Custom confirmation dialog
│   └── business/               # Business-specific components
│       ├── CreateEventModal.tsx
│       ├── EditEventModal.tsx
│       ├── TagManagementModal.tsx
│       └── ClaimTagsModal.tsx
├── lib/
│   ├── supabase.ts             # Browser & Service clients
│   ├── supabase-server.ts      # Server client
│   ├── rate-limit.ts           # Rate limiting utilities
│   ├── validations.ts          # Zod validation schemas
│   └── toast.ts                # Toast notification utilities
└── types/
    ├── database.ts             # Supabase database schema types
    └── index.ts                # Application types & API responses
```

## Key Implementation Details

### NFC Flow
1. NFC tag stores URL: `https://yourapp.com/t/[token]`
2. User taps tag → Browser navigates to URL
3. `/t/[token]/route.ts` validates token → redirects to `/tap?token=[token]`
4. `/tap/page.tsx` checks auth → prompts login if needed → calls `/api/punch`
5. `/api/punch/route.ts` records punch, validates rules, updates progress

### Punch Validation Rules
Implemented in `validateRules()` in `src/app/api/punch/route.ts`:
- **Cooldown**: Minimum hours between punches
- **Daily Limit**: Max punches per day
- Returns violations array with `next_eligible_at` timestamps

### Authentication Pattern
- Customer auth uses **magic links** (passwordless)
- Email sent with link containing token: `/tap?token=[token]`
- After auth, page automatically attempts punch
- Business auth uses same Supabase Auth system

### Card Lifecycle
1. Created on first punch (if doesn't exist)
2. Progress tracked: `0 → target_punches`
3. Status: `active` → `completed`
4. If `allow_repeat: true`, card can be reset after completion

### Reward Generation
- Alphanumeric code generated: `Math.random().toString(36).substring(2, 10).toUpperCase()`
- Stored in `rewards` table with `card_id`, `event_id`, `user_id`
- Businesses validate using `/api/business/validate-reward`

## Environment Variables

Required in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Public anon key
SUPABASE_SERVICE_ROLE_KEY=       # Service role key (keep secret!)
```

## Common Patterns

### API Route Pattern
```typescript
import { createServiceSupabase } from '@/lib/supabase'
import { createServerSupabase } from '@/lib/supabase-server'

const serviceSupabase = createServiceSupabase()

export async function POST(request: NextRequest) {
  // Get authenticated user
  const supabase = await createServerSupabase()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 })
  }

  // Use serviceSupabase for database operations
  const { data, error } = await serviceSupabase
    .from('table_name')
    .select('*')
}
```

### Client Component Auth Check
```typescript
'use client'
import { createClientSupabase } from '@/lib/supabase'

const supabase = createClientSupabase()
const { data: { user } } = await supabase.auth.getUser()
```

### Input Validation with Zod
All API routes use Zod validation for request bodies. Pattern:

```typescript
import { punchSchema, formatValidationError } from '@/lib/validations'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const validation = punchSchema.safeParse(body)

  if (!validation.success) {
    return NextResponse.json({
      status: 'error',
      message: formatValidationError(validation.error)
    }, { status: 400 })
  }

  const { token, location } = validation.data
  // Use validated data...
}
```

**Available schemas** in `src/lib/validations.ts`:
- `punchSchema` - Token + optional location
- `createEventSchema` - Campaign creation
- `updateEventSchema` - Campaign updates
- `validateRewardSchema` - Reward code validation
- `registerTagSchema` - Tag registration
- `claimTagsSchema` - Tag assignment
- `updateTagSchema` - Tag updates
- `createOrderSchema` - Tag orders with shipping
- `createEstablishmentSchema` - Business profile

### Toast Notifications
Use toast notifications instead of `alert()`. Pattern:

```typescript
import { showSuccess, showError, showInfo, showWarning } from '@/lib/toast'

// Success notification
showSuccess('Campaign created successfully!')

// Error notification
showError('Failed to save changes', 'Please try again')

// With description
showSuccess('Order placed', 'Your tags will arrive in 5-7 days')

// Loading state
const loadingToast = showLoading('Processing...')
// Later: dismiss(loadingToast)

// Promise-based
await showPromise(
  fetchData(),
  {
    loading: 'Loading data...',
    success: 'Data loaded!',
    error: 'Failed to load data'
  }
)
```

**Never use browser `alert()` or `confirm()` - they block the UI and provide poor UX.**

### Confirmation Dialogs
Use custom ConfirmDialog instead of `confirm()`. Pattern:

```typescript
'use client'
import { useConfirm } from '@/components/ConfirmDialog'

export function MyComponent() {
  const confirm = useConfirm()

  const handleDelete = async () => {
    const confirmed = await confirm({
      message: 'Are you sure you want to delete this campaign?',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      type: 'danger'  // 'info' | 'warning' | 'danger'
    })

    if (confirmed) {
      // Proceed with deletion
    }
  }
}
```

### Modal Components
Use shared Modal wrapper for consistency. Pattern:

```typescript
import { Modal } from '@/components/Modal'

export function MyModal({ isOpen, onClose }: Props) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modal Title"
      maxWidth="md"  // 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    >
      {/* Modal content */}
    </Modal>
  )
}
```

### Running Tests
The project uses Vitest for testing. Pattern:

```bash
# Run tests in watch mode (interactive)
npm test

# Run tests once (CI mode)
npm run test:run

# Run tests with UI (browser interface)
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

**Test file structure:**
- Create tests in `src/__tests__/` directory
- Match source structure: `src/lib/foo.ts` → `src/__tests__/lib/foo.test.ts`
- Use descriptive `describe()` and `it()` blocks
- Mock external dependencies (Supabase, sonner, etc.)

**Writing new tests:**
```typescript
import { describe, it, expect } from 'vitest'
import { myFunction } from '@/lib/myModule'

describe('MyModule', () => {
  describe('myFunction', () => {
    it('should do something', () => {
      const result = myFunction('input')
      expect(result).toBe('expected output')
    })
  })
})
```

**Current test coverage:**
- 37 tests, 100% passing
- Validation schemas (27 tests)
- Rate limiting utilities (3 tests)
- Toast notifications (7 tests)

## Path Aliases

`@/*` maps to `./src/*` (configured in `tsconfig.json`)

Example: `import { createClientSupabase } from '@/lib/supabase'`

## Important Notes

- Next.js 15 uses **Turbopack** by default for dev and build
- All routes use **App Router** (no Pages Router)
- Server components are async, client components use `'use client'` directive
- TypeScript strict mode is enabled
- The application requires RLS (Row Level Security) policies in Supabase to be configured properly
- **All API routes must have Zod validation** - see `src/lib/validations.ts`
- **Never use alert() or confirm()** - use toast notifications and ConfirmDialog instead

---

## 🚧 Known Issues & Improvement Backlog

**Last Updated**: 2025-01-16

### 📊 Current Status

**Code Quality Metrics:**
- ✅ **All API routes validated** - 13/13 routes have Zod validation
- ✅ **Zero alert() calls** - Replaced 20+ alerts with toast notifications
- ✅ **Zero confirm() calls** - Replaced 4 confirms with custom ConfirmDialog
- ✅ **Dashboard maintainability** - Reduced from 1,062 lines to 583 lines (45% reduction)
- ✅ **Version control** - Project on GitHub with complete history
- ✅ **Customer Dashboard** - Full-featured dashboard with cards & rewards
- ✅ **TypeScript types** - Comprehensive type system with database + app types
- ✅ **ESLint clean** - Zero warnings (down from 54)
- ✅ **Marketing website** - Complete 5-page marketing site built into app
- ✅ **Testing framework** - Vitest configured with 37 passing tests

**Recent Accomplishments (Jan 14-16, 2025):**
- Implemented comprehensive Zod validation across entire API surface
- Replaced all browser alerts with professional toast notifications
- Created reusable Modal and ConfirmDialog components
- Extracted 4 large modal components from dashboard
- Set up GitHub repository for version control
- **Built complete Customer Dashboard** - View active cards, track progress, manage rewards
- **Created TypeScript type system** - `src/types/database.ts` + `src/types/index.ts`
- **Achieved zero ESLint warnings** - Fixed all 36 warnings (100% clean codebase)
- **Built marketing website** - 5 pages: home, features, pricing, how-it-works, contact
- **Set up testing framework** - Vitest + React Testing Library with 37 tests, 100% passing

**Next Priority:** Business Analytics Dashboard (charts, trends, export functionality)

### ✅ Completed

- [x] **Security: Environment variable protection** - `.env.local` properly gitignored, `.env.example` created
- [x] **Security: Rate limiting** - Implemented in `src/lib/rate-limit.ts`, applied to all critical endpoints
- [x] **Documentation: README** - Complete setup instructions and project overview
- [x] **Documentation: SECURITY.md** - Security best practices and guidelines
- [x] **Build: Next.js 15 compatibility** - Fixed async params in all dynamic routes
- [x] **Input Validation with Zod** (2025-01-14) - All 13 API routes now have comprehensive Zod validation
- [x] **Toast Notifications** (2025-01-14) - Replaced all 20+ alert() calls with Sonner toast notifications
- [x] **Custom Confirmation Dialogs** (2025-01-14) - Replaced all 4 confirm() calls with custom ConfirmDialog component
- [x] **Extract Large Components** (2025-01-14) - Dashboard reduced from 1,062 lines to 583 lines (45% reduction)
- [x] **Customer Dashboard** (2025-01-16) - Full customer experience with progress tracking, rewards, and history
  - Created `/app/customer/dashboard/page.tsx` (265 lines)
  - Created `/api/customer/cards` - Fetches all cards with progress
  - Created `/api/customer/rewards` - Fetches reward history
  - Beautiful gradient UI with progress bars
  - Mobile-responsive design
  - Empty state handling
  - Collapsible history sections
- [x] **TypeScript Type System** (2025-01-16) - Comprehensive types for type safety
  - Created `src/types/database.ts` - Database schema types (148 lines)
  - Created `src/types/index.ts` - API response types, component props (139 lines)
  - Types used in new customer API routes
  - Proper type exports and re-exports
- [x] **ESLint Cleanup** (2025-01-16) - COMPLETE: Zero warnings (down from 36)
  - Fixed 11 unescaped entities in JSX
  - Removed 18 unused variables
  - Fixed 1 useEffect dependency warning
  - Cleaned up unused imports across codebase
  - 100% clean build with no errors or warnings
- [x] **Marketing Website** (2025-01-16) - Complete 5-page site using route groups
  - Created `(marketing)` route group in `/app/(marketing)`
  - Built marketing layout with header/nav and footer
  - Homepage: Hero, problem/solution, features grid, social proof, pricing preview
  - Features page: 6 major feature sections with detailed explanations
  - Pricing page: Transparent pricing, bulk options, comparison table, FAQ
  - How It Works page: Step-by-step for businesses and customers
  - Contact page: Contact options, about section, common questions
  - All pages static (pre-rendered) for performance and SEO
- [x] **Testing Framework** (2025-01-16) - Vitest + React Testing Library configured
  - Installed Vitest, @testing-library/react, @testing-library/jest-dom, happy-dom
  - Created `vitest.config.ts` with happy-dom environment and path aliases
  - Created `vitest.setup.ts` with jest-dom matchers and cleanup
  - **37 tests written, 100% passing**:
    - `src/__tests__/lib/validations.test.ts` (27 tests) - All Zod schemas
    - `src/__tests__/lib/rate-limit.test.ts` (3 tests) - Rate limit utilities
    - `src/__tests__/lib/toast.test.ts` (7 tests) - Toast notification utilities
  - Added test scripts: `npm test`, `npm run test:ui`, `npm run test:run`, `npm run test:coverage`
  - Tests validate: punch schema, event creation/updates, reward validation, tag registration, orders, error formatting
- [x] **Business Analytics Dashboard** (2025-11-20) - Implemented charts, trends, and export
  - Created `/app/business/analytics/page.tsx` with Recharts
  - Created API routes: `/api/business/analytics/{punches,completion,retention}`
  - Implemented CSV export functionality
  - Added date range and campaign filters
- [x] **Error Handling & Logging** (2025-11-20) - Sentry + Error Boundaries
  - Installed `@sentry/nextjs`
  - Created `global-error.tsx`, `not-found.tsx`, and specific error boundaries
  - Configured Sentry for client, server, and edge
- [x] **Rate Limiting (Redis)** (2025-11-20) - Upstash Redis with Fallback
  - Installed `@upstash/redis` and `@upstash/ratelimit`
  - Updated `src/lib/rate-limit.ts` to use Redis if configured
  - Implemented seamless fallback to in-memory store for development
- [x] **API Documentation** (2025-11-20) - Swagger/OpenAPI
  - Installed `swagger-jsdoc` and `swagger-ui-react`
  - Created `/docs` page for interactive API documentation
  - Added JSDoc annotations to `/api/punch`


### 🔴 High Priority (Do Next)

### 🟡 Medium Priority



### 🟢 Low Priority (Nice to Have)

#### 2. Centralized Error Logging
**Status**: Not started
**Effort**: Small

**Tasks**:
- [ ] Install Sentry or similar: `npm install @sentry/nextjs`
- [ ] Configure error tracking
- [ ] Remove console.log statements
- [ ] Use proper logging library (Pino)





#### 5. Improve Error Boundaries
**Status**: Not started
**Effort**: Small

**Tasks**:
- [ ] Add React error boundaries to main layouts
- [ ] Create custom error pages
- [ ] Graceful error handling in components

#### 6. Performance Optimization
**Status**: Not started
**Effort**: Medium

**Tasks**:
- [ ] Add caching strategy (React Query or SWR)
- [ ] Optimize database queries
- [ ] Add loading skeletons
- [ ] Implement optimistic UI updates
- [ ] Add Next.js Image optimization
- [ ] Bundle analysis and code splitting

### 📋 Code Quality Improvements

#### ESLint Status
**Status**: ✅ COMPLETE - Zero warnings
**Completed**: 2025-01-16

All 36 warnings have been fixed:
- ✅ Fixed 11 unescaped entities in JSX
- ✅ Removed 18 unused variables
- ✅ Fixed 1 useEffect dependency warning
- ✅ Cleaned up unused imports

Codebase is now 100% clean with no ESLint errors or warnings.

### 🔐 Security Enhancements

#### Additional Security Tasks
- [ ] Add CSRF protection
- [ ] Implement API key rotation schedule
- [ ] Add security headers to Next.js config
- [ ] Set up dependency vulnerability scanning
- [ ] Regular security audits
- [ ] Add rate limit monitoring/alerting
- [ ] Implement request logging
- [ ] Add Supabase RLS policy documentation
- [ ] Review and test all RLS policies

### 🚀 Infrastructure & DevOps

#### Missing Infrastructure
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Automated testing in CI
- [ ] Staging environment
- [ ] Database migration strategy
- [ ] Backup and restore procedures
- [ ] Monitoring and alerting (Uptime, errors)
- [ ] Docker configuration (optional)

---

## 📝 Notes for Future Development

### When Adding New API Routes
1. **Add rate limiting** (import from `src/lib/rate-limit.ts`)
2. **Add Zod validation** - Create schema in `src/lib/validations.ts`, use `safeParse()` and `formatValidationError()`
3. **Use proper Supabase client** (Server Client for auth check, Service Client for DB operations)
4. **Return consistent error format** - Use NextResponse.json with proper status codes
5. **Add TypeScript types** - Avoid `any`, use proper types
6. **Write tests** - Add tests to `src/__tests__/` for validation schemas and critical logic
7. **Run tests** - Ensure all tests pass with `npm run test:run`

### When Adding New Features
1. **Update GEMINI.md backlog** - Mark tasks complete, add new discoveries
2. **Update README** if user-facing
3. **Use toast notifications** - Never use alert() or confirm()
4. **Use Modal component** for dialogs - Import from `@/components/Modal`
5. **Consider mobile responsiveness** - Test on small screens
6. **Test with rate limiting enabled** - Ensure limits are appropriate
7. **Ensure proper error handling** - User-friendly messages, log errors

### When Creating Client Components
1. **Use `'use client'` directive** at top of file
2. **Import toast utilities** for user notifications
3. **Use useConfirm hook** for confirmations instead of browser confirm()
4. **Validate user input** on client side (in addition to server-side Zod validation)
5. **Show loading states** - Use Sonner's loading toast or skeleton screens
6. **Handle errors gracefully** - Display user-friendly error messages

### Database Changes
- Always use Supabase migrations
- Update TypeScript types after schema changes
- Review RLS policies for new tables
- Document relationships in this file

### Performance Considerations
- Use React Server Components by default
- Only mark as 'use client' when necessary
- Implement proper loading states
- Consider caching for expensive operations

---

## 🔧 Development Workflow

### Version Control (GitHub)
**Repository**: https://github.com/themichaelgt/virtual-punch-card.git

**Workflow**:
```bash
# Check status
git status

# Stage changes
git add .

# Commit changes
git commit -m "Description of changes"

# Push to GitHub
git push origin main

# Pull latest changes
git pull origin main
```

**Best Practices**:
- Commit frequently with clear, descriptive messages
- Pull before starting work to avoid conflicts
- Use feature branches for large changes
- Never commit sensitive data (.env files, API keys, tokens)
- Review changes with `git diff` before committing

### Code Quality Checklist
Before committing code, ensure:
- ✅ No ESLint errors (warnings acceptable)
- ✅ Build succeeds (`npm run build`)
- ✅ All new API routes have Zod validation
- ✅ No alert() or confirm() calls (use toast/ConfirmDialog)
- ✅ Toast notifications for user feedback
- ✅ Proper error handling with user-friendly messages
- ✅ TypeScript types (avoid `any`)
- ✅ Mobile responsiveness tested
- ✅ No console.log in production code (debug logs removed)

### Deployment Notes
- Application is configured for Vercel deployment
- Environment variables must be set in deployment platform
- Supabase connection requires proper CORS and RLS policies
- Rate limiting uses in-memory storage (resets on deployment)
- Consider upgrading to Redis-based rate limiting for production
