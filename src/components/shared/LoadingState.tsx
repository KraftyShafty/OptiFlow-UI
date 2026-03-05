interface LoadingStateProps {
  rows?: number;
  message?: string;
}

export function LoadingState({ rows = 3, message }: LoadingStateProps) {
  return (
    <div className="space-y-3 py-4">
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3 animate-pulse">
          <div className="h-4 w-4 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3 rounded bg-muted" style={{ width: `${70 - i * 10}%` }} />
            <div className="h-2 rounded bg-muted" style={{ width: `${50 - i * 5}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
