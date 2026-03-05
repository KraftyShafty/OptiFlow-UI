import { Panel } from "@/components/shared/Panel";
import { MonoValue } from "@/components/shared/MonoValue";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { FreshnessBadge } from "@/components/shared/FreshnessBadge";
import { BookOpen, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type ResearchNotebookRecord } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ResearchPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSymbol, setNewSymbol] = useState("");

  const {
    data: notebooks,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["research-notebooks"],
    queryFn: () => api.getResearchNotebooks(),
  });

  const createNotebook = useMutation({
    mutationFn: (body: { symbol: string }) => api.createResearchNotebook(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["research-notebooks"] });
      toast.success("Research notebook created");
      setDialogOpen(false);
      setNewSymbol("");
    },
    onError: () => toast.error("Failed to create research notebook"),
  });

  if (isLoading) return <LoadingState message="Loading research notebooks…" />;
  if (error) return <ErrorState message="Failed to load research notebooks." />;

  const sorted = [...(notebooks ?? [])].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">Research Desk</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full">+ New Notebook</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Research Notebook</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label>Symbol</Label>
                <Input
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                  placeholder="e.g. AAPL"
                />
              </div>
              <Button
                onClick={() => {
                  if (newSymbol.trim()) createNotebook.mutate({ symbol: newSymbol });
                }}
                disabled={createNotebook.isPending || !newSymbol.trim()}
                className="w-full rounded-full"
              >
                {createNotebook.isPending ? "Creating…" : "Create Notebook"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="No research notebooks"
          description="Create a new notebook to start collecting and synthesising research for a symbol."
        />
      ) : (
        <div className="space-y-3">
          {sorted.map((nb: ResearchNotebookRecord) => (
            <Panel
              key={nb.id}
              ariaLabel={`Notebook ${nb.symbol}`}
              onClick={() => {
                if (nb.current_brief) navigate(`/research/notebooks/${nb.id}/briefs/${nb.current_brief.id}`);
              }}
              className={nb.current_brief ? "cursor-pointer hover:border-primary/40 transition-colors" : ""}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4 text-primary" />
                    <span className="font-mono font-bold text-foreground">{nb.symbol}</span>
                    {nb.strategy_name && (
                      <span className="text-xs text-muted-foreground">
                        {nb.strategy_name.replace(/_/g, " ")}
                      </span>
                    )}
                  </div>
                  {nb.current_brief?.thesis_summary && (
                    <p className="text-sm text-foreground/80 max-w-2xl">
                      {nb.current_brief.thesis_summary}
                    </p>
                  )}
                  {nb.unresolved_questions_summary && (
                    <p className="text-xs text-muted-foreground italic">
                      {nb.unresolved_questions_summary}
                    </p>
                  )}
                  <div className="flex gap-4 mt-2">
                    <MonoValue
                      value={`${nb.source_count} sources`}
                      className="text-xs text-muted-foreground"
                    />
                    <FreshnessBadge timestamp={nb.updated_at} />
                  </div>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResearchPage;
