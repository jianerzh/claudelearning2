# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Next.js dev server (Turbopack)
npm run dev:daemon   # Start server as daemon, logs to logs.txt
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest (all tests)
npm run setup        # Install deps + generate Prisma client + run migrations
npm run db:reset     # Force-reset SQLite database
```

Run a single test file: `npx vitest run src/components/chat/__tests__/ChatInterface.test.tsx`

## Architecture

An AI-powered React component generator: the user describes a UI in chat, Claude generates/edits files using structured tool calls, and the result renders live in an iframe — all in the browser.

### Three-panel layout

`main-content.tsx` composes a resizable split: **Chat (35%)** | **Preview + Code (65%)**. The code sub-panel is File Tree (30%) + Monaco editor (70%).

### AI integration (`src/app/api/chat/route.ts`)

Streams responses from Claude via the Vercel AI SDK. Claude is given two tools:
- `str_replace_editor` — create/view/replace/insert content in files
- `file_manager` — rename, delete, list files

The system prompt lives at `src/lib/prompts/generation.tsx` and uses ephemeral prompt caching on the system message. If `ANTHROPIC_API_KEY` is absent, the route falls back to a `MockLanguageModel` in `src/lib/provider.ts`.

### Virtual file system (`src/lib/file-system.ts`)

Pure in-memory tree — no disk I/O. The `VirtualFileSystem` class is serialized to JSON for database storage and exposed app-wide via `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`). AI tool calls mutate this context directly during a chat turn.

### Live preview (`src/components/preview/PreviewFrame.tsx`)

Watches `FileSystemContext` for changes. When files update, it uses **Babel standalone** (browser-side) to transpile JSX/TypeScript, then injects the bundle into a sandboxed iframe via an import map. Missing imports are silently replaced with stubs so the preview never hard-crashes.

### Auth & persistence

JWT sessions (7-day, via `jose`). `src/lib/auth.ts` issues/validates tokens; `src/middleware.ts` enforces protected routes. Prisma + SQLite store two models: `User` and `Project`. A `Project` row holds `messages` (chat history) and `data` (serialized `VirtualFileSystem`) as JSON columns. Anonymous usage is tracked in `localStorage` via `src/lib/anon-work-tracker.ts`; projects are saved only when the user is authenticated.

### Key data flow

```
User message → ChatContext (useAIChat) → /api/chat
    → Claude streams tool calls → VirtualFileSystem mutates
    → FileSystemContext signals PreviewFrame
    → Babel transforms JSX → iframe re-renders
    → onFinish: project saved to DB (authenticated only)
```

### Testing

Tests live in `__tests__/` folders adjacent to source. Vitest runs with a jsdom environment. Use `@testing-library/react` for component tests and `@testing-library/user-event` for interactions.
