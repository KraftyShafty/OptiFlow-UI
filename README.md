# OptiFlow UI

Canonical production frontend for the OptiFlow options-advisory workstation ([ADR-001](../docs/ADR-001-frontend-convergence.md)). Vite + React single-page application connecting to the FastAPI backend for all data — no mock data in production builds.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 · Vite 5.4 · TypeScript 5.8 |
| Styling | Tailwind CSS 4 · shadcn/ui (new-york, 49 primitives) |
| Data | @tanstack/react-query 5 · @tanstack/react-table 8 |
| Charts | Recharts 3 · Plotly.js (basic-dist-min) |
| Routing | react-router-dom 6 (lazy-loaded routes) |
| Animation | Framer Motion |
| URL State | nuqs |
| Validation | Zod 4 |
| Notifications | Sonner |

## Quick Start

```bash
# Install dependencies
npm ci

# Start dev server (port 3000, proxies /api → localhost:8000)
npm run dev

# Production build
npm run build

# Run tests
npm run test

# Lint
npm run lint

# Type check
npx tsc --noEmit
```

The dev server proxies `/api/*` to `http://localhost:8000` and `/ws/*` to `ws://localhost:8000`. Start the backend first:

```bash
cd ../optiflow/backend
pip install -e ".[dev]"
uvicorn optiflow_app.main:app --reload --port 8000
```

## Docker

The `optiflow/docker-compose.yml` builds and serves this frontend via nginx on port 3000:

```bash
cd ../optiflow
docker compose up --build
```

The 3-stage Dockerfile (`docker/Dockerfile`) produces a static nginx image:
1. **deps** — `node:22-alpine`, `npm ci`
2. **builder** — copies source, runs `npm run build`
3. **runtime** — `nginx:alpine`, serves `/dist` with SPA fallback + API proxy

## Project Structure

```
src/
├── components/
│   ├── charts/          # Recharts & Plotly wrappers
│   ├── shared/          # DataTable, Panel, StatusPill, etc.
│   └── ui/              # shadcn/ui primitives (49 components)
├── hooks/               # use-mobile, use-toast, use-websocket-events
├── lib/
│   ├── api/             # API client (client.ts + index.ts, 111 methods)
│   ├── types/           # 12 domain type files, 130+ TypeScript interfaces
│   ├── routes.ts        # Route path constants + parameterized builders
│   ├── strategies.ts    # Strategy metadata
│   ├── format.ts        # Number & date formatters
│   └── utils.ts         # Tailwind merge helper
├── pages/               # 25 page components (23 routes + detail pages)
└── test/                # Vitest setup + 17 tests
```

## Pages

| Route | Page | API |
|---|---|---|
| `/` | Dashboard | watchlists, positions, trades, alerts, backtests, providers |
| `/symbol/:ticker` | Chain Explorer | getChain, getTermStructure |
| `/scanner` | Scanner | getScannerScreens, runScannerScreen |
| `/watchlist` | Watchlist | getWatchlists, createWatchlist, addItem, refresh |
| `/analyze` | AI Analysis | createAnalysisRun, SSE subscribeAnalysisEvents |
| `/lab` | Strategy Lab | Client-side payoff calculator |
| `/events` | Events Calendar | getEventCalendar, refreshEventBrief |
| `/events/:id/briefs/:id` | Event Brief Detail | getEventBrief, versions |
| `/research` | Research | getResearchNotebooks, createNotebook, semantic search, upload, web ingest |
| `/research/rl` | RL Research | datasets, training runs, models, signals |
| `/research/.../briefs/:id` | Research Brief Detail | getResearchBrief, versions |
| `/forecasts` | Forecasts | getForecastScorecard |
| `/forecasts/:id` | Forecast Set Detail | getForecastSet |
| `/journal` | Trade Journal | listPaperTrades, createPosition |
| `/portfolio` | Portfolio | getPositions, getExposure, closePosition, CSV import |
| `/review` | Trade Review | getTradeReviews, calibration scorecards |
| `/review/:id` | Review Detail | getTradeReview, frozen entry context |
| `/backtest` | Backtest Workspace | listBacktestRuns, createBacktestRun |
| `/backtest/runs/:id` | Backtest Run Detail | getBacktestResults, cancel |
| `/providers` | Provider Health | getProviderHealth, getBackgroundJobs, drift trending |
| `/settings` | Settings | risk profile, LLM policy, costs, runtime diagnostics |
| `/alerts` | Alerts | rules, events, acknowledge, mute |
| `/factors/:id` | Factor Snapshot | getFactorSnapshotById |
| `/regimes/:id` | Regime Snapshot | getRegimeSnapshotById |

## Testing

```bash
# Unit tests (vitest)
npm run test          # 17 tests: 15 route-helper + 2 SSE/API

# Lint
npm run lint          # 0 errors

# Type check (strictNullChecks: true)
npx tsc --noEmit      # 0 errors
```

## Build

```bash
npm run build
# 3344 modules, 337 KB gzipped JS, ~3.7s build time
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `/api` | Base URL for API requests |
| `VITE_WS_BASE_URL` | (commented) | WebSocket base URL override |
| `VITE_MOCK_MODE` | (commented) | Enable mock data fallback |
