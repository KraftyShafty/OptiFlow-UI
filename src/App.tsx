import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLayout } from "@/components/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import ChainExplorerPage from "./pages/ChainExplorerPage";
import ScannerPage from "./pages/ScannerPage";
import WatchlistPage from "./pages/WatchlistPage";
import AnalyzePage from "./pages/AnalyzePage";
import StrategyLabPage from "./pages/StrategyLabPage";
import EventsPage from "./pages/EventsPage";
import ResearchPage from "./pages/ResearchPage";
import ForecastsPage from "./pages/ForecastsPage";
import JournalPage from "./pages/JournalPage";
import PortfolioPage from "./pages/PortfolioPage";
import ReviewPage from "./pages/ReviewPage";
import BacktestPage from "./pages/BacktestPage";
import RLResearchPage from "./pages/RLResearchPage";
import ProvidersPage from "./pages/ProvidersPage";
import SettingsPage from "./pages/SettingsPage";
import AlertsPage from "./pages/AlertsPage";
import FactorSnapshotPage from "./pages/FactorSnapshotPage";
import RegimeSnapshotPage from "./pages/RegimeSnapshotPage";
import EventBriefDetailPage from "./pages/EventBriefDetailPage";
import ResearchBriefDetailPage from "./pages/ResearchBriefDetailPage";
import ForecastSetDetailPage from "./pages/ForecastSetDetailPage";
import BacktestRunDetailPage from "./pages/BacktestRunDetailPage";
import ReviewDetailPage from "./pages/ReviewDetailPage";
import NotFound from "./pages/NotFound";

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
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
