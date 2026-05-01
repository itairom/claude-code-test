# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # Build to dist/
npm run preview      # Preview production build
npm test             # Run all tests (jsdom, watch mode)
npm run test:browser # Run browser tests with Playwright/Chromium
```

Run a single test file:
```bash
npx vitest run TimerApp.test.jsx
```

## Architecture

This is a React 18 + Vite app with two timer implementations served via `react-router-dom` using `HashRouter`:

- `/` → `TimerApp.jsx` — dark-themed stopwatch/countdown with inline CSS-in-JSX styles
- `/v2` → `MaterialTimerApp2.jsx` — alternate Material-style implementation

Entry point is `main.jsx`. The `src/` directory contains standalone utility code (`Button.tsx`, `api.ts`, `helpers.ts`) used as learning/example material and is not wired into the app routing.

Both timer components share the same state model: `mode` (`stopwatch` | `countdown`), `seconds`, `isRunning`, `isFinished`, and a `setInterval` managed via `useRef`. The progress ring is an SVG circle with `strokeDashoffset` driven by elapsed/remaining time.

Tests live alongside components (e.g., `TimerApp.test.jsx`) and use `@testing-library/react` with `vi.useFakeTimers()` for time control. Components that use `react-router-dom` hooks must be wrapped in `MemoryRouter` in tests.

There are two Vitest configs:
- `vitest.config.js` — default, uses jsdom
- `vitest.browser.config.js` — uses Playwright Chromium (`npm run test:browser`)

## Custom Subagents (`.claude/agents/`)

Three project-scoped subagents are defined:

| Agent | Trigger |
|-------|---------|
| `code-reviewer` | After code changes — reviews quality, security, best practices |
| `test-runner` | Run tests and summarize failures |
| `documentation-writer` | When creating or updating docs/READMEs |
