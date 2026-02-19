# CLAUDE.md — HotAI Platform

## Project Overview

HotAI is a multi-AI integration platform built with Next.js 14 (App Router), React 18, TypeScript, Supabase, and Tailwind CSS. It provides a unified chat interface for interacting with OpenAI (GPT-4o), Anthropic (Claude), and Google (Gemini) models, with usage tracking, file/image uploads, and project organization. The UI is in Korean; code comments mix Korean and English.

## Tech Stack

- **Framework**: Next.js 14.1.0 (App Router)
- **Language**: TypeScript 5.3 (strict mode)
- **UI**: React 18, Tailwind CSS 3.4, Radix UI primitives, shadcn/ui components
- **Database**: Supabase (PostgreSQL with Row-Level Security)
- **ORM (alternative)**: Prisma 5.10 (schema exists but Supabase is the primary DB layer)
- **AI SDKs**: `openai@4.28`, `@anthropic-ai/sdk@0.24`, `@google/generative-ai@0.1`
- **State**: Zustand for client state, TanStack React Query for server state
- **Auth**: Supabase Auth (email/password + Google/GitHub OAuth)
- **Deployment**: Vercel + GitHub Actions CI/CD
- **Node**: 18 (per CI config)

## Directory Structure

```
hotai-platform/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (Inter font, Korean lang, Sonner toasts)
│   ├── page.tsx                  # Landing/marketing page
│   ├── globals.css               # Global styles + Tailwind directives
│   ├── (auth)/                   # Auth route group (unprotected)
│   │   ├── login/page.tsx        # Login (email + OAuth)
│   │   └── register/page.tsx     # Registration (email + OAuth)
│   ├── (dashboard)/              # Dashboard route group (protected)
│   │   ├── layout.tsx            # Dashboard shell (sidebar + header)
│   │   ├── chat/page.tsx         # Multi-AI chat interface
│   │   └── usage/page.tsx        # Usage analytics & cost tracking
│   ├── api/
│   │   └── chat/route.ts         # POST — chat completion endpoint
│   └── auth/
│       └── callback/route.ts     # OAuth callback handler
├── components/
│   ├── dashboard/
│   │   ├── sidebar.tsx           # Navigation sidebar with projects
│   │   └── header.tsx            # Top header bar
│   ├── chat/
│   │   ├── chat-message.tsx      # Message bubble component
│   │   ├── image-upload.tsx      # Image upload with drag-and-drop
│   │   └── file-upload.tsx       # Document upload (PDF, DOCX, CSV, etc.)
│   └── ui/                       # shadcn/ui primitives (button, card, tabs, select, etc.)
├── hooks/
│   └── use-chat.tsx              # Chat state hook (messages, sendMessage, isLoading)
├── lib/
│   ├── ai/
│   │   ├── chat-service.ts       # ChatService class — routes to AI providers
│   │   └── providers.ts          # AI SDK instances + model configs + pricing
│   ├── services/
│   │   ├── file-processor.ts     # FileProcessor — PDF/DOCX/CSV text extraction
│   │   └── usage-tracker.ts      # UsageTracker — token counting + cost calculation
│   ├── supabase/
│   │   ├── client.ts             # Browser-side Supabase client
│   │   └── server.ts             # Server-side Supabase client (uses cookies)
│   └── utils.ts                  # cn() utility (clsx + tailwind-merge)
├── types/
│   └── supabase.ts               # Database types (profiles, chats, messages, usage, etc.)
├── prisma/
│   └── schema.prisma             # Prisma schema (PostgreSQL)
├── supabase/
│   ├── config.toml               # Local Supabase dev config
│   └── migrations/               # SQL migrations (001, 002, 003)
├── middleware.ts                  # Auth middleware — protects /dashboard, /chat, /prompts
├── .github/workflows/
│   ├── test.yml                  # CI: lint, type-check, test, build
│   └── deploy.yml                # CD: Vercel preview + production deploys
├── tailwind.config.ts            # Tailwind config with HotAI brand colors
├── tsconfig.json                 # TypeScript config with path aliases
├── next.config.js                # Next.js config (image domains)
└── package.json                  # Dependencies and scripts
```

## Commands

```bash
npm run dev          # Start development server (Next.js)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint (next lint)
npm run db:push      # Push Prisma schema to database
npm run db:studio    # Open Prisma Studio
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run Prisma migrations
```

There is no dedicated test runner configured yet — `npm test` is referenced in CI but no test framework is installed.

## Path Aliases

Defined in `tsconfig.json`:

| Alias | Path |
|-------|------|
| `@/*` | `./*` |
| `@/components/*` | `./components/*` |
| `@/lib/*` | `./lib/*` |
| `@/app/*` | `./app/*` |
| `@/types/*` | `./types/*` |

Always use these aliases for imports rather than relative paths.

## Architecture

### Request Flow (Chat)

1. User sends message via chat page → `useChat` hook
2. Hook calls `POST /api/chat` with `{ messages, model, images? }`
3. API route authenticates via Supabase server client
4. `ChatService` routes to the correct AI provider SDK
5. Each provider has its own multimodal message format (OpenAI: image_url, Anthropic: base64, Google: inlineData)
6. Response + usage (tokens, cost) returned to client
7. Usage tracked in Supabase `usage` table

### Authentication Flow

- Supabase Auth handles email/password and OAuth (Google, GitHub)
- `middleware.ts` checks auth on protected routes (`/dashboard/*`, `/chat`, `/prompts`)
- Authenticated users are redirected away from `/login` and `/register`
- OAuth callback at `/auth/callback` exchanges code for session
- Server components use `createSupabaseServerClient()` from `lib/supabase/server.ts`
- Client components use the singleton from `lib/supabase/client.ts`

### Database

Primary data layer is **Supabase** (not Prisma). Supabase migrations in `supabase/migrations/` define the schema:

**Core tables**: `profiles`, `workspaces`, `chats`, `messages`, `prompts`, `prompt_variables`, `usage`, `projects`, `workspace_invites`

All tables use **Row-Level Security (RLS)** — users can only access their own data. The `usage` table allows system-level inserts via service role.

The Prisma schema exists as an alternative/backup DB layer but Supabase is what the app uses at runtime.

### AI Providers

Configured in `lib/ai/providers.ts`:

| Provider | Models | Multimodal |
|----------|--------|------------|
| OpenAI | gpt-4o, gpt-4o-mini, o1-preview, o1-mini | Yes (image_url) |
| Anthropic | claude-3-5-sonnet, claude-3-opus, claude-3-haiku | Yes (base64) |
| Google | gemini-2.0-flash, gemini-1.5-pro, gemini-1.5-flash | Yes (inlineData) |

Each model has pricing config (`costPer1k`) for usage tracking.

## Conventions

### Code Style

- **TypeScript strict mode** is enabled — avoid `any` types
- **ESLint** with `eslint-config-next` and `@typescript-eslint` rules
- Use `cn()` from `@/lib/utils` for conditional Tailwind class merging
- UI components follow shadcn/ui patterns with CVA (class-variance-authority) for variants
- Components use Radix UI primitives for accessibility

### Component Patterns

- **Server Components** by default (Next.js App Router convention)
- Add `"use client"` directive only when client interactivity is needed
- Dashboard pages are wrapped in a protected layout that checks auth
- Route groups `(auth)` and `(dashboard)` organize pages without affecting URL paths

### Styling

- **Tailwind CSS** for all styling — no CSS modules or styled-components
- Brand colors defined under `hotai` namespace in `tailwind.config.ts`:
  - Primary: `#E74C3C` (red)
  - Secondary: `#2C3E50` (dark gray)
  - Accent: `#F39C12` (orange)
- Dark mode supported via `class` strategy
- HSL CSS variables for shadcn/ui theme tokens (defined in `globals.css`)

### Commit Messages

Follow conventional commits (in English):

```
feat: add new feature
fix: fix a bug
docs: documentation changes
style: code formatting
refactor: code restructuring
test: add tests
chore: build/tooling changes
```

### Branch Strategy

- `main` — production deployment
- `develop` — development integration
- `feature/*` — feature branches
- `hotfix/*` — urgent fixes

## Environment Variables

Required variables (see `.env.local.example`):

```
NEXT_PUBLIC_SUPABASE_URL       # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY  # Supabase anonymous key (public)
SUPABASE_SERVICE_ROLE_KEY      # Supabase service role key (server-only, secret)
OPENAI_API_KEY                 # OpenAI API key
ANTHROPIC_API_KEY              # Anthropic API key
GOOGLE_API_KEY                 # Google AI API key
NEXT_PUBLIC_APP_URL            # App base URL (default: http://localhost:3000)
```

Optional: `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_POSTHOG_KEY`, `SENTRY_DSN`

**Never commit `.env`, `.env.local`, or any file containing secrets.**

## CI/CD

- **Test workflow** (`.github/workflows/test.yml`): Runs on push to `main`/`develop` and PRs to `main`. Steps: `npm ci` → `lint` → `type-check` → `test` → `build`.
- **Deploy workflow** (`.github/workflows/deploy.yml`): Vercel preview on PRs, production deploy on push to `main`.

## Key Files for Common Tasks

| Task | Files |
|------|-------|
| Add a new AI model | `lib/ai/providers.ts` (model config), `lib/ai/chat-service.ts` (routing logic), `app/(dashboard)/chat/page.tsx` (UI model list) |
| Add a new page | Create `app/(dashboard)/<name>/page.tsx`, update sidebar in `components/dashboard/sidebar.tsx` |
| Add a new API route | Create `app/api/<name>/route.ts` |
| Modify auth logic | `middleware.ts`, `lib/supabase/server.ts` |
| Add a new UI component | `components/ui/` following shadcn/ui patterns |
| Change database schema | Add new migration in `supabase/migrations/`, update `types/supabase.ts` |
| Modify chat behavior | `hooks/use-chat.tsx`, `app/api/chat/route.ts`, `lib/ai/chat-service.ts` |
| Update brand colors | `tailwind.config.ts` (hotai color namespace) |
