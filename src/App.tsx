import { lazy, Suspense, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLayout } from "@/components/AppLayout";
import { LoadingState } from "@/components/shared/LoadingState";

// Lazy-loaded pages — each becomes its own chunk.
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const ChainExplorerPage = lazy(() => import("./pages/ChainExplorerPage"));
const ScannerPage = lazy(() => import("./pages/ScannerPage"));
const WatchlistPage = lazy(() => import("./pages/WatchlistPage"));
const AnalyzePage = lazy(() => import("./pages/AnalyzePage"));
const StrategyLabPage = lazy(() => import("./pages/StrategyLabPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const ResearchPage = lazy(() => import("./pages/ResearchPage"));
const ForecastsPage = lazy(() => import("./pages/ForecastsPage"));
const JournalPage = lazy(() => import("./pages/JournalPage"));
const PortfolioPage = lazy(() => import("./pages/PortfolioPage"));
const ReviewPage = lazy(() => import("./pages/ReviewPage"));
const BacktestPage = lazy(() => import("./pages/BacktestPage"));
const RLResearchPage = lazy(() => import("./pages/RLResearchPage"));
const ProvidersPage = lazy(() => import("./pages/ProvidersPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const AlertsPage = lazy(() => import("./pages/AlertsPage"));
const FactorSnapshotPage = lazy(() => import("./pages/FactorSnapshotPage"));
const RegimeSnapshotPage = lazy(() => import("./pages/RegimeSnapshotPage"));
const EventBriefDetailPage = lazy(() => import("./pages/EventBriefDetailPage"));
const ResearchBriefDetailPage = lazy(() => import("./pages/ResearchBriefDetailPage"));
const ForecastSetDetailPage = lazy(() => import("./pages/ForecastSetDetailPage"));
const BacktestRunDetailPage = lazy(() => import("./pages/BacktestRunDetailPage"));
const ReviewDetailPage = lazy(() => import("./pages/ReviewDetailPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ErrorBoundary>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoadingState message="Loading page…" /></div>}>
            <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/symbol/:ticker" element={<ChainExplorerPage />} />
              <Route path="/scanner" element={<ScannerPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
              <Route path="/analyze" element={<AnalyzePage />} />
              <Route path="/lab" element={<StrategyLabPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/events/:itemId/briefs/:briefId" element={<EventBriefDetailPage />} />
              <Route path="/research" element={<ResearchPage />} />
              <Route path="/research/rl" element={<RLResearchPage />} />
              <Route path="/research/notebooks/:notebookId/briefs/:briefId" element={<ResearchBriefDetailPage />} />
              <Route path="/forecasts" element={<ForecastsPage />} />
              <Route path="/forecasts/:forecastSetId" element={<ForecastSetDetailPage />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/review/:paperTradeId" element={<ReviewDetailPage />} />
              <Route path="/review" element={<ReviewPage />} />
              <Route path="/backtest" element={<BacktestPage />} />
              <Route path="/backtest/runs/:runId" element={<BacktestRunDetailPage />} />
              <Route path="/providers" element={<ProvidersPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/factors/:factorSnapshotId" element={<FactorSnapshotPage />} />
              <Route path="/regimes/:regimeSnapshotId" element={<RegimeSnapshotPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
