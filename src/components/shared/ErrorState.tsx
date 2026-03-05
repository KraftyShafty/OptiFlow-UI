import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title = "Something went wrong", message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-destructive/10 p-3 mb-4">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-foreground mb-1">{title}</h3>
      {message && <p className="text-sm text-muted-foreground max-w-md mb-4">{message}</p>}
      {onRetry && (
        <button onClick={onRetry} className="rounded-pill bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Retry
        </button>
      )}
    </div>
  );
}
