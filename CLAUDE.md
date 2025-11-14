# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
│   │   └── admin/              # Admin operations
│   ├── business/               # Business dashboard pages
│   │   ├── dashboard/          # Main business interface (583 lines)
│   │   ├── login/              # Business auth
│   │   ├── complete-signup/    # Establishment creation
│   │   ├── tags/               # Tag management
│   │   ├── orders/             # View orders
│   │   └── validate-reward/    # Reward validation
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
└── lib/
    ├── supabase.ts             # Browser & Service clients
    ├── supabase-server.ts      # Server client
    ├── rate-limit.ts           # Rate limiting utilities
    ├── validations.ts          # Zod validation schemas
    └── toast.ts                # Toast notification utilities
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

**Last Updated**: 2025-01-14

### 📊 Current Status

**Code Quality Metrics:**
- ✅ **All API routes validated** - 11/11 routes have Zod validation
- ✅ **Zero alert() calls** - Replaced 20+ alerts with toast notifications
- ✅ **Zero confirm() calls** - Replaced 4 confirms with custom ConfirmDialog
- ✅ **Dashboard maintainability** - Reduced from 1,062 lines to 583 lines (45% reduction)
- ✅ **Version control** - Project on GitHub with complete history
- ⚠️ **TypeScript warnings** - 54 ESLint warnings remaining (non-critical)
- ⚠️ **Type safety** - 84+ instances of `any` type (needs improvement)

**Recent Accomplishments (Jan 14, 2025):**
- Implemented comprehensive Zod validation across entire API surface
- Replaced all browser alerts with professional toast notifications
- Created reusable Modal and ConfirmDialog components
- Extracted 4 large modal components from dashboard
- Set up GitHub repository for version control

**Next Priority:** Customer Dashboard (missing core feature for end users)

### ✅ Completed

- [x] **Security: Environment variable protection** - `.env.local` properly gitignored, `.env.example` created
- [x] **Security: Rate limiting** - Implemented in `src/lib/rate-limit.ts`, applied to all critical endpoints
- [x] **Documentation: README** - Complete setup instructions and project overview
- [x] **Documentation: SECURITY.md** - Security best practices and guidelines
- [x] **Build: Next.js 15 compatibility** - Fixed async params in all dynamic routes
- [x] **Input Validation with Zod** (2025-01-14) - All 11 API routes now have comprehensive Zod validation
- [x] **Toast Notifications** (2025-01-14) - Replaced all 20+ alert() calls with Sonner toast notifications
- [x] **Custom Confirmation Dialogs** (2025-01-14) - Replaced all 4 confirm() calls with custom ConfirmDialog component
- [x] **Extract Large Components** (2025-01-14) - Dashboard reduced from 1,062 lines to 583 lines (45% reduction)

### 🔴 High Priority (Do Next)

#### 1. Customer Dashboard
**Status**: Not started
**Impact**: Missing core feature
**Effort**: Large (6-8 hours)

**Problem**:
- Customers can't view their cards
- No history of past rewards
- Poor user experience

**Tasks**:
- [ ] Create `/app/customer/dashboard/page.tsx`
- [ ] Create API route: `/api/customer/cards` (list active cards)
- [ ] Create API route: `/api/customer/rewards` (list rewards)
- [ ] Design & build card list UI
- [ ] Design & build reward history UI
- [ ] Add navigation from tap page
- [ ] Show progress bars for active cards
- [ ] Add filters: active/completed
- [ ] Mobile-responsive design

#### 2. Add Proper TypeScript Types
**Status**: Not started
**Impact**: Type safety
**Effort**: Medium (3-4 hours)

**Problem**:
- 84+ instances of `any` type
- No centralized type definitions
- Missing Supabase generated types

**Tasks**:
- [ ] Generate types from Supabase: `npx supabase gen types typescript --project-id <id> > src/types/database.ts`
- [ ] Create `src/types/index.ts` for app types
- [ ] Define types: `Event`, `Establishment`, `Tag`, `Card`, `Punch`, `Reward`
- [ ] Replace `any` in API routes
- [ ] Replace `any` in client components
- [ ] Add strict type checking for Supabase queries

#### 3. Set Up Testing Framework
**Status**: Not started
**Impact**: Code quality & confidence
**Effort**: Large (4-6 hours)

**Tasks**:
- [ ] Install Vitest: `npm install -D vitest @vitejs/plugin-react`
- [ ] Install React Testing Library: `npm install -D @testing-library/react @testing-library/jest-dom`
- [ ] Configure `vitest.config.ts`
- [ ] Write tests for `src/lib/rate-limit.ts`
- [ ] Write tests for punch validation logic
- [ ] Write tests for reward code generation
- [ ] Set up test database or mocks for Supabase
- [ ] Add test script to `package.json`
- [ ] Write E2E tests with Playwright (optional)

**Target Coverage**:
- Critical: `/api/punch` route (punch logic, validation)
- Critical: `/api/business/validate-reward` (reward validation)
- Important: Rate limiting logic
- Important: Utility functions

### 🟡 Medium Priority

#### 4. Marketing Website for VPC
**Status**: Not started
**Impact**: Business growth & customer acquisition
**Effort**: Large (8-12 hours)
**Domain**: virtual-punch-card.com (owned)

**Problem**:
- No public-facing website to explain the product
- Businesses can't discover or learn about VPC
- No place to showcase features, pricing, or get started

**Tasks**:

**Phase 1: Planning & Design**
- [ ] Define target audience (small businesses, restaurants, cafes)
- [ ] Write copy for: hero, features, pricing, testimonials, FAQ
- [ ] Create wireframes/mockups
- [ ] Choose tech stack (options below)
- [ ] Plan sitemap/pages needed

**Phase 2: Core Pages**
- [ ] **Homepage** - Hero, value prop, features overview, CTA
- [ ] **Features** - Detailed feature explanations with screenshots
- [ ] **Pricing** - Pricing tiers, tag costs, comparison table
- [ ] **How It Works** - Step-by-step for businesses and customers
- [ ] **About/Contact** - Company info, contact form
- [ ] **Legal** - Terms of Service, Privacy Policy

**Phase 3: Optional Pages**
- [ ] **Blog** - SEO content, use cases, success stories
- [ ] **Documentation** - Public docs for businesses
- [ ] **Case Studies** - Customer testimonials/stories
- [ ] **Demo Request** - Lead generation form

**Phase 4: Technical Implementation**
- [ ] Set up domain DNS (virtual-punch-card.com)
- [ ] Deploy website
- [ ] Add analytics (Google Analytics / Plausible)
- [ ] Set up contact form (Resend, SendGrid, or Formspree)
- [ ] SEO optimization (meta tags, sitemap, robots.txt)
- [ ] Mobile responsive design
- [ ] Performance optimization (images, lazy loading)
- [ ] SSL certificate (auto with Vercel/Netlify)

**Tech Stack Options**:

**Option A: Separate Static Site (Recommended)**
- **Pros**: Fast, SEO-friendly, separate from app, easy to iterate
- **Cons**: Another codebase to maintain
- **Stack**: Next.js (static) + TailwindCSS + MDX for blog
- **Hosting**: Vercel (free tier, auto-deploy from git)
- **Effort**: Medium

**Option B: Add to Current App**
- **Pros**: Single codebase, shared components/styles
- **Cons**: Mixes marketing with app logic, harder to scale
- **Implementation**: Create `/app/(marketing)` route group
- **Effort**: Small-Medium

**Option C: No-Code Solution**
- **Pros**: Fastest, no code needed, easy updates
- **Cons**: Less customization, recurring cost, not dev-friendly
- **Options**: Webflow, Framer, WordPress
- **Effort**: Small

**Recommended Approach**: Option A (Separate Next.js site)
- Clean separation of concerns
- Easy to hand off to marketing team later
- Full control over performance and SEO
- Can share design system with main app

**Content Outline**:

**Homepage Sections**:
1. Hero: "Digital Loyalty Cards That Actually Work"
2. Problem: Traditional punch cards are clunky
3. Solution: Tap, track, reward - that's it
4. Features grid: NFC tap, customer dashboard, business analytics
5. How it works (3 steps)
6. Pricing preview
7. Social proof/testimonials
8. CTA: "Get Started" → business signup

**Key Messaging**:
- For businesses: "Increase customer retention with modern loyalty cards"
- For customers: "Never lose a punch card again"
- Value props: Easy setup, no app required, instant rewards

**Domain Setup Notes**:
- Point `virtual-punch-card.com` → marketing site
- Point `app.virtual-punch-card.com` → Next.js app (current project)
- Consider: `docs.virtual-punch-card.com` for documentation later

**Integration Points**:
- CTA buttons link to `/business/signup` on app subdomain
- Shared branding/logo between sites
- Cross-link: app can link back to marketing for support/help

### 🟢 Low Priority (Nice to Have)

#### 5. Centralized Error Logging
**Status**: Not started
**Effort**: Small

**Tasks**:
- [ ] Install Sentry or similar: `npm install @sentry/nextjs`
- [ ] Configure error tracking
- [ ] Remove console.log statements
- [ ] Use proper logging library (Pino)

#### 6. Business Analytics Dashboard
**Status**: Not started
**Effort**: Large

**Tasks**:
- [ ] Create analytics API routes
- [ ] Charts for: punch trends, completion rates, customer retention
- [ ] Export functionality (CSV)
- [ ] Date range filters

#### 7. Upgrade Rate Limiting to Redis
**Status**: Not started
**Effort**: Medium

**Current**: In-memory (resets on server restart)
**Target**: Redis/Upstash for production

**Tasks**:
- [ ] Choose Redis provider (Upstash recommended)
- [ ] Install: `npm install @upstash/redis`
- [ ] Update `src/lib/rate-limit.ts`
- [ ] Add Redis connection config
- [ ] Test in production

#### 8. Add API Documentation
**Status**: Not started
**Effort**: Medium

**Tasks**:
- [ ] Install Swagger/OpenAPI tools
- [ ] Document all API endpoints
- [ ] Add request/response examples
- [ ] Generate API docs page

#### 9. Improve Error Boundaries
**Status**: Not started
**Effort**: Small

**Tasks**:
- [ ] Add React error boundaries to main layouts
- [ ] Create custom error pages
- [ ] Graceful error handling in components

#### 10. Performance Optimization
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

#### Current ESLint Warnings (54 warnings)
**Status**: Ongoing
**Effort**: Small (1-2 hours)

Most common issues:
- 23x `@typescript-eslint/no-explicit-any` - Replace `any` types
- 12x `@typescript-eslint/no-unused-vars` - Remove unused variables
- 11x `react/no-unescaped-entities` - Escape quotes in JSX
- 3x `prefer-const` - Use const instead of let
- 2x `react-hooks/exhaustive-deps` - Fix useEffect dependencies

**Non-critical** - Can be fixed gradually as files are touched.

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
6. **Consider adding tests** - Especially for critical business logic

### When Adding New Features
1. **Update CLAUDE.md backlog** - Mark tasks complete, add new discoveries
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
